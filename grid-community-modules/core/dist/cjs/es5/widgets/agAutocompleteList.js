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
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgAutocompleteList = void 0;
var componentAnnotations_1 = require("./componentAnnotations");
var virtualList_1 = require("./virtualList");
var keyCode_1 = require("../constants/keyCode");
var agAutocompleteRow_1 = require("./agAutocompleteRow");
var fuzzyMatch_1 = require("../utils/fuzzyMatch");
var popupComponent_1 = require("./popupComponent");
var context_1 = require("../context/context");
var generic_1 = require("../utils/generic");
var AgAutocompleteList = /** @class */ (function (_super) {
    __extends(AgAutocompleteList, _super);
    function AgAutocompleteList(params) {
        var _this = _super.call(this, AgAutocompleteList.TEMPLATE) || this;
        _this.params = params;
        _this.searchString = '';
        return _this;
    }
    AgAutocompleteList.prototype.destroy = function () {
        _super.prototype.destroy.call(this);
    };
    AgAutocompleteList.prototype.init = function () {
        var _this = this;
        this.autocompleteEntries = this.params.autocompleteEntries;
        this.virtualList = this.createManagedBean(new virtualList_1.VirtualList({ cssIdentifier: 'autocomplete' }));
        this.virtualList.setComponentCreator(this.createRowComponent.bind(this));
        this.eList.appendChild(this.virtualList.getGui());
        this.virtualList.setModel({
            getRowCount: function () { return _this.autocompleteEntries.length; },
            getRow: function (index) { return _this.autocompleteEntries[index]; }
        });
        var virtualListGui = this.virtualList.getGui();
        this.addManagedListener(virtualListGui, 'click', function () { return _this.params.onConfirmed(); });
        this.addManagedListener(virtualListGui, 'mousemove', this.onMouseMove.bind(this));
        this.addManagedListener(virtualListGui, 'mousedown', function (e) { return e.preventDefault(); });
        this.setSelectedValue(0);
    };
    AgAutocompleteList.prototype.onNavigationKeyDown = function (event, key) {
        // if we don't preventDefault the page body and/or grid scroll will move.
        event.preventDefault();
        var oldIndex = this.autocompleteEntries.indexOf(this.selectedValue);
        var newIndex = key === keyCode_1.KeyCode.UP ? oldIndex - 1 : oldIndex + 1;
        this.checkSetSelectedValue(newIndex);
    };
    AgAutocompleteList.prototype.setSearch = function (searchString) {
        this.searchString = searchString;
        if ((0, generic_1.exists)(searchString)) {
            this.runSearch();
        }
        else {
            // reset
            this.autocompleteEntries = this.params.autocompleteEntries;
            this.virtualList.refresh();
            this.checkSetSelectedValue(0);
        }
        this.updateSearchInList();
    };
    AgAutocompleteList.prototype.runContainsSearch = function (searchString, searchStrings) {
        var topMatch;
        var topMatchStartsWithSearchString = false;
        var lowerCaseSearchString = searchString.toLocaleLowerCase();
        var allMatches = searchStrings.filter(function (string) {
            var lowerCaseString = string.toLocaleLowerCase();
            var index = lowerCaseString.indexOf(lowerCaseSearchString);
            var startsWithSearchString = index === 0;
            var isMatch = index >= 0;
            // top match is shortest value that starts with the search string, otherwise shortest value that includes the search string
            if (isMatch && (!topMatch ||
                (!topMatchStartsWithSearchString && startsWithSearchString) ||
                (topMatchStartsWithSearchString === startsWithSearchString && string.length < topMatch.length))) {
                topMatch = string;
                topMatchStartsWithSearchString = startsWithSearchString;
            }
            return isMatch;
        });
        if (!topMatch && allMatches.length) {
            topMatch = allMatches[0];
        }
        return { topMatch: topMatch, allMatches: allMatches };
    };
    AgAutocompleteList.prototype.runSearch = function () {
        var _a, _b;
        var autocompleteEntries = this.params.autocompleteEntries;
        var searchStrings = autocompleteEntries.map(function (v) { var _a; return (_a = v.displayValue) !== null && _a !== void 0 ? _a : v.key; });
        var matchingStrings;
        var topSuggestion;
        if (this.params.useFuzzySearch) {
            matchingStrings = (0, fuzzyMatch_1.fuzzySuggestions)(this.searchString, searchStrings, true).values;
            topSuggestion = matchingStrings.length ? matchingStrings[0] : undefined;
        }
        else {
            var containsMatches = this.runContainsSearch(this.searchString, searchStrings);
            matchingStrings = containsMatches.allMatches;
            topSuggestion = containsMatches.topMatch;
        }
        var filteredEntries = autocompleteEntries.filter(function (_a) {
            var key = _a.key, displayValue = _a.displayValue;
            return matchingStrings.includes(displayValue !== null && displayValue !== void 0 ? displayValue : key);
        });
        if (!filteredEntries.length && this.selectedValue && ((_b = (_a = this.params) === null || _a === void 0 ? void 0 : _a.forceLastSelection) === null || _b === void 0 ? void 0 : _b.call(_a, this.selectedValue, this.searchString))) {
            filteredEntries = [this.selectedValue];
        }
        this.autocompleteEntries = filteredEntries;
        this.virtualList.refresh();
        if (!topSuggestion) {
            return;
        }
        var topSuggestionIndex = matchingStrings.indexOf(topSuggestion);
        this.checkSetSelectedValue(topSuggestionIndex);
    };
    AgAutocompleteList.prototype.updateSearchInList = function () {
        var _this = this;
        this.virtualList.forEachRenderedRow(function (row) { return row.setSearchString(_this.searchString); });
    };
    AgAutocompleteList.prototype.checkSetSelectedValue = function (index) {
        if (index >= 0 && index < this.autocompleteEntries.length) {
            this.setSelectedValue(index);
        }
    };
    AgAutocompleteList.prototype.setSelectedValue = function (index) {
        var value = this.autocompleteEntries[index];
        if (this.selectedValue === value) {
            return;
        }
        this.selectedValue = value;
        this.virtualList.ensureIndexVisible(index);
        this.virtualList.forEachRenderedRow(function (cmp, idx) {
            cmp.updateSelected(index === idx);
        });
    };
    AgAutocompleteList.prototype.createRowComponent = function (value) {
        var _a;
        var row = new agAutocompleteRow_1.AgAutocompleteRow();
        this.getContext().createBean(row);
        row.setState((_a = value.displayValue) !== null && _a !== void 0 ? _a : value.key, value === this.selectedValue);
        return row;
    };
    AgAutocompleteList.prototype.onMouseMove = function (mouseEvent) {
        var rect = this.virtualList.getGui().getBoundingClientRect();
        var scrollTop = this.virtualList.getScrollTop();
        var mouseY = mouseEvent.clientY - rect.top + scrollTop;
        var row = Math.floor(mouseY / this.virtualList.getRowHeight());
        this.checkSetSelectedValue(row);
    };
    AgAutocompleteList.prototype.afterGuiAttached = function () {
        this.virtualList.refresh();
    };
    AgAutocompleteList.prototype.getSelectedValue = function () {
        var _a;
        if (!this.autocompleteEntries.length) {
            return null;
        }
        ;
        return (_a = this.selectedValue) !== null && _a !== void 0 ? _a : null;
    };
    AgAutocompleteList.TEMPLATE = "<div class=\"ag-autocomplete-list-popup\">\n            <div ref=\"eList\" class=\"ag-autocomplete-list\"></div>\n        <div>";
    __decorate([
        (0, componentAnnotations_1.RefSelector)('eList')
    ], AgAutocompleteList.prototype, "eList", void 0);
    __decorate([
        context_1.PostConstruct
    ], AgAutocompleteList.prototype, "init", null);
    return AgAutocompleteList;
}(popupComponent_1.PopupComponent));
exports.AgAutocompleteList = AgAutocompleteList;
