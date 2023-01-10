"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ToolPanelFilterComp = void 0;
const core_1 = require("@ag-grid-community/core");
class ToolPanelFilterComp extends core_1.Component {
    constructor(hideHeader = false) {
        super(ToolPanelFilterComp.TEMPLATE);
        this.expanded = false;
        this.hideHeader = hideHeader;
    }
    postConstruct() {
        this.eExpandChecked = core_1._.createIconNoSpan('columnSelectOpen', this.gridOptionsService);
        this.eExpandUnchecked = core_1._.createIconNoSpan('columnSelectClosed', this.gridOptionsService);
        this.eExpand.appendChild(this.eExpandChecked);
        this.eExpand.appendChild(this.eExpandUnchecked);
    }
    setColumn(column) {
        this.column = column;
        this.eFilterName.innerText = this.columnModel.getDisplayNameForColumn(this.column, 'filterToolPanel', false) || '';
        this.addManagedListener(this.eFilterToolPanelHeader, 'click', this.toggleExpanded.bind(this));
        this.addManagedListener(this.eFilterToolPanelHeader, 'keydown', (e) => {
            if (e.key === core_1.KeyCode.ENTER) {
                this.toggleExpanded();
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
    }
    getColumn() {
        return this.column;
    }
    getColumnFilterName() {
        return this.columnModel.getDisplayNameForColumn(this.column, 'filterToolPanel', false);
    }
    addCssClassToTitleBar(cssClass) {
        this.eFilterToolPanelHeader.classList.add(cssClass);
    }
    addInIcon(iconName, eParent, column) {
        if (eParent == null) {
            return;
        }
        const eIcon = core_1._.createIconNoSpan(iconName, this.gridOptionsService, column);
        eParent.appendChild(eIcon);
    }
    isFilterActive() {
        return this.filterManager.isFilterActive(this.column);
    }
    onFilterChanged() {
        core_1._.setDisplayed(this.eFilterIcon, this.isFilterActive(), { skipAriaHidden: true });
        this.dispatchEvent({ type: core_1.Column.EVENT_FILTER_CHANGED });
    }
    toggleExpanded() {
        this.expanded ? this.collapse() : this.expand();
    }
    expand() {
        if (this.expanded) {
            return;
        }
        this.expanded = true;
        core_1._.setAriaExpanded(this.eFilterToolPanelHeader, true);
        core_1._.setDisplayed(this.eExpandChecked, true);
        core_1._.setDisplayed(this.eExpandUnchecked, false);
        const filterPanelWrapper = core_1._.loadTemplate(/* html */ `<div class="ag-filter-toolpanel-instance-filter"></div>`);
        const filterWrapper = this.filterManager.getOrCreateFilterWrapper(this.column, 'TOOLBAR');
        if (!filterWrapper) {
            return;
        }
        const { filterPromise, guiPromise } = filterWrapper;
        filterPromise === null || filterPromise === void 0 ? void 0 : filterPromise.then(filter => {
            this.underlyingFilter = filter;
            if (!filter) {
                return;
            }
            guiPromise.then(filterContainerEl => {
                if (filterContainerEl) {
                    filterPanelWrapper.appendChild(filterContainerEl);
                }
                this.agFilterToolPanelBody.appendChild(filterPanelWrapper);
                if (filter.afterGuiAttached) {
                    filter.afterGuiAttached({ container: 'toolPanel' });
                }
            });
        });
    }
    collapse() {
        if (!this.expanded) {
            return;
        }
        this.expanded = false;
        core_1._.setAriaExpanded(this.eFilterToolPanelHeader, false);
        this.agFilterToolPanelBody.removeChild(this.agFilterToolPanelBody.children[0]);
        core_1._.setDisplayed(this.eExpandChecked, false);
        core_1._.setDisplayed(this.eExpandUnchecked, true);
    }
    refreshFilter() {
        if (!this.expanded) {
            return;
        }
        const filter = this.underlyingFilter;
        if (!filter) {
            return;
        }
        // set filters should be updated when the filter has been changed elsewhere, i.e. via api. Note that we can't
        // use 'afterGuiAttached' to refresh the virtual list as it also focuses on the mini filter which changes the
        // scroll position in the filter list panel
        if (typeof filter.refreshVirtualList === 'function') {
            filter.refreshVirtualList();
        }
    }
    onFilterOpened(event) {
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
    }
}
ToolPanelFilterComp.TEMPLATE = `
        <div class="ag-filter-toolpanel-instance">
            <div class="ag-filter-toolpanel-header ag-filter-toolpanel-instance-header" ref="eFilterToolPanelHeader" role="button" aria-expanded="false">
                <div ref="eExpand" class="ag-filter-toolpanel-expand"></div>
                <span ref="eFilterName" class="ag-header-cell-text"></span>
                <span ref="eFilterIcon" class="ag-header-icon ag-filter-icon ag-filter-toolpanel-instance-header-icon" aria-hidden="true"></span>
            </div>
            <div class="ag-filter-toolpanel-instance-body ag-filter" ref="agFilterToolPanelBody"></div>
        </div>`;
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
exports.ToolPanelFilterComp = ToolPanelFilterComp;
