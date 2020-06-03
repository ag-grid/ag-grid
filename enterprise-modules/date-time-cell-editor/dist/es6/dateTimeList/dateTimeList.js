var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
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
import { Component, PostConstruct, _, RefSelector } from '@ag-grid-community/core';
import { DateTimeListModel } from './dateTimeListModel';
var DateTimeList = /** @class */ (function (_super) {
    __extends(DateTimeList, _super);
    function DateTimeList(options) {
        var _this = _super.call(this) || this;
        _this.currentPageNumber = 0;
        _this.model = new DateTimeListModel();
        _this.columnLabels = [];
        _this.rowComps = [];
        _this.onValueSelect = options.onValueSelect;
        _this.initialValue = _this.model.roundToValue(options.initialValue || new Date());
        return _this;
    }
    DateTimeList.prototype.init = function () {
        this.setTemplate(DateTimeList.TEMPLATE);
        this.addManagedListener(this.ePrevPageButton, 'click', this.navigatePage.bind(this, -1));
        this.addManagedListener(this.eNextPageButton, 'click', this.navigatePage.bind(this, 1));
        this.addManagedListener(this.getGui(), 'focus', this.handleFocusChange.bind(this, true));
        this.addManagedListener(this.getGui(), 'blur', this.handleFocusChange.bind(this, false));
        this.addManagedListener(this.getGui(), 'keydown', this.handleKeyDown.bind(this));
        this.showPage(0);
    };
    DateTimeList.prototype.focus = function () {
        this.getGui().focus();
        this.handleFocusChange(true);
    };
    DateTimeList.prototype.showPage = function (number) {
        var _this = this;
        this.currentPageNumber = number;
        var page = this.model.getPage(this.initialValue, number);
        this.eTitle.textContent = page.title;
        page.entries.forEach(function (row, i) { return _this.getRowComp(i).setEntries(row); });
        this.rowComps.forEach(function (comp, i) { return comp.setDisplayed(i < page.entries.length); });
        page.columns.forEach(function (column, i) { return _this.getColumnLabel(i).textContent = column.label; });
        this.columnLabels.forEach(function (columnLabel, i) { return _.setDisplayed(columnLabel, i < page.columns.length); });
    };
    DateTimeList.prototype.getRowComp = function (index) {
        if (!this.rowComps[index]) {
            var rowComp = new DateTimeListPageEntriesRowComp(this.onValueSelect);
            this.appendChild(rowComp, this.eEntriesTable);
            this.rowComps[index] = rowComp;
        }
        return this.rowComps[index];
    };
    DateTimeList.prototype.getColumnLabel = function (index) {
        if (!this.columnLabels[index]) {
            var label = _.loadTemplate("<div class=\"ag-date-time-list-page-column-label\"></div>");
            this.appendChild(label, this.eLabelsRow);
            this.columnLabels[index] = label;
        }
        return this.columnLabels[index];
    };
    DateTimeList.prototype.handleKeyDown = function (e) {
        e.preventDefault();
        if (e.key === 'ArrowUp') {
            this.navigateCurrentCell(0, -1);
        }
        if (e.key === 'ArrowDown') {
            this.navigateCurrentCell(0, 1);
        }
        if (e.key === 'ArrowLeft') {
            this.navigateCurrentCell(-1, 0);
        }
        if (e.key === 'ArrowRight') {
            this.navigateCurrentCell(1, 0);
        }
    };
    DateTimeList.prototype.handleFocusChange = function (hasFocus) {
        _.addOrRemoveCssClass(this.getGui(), 'ag-has-focus', hasFocus);
    };
    DateTimeList.prototype.navigatePage = function (relativePage) {
        this.showPage(this.currentPageNumber + relativePage);
    };
    DateTimeList.prototype.navigateCurrentCell = function (x, y) {
        // TODO - next up: implement arrow key navigation
        throw new Error("not implemented");
    };
    DateTimeList.TEMPLATE = "<div class=\"ag-date-time-list\" tabindex=\"-1\">\n            <div class=\"ag-date-time-list-page\">\n                <div class=\"ag-date-time-list-page-title-bar\">\n                    <button ref=\"ePrevPageButton\" class=\"ag-date-time-list-page-prev-button\">&lt;</button>\n                    <div ref=\"eTitle\" class=\"ag-date-time-list-page-title\"></div>\n                    <button ref=\"eNextPageButton\" class=\"ag-date-time-list-page-next-button\">&gt;</button>\n                </div>\n                <div ref=\"eLabelsRow\" class=\"ag-date-time-list-page-column-labels-row\"></div>\n                <div ref=\"eEntriesTable\" class=\"ag-date-time-list-page-entries\"></div>\n            </div>\n        </div>\n    ";
    __decorate([
        RefSelector('ePrevPageButton')
    ], DateTimeList.prototype, "ePrevPageButton", void 0);
    __decorate([
        RefSelector('eTitle')
    ], DateTimeList.prototype, "eTitle", void 0);
    __decorate([
        RefSelector('eNextPageButton')
    ], DateTimeList.prototype, "eNextPageButton", void 0);
    __decorate([
        RefSelector('eLabelsRow')
    ], DateTimeList.prototype, "eLabelsRow", void 0);
    __decorate([
        RefSelector('eEntriesTable')
    ], DateTimeList.prototype, "eEntriesTable", void 0);
    __decorate([
        PostConstruct
    ], DateTimeList.prototype, "init", null);
    return DateTimeList;
}(Component));
export { DateTimeList };
var DateTimeListPageEntriesRowComp = /** @class */ (function (_super) {
    __extends(DateTimeListPageEntriesRowComp, _super);
    function DateTimeListPageEntriesRowComp(onValueSelect) {
        var _this = _super.call(this, DateTimeListPageEntriesRowComp.TEMPLATE) || this;
        _this.onValueSelect = onValueSelect;
        _this.entryComps = [];
        return _this;
    }
    DateTimeListPageEntriesRowComp.prototype.setEntries = function (entries, currentValue) {
        var _this = this;
        entries.forEach(function (entry, i) { return _this.getEntryComponent(i).setEntry(entry, currentValue); });
        this.entryComps.forEach(function (comp, i) { return comp.setDisplayed(i < entries.length); });
    };
    DateTimeListPageEntriesRowComp.prototype.setCurrentValue = function (value) {
        this.entryComps.forEach(function (c) { return c.setCurrentValue(value); });
    };
    DateTimeListPageEntriesRowComp.prototype.getEntryComponent = function (index) {
        if (!this.entryComps[index]) {
            this.entryComps[index] = new DateTimeListPageEntryComp(this.onValueSelect);
            this.appendChild(this.entryComps[index]);
        }
        return this.entryComps[index];
    };
    DateTimeListPageEntriesRowComp.TEMPLATE = "<div class=\"ag-date-time-list-page-entries-row\"></div>";
    return DateTimeListPageEntriesRowComp;
}(Component));
var DateTimeListPageEntryComp = /** @class */ (function (_super) {
    __extends(DateTimeListPageEntryComp, _super);
    function DateTimeListPageEntryComp(onValueSelect) {
        var _this = _super.call(this, DateTimeListPageEntryComp.TEMPLATE) || this;
        _this.onValueSelect = onValueSelect;
        _this.addManagedListener(_this.getGui(), 'click', _this.handleClick.bind(_this));
        return _this;
    }
    DateTimeListPageEntryComp.prototype.setEntry = function (entry, currentValue) {
        if (currentValue) {
            this.currentValue = currentValue;
        }
        this.entry = entry;
        this.getGui().textContent = entry.label;
        _.addOrRemoveCssClass(this.getGui(), 'ag-date-time-list-page-entry-is-padding', entry.isPadding);
        this.onDataChange();
    };
    DateTimeListPageEntryComp.prototype.setCurrentValue = function (value) {
        this.currentValue = value;
        this.onDataChange();
    };
    DateTimeListPageEntryComp.prototype.handleClick = function () {
        this.onValueSelect(this.entry.value);
    };
    DateTimeListPageEntryComp.prototype.onDataChange = function () {
        console.log(this.entry.value, this.currentValue);
        _.addOrRemoveCssClass(this.getGui(), 'ag-date-time-list-page-entry-is-current', this.entry.value && this.currentValue && this.entry.value.getTime() === this.currentValue.getTime());
    };
    DateTimeListPageEntryComp.TEMPLATE = "<div class=\"ag-date-time-list-page-entry\"></div>";
    return DateTimeListPageEntryComp;
}(Component));
