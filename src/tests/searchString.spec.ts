import { example, genres, total, minimum } from "./exempleFilter.json";
import * as data from "../ressources/fullOptions.json";
import { getExtension } from "../ressources/malFilterExtension";

import {
    decodeSearchString,
    encodeRanges,
    generatePrefixIdentifiers,
    getCombinedFilterData,
    getDeCypheredFilter,
    getSearchStringFromFilterData
} from "../searchString";

const arrayRange = (stop: number, start: number = 0, step: number = 1) =>
    Array.from({ length: (stop - start) / step + 1 }, (value, index) => start + index * step);
const getArrayRanges = (...intervals: number[][]) => {
    const result: number[] = [];

    intervals.forEach(interv => result.push(...arrayRange(interv[0], interv[1])));
    return result.sort();
};

it.each([
    ["airing", arrayRange(1)],
    ["approved", arrayRange(0)],
    ["genres", arrayRange(20)],
    ["rating", arrayRange(5)],
    ["seasons", arrayRange(3)],
    ["sources", arrayRange(15)],
    ["themes", getArrayRanges([9], [38, 11], [51, 40])],
    [
        "years",
        [
            ...getArrayRanges(
                [7, 5],
                [14, 13],
                [29, 28],
                [35, 34],
                [40, 37],
                [45, 43],
                [67, 63],
                [77, 74],
                [85, 82],
                [93, 90]
            ),
            ...[1, 3, 9, 10, 16, 18, 20, 22, 47, 48, 51, 52, 56, 58, 60, 61, 72, 80, 88]
        ]
    ],
    ["text", "gakkou's new house\""],
    ["length", 133],
    ["limit", 100],
    ["page", 0],
    ["previousPageIndex", 0]
])("is possible to decode from a given searchString for argument %s", (arg, expected) => {
    const decoded = decodeSearchString(
        ".ai:A2.ap:R0.ge:A21.le:N133.li:N100.pa:N0.pr:N0.ra:A6.se:A4.so:A16.te:Tgakkou's%20new%20house%22.th:R0-9:11-38:40-51.ty:R1-2:4-9.ye:B6mZVMOy5GbUP",
        getCombinedFilterData(data, getExtension())
    );

    const sortedCandidate = Array.isArray(decoded[arg]) ? decoded[arg].sort() : decoded[arg];
    const sortedExpected = Array.isArray(expected) ? expected.sort() : expected;

    expect(sortedCandidate).toStrictEqual(sortedExpected);
});

test.each([
    [{ genres: "", airing: "" }, ["ai", "ge"]],
    [{ airing: "", genres: "", genders: "" }, ["ai", "genr", "gend"]]
])("options : %s should resove to %s", (options, expected) => {
    const result = Object.values(generatePrefixIdentifiers(options));
    expect(result.sort()).toStrictEqual(expected.sort());
});

test("", () => {
    const event = example;
    const result = getSearchStringFromFilterData(data, event);
    expect(result).toBe(".ge:A20.se:R1");
});

test("A set of Ids for genres cannot start by zero if the option is not the first one", () => {
    const result = getSearchStringFromFilterData(data, genres);
    expect(result).toBe(".ge:R5");
});

test("The string given is deterministic", () => {
    const event = {
        genres: ["Adventure", "Adventure", "Boys Love", "Comedy", "Romance", "Slice of Life", "Sports", "Suspense"]
    };
    const result = getSearchStringFromFilterData(data, event);
    expect(result).toBe(".ge:R1:4p:15:17p:20");
});

test("The string given is deterministic with negative filters", () => {
    const event = {
        genres: [
            "Adventure",
            "Adventure",
            "Boys Love",
            "Comedy",
            "Romance",
            "Slice of Life",
            "Sports",
            "Suspense",
            "-Hentai",
            "-Horror"
        ]
    };
    const result = getSearchStringFromFilterData(data, event);
    expect(result).toBe(".ge:R1:4p:15:17p:20!12p");
});

it("is possible to decypher from a a cyphered filter", () => {
    const search = getSearchStringFromFilterData(data, minimum);
    const result = getDeCypheredFilter(data, decodeSearchString(search, data));

    expect(getSearchStringFromFilterData(data, result)).toStrictEqual(search);
});

//console.log(".ai:R0-2.ap:R1.ge:R0-21.ra:R0-6.se:R0-4.so:R0-16.th:R0-9:11-38:40-51.ty:R1-2:4-9.ye:B6mZVMOy5GbUP");

//.ai:A2.ap:R0.ge:A21.le:N133.li:N100.pa:N0.pr:N0.ra:A6.se:A4.so:A16.te:Tgakkou's%20new%20house%22.th:R0-9:11-38:40-51.ty:R1-2:4-9.ye:B6mZVMOy5GbUP
//R1:3:5-7:9-10:13-14:16:18:20:22:28-29:34-35:37-40:43-45:47-48:51-52:56:58:60-61:63-67
//.ai:R0-2.ap:R1.ge:R0-21.ra:R0-6.se:R0-4.so:R0-16.th:R0-9:11-38:40-51.ty:R1-2:4-9.ye:B6mZVMOy5GbUP
//.ai:R0-2.ap:R1.ge:R0-21.ra:R0-6.se:R0-4.so:R0-16.th:B//v//3//Dw.ty:R1-2:4-9.ye:B6mZVMOy5GbUP
//.ai:R0-2.ap:R1.ge:R0-21.ra:R0-6.se:R0-4.so:R0-16.th:R0-9:11-38:40-51.ty:R1-2:4-9.ye:R1:3:5-7:9-10:13-14:16:18:20:22:28-29:34-35:37-40:43-45:47-48:51-52:56:58:60-61:63-67
