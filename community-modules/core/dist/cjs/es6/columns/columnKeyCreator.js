/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v29.0.0
 * @link https://www.ag-grid.com/
 * @license MIT
 */
"use strict";
// class returns a unique id to use for the column. it checks the existing columns, and if the requested
// id is already taken, it will start appending numbers until it gets a unique id.
// eg, if the col field is 'name', it will try ids: {name, name_1, name_2...}
// if no field or id provided in the col, it will try the ids of natural numbers
Object.defineProperty(exports, "__esModule", { value: true });
exports.ColumnKeyCreator = void 0;
const generic_1 = require("../utils/generic");
class ColumnKeyCreator {
    constructor() {
        this.existingKeys = {};
    }
    addExistingKeys(keys) {
        for (let i = 0; i < keys.length; i++) {
            this.existingKeys[keys[i]] = true;
        }
    }
    getUniqueKey(colId, colField) {
        // in case user passed in number for colId, convert to string
        colId = generic_1.toStringOrNull(colId);
        let count = 0;
        while (true) {
            let idToTry;
            if (colId) {
                idToTry = colId;
                if (count !== 0) {
                    idToTry += '_' + count;
                }
            }
            else if (colField) {
                idToTry = colField;
                if (count !== 0) {
                    idToTry += '_' + count;
                }
            }
            else {
                idToTry = '' + count;
            }
            if (!this.existingKeys[idToTry]) {
                this.existingKeys[idToTry] = true;
                return idToTry;
            }
            count++;
        }
    }
}
exports.ColumnKeyCreator = ColumnKeyCreator;
