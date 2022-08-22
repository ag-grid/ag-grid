/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v28.1.1
 * @link https://www.ag-grid.com/
 * @license MIT
 */
"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var FilterManager_1;
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../utils");
const context_1 = require("../context/context");
const events_1 = require("../events");
const moduleNames_1 = require("../modules/moduleNames");
const moduleRegistry_1 = require("../modules/moduleRegistry");
const beanStub_1 = require("../context/beanStub");
const set_1 = require("../utils/set");
const generic_1 = require("../utils/generic");
const object_1 = require("../utils/object");
const dom_1 = require("../utils/dom");
let FilterManager = FilterManager_1 = class FilterManager extends beanStub_1.BeanStub {
    constructor() {
        super(...arguments);
        this.allColumnFilters = new Map();
        this.activeAggregateFilters = [];
        this.activeColumnFilters = [];
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
        this.addManagedListener(this.eventService, events_1.Events.EVENT_GRID_COLUMNS_CHANGED, () => this.onColumnsChanged());
        this.addManagedListener(this.eventService, events_1.Events.EVENT_COLUMN_VALUE_CHANGED, () => this.refreshFiltersForAggregations());
        this.addManagedListener(this.eventService, events_1.Events.EVENT_COLUMN_PIVOT_CHANGED, () => this.refreshFiltersForAggregations());
        this.addManagedListener(this.eventService, events_1.Events.EVENT_COLUMN_PIVOT_MODE_CHANGED, () => this.refreshFiltersForAggregations());
        this.quickFilter = this.parseQuickFilter(this.gridOptionsWrapper.getQuickFilterText());
        this.setQuickFilterParts();
        this.allowShowChangeAfterFilter = this.gridOptionsWrapper.isAllowShowChangeAfterFilter();
        this.externalFilterPresent = this.gridOptionsWrapper.isExternalFilterPresent();
    }
    setQuickFilterParts() {
        this.quickFilterParts = this.quickFilter ? this.quickFilter.split(' ') : null;
    }
    setFilterModel(model) {
        const allPromises = [];
        const previousModel = this.getFilterModel();
        if (model) {
            // mark the filters as we set them, so any active filters left over we stop
            const modelKeys = set_1.convertToSet(Object.keys(model));
            this.allColumnFilters.forEach((filterWrapper, colId) => {
                const newModel = model[colId];
                allPromises.push(this.setModelOnFilterWrapper(filterWrapper.filterPromise, newModel));
                modelKeys.delete(colId);
            });
            // at this point, processedFields contains data for which we don't have a filter working yet
            modelKeys.forEach(colId => {
                const column = this.columnModel.getPrimaryColumn(colId) || this.columnModel.getGridColumn(colId);
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
            this.allColumnFilters.forEach(filterWrapper => {
                allPromises.push(this.setModelOnFilterWrapper(filterWrapper.filterPromise, null));
            });
        }
        utils_1.AgPromise.all(allPromises).then(() => {
            const currentModel = this.getFilterModel();
            const columns = [];
            this.allColumnFilters.forEach((filterWrapper, colId) => {
                const before = previousModel ? previousModel[colId] : null;
                const after = currentModel ? currentModel[colId] : null;
                if (!utils_1._.jsonEquals(before, after)) {
                    columns.push(filterWrapper.column);
                }
            });
            if (columns.length > 0) {
                this.onFilterChanged({ columns });
            }
        });
    }
    setModelOnFilterWrapper(filterPromise, newModel) {
        return new utils_1.AgPromise(resolve => {
            filterPromise.then(filter => {
                if (typeof filter.setModel !== 'function') {
                    console.warn('AG Grid: filter missing setModel method, which is needed for setFilterModel');
                    resolve();
                }
                (filter.setModel(newModel) || utils_1.AgPromise.resolve()).then(() => resolve());
            });
        });
    }
    getFilterModel() {
        const result = {};
        this.allColumnFilters.forEach((filterWrapper, key) => {
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
            if (generic_1.exists(model)) {
                result[key] = model;
            }
        });
        return result;
    }
    isColumnFilterPresent() {
        return this.activeColumnFilters.length > 0;
    }
    isAggregateFilterPresent() {
        return !!this.activeAggregateFilters.length;
    }
    isExternalFilterPresent() {
        return this.externalFilterPresent;
    }
    doAggregateFiltersPass(node, filterToSkip) {
        return this.doColumnFiltersPass(node, filterToSkip, true);
    }
    // called by:
    // 1) onFilterChanged()
    // 2) onNewRowsLoaded()
    updateActiveFilters() {
        this.activeColumnFilters.length = 0;
        this.activeAggregateFilters.length = 0;
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
        const groupFilterEnabled = !!this.gridOptionsWrapper.getGroupAggFiltering();
        const isAggFilter = (column) => {
            const isSecondary = !column.isPrimary();
            // the only filters that can appear on secondary columns are groupAgg filters
            if (isSecondary) {
                return true;
            }
            const isShowingPrimaryColumns = !this.columnModel.isPivotActive();
            const isValueActive = column.isValueActive();
            // primary columns are only ever groupAgg filters if a) value is active and b) showing primary columns
            if (!isValueActive || !isShowingPrimaryColumns) {
                return false;
            }
            // from here on we know: isPrimary=true, isValueActive=true, isShowingPrimaryColumns=true
            if (this.columnModel.isPivotMode()) {
                // primary column is pretending to be a pivot column, ie pivotMode=true, but we are
                // still showing primary columns
                return true;
            }
            else {
                // we are not pivoting, so we groupFilter when it's an agg column
                return groupFilterEnabled;
            }
        };
        this.allColumnFilters.forEach(filterWrapper => {
            if (filterWrapper.filterPromise.resolveNow(false, isFilterActive)) {
                const filterComp = filterWrapper.filterPromise.resolveNow(null, filter => filter);
                if (isAggFilter(filterWrapper.column)) {
                    this.activeAggregateFilters.push(filterComp);
                }
                else {
                    this.activeColumnFilters.push(filterComp);
                }
            }
        });
    }
    updateFilterFlagInColumns(source, additionalEventAttributes) {
        this.allColumnFilters.forEach(filterWrapper => {
            const isFilterActive = filterWrapper.filterPromise.resolveNow(false, filter => filter.isFilterActive());
            filterWrapper.column.setFilterActive(isFilterActive, source, additionalEventAttributes);
        });
    }
    isAnyFilterPresent() {
        return this.isQuickFilterPresent() || this.isColumnFilterPresent() || this.isAggregateFilterPresent() || this.isExternalFilterPresent();
    }
    doColumnFiltersPass(node, filterToSkip, targetAggregates) {
        const { data, aggData } = node;
        const targetedFilters = targetAggregates ? this.activeAggregateFilters : this.activeColumnFilters;
        const targetedData = targetAggregates ? aggData : data;
        for (let i = 0; i < targetedFilters.length; i++) {
            const filter = targetedFilters[i];
            if (filter == null || filter === filterToSkip) {
                continue;
            }
            if (typeof filter.doesFilterPass !== 'function') {
                // because users can do custom filters, give nice error message
                throw new Error('Filter is missing method doesFilterPass');
            }
            if (!filter.doesFilterPass({ node, data: targetedData })) {
                return false;
            }
        }
        return true;
    }
    parseQuickFilter(newFilter) {
        if (!generic_1.exists(newFilter)) {
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
    refreshFiltersForAggregations() {
        const isAggFiltering = this.gridOptionsWrapper.getGroupAggFiltering();
        if (isAggFiltering) {
            this.onFilterChanged();
        }
    }
    // sometimes (especially in React) the filter can call onFilterChanged when we are in the middle
    // of a render cycle. this would be bad, so we wait for render cycle to complete when this happens.
    // this happens in react when we change React State in the grid (eg setting RowCtrl's in RowContainer)
    // which results in React State getting applied in the main application, triggering a useEffect() to
    // be kicked off adn then the application calling the grid's API. in AG-6554, the custom filter was
    // getting it's useEffect() triggered in this way.
    callOnFilterChangedOutsideRenderCycle(params = {}) {
        const action = () => this.onFilterChanged(params);
        if (this.rowRenderer.isRefreshInProgress()) {
            setTimeout(action, 0);
        }
        else {
            action();
        }
    }
    onFilterChanged(params = {}) {
        const { filterInstance, additionalEventAttributes, columns } = params;
        this.updateActiveFilters();
        this.updateFilterFlagInColumns('filterChanged', additionalEventAttributes);
        this.externalFilterPresent = this.gridOptionsWrapper.isExternalFilterPresent();
        this.allColumnFilters.forEach(filterWrapper => {
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
            type: events_1.Events.EVENT_FILTER_CHANGED,
            columns: columns || [],
        };
        if (additionalEventAttributes) {
            object_1.mergeDeep(filterChangedEvent, additionalEventAttributes);
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
            return generic_1.exists(part) && part.indexOf(filterPart) >= 0;
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
    doesRowPassAggregateFilters(params) {
        if (this.isAggregateFilterPresent() && !this.doAggregateFiltersPass(params.rowNode, params.filterInstanceToSkip)) {
            return false;
        }
        // got this far, all filters pass
        return true;
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
        if (this.isExternalFilterPresent() && !this.gridOptionsWrapper.doesExternalFilterPass(params.rowNode)) {
            return false;
        }
        // lastly, check column filter
        if (this.isColumnFilterPresent() && !this.doColumnFiltersPass(params.rowNode, params.filterInstanceToSkip)) {
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
                api: this.gridOptionsWrapper.getApi(),
                columnApi: this.gridOptionsWrapper.getColumnApi(),
                context: this.gridOptionsWrapper.getContext()
            };
            value = colDef.getQuickFilterText(params);
        }
        return generic_1.exists(value) ? value.toString().toUpperCase() : null;
    }
    aggregateRowForQuickFilter(node) {
        const stringParts = [];
        const columns = this.columnModel.getAllColumnsForQuickFilter();
        columns.forEach(column => {
            const part = this.getQuickFilterTextForColumn(column, node);
            if (generic_1.exists(part)) {
                stringParts.push(part);
            }
        });
        node.quickFilterAggregateText = stringParts.join(FilterManager_1.QUICK_FILTER_SEPARATOR);
    }
    onNewRowsLoaded(source) {
        this.allColumnFilters.forEach(filterWrapper => {
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
            this.allColumnFilters.set(column.getColId(), filterWrapper);
        }
        else if (source !== 'NO_UI') {
            this.putIntoGui(filterWrapper, source);
        }
        return filterWrapper;
    }
    cachedFilter(column) {
        return this.allColumnFilters.get(column.getColId());
    }
    createFilterInstance(column) {
        const defaultFilter = moduleRegistry_1.ModuleRegistry.isRegistered(moduleNames_1.ModuleNames.SetFilterModule) ? 'agSetColumnFilter' : 'agTextColumnFilter';
        const colDef = column.getColDef();
        let filterInstance;
        const params = Object.assign(Object.assign({}, this.createFilterParams(column, colDef)), { filterModifiedCallback: () => {
                const event = {
                    type: events_1.Events.EVENT_FILTER_MODIFIED,
                    column,
                    filterInstance
                };
                this.eventService.dispatchEvent(event);
            }, filterChangedCallback: (additionalEventAttributes) => {
                const params = { filterInstance, additionalEventAttributes, columns: [column] };
                this.callOnFilterChangedOutsideRenderCycle(params);
            }, doesRowPassOtherFilter: node => this.doesRowPassOtherFilters(filterInstance, node) });
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
    createFilterParams(column, colDef) {
        const params = {
            api: this.gridOptionsWrapper.getApi(),
            columnApi: this.gridOptionsWrapper.getColumnApi(),
            column,
            colDef: object_1.cloneObject(colDef),
            rowModel: this.rowModel,
            filterChangedCallback: () => { },
            filterModifiedCallback: () => { },
            valueGetter: this.createValueGetter(column),
            context: this.gridOptionsWrapper.getContext(),
            doesRowPassOtherFilter: () => true,
        };
        return params;
    }
    createFilterWrapper(column, source) {
        const filterWrapper = {
            column: column,
            filterPromise: null,
            compiledElement: null,
            guiPromise: utils_1.AgPromise.resolve(null)
        };
        filterWrapper.filterPromise = this.createFilterInstance(column);
        if (filterWrapper.filterPromise) {
            this.putIntoGui(filterWrapper, source);
        }
        return filterWrapper;
    }
    putIntoGui(filterWrapper, source) {
        const eFilterGui = document.createElement('div');
        eFilterGui.className = 'ag-filter';
        filterWrapper.guiPromise = new utils_1.AgPromise(resolve => {
            filterWrapper.filterPromise.then(filter => {
                let guiFromFilter = filter.getGui();
                if (!generic_1.exists(guiFromFilter)) {
                    console.warn(`AG Grid: getGui method from filter returned ${guiFromFilter}, it should be a DOM element or an HTML template string.`);
                }
                // for backwards compatibility with Angular 1 - we
                // used to allow providing back HTML from getGui().
                // once we move away from supporting Angular 1
                // directly, we can change this.
                if (typeof guiFromFilter === 'string') {
                    guiFromFilter = dom_1.loadTemplate(guiFromFilter);
                }
                eFilterGui.appendChild(guiFromFilter);
                resolve(eFilterGui);
                const event = {
                    type: events_1.Events.EVENT_FILTER_OPENED,
                    column: filterWrapper.column,
                    source,
                    eGui: eFilterGui
                };
                this.eventService.dispatchEvent(event);
            });
        });
    }
    onColumnsChanged() {
        const columns = [];
        this.allColumnFilters.forEach((wrapper, colId) => {
            let currentColumn;
            if (wrapper.column.isPrimary()) {
                currentColumn = this.columnModel.getPrimaryColumn(colId);
            }
            else {
                currentColumn = this.columnModel.getGridColumn(colId);
            }
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
        const filterWrapper = this.allColumnFilters.get(column.getColId());
        if (filterWrapper) {
            this.disposeFilterWrapper(filterWrapper, source);
            this.onFilterChanged({ columns: [column] });
        }
    }
    disposeFilterWrapper(filterWrapper, source) {
        filterWrapper.filterPromise.then(filter => {
            (filter.setModel(null) || utils_1.AgPromise.resolve()).then(() => {
                this.getContext().destroyBean(filter);
                filterWrapper.column.setFilterActive(false, source);
                this.allColumnFilters.delete(filterWrapper.column.getColId());
            });
        });
    }
    destroy() {
        super.destroy();
        this.allColumnFilters.forEach(filterWrapper => this.disposeFilterWrapper(filterWrapper, 'filterDestroyed'));
    }
};
FilterManager.QUICK_FILTER_SEPARATOR = '\n';
__decorate([
    context_1.Autowired('valueService')
], FilterManager.prototype, "valueService", void 0);
__decorate([
    context_1.Autowired('columnModel')
], FilterManager.prototype, "columnModel", void 0);
__decorate([
    context_1.Autowired('rowModel')
], FilterManager.prototype, "rowModel", void 0);
__decorate([
    context_1.Autowired('userComponentFactory')
], FilterManager.prototype, "userComponentFactory", void 0);
__decorate([
    context_1.Autowired('rowRenderer')
], FilterManager.prototype, "rowRenderer", void 0);
__decorate([
    context_1.PostConstruct
], FilterManager.prototype, "init", null);
__decorate([
    context_1.PreDestroy
], FilterManager.prototype, "destroy", null);
FilterManager = FilterManager_1 = __decorate([
    context_1.Bean('filterManager')
], FilterManager);
exports.FilterManager = FilterManager;
