import * as path from "path";
import * as fs from "fs";
import { sync as globSync } from "glob";

const BASE_DIR = path.join(__dirname, "..");
const VAR_REGEX = /\$[\w-]+/g;
const VAR_DEFINE_REGEX = /\$[\w-]+(?=\s*:)/g;

const getVariableNames = (pattern: string, regex: RegExp) =>
    globSync(path.join(BASE_DIR, pattern))
        .map(file => fs.readFileSync(file))
        .join("\n")
        .match(regex)
        .filter((value, index, self) => self.indexOf(value) === index) // remove duplicates
        .filter(value => value.startsWith("$ag-"))
        .sort();

const definedInBaseTheme = getVariableNames("src/styles/ag-theme-base/vars/{_ag-theme-base-vars,_font-vars}.scss", VAR_DEFINE_REGEX);
const usedInBaseTheme = getVariableNames("src/styles/{ag-theme-base/sass,mixins,webfont}/**/*.scss", VAR_REGEX);

const definedAndNotUsed = definedInBaseTheme.filter(v => !usedInBaseTheme.includes(v));

if (definedAndNotUsed.length > 0) {
    console.error(`${definedAndNotUsed.length} VARS DEFINED AND NOT USED:\n\t${definedAndNotUsed.join("\n\t")}`);
}

const usedAndNotDefined = usedInBaseTheme.filter(v => !definedInBaseTheme.includes(v));
if (usedAndNotDefined.length > 0) {
    console.error(`${usedAndNotDefined.length} VARS USED AND NOT DEFINED:\n\t${usedAndNotDefined.join("\n\t")}`);
}

if (definedAndNotUsed.length + definedAndNotUsed.length === 0) {
    console.error("Everything looks good...");
}