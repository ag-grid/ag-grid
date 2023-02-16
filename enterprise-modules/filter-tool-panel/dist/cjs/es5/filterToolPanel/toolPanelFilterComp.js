"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ToolPanelFilterComp = void 0;
var core_1 = require("@ag-grid-community/core");
var ToolPanelFilterComp = /** @class */ (function (_super) {
    __extends(ToolPanelFilterComp, _super);
    function ToolPanelFilterComp(hideHeader) {
        if (hideHeader === void 0) { hideHeader = false; }
        var _this = _super.call(this, ToolPanelFilterComp.TEMPLATE) || this;
        _this.expanded = false;
        _this.hideHeader = hideHeader;
        return _this;
    }
    ToolPanelFilterComp.prototype.postConstruct = function () {
        this.eExpandChecked = core_1._.createIconNoSpan('columnSelectOpen', this.gridOptionsService);
        this.eExpandUnchecked = core_1._.createIconNoSpan('columnSelectClosed', this.gridOptionsService);
        this.eExpand.appendChild(this.eExpandChecked);
        this.eExpand.appendChild(this.eExpandUnchecked);
    };
    ToolPanelFilterComp.prototype.setColumn = function (column) {
        var _this = this;
        this.column = column;
        this.eFilterName.innerText = this.columnModel.getDisplayNameForColumn(this.column, 'filterToolPanel', false) || '';
        this.addManagedListener(this.eFilterToolPanelHeader, 'click', this.toggleExpanded.bind(this));
        this.addManagedListener(this.eFilterToolPanelHeader, 'keydown', function (e) {
            if (e.key === core_1.KeyCode.ENTER) {
                _this.toggleExpanded();
            }
        });
        this.addManagedListener(this.eventService, core_1.Events.EVENT_FILTER_OPENED, this.onFilterOpened.bind(this));
        this.addInIcon('filter', this.eFilterIcon, this.column);
        core_1._.setDisplayed(this.eFilterIcon, this.isFilterActive(), { skipAriaHidden: true });
        core_1._.setDisplayed(this.eExpandChecked, false);
        if (this.hideHeader) {
            core_1._.setDisplayed(this.eFilterToolPanelHeader, false);
            this.eFilterToolPanelHeader.removeAttribute('tabindex');
        }
        else {
            this.eFilterToolPanelHeader.setAttribute('tabindex', '0');
        }
        this.addManagedListener(this.column, core_1.Column.EVENT_FILTER_CHANGED, this.onFilterChanged.bind(this));
    };
    ToolPanelFilterComp.prototype.getColumn = function () {
        return this.column;
    };
    ToolPanelFilterComp.prototype.getColumnFilterName = function () {
        return this.columnModel.getDisplayNameForColumn(this.column, 'filterToolPanel', false);
    };
    ToolPanelFilterComp.prototype.addCssClassToTitleBar = function (cssClass) {
        this.eFilterToolPanelHeader.classList.add(cssClass);
    };
    ToolPanelFilterComp.prototype.addInIcon = function (iconName, eParent, column) {
        if (eParent == null) {
            return;
        }
        var eIcon = core_1._.createIconNoSpan(iconName, this.gridOptionsService, column);
        eParent.appendChild(eIcon);
    };
    ToolPanelFilterComp.prototype.isFilterActive = function () {
        return this.filterManager.isFilterActive(this.column);
    };
    ToolPanelFilterComp.prototype.onFilterChanged = function (event) {
        var _this = this;
        var _a;
        core_1._.setDisplayed(this.eFilterIcon, this.isFilterActive(), { skipAriaHidden: true });
        if (this.expanded &&
            event.source === 'filterDestroyed' && ((_a = event.columns) === null || _a === void 0 ? void 0 : _a.some(function (col) { return col.getId() === _this.column.getId(); })) &&
            this.columnModel.getPrimaryColumn(this.column)) {
            // filter was visible and is now destroyed. If the column still exists, need to recreate UI component
            this.removeFilterElement();
            this.addFilterElement();
        }
        this.dispatchEvent({ type: core_1.Column.EVENT_FILTER_CHANGED });
    };
    ToolPanelFilterComp.prototype.toggleExpanded = function () {
        this.expanded ? this.collapse() : this.expand();
    };
    ToolPanelFilterComp.prototype.expand = function () {
        if (this.expanded) {
            return;
        }
        this.expanded = true;
        core_1._.setAriaExpanded(this.eFilterToolPanelHeader, true);
        core_1._.setDisplayed(this.eExpandChecked, true);
        core_1._.setDisplayed(this.eExpandUnchecked, false);
        this.addFilterElement();
    };
    ToolPanelFilterComp.prototype.addFilterElement = function () {
        var _this = this;
        var filterPanelWrapper = core_1._.loadTemplate(/* html */ "<div class=\"ag-filter-toolpanel-instance-filter\"></div>");
        var filterWrapper = this.filterManager.getOrCreateFilterWrapper(this.column, 'TOOLBAR');
        if (!filterWrapper) {
            return;
        }
        var filterPromise = filterWrapper.filterPromise, guiPromise = filterWrapper.guiPromise;
        filterPromise === null || filterPromise === void 0 ? void 0 : filterPromise.then(function (filter) {
            _this.underlyingFilter = filter;
            if (!filter) {
                return;
            }
            guiPromise.then(function (filterContainerEl) {
                if (filterContainerEl) {
                    filterPanelWrapper.appendChild(filterContainerEl);
                }
                _this.agFilterToolPanelBody.appendChild(filterPanelWrapper);
                if (filter.afterGuiAttached) {
                    filter.afterGuiAttached({ container: 'toolPanel' });
                }
            });
        });
    };
    ToolPanelFilterComp.prototype.collapse = function () {
        var _a, _b;
        if (!this.expanded) {
            return;
        }
        this.expanded = false;
        core_1._.setAriaExpanded(this.eFilterToolPanelHeader, false);
        this.removeFilterElement();
        core_1._.setDisplayed(this.eExpandChecked, false);
        core_1._.setDisplayed(this.eExpandUnchecked, true);
        (_b = (_a = this.underlyingFilter) === null || _a === void 0 ? void 0 : _a.afterGuiDetached) === null || _b === void 0 ? void 0 : _b.call(_a);
    };
    ToolPanelFilterComp.prototype.removeFilterElement = function () {
        core_1._.clearElement(this.agFilterToolPanelBody);
    };
    ToolPanelFilterComp.prototype.isExpanded = function () {
        return this.expanded;
    };
    ToolPanelFilterComp.prototype.refreshFilter = function (isDisplayed) {
        var _a;
        if (!this.expanded) {
            return;
        }
        var filter = this.underlyingFilter;
        if (!filter) {
            return;
        }
        if (isDisplayed) {
            // set filters should be updated when the filter has been changed elsewhere, i.e. via api. Note that we can't
            // use 'afterGuiAttached' to refresh the virtual list as it also focuses on the mini filter which changes the
            // scroll position in the filter list panel
            if (typeof filter.refreshVirtualList === 'function') {
                filter.refreshVirtualList();
            }
        }
        else {
            (_a = filter.afterGuiDetached) === null || _a === void 0 ? void 0 : _a.call(filter);
        }
    };
    ToolPanelFilterComp.prototype.onFilterOpened = function (event) {
        if (event.source !== 'COLUMN_MENU') {
            return;
        }
        if (event.column !== this.column) {
            return;
        }
        if (!this.expanded) {
            return;
        }
        this.collapse();
    };
    ToolPanelFilterComp.TEMPLATE = "\n        <div class=\"ag-filter-toolpanel-instance\">\n            <div class=\"ag-filter-toolpanel-header ag-filter-toolpanel-instance-header\" ref=\"eFilterToolPanelHeader\" role=\"button\" aria-expanded=\"false\">\n                <div ref=\"eExpand\" class=\"ag-filter-toolpanel-expand\"></div>\n                <span ref=\"eFilterName\" class=\"ag-header-cell-text\"></span>\n                <span ref=\"eFilterIcon\" class=\"ag-header-icon ag-filter-icon ag-filter-toolpanel-instance-header-icon\" aria-hidden=\"true\"></span>\n            </div>\n            <div class=\"ag-filter-toolpanel-instance-body ag-filter\" ref=\"agFilterToolPanelBody\"></div>\n        </div>";
    __decorate([
        core_1.RefSelector('eFilterToolPanelHeader')
    ], ToolPanelFilterComp.prototype, "eFilterToolPanelHeader", void 0);
    __decorate([
        core_1.RefSelector('eFilterName')
    ], ToolPanelFilterComp.prototype, "eFilterName", void 0);
    __decorate([
        core_1.RefSelector('agFilterToolPanelBody')
    ], ToolPanelFilterComp.prototype, "agFilterToolPanelBody", void 0);
    __decorate([
        core_1.RefSelector('eFilterIcon')
    ], ToolPanelFilterComp.prototype, "eFilterIcon", void 0);
    __decorate([
        core_1.RefSelector('eExpand')
    ], ToolPanelFilterComp.prototype, "eExpand", void 0);
    __decorate([
        core_1.Autowired('filterManager')
    ], ToolPanelFilterComp.prototype, "filterManager", void 0);
    __decorate([
        core_1.Autowired('columnModel')
    ], ToolPanelFilterComp.prototype, "columnModel", void 0);
    __decorate([
        core_1.PostConstruct
    ], ToolPanelFilterComp.prototype, "postConstruct", null);
    return ToolPanelFilterComp;
}(core_1.Component));
exports.ToolPanelFilterComp = ToolPanelFilterComp;
