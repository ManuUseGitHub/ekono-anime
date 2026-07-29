import "dotenv/config";
import axios from "axios";
import { promises as fs } from "fs";
import path from "path";
import { getExtension } from "./ressources/malFilterExtension";
import { getCombinedFilterData } from "./searchString";

const BASE_URL = process.env["API_URL"] ?? "http://localhost:3000";

async function main() {
    console.log("Generating discriminants...");

    const { data } = await axios.get(`${BASE_URL}/discriminents`);
    const totalFilters: any = {};
    Object.entries(data.data).forEach(([k, v]) => {
        if (Array.isArray(v)) {
            totalFilters[k] = v
                .map((e: { [x: "animeCount" | string]: any }) => e[Object.keys(e).filter(e => e != "animeCount")[0]!])
                .sort();
        }
    });

    const output = path.join(process.cwd(), "src", "ressources", "discriminents.json");
    const outputTotalFilters = path.join(process.cwd(), "src", "ressources", "fullOptions.json");

    await fs.mkdir(path.dirname(output), {
        recursive: true
    });

    await fs.writeFile(output, JSON.stringify(data), "utf8");
    console.log(`Generated ${output}`);
    await fs.writeFile(outputTotalFilters, JSON.stringify(getCombinedFilterData(totalFilters, getExtension())), "utf8");
    console.log(`Generated ${outputTotalFilters}`);
}

main().catch(error => {
    console.error(error);

    process.exit(1);
});
