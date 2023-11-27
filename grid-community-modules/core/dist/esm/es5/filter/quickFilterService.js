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
import { BeanStub } from "../context/beanStub";
import { Autowired, Bean, PostConstruct } from "../context/context";
import { Events } from "../eventKeys";
import { exists } from "../utils/generic";
var QuickFilterService = /** @class */ (function (_super) {
    __extends(QuickFilterService, _super);
    function QuickFilterService() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.quickFilter = null;
        _this.quickFilterParts = null;
        return _this;
    }
    QuickFilterService_1 = QuickFilterService;
    QuickFilterService.prototype.postConstruct = function () {
        var _this = this;
        this.addManagedListener(this.eventService, Events.EVENT_COLUMN_PIVOT_MODE_CHANGED, function () { return _this.resetQuickFilterCache(); });
        this.addManagedListener(this.eventService, Events.EVENT_NEW_COLUMNS_LOADED, function () { return _this.resetQuickFilterCache(); });
        this.addManagedListener(this.eventService, Events.EVENT_COLUMN_ROW_GROUP_CHANGED, function () { return _this.resetQuickFilterCache(); });
        this.addManagedListener(this.eventService, Events.EVENT_COLUMN_VISIBLE, function () {
            if (!_this.gridOptionsService.get('includeHiddenColumnsInQuickFilter')) {
                _this.resetQuickFilterCache();
            }
        });
        this.addManagedPropertyListener('quickFilterText', function (e) { return _this.setQuickFilter(e.currentValue); });
        this.addManagedPropertyListener('includeHiddenColumnsInQuickFilter', function () { return _this.onIncludeHiddenColumnsInQuickFilterChanged(); });
        this.quickFilter = this.parseQuickFilter(this.gridOptionsService.get('quickFilterText'));
        this.parser = this.gridOptionsService.get('quickFilterParser');
        this.matcher = this.gridOptionsService.get('quickFilterMatcher');
        this.setQuickFilterParts();
        this.addManagedPropertyListeners(['quickFilterMatcher', 'quickFilterParser'], function () { return _this.setQuickFilterParserAndMatcher(); });
    };
    QuickFilterService.prototype.isQuickFilterPresent = function () {
        return this.quickFilter !== null;
    };
    QuickFilterService.prototype.doesRowPassQuickFilter = function (node) {
        var _this = this;
        var usingCache = this.gridOptionsService.get('cacheQuickFilter');
        if (this.matcher) {
            return this.doesRowPassQuickFilterMatcher(usingCache, node);
        }
        // each part must pass, if any fails, then the whole filter fails
        return this.quickFilterParts.every(function (part) {
            return usingCache ? _this.doesRowPassQuickFilterCache(node, part) : _this.doesRowPassQuickFilterNoCache(node, part);
        });
    };
    QuickFilterService.prototype.resetQuickFilterCache = function () {
        this.rowModel.forEachNode(function (node) { return node.quickFilterAggregateText = null; });
    };
    QuickFilterService.prototype.setQuickFilterParts = function () {
        var _a = this, quickFilter = _a.quickFilter, parser = _a.parser;
        if (quickFilter) {
            this.quickFilterParts = parser ? parser(quickFilter) : quickFilter.split(' ');
        }
        else {
            this.quickFilterParts = null;
        }
    };
    QuickFilterService.prototype.parseQuickFilter = function (newFilter) {
        if (!exists(newFilter)) {
            return null;
        }
        if (!this.gridOptionsService.isRowModelType('clientSide')) {
            console.warn('AG Grid - Quick filtering only works with the Client-Side Row Model');
            return null;
        }
        return newFilter.toUpperCase();
    };
    QuickFilterService.prototype.setQuickFilter = function (newFilter) {
        if (newFilter != null && typeof newFilter !== 'string') {
            console.warn("AG Grid - Grid option quickFilterText only supports string inputs, received: ".concat(typeof newFilter));
            return;
        }
        var parsedFilter = this.parseQuickFilter(newFilter);
        if (this.quickFilter !== parsedFilter) {
            this.quickFilter = parsedFilter;
            this.setQuickFilterParts();
            this.dispatchEvent({ type: QuickFilterService_1.EVENT_QUICK_FILTER_CHANGED });
        }
    };
    QuickFilterService.prototype.setQuickFilterParserAndMatcher = function () {
        var parser = this.gridOptionsService.get('quickFilterParser');
        var matcher = this.gridOptionsService.get('quickFilterMatcher');
        var hasChanged = parser !== this.parser || matcher !== this.matcher;
        this.parser = parser;
        this.matcher = matcher;
        if (hasChanged) {
            this.setQuickFilterParts();
            this.dispatchEvent({ type: QuickFilterService_1.EVENT_QUICK_FILTER_CHANGED });
        }
    };
    QuickFilterService.prototype.onIncludeHiddenColumnsInQuickFilterChanged = function () {
        this.columnModel.refreshQuickFilterColumns();
        this.resetQuickFilterCache();
        if (this.isQuickFilterPresent()) {
            this.dispatchEvent({ type: QuickFilterService_1.EVENT_QUICK_FILTER_CHANGED });
        }
    };
    QuickFilterService.prototype.doesRowPassQuickFilterNoCache = function (node, filterPart) {
        var _this = this;
        var columns = this.columnModel.getAllColumnsForQuickFilter();
        return columns.some(function (column) {
            var part = _this.getQuickFilterTextForColumn(column, node);
            return exists(part) && part.indexOf(filterPart) >= 0;
        });
    };
    QuickFilterService.prototype.doesRowPassQuickFilterCache = function (node, filterPart) {
        this.checkGenerateQuickFilterAggregateText(node);
        return node.quickFilterAggregateText.indexOf(filterPart) >= 0;
    };
    QuickFilterService.prototype.doesRowPassQuickFilterMatcher = function (usingCache, node) {
        var quickFilterAggregateText;
        if (usingCache) {
            this.checkGenerateQuickFilterAggregateText(node);
            quickFilterAggregateText = node.quickFilterAggregateText;
        }
        else {
            quickFilterAggregateText = this.getQuickFilterAggregateText(node);
        }
        var _a = this, quickFilterParts = _a.quickFilterParts, matcher = _a.matcher;
        return matcher(quickFilterParts, quickFilterAggregateText);
    };
    QuickFilterService.prototype.checkGenerateQuickFilterAggregateText = function (node) {
        if (!node.quickFilterAggregateText) {
            node.quickFilterAggregateText = this.getQuickFilterAggregateText(node);
        }
    };
    QuickFilterService.prototype.getQuickFilterTextForColumn = function (column, node) {
        var value = this.valueService.getValue(column, node, true);
        var colDef = column.getColDef();
        if (colDef.getQuickFilterText) {
            var params = {
                value: value,
                node: node,
                data: node.data,
                column: column,
                colDef: colDef,
                api: this.gridOptionsService.api,
                columnApi: this.gridOptionsService.columnApi,
                context: this.gridOptionsService.context
            };
            value = colDef.getQuickFilterText(params);
        }
        return exists(value) ? value.toString().toUpperCase() : null;
    };
    QuickFilterService.prototype.getQuickFilterAggregateText = function (node) {
        var _this = this;
        var stringParts = [];
        var columns = this.columnModel.getAllColumnsForQuickFilter();
        columns.forEach(function (column) {
            var part = _this.getQuickFilterTextForColumn(column, node);
            if (exists(part)) {
                stringParts.push(part);
            }
        });
        return stringParts.join(QuickFilterService_1.QUICK_FILTER_SEPARATOR);
    };
    var QuickFilterService_1;
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
    return QuickFilterService;
}(BeanStub));
export { QuickFilterService };
