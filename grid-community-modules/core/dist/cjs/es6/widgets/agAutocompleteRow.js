"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgAutocompleteRow = void 0;
const string_1 = require("../utils/string");
const generic_1 = require("../utils/generic");
const component_1 = require("./component");
class AgAutocompleteRow extends component_1.Component {
    constructor() {
        super(/* html */ `
        <div class="ag-autocomplete-row" role="presentation">
            <div class="ag-autocomplete-row-label"></div>
        </div>`);
        this.hasHighlighting = false;
    }
    setState(value, selected) {
        this.value = value;
        this.render();
        this.updateSelected(selected);
    }
    updateSelected(selected) {
        this.addOrRemoveCssClass('ag-autocomplete-row-selected', selected);
    }
    setSearchString(searchString) {
        var _a;
        let keepHighlighting = false;
        if ((0, generic_1.exists)(searchString)) {
            const index = (_a = this.value) === null || _a === void 0 ? void 0 : _a.toLocaleLowerCase().indexOf(searchString.toLocaleLowerCase());
            if (index >= 0) {
                keepHighlighting = true;
                this.hasHighlighting = true;
                const highlightEndIndex = index + searchString.length;
                const startPart = (0, string_1.escapeString)(this.value.slice(0, index));
                const highlightedPart = (0, string_1.escapeString)(this.value.slice(index, highlightEndIndex));
                const endPart = (0, string_1.escapeString)(this.value.slice(highlightEndIndex));
                this.getGui().lastElementChild.innerHTML = `${startPart}<b>${highlightedPart}</b>${endPart}`;
            }
        }
        if (!keepHighlighting && this.hasHighlighting) {
            this.hasHighlighting = false;
            this.render();
        }
    }
    render() {
        var _a;
        // putting in blank if missing, so at least the user can click on it
        this.getGui().lastElementChild.innerHTML = (_a = (0, string_1.escapeString)(this.value)) !== null && _a !== void 0 ? _a : '&nbsp;';
    }
}
exports.AgAutocompleteRow = AgAutocompleteRow;
