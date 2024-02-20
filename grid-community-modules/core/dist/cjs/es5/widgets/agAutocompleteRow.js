"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgAutocompleteRow = void 0;
var string_1 = require("../utils/string");
var generic_1 = require("../utils/generic");
var component_1 = require("./component");
var AgAutocompleteRow = /** @class */ (function (_super) {
    __extends(AgAutocompleteRow, _super);
    function AgAutocompleteRow() {
        var _this = _super.call(this, /* html */ "\n        <div class=\"ag-autocomplete-row\" role=\"presentation\">\n            <div class=\"ag-autocomplete-row-label\"></div>\n        </div>") || this;
        _this.hasHighlighting = false;
        return _this;
    }
    AgAutocompleteRow.prototype.setState = function (value, selected) {
        this.value = value;
        this.render();
        this.updateSelected(selected);
    };
    AgAutocompleteRow.prototype.updateSelected = function (selected) {
        this.addOrRemoveCssClass('ag-autocomplete-row-selected', selected);
    };
    AgAutocompleteRow.prototype.setSearchString = function (searchString) {
        var _a;
        var keepHighlighting = false;
        if ((0, generic_1.exists)(searchString)) {
            var index = (_a = this.value) === null || _a === void 0 ? void 0 : _a.toLocaleLowerCase().indexOf(searchString.toLocaleLowerCase());
            if (index >= 0) {
                keepHighlighting = true;
                this.hasHighlighting = true;
                var highlightEndIndex = index + searchString.length;
                var startPart = (0, string_1.escapeString)(this.value.slice(0, index));
                var highlightedPart = (0, string_1.escapeString)(this.value.slice(index, highlightEndIndex));
                var endPart = (0, string_1.escapeString)(this.value.slice(highlightEndIndex));
                this.getGui().lastElementChild.innerHTML = "".concat(startPart, "<b>").concat(highlightedPart, "</b>").concat(endPart);
            }
        }
        if (!keepHighlighting && this.hasHighlighting) {
            this.hasHighlighting = false;
            this.render();
        }
    };
    AgAutocompleteRow.prototype.render = function () {
        var _a;
        // putting in blank if missing, so at least the user can click on it
        this.getGui().lastElementChild.innerHTML = (_a = (0, string_1.escapeString)(this.value)) !== null && _a !== void 0 ? _a : '&nbsp;';
    };
    return AgAutocompleteRow;
}(component_1.Component));
exports.AgAutocompleteRow = AgAutocompleteRow;
