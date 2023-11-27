var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var QuickFilterService_1;
import { BeanStub } from "../context/beanStub.mjs";
import { Autowired, Bean, PostConstruct } from "../context/context.mjs";
import { Events } from "../eventKeys.mjs";
import { exists } from "../utils/generic.mjs";
let QuickFilterService = QuickFilterService_1 = class QuickFilterService extends BeanStub {
    constructor() {
        super(...arguments);
        this.quickFilter = null;
        this.quickFilterParts = null;
    }
    postConstruct() {
        this.addManagedListener(this.eventService, Events.EVENT_COLUMN_PIVOT_MODE_CHANGED, () => this.resetQuickFilterCache());
        this.addManagedListener(this.eventService, Events.EVENT_NEW_COLUMNS_LOADED, () => this.resetQuickFilterCache());
        this.addManagedListener(this.eventService, Events.EVENT_COLUMN_ROW_GROUP_CHANGED, () => this.resetQuickFilterCache());
        this.addManagedListener(this.eventService, Events.EVENT_COLUMN_VISIBLE, () => {
            if (!this.gridOptionsService.get('includeHiddenColumnsInQuickFilter')) {
                this.resetQuickFilterCache();
            }
        });
        this.addManagedPropertyListener('quickFilterText', (e) => this.setQuickFilter(e.currentValue));
        this.addManagedPropertyListener('includeHiddenColumnsInQuickFilter', () => this.onIncludeHiddenColumnsInQuickFilterChanged());
        this.quickFilter = this.parseQuickFilter(this.gridOptionsService.get('quickFilterText'));
        this.parser = this.gridOptionsService.get('quickFilterParser');
        this.matcher = this.gridOptionsService.get('quickFilterMatcher');
        this.setQuickFilterParts();
        this.addManagedPropertyListeners(['quickFilterMatcher', 'quickFilterParser'], () => this.setQuickFilterParserAndMatcher());
    }
    isQuickFilterPresent() {
        return this.quickFilter !== null;
    }
    doesRowPassQuickFilter(node) {
        const usingCache = this.gridOptionsService.get('cacheQuickFilter');
        if (this.matcher) {
            return this.doesRowPassQuickFilterMatcher(usingCache, node);
        }
        // each part must pass, if any fails, then the whole filter fails
        return this.quickFilterParts.every(part => usingCache ? this.doesRowPassQuickFilterCache(node, part) : this.doesRowPassQuickFilterNoCache(node, part));
    }
    resetQuickFilterCache() {
        this.rowModel.forEachNode(node => node.quickFilterAggregateText = null);
    }
    setQuickFilterParts() {
        const { quickFilter, parser } = this;
        if (quickFilter) {
            this.quickFilterParts = parser ? parser(quickFilter) : quickFilter.split(' ');
        }
        else {
            this.quickFilterParts = null;
        }
    }
    parseQuickFilter(newFilter) {
        if (!exists(newFilter)) {
            return null;
        }
        if (!this.gridOptionsService.isRowModelType('clientSide')) {
            console.warn('AG Grid - Quick filtering only works with the Client-Side Row Model');
            return null;
        }
        return newFilter.toUpperCase();
    }
    setQuickFilter(newFilter) {
        if (newFilter != null && typeof newFilter !== 'string') {
            console.warn(`AG Grid - Grid option quickFilterText only supports string inputs, received: ${typeof newFilter}`);
            return;
        }
        const parsedFilter = this.parseQuickFilter(newFilter);
        if (this.quickFilter !== parsedFilter) {
            this.quickFilter = parsedFilter;
            this.setQuickFilterParts();
            this.dispatchEvent({ type: QuickFilterService_1.EVENT_QUICK_FILTER_CHANGED });
        }
    }
    setQuickFilterParserAndMatcher() {
        const parser = this.gridOptionsService.get('quickFilterParser');
        const matcher = this.gridOptionsService.get('quickFilterMatcher');
        const hasChanged = parser !== this.parser || matcher !== this.matcher;
        this.parser = parser;
        this.matcher = matcher;
        if (hasChanged) {
            this.setQuickFilterParts();
            this.dispatchEvent({ type: QuickFilterService_1.EVENT_QUICK_FILTER_CHANGED });
        }
    }
    onIncludeHiddenColumnsInQuickFilterChanged() {
        this.columnModel.refreshQuickFilterColumns();
        this.resetQuickFilterCache();
        if (this.isQuickFilterPresent()) {
            this.dispatchEvent({ type: QuickFilterService_1.EVENT_QUICK_FILTER_CHANGED });
        }
    }
    doesRowPassQuickFilterNoCache(node, filterPart) {
        const columns = this.columnModel.getAllColumnsForQuickFilter();
        return columns.some(column => {
            const part = this.getQuickFilterTextForColumn(column, node);
            return exists(part) && part.indexOf(filterPart) >= 0;
        });
    }
    doesRowPassQuickFilterCache(node, filterPart) {
        this.checkGenerateQuickFilterAggregateText(node);
        return node.quickFilterAggregateText.indexOf(filterPart) >= 0;
    }
    doesRowPassQuickFilterMatcher(usingCache, node) {
        let quickFilterAggregateText;
        if (usingCache) {
            this.checkGenerateQuickFilterAggregateText(node);
            quickFilterAggregateText = node.quickFilterAggregateText;
        }
        else {
            quickFilterAggregateText = this.getQuickFilterAggregateText(node);
        }
        const { quickFilterParts, matcher } = this;
        return matcher(quickFilterParts, quickFilterAggregateText);
    }
    checkGenerateQuickFilterAggregateText(node) {
        if (!node.quickFilterAggregateText) {
            node.quickFilterAggregateText = this.getQuickFilterAggregateText(node);
        }
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
                api: this.gridOptionsService.api,
                columnApi: this.gridOptionsService.columnApi,
                context: this.gridOptionsService.context
            };
            value = colDef.getQuickFilterText(params);
        }
        return exists(value) ? value.toString().toUpperCase() : null;
    }
    getQuickFilterAggregateText(node) {
        const stringParts = [];
        const columns = this.columnModel.getAllColumnsForQuickFilter();
        columns.forEach(column => {
            const part = this.getQuickFilterTextForColumn(column, node);
            if (exists(part)) {
                stringParts.push(part);
            }
        });
        return stringParts.join(QuickFilterService_1.QUICK_FILTER_SEPARATOR);
    }
};
QuickFilterService.EVENT_QUICK_FILTER_CHANGED = 'quickFilterChanged';
QuickFilterService.QUICK_FILTER_SEPARATOR = '\n';
__decorate([
    Autowired('valueService')
], QuickFilterService.prototype, "valueService", void 0);
__decorate([
    Autowired('columnModel')
], QuickFilterService.prototype, "columnModel", void 0);
__decorate([
    Autowired('rowModel')
], QuickFilterService.prototype, "rowModel", void 0);
__decorate([
    PostConstruct
], QuickFilterService.prototype, "postConstruct", null);
QuickFilterService = QuickFilterService_1 = __decorate([
    Bean('quickFilterService')
], QuickFilterService);
export { QuickFilterService };
