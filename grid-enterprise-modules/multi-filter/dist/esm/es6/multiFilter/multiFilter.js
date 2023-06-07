var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { ProvidedFilter, AgPromise, Autowired, AgGroupComponent, TabGuardComp, AgMenuItemComponent, PostConstruct, _ } from '@ag-grid-community/core';
export class MultiFilter extends TabGuardComp {
    constructor() {
        super(/* html */ `<div class="ag-multi-filter ag-menu-list-compact"></div>`);
        this.filterDefs = [];
        this.filters = [];
        this.guiDestroyFuncs = [];
        this.activeFilterIndices = [];
        this.lastActivatedMenuItem = null;
        this.afterFiltersReadyFuncs = [];
    }
    postConstruct() {
        this.initialiseTabGuard({
            onFocusIn: e => this.onFocusIn(e)
        });
    }
    static getFilterDefs(params) {
        const { filters } = params;
        return filters && filters.length > 0 ?
            filters :
            [{ filter: 'agTextColumnFilter' }, { filter: 'agSetColumnFilter' }];
    }
    init(params) {
        this.params = params;
        this.filterDefs = MultiFilter.getFilterDefs(params);
        const { column, filterChangedCallback } = params;
        this.column = column;
        this.filterChangedCallback = filterChangedCallback;
        const filterPromises = [];
        this.filterDefs.forEach((filterDef, index) => {
            const filterPromise = this.createFilter(filterDef, index);
            if (filterPromise != null) {
                filterPromises.push(filterPromise);
            }
        });
        // we have to refresh the GUI here to ensure that Angular components are not rendered in odd places
        return AgPromise
            .all(filterPromises)
            .then(filters => {
            this.filters = filters;
            this.refreshGui('columnMenu');
            this.afterFiltersReadyFuncs.forEach(f => f());
            this.afterFiltersReadyFuncs.length = 0;
        });
    }
    refreshGui(container) {
        if (container === this.lastOpenedInContainer) {
            return;
        }
        this.removeAllChildrenExceptTabGuards();
        this.destroyChildren();
        this.filters.forEach((filter, index) => {
            if (index > 0) {
                this.appendChild(_.loadTemplate(/* html */ `<div class="ag-filter-separator"></div>`));
            }
            const filterDef = this.filterDefs[index];
            const filterTitle = this.getFilterTitle(filter, filterDef);
            let filterGui;
            if (filterDef.display === 'subMenu' && container !== 'toolPanel') {
                // prevent sub-menu being used in tool panel
                const menuItem = this.insertFilterMenu(filter, filterTitle);
                filterGui = menuItem.getGui();
            }
            else if (filterDef.display === 'subMenu' || filterDef.display === 'accordion') {
                // sub-menus should appear as groups in the tool panel
                const group = this.insertFilterGroup(filter, filterTitle);
                filterGui = group.getGui();
            }
            else {
                // display inline
                filterGui = filter.getGui();
            }
            this.appendChild(filterGui);
        });
        this.lastOpenedInContainer = container;
    }
    getFilterTitle(filter, filterDef) {
        if (filterDef.title != null) {
            return filterDef.title;
        }
        const filterWithoutType = filter;
        return typeof filterWithoutType.getFilterTitle === 'function' ? filterWithoutType.getFilterTitle() : 'Filter';
    }
    destroyChildren() {
        this.guiDestroyFuncs.forEach(func => func());
        this.guiDestroyFuncs.length = 0;
    }
    insertFilterMenu(filter, name) {
        const menuItem = this.createBean(new AgMenuItemComponent({
            name,
            subMenu: filter,
            cssClasses: ['ag-multi-filter-menu-item'],
            isCompact: true,
            isAnotherSubMenuOpen: () => false,
        }));
        menuItem.setParentComponent(this);
        this.guiDestroyFuncs.push(() => this.destroyBean(menuItem));
        this.addManagedListener(menuItem, AgMenuItemComponent.EVENT_MENU_ITEM_ACTIVATED, (event) => {
            if (this.lastActivatedMenuItem && this.lastActivatedMenuItem !== event.menuItem) {
                this.lastActivatedMenuItem.deactivate();
            }
            this.lastActivatedMenuItem = event.menuItem;
        });
        menuItem.addGuiEventListener('focusin', () => menuItem.activate());
        menuItem.addGuiEventListener('focusout', () => {
            if (!menuItem.isSubMenuOpen()) {
                menuItem.deactivate();
            }
        });
        return menuItem;
    }
    insertFilterGroup(filter, title) {
        const group = this.createBean(new AgGroupComponent({
            title,
            cssIdentifier: 'multi-filter',
        }));
        this.guiDestroyFuncs.push(() => this.destroyBean(group));
        group.addItem(filter.getGui());
        group.toggleGroupExpand(false);
        if (filter.afterGuiAttached) {
            group.addManagedListener(group, AgGroupComponent.EVENT_EXPANDED, () => filter.afterGuiAttached({
                container: this.lastOpenedInContainer,
                suppressFocus: true
            }));
        }
        return group;
    }
    isFilterActive() {
        return this.filters.some(filter => filter.isFilterActive());
    }
    getLastActiveFilterIndex() {
        return this.activeFilterIndices.length > 0 ? this.activeFilterIndices[this.activeFilterIndices.length - 1] : null;
    }
    doesFilterPass(params, filterToSkip) {
        let rowPasses = true;
        this.filters.forEach(filter => {
            if (!rowPasses || filter === filterToSkip || !filter.isFilterActive()) {
                return;
            }
            rowPasses = filter.doesFilterPass(params);
        });
        return rowPasses;
    }
    getFilterType() {
        return 'multi';
    }
    getModelFromUi() {
        const model = {
            filterType: this.getFilterType(),
            filterModels: this.filters.map(filter => {
                const providedFilter = filter;
                if (typeof providedFilter.getModelFromUi === 'function') {
                    return providedFilter.getModelFromUi();
                }
                return null;
            })
        };
        return model;
    }
    getModel() {
        if (!this.isFilterActive()) {
            return null;
        }
        const model = {
            filterType: this.getFilterType(),
            filterModels: this.filters.map(filter => {
                if (filter.isFilterActive()) {
                    return filter.getModel();
                }
                return null;
            })
        };
        return model;
    }
    setModel(model) {
        const setFilterModel = (filter, filterModel) => {
            return new AgPromise(resolve => {
                const promise = filter.setModel(filterModel);
                promise ? promise.then(() => resolve()) : resolve();
            });
        };
        let promises = [];
        if (model == null) {
            promises = this.filters.map((filter, index) => {
                const res = setFilterModel(filter, null).then(() => {
                    this.updateActiveList(index);
                });
                return res;
            });
        }
        else {
            this.filters.forEach((filter, index) => {
                const filterModel = model.filterModels.length > index ? model.filterModels[index] : null;
                const res = setFilterModel(filter, filterModel).then(() => {
                    this.updateActiveList(index);
                });
                promises.push(res);
            });
        }
        return AgPromise.all(promises).then(() => { });
    }
    applyModel(source = 'api') {
        let result = false;
        this.filters.forEach((filter) => {
            if (filter instanceof ProvidedFilter) {
                result = filter.applyModel(source) || result;
            }
        });
        return result;
    }
    getChildFilterInstance(index) {
        return this.filters[index];
    }
    afterGuiAttached(params) {
        if (params) {
            this.refreshGui(params.container);
        }
        const { filters } = this.params;
        const suppressFocus = filters && filters.some(filter => filter.display && filter.display !== 'inline');
        this.executeFunctionIfExists('afterGuiAttached', Object.assign(Object.assign({}, params || {}), { suppressFocus }));
        const eDocument = this.gridOptionsService.getDocument();
        const activeEl = eDocument.activeElement;
        // if suppress focus is true, we might run into two scenarios:
        // 1 - we are loading the filter for the first time and the component isn't ready,
        //     which means the document will have focus.
        // 2 - The focus will be somewhere inside the component due to auto focus
        // In both cases we need to force the focus somewhere valid but outside the filter.
        if (suppressFocus && (activeEl === eDocument.body || this.getGui().contains(activeEl))) {
            // reset focus to the top of the container, and blur
            this.forceFocusOutOfContainer(true);
        }
    }
    afterGuiDetached() {
        this.executeFunctionIfExists('afterGuiDetached');
    }
    onAnyFilterChanged() {
        this.executeFunctionIfExists('onAnyFilterChanged');
    }
    onNewRowsLoaded() {
        this.executeFunctionIfExists('onNewRowsLoaded');
    }
    destroy() {
        this.filters.forEach(filter => {
            filter.setModel(null);
            this.destroyBean(filter);
        });
        this.filters.length = 0;
        this.destroyChildren();
        super.destroy();
    }
    executeFunctionIfExists(name, ...params) {
        // The first filter is always the "dominant" one. By iterating in reverse order we ensure the first filter
        // always gets the last say
        _.forEachReverse(this.filters, filter => {
            const func = filter[name];
            if (typeof func === 'function') {
                func.apply(filter, params);
            }
        });
    }
    createFilter(filterDef, index) {
        const { filterModifiedCallback, doesRowPassOtherFilter } = this.params;
        let filterInstance;
        const filterParams = Object.assign(Object.assign({}, this.filterManager.createFilterParams(this.column, this.column.getColDef())), { filterModifiedCallback, filterChangedCallback: additionalEventAttributes => {
                this.executeWhenAllFiltersReady(() => this.filterChanged(index, additionalEventAttributes));
            }, doesRowPassOtherFilter: (node) => doesRowPassOtherFilter(node) && this.doesFilterPass({ node, data: node.data }, filterInstance) });
        const compDetails = this.userComponentFactory.getFilterDetails(filterDef, filterParams, 'agTextColumnFilter');
        if (!compDetails) {
            return null;
        }
        const filterPromise = compDetails.newAgStackInstance();
        if (filterPromise) {
            filterPromise.then(filter => filterInstance = filter);
        }
        return filterPromise;
    }
    executeWhenAllFiltersReady(action) {
        if (this.filters && this.filters.length > 0) {
            action();
        }
        else {
            this.afterFiltersReadyFuncs.push(action);
        }
    }
    updateActiveList(index) {
        const changedFilter = this.filters[index];
        _.removeFromArray(this.activeFilterIndices, index);
        if (changedFilter.isFilterActive()) {
            this.activeFilterIndices.push(index);
        }
    }
    filterChanged(index, additionalEventAttributes) {
        this.updateActiveList(index);
        this.filterChangedCallback(additionalEventAttributes);
        const changedFilter = this.filters[index];
        this.filters.forEach(filter => {
            if (filter === changedFilter) {
                return;
            }
            if (typeof filter.onAnyFilterChanged === 'function') {
                filter.onAnyFilterChanged();
            }
        });
    }
    onFocusIn(e) {
        if (this.lastActivatedMenuItem != null && !this.lastActivatedMenuItem.getGui().contains(e.target)) {
            this.lastActivatedMenuItem.deactivate();
            this.lastActivatedMenuItem = null;
        }
        return true;
    }
    getModelAsString(model) {
        var _a, _b, _c, _d;
        if (!this.filters || !((_a = model === null || model === void 0 ? void 0 : model.filterModels) === null || _a === void 0 ? void 0 : _a.length)) {
            return '';
        }
        const lastActiveIndex = (_b = this.getLastActiveFilterIndex()) !== null && _b !== void 0 ? _b : 0;
        const activeFilter = this.filters[lastActiveIndex];
        return (_d = (_c = activeFilter.getModelAsString) === null || _c === void 0 ? void 0 : _c.call(activeFilter, model.filterModels[lastActiveIndex])) !== null && _d !== void 0 ? _d : '';
    }
}
__decorate([
    Autowired('filterManager')
], MultiFilter.prototype, "filterManager", void 0);
__decorate([
    Autowired('userComponentFactory')
], MultiFilter.prototype, "userComponentFactory", void 0);
__decorate([
    PostConstruct
], MultiFilter.prototype, "postConstruct", null);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibXVsdGlGaWx0ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvbXVsdGlGaWx0ZXIvbXVsdGlGaWx0ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUEsT0FBTyxFQUNILGNBQWMsRUFDZCxTQUFTLEVBUVQsU0FBUyxFQU9ULGdCQUFnQixFQUVoQixZQUFZLEVBQ1osbUJBQW1CLEVBRW5CLGFBQWEsRUFFYixDQUFDLEVBQ0osTUFBTSx5QkFBeUIsQ0FBQztBQUVqQyxNQUFNLE9BQU8sV0FBWSxTQUFRLFlBQVk7SUFnQnpDO1FBQ0ksS0FBSyxDQUFDLFVBQVUsQ0FBQSwwREFBMEQsQ0FBQyxDQUFDO1FBWnhFLGVBQVUsR0FBc0IsRUFBRSxDQUFDO1FBQ25DLFlBQU8sR0FBeUIsRUFBRSxDQUFDO1FBQ25DLG9CQUFlLEdBQW1CLEVBQUUsQ0FBQztRQUlyQyx3QkFBbUIsR0FBYSxFQUFFLENBQUM7UUFDbkMsMEJBQXFCLEdBQStCLElBQUksQ0FBQztRQUV6RCwyQkFBc0IsR0FBbUIsRUFBRSxDQUFDO0lBSXBELENBQUM7SUFHTyxhQUFhO1FBQ2pCLElBQUksQ0FBQyxrQkFBa0IsQ0FBQztZQUNwQixTQUFTLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQztTQUNwQyxDQUFDLENBQUM7SUFDUCxDQUFDO0lBRU0sTUFBTSxDQUFDLGFBQWEsQ0FBQyxNQUF5QjtRQUNqRCxNQUFNLEVBQUUsT0FBTyxFQUFFLEdBQUcsTUFBTSxDQUFDO1FBRTNCLE9BQU8sT0FBTyxJQUFJLE9BQU8sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDbEMsT0FBTyxDQUFDLENBQUM7WUFDVCxDQUFDLEVBQUUsTUFBTSxFQUFFLG9CQUFvQixFQUFFLEVBQUUsRUFBRSxNQUFNLEVBQUUsbUJBQW1CLEVBQUUsQ0FBQyxDQUFDO0lBQzVFLENBQUM7SUFFTSxJQUFJLENBQUMs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