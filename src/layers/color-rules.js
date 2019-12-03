import { divideOrZeroIfNaN } from "../utils";
import { labelPopCount, labelPopPercent, labelZeroToHundredPercent } from "./LegendLabels";

// TODO: Include legends
// TODO: Define a color rule interface, for extensibility and modularity.

/**
 * Default color scheme for the two major parties.
 */
const partyRGBColors = {
    Democratic: [25, 118, 210],
    Republican: [211, 47, 47]
};

/**
 * ColorBrewer colors for all non-major parties.
 */
let vizColors = [
    [102, 194, 165],
    [252, 141, 98],
    [141, 160, 203],
    [231, 138, 195],
    [166, 216, 84]
];

let cachedColors = {};

/**
 * Returns a color for the given party.
 * @param {String} name the party's name (e.g. Democratic)
 */
function getPartyRGBColors(name) {
    if (partyRGBColors.hasOwnProperty(name)) {
        return partyRGBColors[name];
    }
    if (cachedColors.hasOwnProperty(name)) {
        return cachedColors[name];
    }
    let color = vizColors.pop();
    cachedColors[name] = color;
    return color;
}

/**
 * Colors from transparent to black, according to the total count in each
 * unit (black == the maximum value). Currently only used for the total
 * population columns---should consider using population density instead.
 * @param {Subgroup} subgroup
 * @returns {Array} Mapbox style for a *-color property
 */
export function colorByCount(subgroup) {
    labelPopCount(subgroup);
    return [
        "step",
        subgroup.asMapboxExpression(),
        "#f00",
        0, "#fff",
        subgroup.breaks[1], "#f0f0f0",
        subgroup.breaks[2], "#bdbdbd",
        subgroup.breaks[3], "#636363",
        subgroup.breaks[4], "#000", // up to 100% of mostPop
    ];
}

/**
 * Sizes circles according to the total population count.
 * @param {Subgroup} subgroup
 * @returns {Array} Mapbox style for a circle-radius property
 */
export function sizeByCount(subgroup) {
    return [
        "interpolate",
        ["linear"],
        ["sqrt", subgroup.total.asMapboxExpression()],
        0,
        0,
        Math.sqrt(subgroup.total.max),
        20
    ];
}

/**
 * Colors from white to black, based on the subgroup's proportion
 * of the total count for the ColumnSet in each unit.
 * @param {Subgroup} subgroup
 * @returns {Array} Mapbox style for a *-color property
 */
export function colorByFraction(subgroup) {
    let smallpop = Math.ceil(subgroup.max / subgroup.total.max * 100) / 100;
    labelPopPercent(subgroup);
    return [
        "step",
        subgroup.fractionAsMapboxExpression(),
        "rgba(255, 255, 0, 0.5)", // null area
        0, "rgba(255, 255, 255, 0.8)",
        subgroup.breaks[1], "rgba(240, 240, 240, 0.8)",
        subgroup.breaks[2], "rgba(189, 189, 189, 0.8)",
        subgroup.breaks[3], "rgba(99, 99, 99, 0.8)",
        subgroup.breaks[4], "rgba(0, 0, 0, 0.8)", // up to 100% or (for small groups) estimated max %
    ];
}

// Partisan color rules:

function colorbyVoteShare(party, colorStops) {
    return [
        "interpolate",
        ["linear"],
        party.fractionAsMapboxExpression(),
        ...colorStops
    ];
}

function getPartisanColorStops(party) {
    const rgb = getPartyRGBColors(party.name);
    return [
        0,
        "rgba(0,0,0,0)",
        0.499,
        "rgba(0,0,0,0)",
        0.5,
        "rgba(249,249,249,0)",
        1,
        `rgb(${rgb[0]},${rgb[1]},${rgb[2]})`
    ];
}

export function voteShareRule(party) {
    const colorStops = getPartisanColorStops(party);
    return colorbyVoteShare(party, colorStops);
}

function marginPerCapitaExpression(election, party, population) {
    return divideOrZeroIfNaN(
        election.marginAsMapboxExpression(party),
        population.asMapboxExpression()
    );
}

function colorByMarginPerCapita(election, party, population, colorStops) {
    return [
        "interpolate",
        ["linear"],
        marginPerCapitaExpression(election, party, population),
        ...colorStops
    ];
}

export const createMarginPerCapitaRule = population => (election, party) => {
    const rgb = getPartyRGBColors(party.name);
    let stops = [
        0,
        "rgba(249, 249, 249, 0)",
        1,
        `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`
    ];

    return colorByMarginPerCapita(election, party, population, stops);
};

export function createPartisanColorRules(state) {
    return [
        { name: "Vote share", rule: voteShareRule },
        {
            name: "Margin per capita",
            rule: createMarginPerCapitaRule(state.population)
        }
    ];
}
