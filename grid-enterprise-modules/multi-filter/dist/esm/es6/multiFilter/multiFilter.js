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
            shouldSetMaxHeight: true,
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
            const params = { container: this.lastOpenedInContainer, suppressFocus: true };
            group.addManagedListener(group, AgGroupComponent.EVENT_EXPANDED, () => filter.afterGuiAttached(params));
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
