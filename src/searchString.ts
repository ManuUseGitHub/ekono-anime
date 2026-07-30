import { decodeB64OfBitset, encodeBitset } from "./b64BitsetEncoder";

function commonPrefixLength(a: string, b: string): number {
    let i = 0;

    while (i < a.length && i < b.length && a[i] === b[i]) {
        i++;
    }

    return i;
}

/**
 * generates conversion dictionary kind object :
 * keys = object keys ; values = prefix of keys. i.e: {airing:ai,photo:ph}
 */
export const generatePrefixIdentifiers = <K extends readonly string[]>(data: any) => {
    const keys = Object.keys(data).sort();

    return Object.fromEntries(
        keys.map((key, index) => {
            const previous = index > 0 ? keys[index - 1] : "";
            const next = index < keys.length - 1 ? keys[index + 1] : "";

            const previousCommon = commonPrefixLength(key, previous);
            const nextCommon = commonPrefixLength(key, next);

            const length = Math.max(previousCommon, nextCommon, 1) + 1;

            return [key, key.slice(0, length)];
        })
    ) as Record<K[number], string>;
};

export const compressIdsWithPrefix = (ids: number[], t: number): string => {
    if (ids.length === 0) return "Z";

    const sorted = [...new Set(ids)].sort((a, b) => a - b);
    const range = encodeRanges(sorted);
    const list = sorted.join(":");
    const encodings = [range, list];
    let prefix = "R";

    if (t == sorted.length) {
        encodeAll(sorted, encodings, sorted.length);
        prefix = "A";
    }
    // Only use a bitset when it is expected to be more compact than the
    // textual range/list encodings.
    else if (Math.min(range.length, list.length) > 25) {
        encodeBitset(sorted, range, list, encodings);
        prefix = "B";
    }

    return prefix + encodings.reduce((a, b) => (a.length <= b.length ? a : b));
};

export const encodeRanges = (ids: number[]): string => {
    const parts: string[] = [];
    let start = ids[0];
    let end = ids[0];

    for (let i = 1; i < ids.length; i++) {
        if (ids[i] === end + 1) {
            end = ids[i];
        } else {
            parts.push(encodeRange(start, end));
            start = end = ids[i];
        }
    }

    parts.push(encodeRange(start, end));

    return parts.join(":");
};

export const decodeIdRanges = (idIntervals: string) => {
    const ids: number[] = [];
    if (/^\d$|^(?:(?:\d+(?:p\d?|-\d+)?):?)+$/gm.test(idIntervals)) {
        const idRanges = idIntervals.split(":");

        idRanges.forEach(idr => {
            if (/p/.test(idr)) {
                const [startString, distanceString] = idr.split("p");
                const start = parseInt(startString);
                const distance = distanceString ? parseInt(distanceString) : 1;

                for (let i = start; i <= start + distance; i++) {
                    ids.push(i);
                }
            } else if (/-/.test(idr)) {
                const limits = idr.split("-");
                let i: number = parseInt(limits[0]);
                const t = parseInt(limits[1]);

                for (; i <= t; i++) {
                    ids.push(i);
                }
            } else {
                ids.push(parseInt(idr));
            }
        });
    }
    return ids;
};

function encodeRange(start: number, end: number): string {
    const distance = end - start;

    if (distance === 0) return `${start}`;
    if (distance === 1) return `${start}p`;
    if (distance <= 9) return `${start}p${distance}`;
    return `${start}-${end}`;
}

export const decodeAll = (idIntervals: string) => {
    const ids: number[] = [];
    const t = parseInt(idIntervals);
    for (let i = 0; i < t; i++) {
        ids.push(i);
    }

    return ids;
};

/**
 * if all elements are presents, just indicate the max value index
 * @param sorted
 * @param encodings
 */
export const encodeAll = (sorted: number[], encodings: string[], t: number) => {
    const max = sorted[sorted.length - 1];
    if (sorted.length == t) {
        encodings.push("" + max);
    }
};

export const getSearchStringFromFilterData = (data: { [x: string]: any }, filter: { [x: string]: any }) => {
    const conversion = getCypheredFilter(data, filter);

    const filtersSearchKeys = generatePrefixIdentifiers(data);
    const list: string[] = [];
    Object.keys(conversion).forEach(k => {
        const vFilter = filter[k];

        if (Array.isArray(vFilter)) {
            const options = getSearchableOptions(data[k]);
            const t = options.length;

            const vPositive: any[] = [];
            const vNegative: any[] = [];

            vFilter.forEach(vn => {
                if (options.includes(vn)) {
                    vPositive.push(options.indexOf(vn));
                } else if (`${vn}`.startsWith("-")) {
                    vNegative.push(options.indexOf(`${vn}`.slice(1)));
                }
            });

            const rangeDefinition =
                ":" +
                compressIdsWithPrefix(vPositive, t) +
                (vNegative.length ? "!" + compressIdsWithPrefix(vNegative, t).slice(1) : "");

            if (rangeDefinition != ":Z") {
                list.push(filtersSearchKeys[k] + rangeDefinition);
            }
        } else if (typeof vFilter == "string") {
            list.push(filtersSearchKeys[k] + ":T" + encodeURI(vFilter));
        } else {
            list.push(filtersSearchKeys[k] + ":N" + vFilter);
        }
    });

    return list.length ? "." + list.sort().join(".") : "";
};

export const decodeSearchString = (searchString: string, data: any) => {
    const p = /\.(?<key>[a-z]{2,3}):(?<strat>.)(?<value>[^\.]+)/gm;
    let m: RegExpExecArray | null;

    const matching = generatePrefixIdentifiers(data);
    const filter: { [x: string]: number[] | any } = {};

    while ((m = p.exec(searchString))) {
        const [key] = Object.entries(matching).find(([_, k]) => k == m!.groups!["key"]) as [string, string];
        const strat = m.groups!["strat"];
        filter[key] = [];

        const value = m.groups!["value"];

        if (strat == "B") {
            filter[key] = decodeB64OfBitset(atob(value));
        } else if (strat == "R") {
            filter[key] = decodeIdRanges(value);
        } else if (strat == "A") {
            filter[key] = decodeAll(value);
        } else if (strat == "N") {
            filter[key] = parseInt(value);
        } else if (strat == "T") {
            filter[key] = decodeURI(value);
        }
    }
    return filter;
};
export function getCombinedFilterData(data: { [x: string]: any }, extension: any) {
    return { ...data, ...extension };
}
function getCypheredFilter(data: { [x: string]: any }, filter: { [x: string]: any }) {
    const cyphered: { [x: string]: number[] | any } = {};

    Object.entries(data).forEach(([k, v]) => {
        const key: string = k;
        const matchedFilter: any = filter[key];

        if (matchedFilter != undefined) {
            const matchedFilterNormalized = Array.isArray(matchedFilter)
                ? matchedFilter.map(n => (`${n}`.startsWith("-") ? `${n}`.slice(1) : n))
                : matchedFilter;

            if (Array.isArray(v)) {
                if (!cyphered[key]) {
                    cyphered[key] = [];
                }

                const options = getSearchableOptions(v);
                (v as any[]).forEach(v => {
                    const index = matchedFilterNormalized.indexOf(v);
                    const optionIndex = options.indexOf(v);

                    if (index != -1 && optionIndex != -1) {
                        cyphered[key].push(optionIndex);
                    }
                });
            } else {
                cyphered[key] = filter[key];
            }
        }
    });
    return cyphered;
}

export function getDeCypheredFilter(data: { [x: string]: any }, cyphered: { [x: string]: any }) {
    const filter: { [x: string]: any } = {};
    Object.entries(cyphered).forEach(([k, v]) => {
        const key: string = k;

        if (Array.isArray(v)) {
            if (!filter[key]) {
                filter[key] = [];
            }

            v.forEach((i: number) => {
                filter[key].push(getSearchableOptions(data[key])[i]);
            });
        } else {
            filter[key] = cyphered[key];
        }
    });
    return filter;
}

function getSearchableOptions(options: any[]): any[] {
    const isExclusion = (option: any) => typeof option === "string" && option.startsWith("-");

    return [
        ...options.filter(option => !isExclusion(option)).sort(),
        ...options.filter(isExclusion).sort()
    ];
}
