/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v27.0.1
 * @link http://www.ag-grid.com/
 * @license MIT
 */
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var FilterManager_1;
import { AgPromise, _ } from '../utils';
import { Autowired, Bean, PostConstruct, PreDestroy } from '../context/context';
import { Events } from '../events';
import { ModuleNames } from '../modules/moduleNames';
import { ModuleRegistry } from '../modules/moduleRegistry';
import { BeanStub } from '../context/beanStub';
import { convertToSet } from '../utils/set';
import { exists } from '../utils/generic';
import { mergeDeep, cloneObject } from '../utils/object';
import { loadTemplate } from '../utils/dom';
let FilterManager = FilterManager_1 = class FilterManager extends BeanStub {
    constructor() {
        super(...arguments);
        this.allAdvancedFilters = new Map();
        this.activeAdvancedFilters = [];
        this.quickFilter = null;
        this.quickFilterParts = null;
        // this is true when the grid is processing the filter change. this is used by the cell comps, so that they
        // don't flash when data changes due to filter changes. there is no need to flash when filter changes as the
        // user is in control, so doesn't make sense to show flashing changes. for example, go to main demo where
        // this feature is turned off (hack code to always return false for isSuppressFlashingCellsBecauseFiltering(), put in)
        // 100,000 rows and group by country. then do some filtering. all the cells flash, which is silly.
        this.processingFilterChange = false;
    }
    init() {
        this.addManagedListener(this.eventService, Events.EVENT_ROW_DATA_CHANGED, (source) => this.onNewRowsLoaded(source));
        this.addManagedListener(this.eventService, Events.EVENT_GRID_COLUMNS_CHANGED, () => this.onColumnsChanged());
        this.quickFilter = this.parseQuickFilter(this.gridOptionsWrapper.getQuickFilterText());
        this.setQuickFilterParts();
        this.allowShowChangeAfterFilter = this.gridOptionsWrapper.isAllowShowChangeAfterFilter();
    }
    setQuickFilterParts() {
        this.quickFilterParts = this.quickFilter ? this.quickFilter.split(' ') : null;
    }
    setFilterModel(model) {
        const allPromises = [];
        const previousModel = this.getFilterModel();
        if (model) {
            // mark the filters as we set them, so any active filters left over we stop
            const modelKeys = convertToSet(Object.keys(model));
            this.allAdvancedFilters.forEach((filterWrapper, colId) => {
                const newModel = model[colId];
                allPromises.push(this.setModelOnFilterWrapper(filterWrapper.filterPromise, newModel));
                modelKeys.delete(colId);
            });
            // at this point, processedFields contains data for which we don't have a filter working yet
            modelKeys.forEach(colId => {
                const column = this.columnModel.getPrimaryColumn(colId);
                if (!column) {
                    console.warn('AG Grid: setFilterModel() - no column found for colId: ' + colId);
                    return;
                }
                if (!column.isFilterAllowed()) {
                    console.warn('AG Grid: setFilterModel() - unable to fully apply model, filtering disabled for colId: ' + colId);
                    return;
                }
                const filterWrapper = this.getOrCreateFilterWrapper(column, 'NO_UI');
                if (!filterWrapper) {
                    console.warn('AG-Grid: setFilterModel() - unable to fully apply model, unable to create filter for colId: ' + colId);
                    return;
                }
                allPromises.push(this.setModelOnFilterWrapper(filterWrapper.filterPromise, model[colId]));
            });
        }
        else {
            this.allAdvancedFilters.forEach(filterWrapper => {
                allPromises.push(this.setModelOnFilterWrapper(filterWrapper.filterPromise, null));
            });
        }
        AgPromise.all(allPromises).then(() => {
            const currentModel = this.getFilterModel();
            const columns = [];
            this.allAdvancedFilters.forEach((filterWrapper, colId) => {
                const before = previousModel ? previousModel[colId] : null;
                const after = currentModel ? currentModel[colId] : null;
                if (!_.jsonEquals(before, after)) {
                    columns.push(filterWrapper.column);
                }
            });
            if (columns.length > 0) {
                this.onFilterChanged({ columns });
            }
        });
    }
    setModelOnFilterWrapper(filterPromise, newModel) {
        return new AgPromise(resolve => {
            filterPromise.then(filter => {
                if (typeof filter.setModel !== 'function') {
                    console.warn('AG Grid: filter missing setModel method, which is needed for setFilterModel');
                    resolve();
                }
                (filter.setModel(newModel) || AgPromise.resolve()).then(() => resolve());
            });
        });
    }
    getFilterModel() {
        const result = {};
        this.allAdvancedFilters.forEach((filterWrapper, key) => {
            // because user can provide filters, we provide useful error checking and messages
            const filterPromise = filterWrapper.filterPromise;
            const filter = filterPromise.resolveNow(null, promiseFilter => promiseFilter);
            if (filter == null) {
                return null;
            }
            if (typeof filter.getModel !== 'function') {
                console.warn('AG Grid: filter API missing getModel method, which is needed for getFilterModel');
                return;
            }
            const model = filter.getModel();
            if (exists(model)) {
                result[key] = model;
            }
        });
        return result;
    }
    // returns true if any advanced filter (ie not quick filter) active
    isAdvancedFilterPresent() {
        return this.activeAdvancedFilters.length > 0;
    }
    // called by:
    // 1) onFilterChanged()
    // 2) onNewRowsLoaded()
    updateActiveFilters() {
        this.activeAdvancedFilters.length = 0;
        const isFilterActive = (filter) => {
            if (!filter) {
                return false;
            } // this never happens, including to avoid compile error
            if (!filter.isFilterActive) {
                console.warn('AG Grid: Filter is missing isFilterActive() method');
                return false;
            }
            return filter.isFilterActive();
        };
        this.allAdvancedFilters.forEach(filterWrapper => {
            if (filterWrapper.filterPromise.resolveNow(false, isFilterActive)) {
                const resolvedPromise = filterWrapper.filterPromise.resolveNow(null, filter => filter);
                this.activeAdvancedFilters.push(resolvedPromise);
            }
        });
    }
    updateFilterFlagInColumns(source, additionalEventAttributes) {
        this.allAdvancedFilters.forEach(filterWrapper => {
            const isFilterActive = filterWrapper.filterPromise.resolveNow(false, filter => filter.isFilterActive());
            filterWrapper.column.setFilterActive(isFilterActive, source, additionalEventAttributes);
        });
    }
    isAnyFilterPresent() {
        return this.isQuickFilterPresent() || this.isAdvancedFilterPresent() || this.gridOptionsWrapper.isExternalFilterPresent();
    }
    doAdvancedFiltersPass(node, filterToSkip) {
        const { data } = node;
        for (let i = 0; i < this.activeAdvancedFilters.length; i++) {
            const filter = this.activeAdvancedFilters[i];
            if (filter == null || filter === filterToSkip) {
                continue;
            }
            if (typeof filter.doesFilterPass !== 'function') {
                // because users can do custom filters, give nice error message
                throw new Error('Filter is missing method doesFilterPass');
            }
            if (!filter.doesFilterPass({ node, data })) {
                return false;
            }
        }
        return true;
    }
    parseQuickFilter(newFilter) {
        if (!exists(newFilter)) {
            return null;
        }
        if (!this.gridOptionsWrapper.isRowModelDefault()) {
            console.warn('AG Grid - Quick filtering only works with the Client-Side Row Model');
            return null;
        }
        return newFilter.toUpperCase();
    }
    setQuickFilter(newFilter) {
        if (newFilter != null && typeof newFilter !== 'string') {
            console.warn(`AG Grid - setQuickFilter() only supports string inputs, received: ${typeof newFilter}`);
            return;
        }
        const parsedFilter = this.parseQuickFilter(newFilter);
        if (this.quickFilter !== parsedFilter) {
            this.quickFilter = parsedFilter;
            this.setQuickFilterParts();
            this.onFilterChanged();
        }
    }
    onFilterChanged(params = {}) {
        const { filterInstance, additionalEventAttributes, columns } = params;
        this.updateActiveFilters();
        this.updateFilterFlagInColumns('filterChanged', additionalEventAttributes);
        this.allAdvancedFilters.forEach(filterWrapper => {
            if (!filterWrapper.filterPromise) {
                return;
            }
            filterWrapper.filterPromise.then(filter => {
                if (filter && filter !== filterInstance && filter.onAnyFilterChanged) {
                    filter.onAnyFilterChanged();
                }
            });
        });
        const filterChangedEvent = {
            type: Events.EVENT_FILTER_CHANGED,
            api: this.gridApi,
            columnApi: this.columnApi,
            columns: columns || [],
        };
        if (additionalEventAttributes) {
            mergeDeep(filterChangedEvent, additionalEventAttributes);
        }
        // because internal events are not async in ag-grid, when the dispatchEvent
        // method comes back, we know all listeners have finished executing.
        this.processingFilterChange = true;
        this.eventService.dispatchEvent(filterChangedEvent);
        this.processingFilterChange = false;
    }
    isSuppressFlashingCellsBecauseFiltering() {
        // if user has elected to always flash cell changes, then always return false, otherwise we suppress flashing
        // changes when filtering
        return !this.allowShowChangeAfterFilter && this.processingFilterChange;
    }
    isQuickFilterPresent() {
        return this.quickFilter !== null;
    }
    doesRowPassOtherFilters(filterToSkip, node) {
        return this.doesRowPassFilter({ rowNode: node, filterInstanceToSkip: filterToSkip });
    }
    doesRowPassQuickFilterNoCache(node, filterPart) {
        const columns = this.columnModel.getAllColumnsForQuickFilter();
        return columns.some(column => {
            const part = this.getQuickFilterTextForColumn(column, node);
            return exists(part) && part.indexOf(filterPart) >= 0;
        });
    }
    doesRowPassQuickFilterCache(node, filterPart) {
        if (!node.quickFilterAggregateText) {
            this.aggregateRowForQuickFilter(node);
        }
        return node.quickFilterAggregateText.indexOf(filterPart) >= 0;
    }
    doesRowPassQuickFilter(node) {
        const usingCache = this.gridOptionsWrapper.isCacheQuickFilter();
        // each part must pass, if any fails, then the whole filter fails
        return this.quickFilterParts.every(part => usingCache ? this.doesRowPassQuickFilterCache(node, part) : this.doesRowPassQuickFilterNoCache(node, part));
    }
    doesRowPassFilter(params) {
        // the row must pass ALL of the filters, so if any of them fail,
        // we return true. that means if a row passes the quick filter,
        // but fails the column filter, it fails overall
        // first up, check quick filter
        if (this.isQuickFilterPresent() && !this.doesRowPassQuickFilter(params.rowNode)) {
            return false;
        }
        // secondly, give the client a chance to reject this row
        if (this.gridOptionsWrapper.isExternalFilterPresent() && !this.gridOptionsWrapper.doesExternalFilterPass(params.rowNode)) {
            return false;
        }
        // lastly, check our internal advanced filter
        if (this.isAdvancedFilterPresent() && !this.doAdvancedFiltersPass(params.rowNode, params.filterInstanceToSkip)) {
            return false;
        }
        // got this far, all filters pass
        return true;
    }
    getQuickFilterTextForColumn(column, node) {
        let value = this.valueService.getValue(column, node, true);
        const colDef = column.getColDef();
        if (colDef.getQuickFilterText) {
            const params = {
                value,
                node,
                data: node.data,
                column,
                colDef,
                context: this.gridOptionsWrapper.getContext()
            };
            value = colDef.getQuickFilterText(params);
        }
        return exists(value) ? value.toString().toUpperCase() : null;
    }
    aggregateRowForQuickFilter(node) {
        const stringParts = [];
        const columns = this.columnModel.getAllColumnsForQuickFilter();
        columns.forEach(column => {
            const part = this.getQuickFilterTextForColumn(column, node);
            if (exists(part)) {
                stringParts.push(part);
            }
        });
        node.quickFilterAggregateText = stringParts.join(FilterManager_1.QUICK_FILTER_SEPARATOR);
    }
    onNewRowsLoaded(source) {
        this.allAdvancedFilters.forEach(filterWrapper => {
            filterWrapper.filterPromise.then(filter => {
                if (filter.onNewRowsLoaded) {
                    filter.onNewRowsLoaded();
                }
            });
        });
        this.updateFilterFlagInColumns(source);
        this.updateActiveFilters();
    }
    createValueGetter(column) {
        return ({ node }) => this.valueService.getValue(column, node, true);
    }
    getFilterComponent(column, source, createIfDoesNotExist = true) {
        var _a;
        if (createIfDoesNotExist) {
            return ((_a = this.getOrCreateFilterWrapper(column, source)) === null || _a === void 0 ? void 0 : _a.filterPromise) || null;
        }
        const filterWrapper = this.cachedFilter(column);
        return filterWrapper ? filterWrapper.filterPromise : null;
    }
    isFilterActive(column) {
        const filterWrapper = this.cachedFilter(column);
        return !!filterWrapper && filterWrapper.filterPromise.resolveNow(false, filter => filter.isFilterActive());
    }
    getOrCreateFilterWrapper(column, source) {
        if (!column.isFilterAllowed()) {
            return null;
        }
        let filterWrapper = this.cachedFilter(column);
        if (!filterWrapper) {
            filterWrapper = this.createFilterWrapper(column, source);
            this.allAdvancedFilters.set(column.getColId(), filterWrapper);
        }
        else if (source !== 'NO_UI') {
            this.putIntoGui(filterWrapper, source);
        }
        return filterWrapper;
    }
    cachedFilter(column) {
        return this.allAdvancedFilters.get(column.getColId());
    }
    createFilterInstance(column, $scope) {
        const defaultFilter = ModuleRegistry.isRegistered(ModuleNames.SetFilterModule) ? 'agSetColumnFilter' : 'agTextColumnFilter';
        const colDef = column.getColDef();
        let filterInstance;
        const params = Object.assign(Object.assign({}, this.createFilterParams(column, colDef, $scope)), { filterModifiedCallback: () => {
                const event = {
                    type: Events.EVENT_FILTER_MODIFIED,
                    api: this.gridApi,
                    columnApi: this.columnApi,
                    column,
                    filterInstance
                };
                this.eventService.dispatchEvent(event);
            }, filterChangedCallback: (additionalEventAttributes) => this.onFilterChanged({ filterInstance, additionalEventAttributes, columns: [column] }), doesRowPassOtherFilter: node => this.doesRowPassOtherFilters(filterInstance, node) });
        const compDetails = this.userComponentFactory.getFilterDetails(colDef, params, defaultFilter);
        if (!compDetails) {
            return null;
        }
        const componentPromise = compDetails.newAgStackInstance();
        if (componentPromise) {
            componentPromise.then(r => filterInstance = r);
        }
        return componentPromise;
    }
    createFilterParams(column, colDef, $scope = null) {
        const params = {
            api: this.gridOptionsWrapper.getApi(),
            columnApi: this.gridOptionsWrapper.getColumnApi(),
            column,
            colDef: cloneObject(colDef),
            rowModel: this.rowModel,
            filterChangedCallback: () => { },
            filterModifiedCallback: () => { },
            valueGetter: this.createValueGetter(column),
            context: this.gridOptionsWrapper.getContext(),
            doesRowPassOtherFilter: () => true,
        };
        // hack in scope if using AngularJS
        if ($scope) {
            params.$scope = $scope;
        }
        return params;
    }
    createFilterWrapper(column, source) {
        const filterWrapper = {
            column: column,
            filterPromise: null,
            scope: null,
            compiledElement: null,
            guiPromise: AgPromise.resolve(null)
        };
        filterWrapper.scope = this.gridOptionsWrapper.isAngularCompileFilters() ? this.$scope.$new() : null;
        filterWrapper.filterPromise = this.createFilterInstance(column, filterWrapper.scope);
        if (filterWrapper.filterPromise) {
            this.putIntoGui(filterWrapper, source);
        }
        return filterWrapper;
    }
    putIntoGui(filterWrapper, source) {
        const eFilterGui = document.createElement('div');
        eFilterGui.className = 'ag-filter';
        filterWrapper.guiPromise = new AgPromise(resolve => {
            filterWrapper.filterPromise.then(filter => {
                let guiFromFilter = filter.getGui();
                if (!exists(guiFromFilter)) {
                    console.warn(`AG Grid: getGui method from filter returned ${guiFromFilter}, it should be a DOM element or an HTML template string.`);
                }
                // for backwards compatibility with Angular 1 - we
                // used to allow providing back HTML from getGui().
                // once we move away from supporting Angular 1
                // directly, we can change this.
                if (typeof guiFromFilter === 'string') {
                    guiFromFilter = loadTemplate(guiFromFilter);
                }
                eFilterGui.appendChild(guiFromFilter);
                if (filterWrapper.scope) {
                    const compiledElement = this.$compile(eFilterGui)(filterWrapper.scope);
                    filterWrapper.compiledElement = compiledElement;
                    window.setTimeout(() => filterWrapper.scope.$apply(), 0);
                }
                resolve(eFilterGui);
                this.eventService.dispatchEvent({
                    type: Events.EVENT_FILTER_OPENED,
                    column: filterWrapper.column,
                    source,
                    eGui: eFilterGui,
                    api: this.gridApi,
                    columnApi: this.columnApi
                });
            });
        });
    }
    onColumnsChanged() {
        const columns = [];
        this.allAdvancedFilters.forEach((wrapper, colId) => {
            const currentColumn = this.columnModel.getPrimaryColumn(colId);
            if (currentColumn) {
                return;
            }
            columns.push(wrapper.column);
            this.disposeFilterWrapper(wrapper, 'filterDestroyed');
        });
        if (columns.length > 0) {
            this.onFilterChanged({ columns });
        }
    }
    // destroys the filter, so it not longer takes part
    destroyFilter(column, source = 'api') {
        const filterWrapper = this.allAdvancedFilters.get(column.getColId());
        if (filterWrapper) {
            this.disposeFilterWrapper(filterWrapper, source);
            this.onFilterChanged({ columns: [column] });
        }
    }
    disposeFilterWrapper(filterWrapper, source) {
        filterWrapper.filterPromise.then(filter => {
            (filter.setModel(null) || AgPromise.resolve()).then(() => {
                this.getContext().destroyBean(filter);
                filterWrapper.column.setFilterActive(false, source);
                if (filterWrapper.scope) {
                    if (filterWrapper.compiledElement) {
                        filterWrapper.compiledElement.remove();
                    }
                    filterWrapper.scope.$destroy();
                }
                this.allAdvancedFilters.delete(filterWrapper.column.getColId());
            });
        });
    }
    destroy() {
        super.destroy();
        this.allAdvancedFilters.forEach(filterWrapper => this.disposeFilterWrapper(filterWrapper, 'filterDestroyed'));
    }
};
FilterManager.QUICK_FILTER_SEPARATOR = '\n';
__decorate([
    Autowired('$compile')
], FilterManager.prototype, "$compile", void 0);
__decorate([
    Autowired('$scope')
], FilterManager.prototype, "$scope", void 0);
__decorate([
    Autowired('valueService')
], FilterManager.prototype, "valueService", void 0);
__decorate([
    Autowired('columnModel')
], FilterManager.prototype, "columnModel", void 0);
__decorate([
    Autowired('rowModel')
], FilterManager.prototype, "rowModel", void 0);
__decorate([
    Autowired('columnApi')
], FilterManager.prototype, "columnApi", void 0);
__decorate([
    Autowired('gridApi')
], FilterManager.prototype, "gridApi", void 0);
__decorate([
    Autowired('userComponentFactory')
], FilterManager.prototype, "userComponentFactory", void 0);
__decorate([
    PostConstruct
], FilterManager.prototype, "init", null);
__decorate([
    PreDestroy
], FilterManager.prototype, "destroy", null);
FilterManager = FilterManager_1 = __decorate([
    Bean('filterManager')
], FilterManager);
export { FilterManager };
