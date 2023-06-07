var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { _, Autowired, Column, Component, Events, KeyCode, PostConstruct, RefSelector } from "@ag-grid-community/core";
export class ToolPanelFilterComp extends Component {
    constructor(hideHeader = false) {
        super(ToolPanelFilterComp.TEMPLATE);
        this.expanded = false;
        this.hideHeader = hideHeader;
    }
    postConstruct() {
        this.eExpandChecked = _.createIconNoSpan('columnSelectOpen', this.gridOptionsService);
        this.eExpandUnchecked = _.createIconNoSpan('columnSelectClosed', this.gridOptionsService);
        this.eExpand.appendChild(this.eExpandChecked);
        this.eExpand.appendChild(this.eExpandUnchecked);
    }
    setColumn(column) {
        this.column = column;
        this.eFilterName.innerText = this.columnModel.getDisplayNameForColumn(this.column, 'filterToolPanel', false) || '';
        this.addManagedListener(this.eFilterToolPanelHeader, 'click', this.toggleExpanded.bind(this));
        this.addManagedListener(this.eFilterToolPanelHeader, 'keydown', (e) => {
            if (e.key === KeyCode.ENTER) {
                this.toggleExpanded();
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
        const eIcon = _.createIconNoSpan(iconName, this.gridOptionsService, column);
        eParent.appendChild(eIcon);
    }
    isFilterActive() {
        return this.filterManager.isFilterActive(this.column);
    }
    onFilterChanged() {
        _.setDisplayed(this.eFilterIcon, this.isFilterActive(), { skipAriaHidden: true });
        this.dispatchEvent({ type: Column.EVENT_FILTER_CHANGED });
    }
    onFilterDestroyed(event) {
        if (this.expanded &&
            event.source === 'api' &&
            event.column.getId() === this.column.getId() &&
            this.columnModel.getPrimaryColumn(this.column)) {
            // filter was visible and has been destroyed by the API. If the column still exists, need to recreate UI component
            this.removeFilterElement();
            this.addFilterElement();
        }
    }
    toggleExpanded() {
        this.expanded ? this.collapse() : this.expand();
    }
    expand() {
        if (this.expanded) {
            return;
        }
        this.expanded = true;
        _.setAriaExpanded(this.eFilterToolPanelHeader, true);
        _.setDisplayed(this.eExpandChecked, true);
        _.setDisplayed(this.eExpandUnchecked, false);
        this.addFilterElement();
    }
    addFilterElement() {
        const filterPanelWrapper = _.loadTemplate(/* html */ `<div class="ag-filter-toolpanel-instance-filter"></div>`);
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
    }
    removeFilterElement() {
        _.clearElement(this.agFilterToolPanelBody);
    }
    isExpanded() {
        return this.expanded;
    }
    refreshFilter(isDisplayed) {
        var _a;
        if (!this.expanded) {
            return;
        }
        const filter = this.underlyingFilter;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidG9vbFBhbmVsRmlsdGVyQ29tcC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9maWx0ZXJUb29sUGFuZWwvdG9vbFBhbmVsRmlsdGVyQ29tcC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQSxPQUFPLEVBQ0gsQ0FBQyxFQUNELFNBQVMsRUFDVCxNQUFNLEVBRU4sU0FBUyxFQUNULE1BQU0sRUFJTixPQUFPLEVBQ1AsYUFBYSxFQUNiLFdBQVcsRUFFZCxNQUFNLHlCQUF5QixDQUFDO0FBRWpDLE1BQU0sT0FBTyxtQkFBb0IsU0FBUSxTQUFTO0lBMkI5QyxZQUFZLFVBQVUsR0FBRyxLQUFLO1FBQzFCLEtBQUssQ0FBQyxtQkFBbUIsQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUpoQyxhQUFRLEdBQVksS0FBSyxDQUFDO1FBSzlCLElBQUksQ0FBQyxVQUFVLEdBQUcsVUFBVSxDQUFDO0lBQ2pDLENBQUM7SUFHTyxhQUFhO1FBQ2pCLElBQUksQ0FBQyxjQUFjLEdBQUcsQ0FBQyxDQUFDLGdCQUFnQixDQUFDLGtCQUFrQixFQUFFLElBQUksQ0FBQyxrQkFBa0IsQ0FBRSxDQUFDO1FBQ3ZGLElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxDQUFDLENBQUMsZ0JBQWdCLENBQUMsb0JBQW9CLEVBQUUsSUFBSSxDQUFDLGtCQUFrQixDQUFFLENBQUM7UUFDM0YsSUFBSSxDQUFDLE9BQU8sQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxDQUFDO1FBQzlDLElBQUksQ0FBQyxPQUFPLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO0lBQ3BELENBQUM7SUFFTSxTQUFTLENBQUMsTUFBYztRQUMzQixJQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQztRQUNyQixJQUFJLENBQUMsV0FBVyxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLHVCQUF1QixDQUFDLElBQUksQ0FB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