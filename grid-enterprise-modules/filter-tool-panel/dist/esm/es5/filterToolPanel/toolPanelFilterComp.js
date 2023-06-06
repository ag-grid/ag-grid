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
import { _, Autowired, Column, Component, Events, KeyCode, PostConstruct, RefSelector } from "@ag-grid-community/core";
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
        this.eExpandChecked = _.createIconNoSpan('columnSelectOpen', this.gridOptionsService);
        this.eExpandUnchecked = _.createIconNoSpan('columnSelectClosed', this.gridOptionsService);
        this.eExpand.appendChild(this.eExpandChecked);
        this.eExpand.appendChild(this.eExpandUnchecked);
    };
    ToolPanelFilterComp.prototype.setColumn = function (column) {
        var _this = this;
        this.column = column;
        this.eFilterName.innerText = this.columnModel.getDisplayNameForColumn(this.column, 'filterToolPanel', false) || '';
        this.addManagedListener(this.eFilterToolPanelHeader, 'click', this.toggleExpanded.bind(this));
        this.addManagedListener(this.eFilterToolPanelHeader, 'keydown', function (e) {
            if (e.key === KeyCode.ENTER) {
                _this.toggleExpanded();
            }
        });
        this.addManagedListener(this.eventService, Events.EVENT_FILTER_OPENED, this.onFilterOpened.bind(this));
        this.addInIcon('filter', this.eFilterIcon, this.column);
        _.setDisplayed(this.eFilterIcon, this.isFilterActive(), { skipAriaHidden: true });
        _.setDisplayed(this.eExpandChecked, false);
        if (this.hideHeader) {
            _.setDisplayed(this.eFilterToolPanelHeader, false);
            this.eFilterToolPanelHeader.removeAttribute('tabindex');
        }
        else {
            this.eFilterToolPanelHeader.setAttribute('tabindex', '0');
        }
        this.addManagedListener(this.column, Column.EVENT_FILTER_CHANGED, this.onFilterChanged.bind(this));
        this.addManagedListener(this.eventService, Events.EVENT_FILTER_DESTROYED, this.onFilterDestroyed.bind(this));
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
        var eIcon = _.createIconNoSpan(iconName, this.gridOptionsService, column);
        eParent.appendChild(eIcon);
    };
    ToolPanelFilterComp.prototype.isFilterActive = function () {
        return this.filterManager.isFilterActive(this.column);
    };
    ToolPanelFilterComp.prototype.onFilterChanged = function () {
        _.setDisplayed(this.eFilterIcon, this.isFilterActive(), { skipAriaHidden: true });
        this.dispatchEvent({ type: Column.EVENT_FILTER_CHANGED });
    };
    ToolPanelFilterComp.prototype.onFilterDestroyed = function (event) {
        if (this.expanded &&
            event.source === 'api' &&
            event.column.getId() === this.column.getId() &&
            this.columnModel.getPrimaryColumn(this.column)) {
            // filter was visible and has been destroyed by the API. If the column still exists, need to recreate UI component
            this.removeFilterElement();
            this.addFilterElement();
        }
    };
    ToolPanelFilterComp.prototype.toggleExpanded = function () {
        this.expanded ? this.collapse() : this.expand();
    };
    ToolPanelFilterComp.prototype.expand = function () {
        if (this.expanded) {
            return;
        }
        this.expanded = true;
        _.setAriaExpanded(this.eFilterToolPanelHeader, true);
        _.setDisplayed(this.eExpandChecked, true);
        _.setDisplayed(this.eExpandUnchecked, false);
        this.addFilterElement();
    };
    ToolPanelFilterComp.prototype.addFilterElement = function () {
        var _this = this;
        var filterPanelWrapper = _.loadTemplate(/* html */ "<div class=\"ag-filter-toolpanel-instance-filter\"></div>");
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
        _.setAriaExpanded(this.eFilterToolPanelHeader, false);
        this.removeFilterElement();
        _.setDisplayed(this.eExpandChecked, false);
        _.setDisplayed(this.eExpandUnchecked, true);
        (_b = (_a = this.underlyingFilter) === null || _a === void 0 ? void 0 : _a.afterGuiDetached) === null || _b === void 0 ? void 0 : _b.call(_a);
    };
    ToolPanelFilterComp.prototype.removeFilterElement = function () {
        _.clearElement(this.agFilterToolPanelBody);
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
        RefSelector('eFilterToolPanelHeader')
    ], ToolPanelFilterComp.prototype, "eFilterToolPanelHeader", void 0);
    __decorate([
        RefSelector('eFilterName')
    ], ToolPanelFilterComp.prototype, "eFilterName", void 0);
    __decorate([
        RefSelector('agFilterToolPanelBody')
    ], ToolPanelFilterComp.prototype, "agFilterToolPanelBody", void 0);
    __decorate([
        RefSelector('eFilterIcon')
    ], ToolPanelFilterComp.prototype, "eFilterIcon", void 0);
    __decorate([
        RefSelector('eExpand')
    ], ToolPanelFilterComp.prototype, "eExpand", void 0);
    __decorate([
        Autowired('filterManager')
    ], ToolPanelFilterComp.prototype, "filterManager", void 0);
    __decorate([
        Autowired('columnModel')
    ], ToolPanelFilterComp.prototype, "columnModel", void 0);
    __decorate([
        PostConstruct
    ], ToolPanelFilterComp.prototype, "postConstruct", null);
    return ToolPanelFilterComp;
}(Component));
export { ToolPanelFilterComp };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidG9vbFBhbmVsRmlsdGVyQ29tcC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9maWx0ZXJUb29sUGFuZWwvdG9vbFBhbmVsRmlsdGVyQ29tcC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSxPQUFPLEVBQ0gsQ0FBQyxFQUNELFNBQVMsRUFDVCxNQUFNLEVBRU4sU0FBUyxFQUNULE1BQU0sRUFJTixPQUFPLEVBQ1AsYUFBYSxFQUNiLFdBQVcsRUFFZCxNQUFNLHlCQUF5QixDQUFDO0FBRWpDO0lBQXlDLHVDQUFTO0lBMkI5Qyw2QkFBWSxVQUFrQjtRQUFsQiwyQkFBQSxFQUFBLGtCQUFrQjtRQUE5QixZQUNJLGtCQUFNLG1CQUFtQixDQUFDLFFBQVEsQ0FBQyxTQUV0QztRQU5PLGNBQVEsR0FBWSxLQUFLLENBQUM7UUFLOUIsS0FBSSxDQUFDLFVBQVUsR0FBRyxVQUFVLENBQUM7O0lBQ2pDLENBQUM7SUFHTywyQ0FBYSxHQUFyQjtRQUNJLElBQUksQ0FBQyxjQUFjLEdBQUcsQ0FBQyxDQUFDLGdCQUFnQixDQUFDLGtCQUFrQixFQUFFLElBQUksQ0FBQyxrQkFBa0IsQ0FBRSxDQUFDO1FBQ3ZGLElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxDQUFDLENBQUMsZ0JBQWdCLENBQUMsb0JBQW9CLEVBQUUsSUFBSSxDQUFDLGtCQUFrQixDQUFFLENBQUM7UUFDM0YsSUFBSSxDQUFDLE9BQU8sQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxDQUFDO1FBQzlDLElBQUksQ0FBQyxPQUFPLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO0lBQ3BELENBQUM7SUFFTSx1Q0FBUyxHQUFoQixVQUFpQixNQUFjO1FBQS9CLGlCQXdCQztRQXZCRyxJQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQztRQUNyQixJQUFJLENBQUMsV0FBVyxDQUFDLFNBQVMs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