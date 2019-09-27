/**
 * ag-grid-community - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v21.2.2
 * @link http://www.ag-grid.com/
 * @license MIT
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// class returns a unique id to use for the column. it checks the existing columns, and if the requested
// id is already taken, it will start appending numbers until it gets a unique id.
// eg, if the col field is 'name', it will try ids: {name, name_1, name_2...}
// if no field or id provided in the col, it will try the ids of natural numbers
var utils_1 = require("../utils");
var ColumnKeyCreator = /** @class */ (function () {
    function ColumnKeyCreator() {
        this.existingKeys = [];
    }
    ColumnKeyCreator.prototype.addExistingKeys = function (keys) {
        this.existingKeys = this.existingKeys.concat(keys);
    };
    ColumnKeyCreator.prototype.getUniqueKey = function (colId, colField) {
        // in case user passed in number for colId, convert to string
        colId = utils_1._.toStringOrNull(colId);
        var count = 0;
        while (true) {
            var idToTry = void 0;
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
            if (this.existingKeys.indexOf(idToTry) < 0) {
                this.existingKeys.push(idToTry);
                return idToTry;
            }
            count++;
        }
    };
    return ColumnKeyCreator;
}());
exports.ColumnKeyCreator = ColumnKeyCreator;
