(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@angular/core'), require('@ag-grid-community/core')) :
    typeof define === 'function' && define.amd ? define('@ag-grid-community/angular', ['exports', '@angular/core', '@ag-grid-community/core'], factory) :
    (global = global || self, factory((global['ag-grid-community'] = global['ag-grid-community'] || {}, global['ag-grid-community'].angular = {}), global.ng.core, global.agGrid));
}(this, (function (exports, core, core$1) { 'use strict';

    /*! *****************************************************************************
    Copyright (c) Microsoft Corporation.

    Permission to use, copy, modify, and/or distribute this software for any
    purpose with or without fee is hereby granted.

    THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
    REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
    AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
    INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
    LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
    OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
    PERFORMANCE OF THIS SOFTWARE.
    ***************************************************************************** */
    /* global Reflect, Promise */

    var extendStatics = function(d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };

    function __extends(d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    }

    var __assign = function() {
        __assign = Object.assign || function __assign(t) {
            for (var s, i = 1, n = arguments.length; i < n; i++) {
                s = arguments[i];
                for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
            }
            return t;
        };
        return __assign.apply(this, arguments);
    };

    function __rest(s, e) {
        var t = {};
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
            t[p] = s[p];
        if (s != null && typeof Object.getOwnPropertySymbols === "function")
            for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
                if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                    t[p[i]] = s[p[i]];
            }
        return t;
    }

    function __decorate(decorators, target, key, desc) {
        var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
        else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    }

    function __param(paramIndex, decorator) {
        return function (target, key) { decorator(target, key, paramIndex); }
    }

    function __metadata(metadataKey, metadataValue) {
        if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(metadataKey, metadataValue);
    }

    function __awaiter(thisArg, _arguments, P, generator) {
        function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
            function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
            function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    }

    function __generator(thisArg, body) {
        var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
        return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
        function verb(n) { return function (v) { return step([n, v]); }; }
        function step(op) {
            if (f) throw new TypeError("Generator is already executing.");
            while (_) try {
                if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
                if (y = 0, t) op = [op[0] & 2, t.value];
                switch (op[0]) {
                    case 0: case 1: t = op; break;
                    case 4: _.label++; return { value: op[1], done: false };
                    case 5: _.label++; y = op[1]; op = [0]; continue;
                    case 7: op = _.ops.pop(); _.trys.pop(); continue;
                    default:
                        if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                        if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                        if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                        if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                        if (t[2]) _.ops.pop();
                        _.trys.pop(); continue;
                }
                op = body.call(thisArg, _);
            } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
            if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
        }
    }

    function __createBinding(o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        o[k2] = m[k];
    }

    function __exportStar(m, exports) {
        for (var p in m) if (p !== "default" && !exports.hasOwnProperty(p)) exports[p] = m[p];
    }

    function __values(o) {
        var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
        if (m) return m.call(o);
        if (o && typeof o.length === "number") return {
            next: function () {
                if (o && i >= o.length) o = void 0;
                return { value: o && o[i++], done: !o };
            }
        };
        throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
    }

    function __read(o, n) {
        var m = typeof Symbol === "function" && o[Symbol.iterator];
        if (!m) return o;
        var i = m.call(o), r, ar = [], e;
        try {
            while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
        }
        catch (error) { e = { error: error }; }
        finally {
            try {
                if (r && !r.done && (m = i["return"])) m.call(i);
            }
            finally { if (e) throw e.error; }
        }
        return ar;
    }

    function __spread() {
        for (var ar = [], i = 0; i < arguments.length; i++)
            ar = ar.concat(__read(arguments[i]));
        return ar;
    }

    function __spreadArrays() {
        for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
        for (var r = Array(s), k = 0, i = 0; i < il; i++)
            for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
                r[k] = a[j];
        return r;
    };

    function __await(v) {
        return this instanceof __await ? (this.v = v, this) : new __await(v);
    }

    function __asyncGenerator(thisArg, _arguments, generator) {
        if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
        var g = generator.apply(thisArg, _arguments || []), i, q = [];
        return i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i;
        function verb(n) { if (g[n]) i[n] = function (v) { return new Promise(function (a, b) { q.push([n, v, a, b]) > 1 || resume(n, v); }); }; }
        function resume(n, v) { try { step(g[n](v)); } catch (e) { settle(q[0][3], e); } }
        function step(r) { r.value instanceof __await ? Promise.resolve(r.value.v).then(fulfill, reject) : settle(q[0][2], r); }
        function fulfill(value) { resume("next", value); }
        function reject(value) { resume("throw", value); }
        function settle(f, v) { if (f(v), q.shift(), q.length) resume(q[0][0], q[0][1]); }
    }

    function __asyncDelegator(o) {
        var i, p;
        return i = {}, verb("next"), verb("throw", function (e) { throw e; }), verb("return"), i[Symbol.iterator] = function () { return this; }, i;
        function verb(n, f) { i[n] = o[n] ? function (v) { return (p = !p) ? { value: __await(o[n](v)), done: n === "return" } : f ? f(v) : v; } : f; }
    }

    function __asyncValues(o) {
        if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
        var m = o[Symbol.asyncIterator], i;
        return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
        function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
        function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
    }

    function __makeTemplateObject(cooked, raw) {
        if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
        return cooked;
    };

    function __importStar(mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
        result.default = mod;
        return result;
    }

    function __importDefault(mod) {
        return (mod && mod.__esModule) ? mod : { default: mod };
    }

    function __classPrivateFieldGet(receiver, privateMap) {
        if (!privateMap.has(receiver)) {
            throw new TypeError("attempted to get private field on non-instance");
        }
        return privateMap.get(receiver);
    }

    function __classPrivateFieldSet(receiver, privateMap, value) {
        if (!privateMap.has(receiver)) {
            throw new TypeError("attempted to set private field on non-instance");
        }
        privateMap.set(receiver, value);
        return value;
    }

    var AgGridColumn = /** @class */ (function () {
        function AgGridColumn() {
            // inputs - pretty much most of ColDef, with the exception of template, templateUrl and internal only properties
            // @START@
            /** Columns in this group     */
            this.children = undefined;
            /** The sort order, provide an array with any of the following in any order ['asc','desc',null]     */
            this.sortingOrder = undefined;
            /** Agg funcs allowed on this column. If missing, all installed agg funcs are allowed.
             * Can be eg ['sum','avg']. This will restrict what the GUI allows to select only.     */
            this.allowedAggFuncs = undefined;
            /** The menu tabs to show, and in which order, the valid values for this property are:
             * filterMenuTab, generalMenuTab, columnsMenuTab     *     */
            this.menuTabs = undefined;
            /** Rules for applying css classes     */
            this.cellClassRules = undefined;
            /** Icons for this column. Leave blank to use default.     */
            this.icons = undefined;
            /** The custom header group component to be used for rendering the component header. If none specified the default AG Grid is used*     */
            this.headerGroupComponent = undefined;
            /** The custom header group component to be used for rendering the component header in the hosting framework (ie: React/Angular). If none specified the default AG Grid is used*     */
            this.headerGroupComponentFramework = undefined;
            /** The custom header group component to be used for rendering the component header. If none specified the default AG Grid is used*     */
            this.headerGroupComponentParams = undefined;
            /** An object of css values. Or a function returning an object of css values.     */
            this.cellStyle = undefined;
            this.cellRendererParams = undefined;
            this.cellEditorFramework = undefined;
            this.cellEditorParams = undefined;
            /** @deprecated Use cellRendererSelector if you want a different Cell Renderer for pinned rows. Check params.node.rowPinned.
             */
            this.pinnedRowCellRendererFramework = undefined;
            /** @deprecated Use cellRendererSelector if you want a different Cell Renderer for pinned rows. Check params.node.rowPinned.
             */
            this.pinnedRowCellRendererParams = undefined;
            this.filterFramework = undefined;
            this.filterParams = undefined;
            /** The custom header component to be used for rendering the component header. If none specified the default AG Grid is used*     */
            this.headerComponent = undefined;
            /** The custom header component to be used for rendering the component header in the hosting framework (ie: React/Angular). If none specified the default AG Grid is used*     */
            this.headerComponentFramework = undefined;
            /** The custom header component parameters*     */
            this.headerComponentParams = undefined;
            this.floatingFilterComponent = undefined;
            this.floatingFilterComponentParams = undefined;
            this.floatingFilterComponentFramework = undefined;
            this.tooltipComponent = undefined;
            this.tooltipComponentParams = undefined;
            this.tooltipComponentFramework = undefined;
            this.refData = undefined;
            /** Params to customise the columns menu behaviour and appearance     */
            this.columnsMenuParams = undefined;
            /** The name to render in the column header     */
            this.headerName = undefined;
            /** Whether to show the column when the group is open / closed.     */
            this.columnGroupShow = undefined;
            /** CSS class for the header     */
            this.headerClass = undefined;
            /** CSS class for the toolPanel     */
            this.toolPanelClass = undefined;
            /** Expression or function to get the cells value.     */
            this.headerValueGetter = undefined;
            /** Group ID     */
            this.groupId = undefined;
            /** The unique ID to give the column. This is optional. If missing, the ID will default to the field.
             * If both field and colId are missing, a unique ID will be generated.
             * This ID is used to identify the column in the API for sorting, filtering etc.     */
            this.colId = undefined;
            /** If sorting by default, set it here. Set to 'asc' or 'desc'     */
            this.sort = undefined;
            this.initialSort = undefined;
            /** The field of the row to get the cells data from     */
            this.field = undefined;
            /** A comma separated string or array of strings containing ColumnType keys which can be used as a template for a column.
             * This helps to reduce duplication of properties when you have a lot of common column properties.     */
            this.type = undefined;
            /** The field where we get the tooltip on the object     */
            this.tooltipField = undefined;
            /** Tooltip for the column header     */
            this.headerTooltip = undefined;
            /** Class to use for the cell. Can be string, array of strings, or function.     */
            this.cellClass = undefined;
            /** Set to true to have the grid place the values for the group into the cell, or put the name of a grouped column to just show that group.     */
            this.showRowGroup = undefined;
            this.filter = undefined;
            this.initialAggFunc = undefined;
            /** Name of function to use for aggregation. One of [sum,min,max,first,last] or a function.     */
            this.aggFunc = undefined;
            /** A function for rendering a cell.     */
            this.cellRenderer = undefined;
            /** Cell editor     */
            this.cellEditor = undefined;
            /** Whether this column is pinned or not.     */
            this.pinned = undefined;
            this.initialPinned = undefined;
            /** Defines the column data type used when charting     */
            this.chartDataType = undefined;
            this.cellEditorPopupPosition = undefined;
            /** @deprecated since v24 - use sortIndex instead
             */
            this.sortedAt = undefined;
            /** If sorting more than one column by default, specifies order in which the sorting should be applied.     */
            this.sortIndex = undefined;
            this.initialSortIndex = undefined;
            /** Sets the grow factor of a column. It specifies how much of the remaining
             * space should be assigned to the column.     */
            this.flex = undefined;
            this.initialFlex = undefined;
            /** Actual width, in pixels, of the cell     */
            this.width = undefined;
            /** Default width, in pixels, of the cell     */
            this.initialWidth = undefined;
            /** Min width, in pixels, of the cell     */
            this.minWidth = undefined;
            /** Max width, in pixels, of the cell     */
            this.maxWidth = undefined;
            /** To group by this column by default, either provide an index (eg rowGroupIndex=1), or set rowGroup=true.     */
            this.rowGroupIndex = undefined;
            this.initialRowGroupIndex = undefined;
            /** To pivot by this column by default, either provide an index (eg pivotIndex=1), or set pivot=true.     */
            this.pivotIndex = undefined;
            this.initialPivotIndex = undefined;
            /** For native drag and drop, set to true to allow custom onRowDrag processing     */
            this.dndSourceOnRowDrag = undefined;
            /** Expression or function to get the cells value.     */
            this.valueGetter = undefined;
            /** If not using a field, then this puts the value into the cell     */
            this.valueSetter = undefined;
            /** Expression or function to get the cells value for filtering.     */
            this.filterValueGetter = undefined;
            /** Function to return the key for a value - use this if the value is an object (not a primitive type) and you
             * want to a) group by this field or b) use set filter on this field.     */
            this.keyCreator = undefined;
            this.cellRendererFramework = undefined;
            /** @deprecated Use cellRendererSelector if you want a different Cell Renderer for pinned rows. Check params.node.rowPinned.
             */
            this.pinnedRowCellRenderer = undefined;
            /** A function to format a value, should return a string. Not used for CSV export or copy to clipboard, only for UI cell rendering.     */
            this.valueFormatter = undefined;
            /** @deprecated Use valueFormatter for pinned rows, and check params.node.rowPinned.
             */
            this.pinnedRowValueFormatter = undefined;
            /** Gets called after editing, converts the value in the cell.     */
            this.valueParser = undefined;
            /** Comparator function for custom sorting.     */
            this.comparator = undefined;
            /** Comparator for values, used by renderer to know if values have changed. Cells who's values have not changed don't get refreshed.     */
            this.equals = undefined;
            /** Comparator for ordering the pivot columns     */
            this.pivotComparator = undefined;
            /** Allows the user to suppress certain keyboard events in the grid cell     */
            this.suppressKeyboardEvent = undefined;
            /** Allows the user to suppress certain keyboard events in the grid header     */
            this.suppressHeaderKeyboardEvent = undefined;
            this.colSpan = undefined;
            this.rowSpan = undefined;
            /** To create the quick filter text for this column, if toString is not good enough on the value.     */
            this.getQuickFilterText = undefined;
            /** Callbacks for editing. See editing section for further details.
             * Return true if the update was successful, or false if not.
             * If false, then skips the UI refresh and no events are emitted.
             * Return false if the values are the same (ie no update).     */
            this.newValueHandler = undefined;
            /** Callbacks for editing.See editing section for further details.     */
            this.onCellValueChanged = undefined;
            /** Function callback, gets called when a cell is clicked.     */
            this.onCellClicked = undefined;
            /** Function callback, gets called when a cell is double clicked.     */
            this.onCellDoubleClicked = undefined;
            /** Function callback, gets called when a cell is right clicked.     */
            this.onCellContextMenu = undefined;
            /** To configure the text to be displayed in the floating div while dragging a row when rowDrag is true     */
            this.rowDragText = undefined;
            /** The function used to calculate the tooltip of the object, tooltipField takes precedence     */
            this.tooltipValueGetter = undefined;
            this.cellRendererSelector = undefined;
            this.cellEditorSelector = undefined;
            /** Set to true to not flash this column for value changes     */
            this.suppressCellFlash = undefined;
            /** Set to true to not include this column in the Columns Tool Panel     */
            this.suppressColumnsToolPanel = undefined;
            /** Set to true to not include this column / filter in the Filters Tool Panel     */
            this.suppressFiltersToolPanel = undefined;
            /** Open by Default     */
            this.openByDefault = undefined;
            /** If true, group cannot be broken up by column moving, child columns will always appear side by side, however you can rearrange child columns within the group     */
            this.marryChildren = undefined;
            /** Set to true for this column to be hidden. Naturally you might think, it would make more sense to call this field 'visible' and mark it false to hide,
             * however we want all default values to be false and we want columns to be visible by default.     */
            this.hide = undefined;
            this.initialHide = undefined;
            this.rowGroup = undefined;
            this.initialRowGroup = undefined;
            this.pivot = undefined;
            this.initialPivot = undefined;
            /** Set to true to render a selection checkbox in the column.     */
            this.checkboxSelection = undefined;
            /** If true, a 'select all' checkbox will be put into the header     */
            this.headerCheckboxSelection = undefined;
            /** If true, the header checkbox selection will work on filtered items     */
            this.headerCheckboxSelectionFilteredOnly = undefined;
            /** Set to true if no menu should be shown for this column header.     */
            this.suppressMenu = undefined;
            /** Set to true to not allow moving this column via dragging it's header     */
            this.suppressMovable = undefined;
            /** Set to true to make sure this column is always first. Other columns, if movable, cannot move before this column.     */
            this.lockPosition = undefined;
            /** Set to true to block the user showing / hiding the column, the column can only be shown / hidden via definitions or API     */
            this.lockVisible = undefined;
            /** Set to true to block the user pinning the column, the column can only be pinned via definitions or API     */
            this.lockPinned = undefined;
            /** Set to true if you want the unsorted icon to be shown when no sort is applied to this column.     */
            this.unSortIcon = undefined;
            /** Set to true if you want this columns width to be fixed during 'size to fit' operation.     */
            this.suppressSizeToFit = undefined;
            /** Set to true if you do not want this column to be auto-resizable by double clicking it's edge.     */
            this.suppressAutoSize = undefined;
            /** If true, GUI will allow adding this columns as a row group     */
            this.enableRowGroup = undefined;
            /** If true, GUI will allow adding this columns as a pivot     */
            this.enablePivot = undefined;
            /** If true, GUI will allow adding this columns as a value     */
            this.enableValue = undefined;
            /** Set to true if this col is editable, otherwise false. Can also be a function to have different rows editable.     */
            this.editable = undefined;
            /** Set to true if this col should not be allowed take new values from the clipboard .     */
            this.suppressPaste = undefined;
            /** Set to true if this col should not be navigable with the tab key. Can also be a function to have different rows editable.     */
            this.suppressNavigable = undefined;
            /** If true, grid will flash cell after cell is refreshed     */
            this.enableCellChangeFlash = undefined;
            /** For grid row dragging, set to true to enable row dragging within the grid     */
            this.rowDrag = undefined;
            /** For native drag and drop, set to true to enable drag source     */
            this.dndSource = undefined;
            /** True if this column should stretch rows height to fit contents     */
            this.autoHeight = undefined;
            /** True if this column should wrap cell contents - typically used with autoHeight     */
            this.wrapText = undefined;
            /** Set to true if sorting allowed for this column.     */
            this.sortable = undefined;
            /** Set to true if this column should be resizable     */
            this.resizable = undefined;
            /** If true, this cell will be in editing mode after first click.     */
            this.singleClickEdit = undefined;
            /** Whether to display a floating filter for this column.     */
            this.floatingFilter = undefined;
            this.cellEditorPopup = undefined;
            // @END@
        }
        AgGridColumn_1 = AgGridColumn;
        AgGridColumn.prototype.hasChildColumns = function () {
            if (this.childColumns && this.childColumns.length > 0) {
                // necessary because of https://github.com/angular/angular/issues/10098
                return !(this.childColumns.length === 1 && this.childColumns.first === this);
            }
            return false;
        };
        AgGridColumn.prototype.toColDef = function () {
            var colDef = this.createColDefFromGridColumn(this);
            if (this.hasChildColumns()) {
                colDef["children"] = this.getChildColDefs(this.childColumns);
            }
            return colDef;
        };
        AgGridColumn.prototype.getChildColDefs = function (childColumns) {
            return childColumns
                // necessary because of https://github.com/angular/angular/issues/10098
                .filter(function (column) { return !column.hasChildColumns(); })
                .map(function (column) {
                return column.toColDef();
            });
        };
        AgGridColumn.prototype.createColDefFromGridColumn = function (from) {
            var childColumns = from.childColumns, colDef = __rest(from, ["childColumns"]);
            return colDef;
        };
        var AgGridColumn_1;
        __decorate([
            core.ContentChildren(AgGridColumn_1),
            __metadata("design:type", core.QueryList)
        ], AgGridColumn.prototype, "childColumns", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Array)
        ], AgGridColumn.prototype, "children", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Array)
        ], AgGridColumn.prototype, "sortingOrder", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Array)
        ], AgGridColumn.prototype, "allowedAggFuncs", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Array)
        ], AgGridColumn.prototype, "menuTabs", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Object)
        ], AgGridColumn.prototype, "cellClassRules", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Object)
        ], AgGridColumn.prototype, "icons", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Object)
        ], AgGridColumn.prototype, "headerGroupComponent", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Object)
        ], AgGridColumn.prototype, "headerGroupComponentFramework", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Object)
        ], AgGridColumn.prototype, "headerGroupComponentParams", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Object)
        ], AgGridColumn.prototype, "cellStyle", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Object)
        ], AgGridColumn.prototype, "cellRendererParams", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Object)
        ], AgGridColumn.prototype, "cellEditorFramework", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Object)
        ], AgGridColumn.prototype, "cellEditorParams", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Object)
        ], AgGridColumn.prototype, "pinnedRowCellRendererFramework", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Object)
        ], AgGridColumn.prototype, "pinnedRowCellRendererParams", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Object)
        ], AgGridColumn.prototype, "filterFramework", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Object)
        ], AgGridColumn.prototype, "filterParams", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Object)
        ], AgGridColumn.prototype, "headerComponent", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Object)
        ], AgGridColumn.prototype, "headerComponentFramework", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Object)
        ], AgGridColumn.prototype, "headerComponentParams", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Object)
        ], AgGridColumn.prototype, "floatingFilterComponent", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Object)
        ], AgGridColumn.prototype, "floatingFilterComponentParams", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Object)
        ], AgGridColumn.prototype, "floatingFilterComponentFramework", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Object)
        ], AgGridColumn.prototype, "tooltipComponent", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Object)
        ], AgGridColumn.prototype, "tooltipComponentParams", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Object)
        ], AgGridColumn.prototype, "tooltipComponentFramework", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Object)
        ], AgGridColumn.prototype, "refData", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Object)
        ], AgGridColumn.prototype, "columnsMenuParams", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", String)
        ], AgGridColumn.prototype, "headerName", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", String)
        ], AgGridColumn.prototype, "columnGroupShow", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Object)
        ], AgGridColumn.prototype, "headerClass", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Object)
        ], AgGridColumn.prototype, "toolPanelClass", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Object)
        ], AgGridColumn.prototype, "headerValueGetter", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", String)
        ], AgGridColumn.prototype, "groupId", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", String)
        ], AgGridColumn.prototype, "colId", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", String)
        ], AgGridColumn.prototype, "sort", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", String)
        ], AgGridColumn.prototype, "initialSort", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", String)
        ], AgGridColumn.prototype, "field", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Object)
        ], AgGridColumn.prototype, "type", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", String)
        ], AgGridColumn.prototype, "tooltipField", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", String)
        ], AgGridColumn.prototype, "headerTooltip", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Object)
        ], AgGridColumn.prototype, "cellClass", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Object)
        ], AgGridColumn.prototype, "showRowGroup", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Object)
        ], AgGridColumn.prototype, "filter", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Object)
        ], AgGridColumn.prototype, "initialAggFunc", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Object)
        ], AgGridColumn.prototype, "aggFunc", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Object)
        ], AgGridColumn.prototype, "cellRenderer", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Object)
        ], AgGridColumn.prototype, "cellEditor", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Object)
        ], AgGridColumn.prototype, "pinned", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Object)
        ], AgGridColumn.prototype, "initialPinned", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", String)
        ], AgGridColumn.prototype, "chartDataType", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", String)
        ], AgGridColumn.prototype, "cellEditorPopupPosition", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Number)
        ], AgGridColumn.prototype, "sortedAt", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Number)
        ], AgGridColumn.prototype, "sortIndex", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Number)
        ], AgGridColumn.prototype, "initialSortIndex", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Number)
        ], AgGridColumn.prototype, "flex", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Number)
        ], AgGridColumn.prototype, "initialFlex", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Number)
        ], AgGridColumn.prototype, "width", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Number)
        ], AgGridColumn.prototype, "initialWidth", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Number)
        ], AgGridColumn.prototype, "minWidth", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Number)
        ], AgGridColumn.prototype, "maxWidth", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Number)
        ], AgGridColumn.prototype, "rowGroupIndex", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Number)
        ], AgGridColumn.prototype, "initialRowGroupIndex", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Number)
        ], AgGridColumn.prototype, "pivotIndex", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Number)
        ], AgGridColumn.prototype, "initialPivotIndex", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Function)
        ], AgGridColumn.prototype, "dndSourceOnRowDrag", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Object)
        ], AgGridColumn.prototype, "valueGetter", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Object)
        ], AgGridColumn.prototype, "valueSetter", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Object)
        ], AgGridColumn.prototype, "filterValueGetter", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Function)
        ], AgGridColumn.prototype, "keyCreator", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Object)
        ], AgGridColumn.prototype, "cellRendererFramework", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Object)
        ], AgGridColumn.prototype, "pinnedRowCellRenderer", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Object)
        ], AgGridColumn.prototype, "valueFormatter", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Object)
        ], AgGridColumn.prototype, "pinnedRowValueFormatter", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Object)
        ], AgGridColumn.prototype, "valueParser", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Function)
        ], AgGridColumn.prototype, "comparator", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Function)
        ], AgGridColumn.prototype, "equals", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Function)
        ], AgGridColumn.prototype, "pivotComparator", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Function)
        ], AgGridColumn.prototype, "suppressKeyboardEvent", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Function)
        ], AgGridColumn.prototype, "suppressHeaderKeyboardEvent", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Function)
        ], AgGridColumn.prototype, "colSpan", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Function)
        ], AgGridColumn.prototype, "rowSpan", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Function)
        ], AgGridColumn.prototype, "getQuickFilterText", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Function)
        ], AgGridColumn.prototype, "newValueHandler", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Function)
        ], AgGridColumn.prototype, "onCellValueChanged", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Function)
        ], AgGridColumn.prototype, "onCellClicked", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Function)
        ], AgGridColumn.prototype, "onCellDoubleClicked", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Function)
        ], AgGridColumn.prototype, "onCellContextMenu", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Function)
        ], AgGridColumn.prototype, "rowDragText", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Function)
        ], AgGridColumn.prototype, "tooltipValueGetter", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Function)
        ], AgGridColumn.prototype, "cellRendererSelector", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Function)
        ], AgGridColumn.prototype, "cellEditorSelector", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Boolean)
        ], AgGridColumn.prototype, "suppressCellFlash", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Boolean)
        ], AgGridColumn.prototype, "suppressColumnsToolPanel", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Boolean)
        ], AgGridColumn.prototype, "suppressFiltersToolPanel", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Boolean)
        ], AgGridColumn.prototype, "openByDefault", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Boolean)
        ], AgGridColumn.prototype, "marryChildren", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Boolean)
        ], AgGridColumn.prototype, "hide", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Boolean)
        ], AgGridColumn.prototype, "initialHide", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Boolean)
        ], AgGridColumn.prototype, "rowGroup", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Boolean)
        ], AgGridColumn.prototype, "initialRowGroup", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Boolean)
        ], AgGridColumn.prototype, "pivot", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Boolean)
        ], AgGridColumn.prototype, "initialPivot", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Object)
        ], AgGridColumn.prototype, "checkboxSelection", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Object)
        ], AgGridColumn.prototype, "headerCheckboxSelection", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Boolean)
        ], AgGridColumn.prototype, "headerCheckboxSelectionFilteredOnly", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Boolean)
        ], AgGridColumn.prototype, "suppressMenu", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Boolean)
        ], AgGridColumn.prototype, "suppressMovable", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Boolean)
        ], AgGridColumn.prototype, "lockPosition", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Boolean)
        ], AgGridColumn.prototype, "lockVisible", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Boolean)
        ], AgGridColumn.prototype, "lockPinned", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Boolean)
        ], AgGridColumn.prototype, "unSortIcon", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Boolean)
        ], AgGridColumn.prototype, "suppressSizeToFit", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Boolean)
        ], AgGridColumn.prototype, "suppressAutoSize", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Boolean)
        ], AgGridColumn.prototype, "enableRowGroup", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Boolean)
        ], AgGridColumn.prototype, "enablePivot", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Boolean)
        ], AgGridColumn.prototype, "enableValue", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Object)
        ], AgGridColumn.prototype, "editable", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Object)
        ], AgGridColumn.prototype, "suppressPaste", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Object)
        ], AgGridColumn.prototype, "suppressNavigable", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Boolean)
        ], AgGridColumn.prototype, "enableCellChangeFlash", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Object)
        ], AgGridColumn.prototype, "rowDrag", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Object)
        ], AgGridColumn.prototype, "dndSource", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Boolean)
        ], AgGridColumn.prototype, "autoHeight", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Boolean)
        ], AgGridColumn.prototype, "wrapText", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Boolean)
        ], AgGridColumn.prototype, "sortable", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Boolean)
        ], AgGridColumn.prototype, "resizable", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Boolean)
        ], AgGridColumn.prototype, "singleClickEdit", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Boolean)
        ], AgGridColumn.prototype, "floatingFilter", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Boolean)
        ], AgGridColumn.prototype, "cellEditorPopup", void 0);
        AgGridColumn = AgGridColumn_1 = __decorate([
            core.Component({
                selector: 'ag-grid-column',
                template: ''
            })
        ], AgGridColumn);
        return AgGridColumn;
    }());

    var AngularFrameworkOverrides = /** @class */ (function (_super) {
        __extends(AngularFrameworkOverrides, _super);
        function AngularFrameworkOverrides(_ngZone) {
            var _this = _super.call(this) || this;
            _this._ngZone = _ngZone;
            return _this;
        }
        AngularFrameworkOverrides.prototype.setEmitterUsedCallback = function (isEmitterUsed) {
            this.isEmitterUsed = isEmitterUsed;
        };
        AngularFrameworkOverrides.prototype.setTimeout = function (action, timeout) {
            if (this._ngZone) {
                this._ngZone.runOutsideAngular(function () {
                    window.setTimeout(function () {
                        action();
                    }, timeout);
                });
            }
            else {
                window.setTimeout(function () {
                    action();
                }, timeout);
            }
        };
        AngularFrameworkOverrides.prototype.setInterval = function (action, interval) {
            var _this = this;
            return new core$1.AgPromise(function (resolve) {
                if (_this._ngZone) {
                    _this._ngZone.runOutsideAngular(function () {
                        resolve(window.setInterval(function () {
                            action();
                        }, interval));
                    });
                }
                else {
                    resolve(window.setInterval(function () {
                        action();
                    }, interval));
                }
            });
        };
        AngularFrameworkOverrides.prototype.addEventListener = function (element, eventType, listener, useCapture) {
            if (this.isOutsideAngular(eventType) && this._ngZone) {
                this._ngZone.runOutsideAngular(function () {
                    element.addEventListener(eventType, listener, useCapture);
                });
            }
            else {
                element.addEventListener(eventType, listener, useCapture);
            }
        };
        AngularFrameworkOverrides.prototype.dispatchEvent = function (eventType, listener, global) {
            if (global === void 0) { global = false; }
            if (this.isOutsideAngular(eventType)) {
                if (this._ngZone) {
                    this._ngZone.runOutsideAngular(listener);
                }
                else {
                    listener();
                }
            }
            else if (this.isEmitterUsed(eventType) || global) {
                // only trigger off events (and potentially change detection) if actually used
                if (!core.NgZone.isInAngularZone() && this._ngZone) {
                    this._ngZone.run(listener);
                }
                else {
                    listener();
                }
            }
        };
        AngularFrameworkOverrides.ctorParameters = function () { return [
            { type: core.NgZone }
        ]; };
        AngularFrameworkOverrides = __decorate([
            core.Injectable(),
            __metadata("design:paramtypes", [core.NgZone])
        ], AngularFrameworkOverrides);
        return AngularFrameworkOverrides;
    }(core$1.VanillaFrameworkOverrides));

    var AngularFrameworkComponentWrapper = /** @class */ (function (_super) {
        __extends(AngularFrameworkComponentWrapper, _super);
        function AngularFrameworkComponentWrapper() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        AngularFrameworkComponentWrapper.prototype.setViewContainerRef = function (viewContainerRef) {
            this.viewContainerRef = viewContainerRef;
        };
        AngularFrameworkComponentWrapper.prototype.setComponentFactoryResolver = function (componentFactoryResolver) {
            this.componentFactoryResolver = componentFactoryResolver;
        };
        AngularFrameworkComponentWrapper.prototype.createWrapper = function (OriginalConstructor) {
            var that = this;
            var DynamicAgNg2Component = /** @class */ (function (_super) {
                __extends(DynamicAgNg2Component, _super);
                function DynamicAgNg2Component() {
                    return _super !== null && _super.apply(this, arguments) || this;
                }
                DynamicAgNg2Component.prototype.init = function (params) {
                    _super.prototype.init.call(this, params);
                    this._componentRef.changeDetectorRef.detectChanges();
                };
                DynamicAgNg2Component.prototype.createComponent = function () {
                    return that.createComponent(OriginalConstructor);
                };
                DynamicAgNg2Component.prototype.hasMethod = function (name) {
                    return wrapper.getFrameworkComponentInstance()[name] != null;
                };
                DynamicAgNg2Component.prototype.callMethod = function (name, args) {
                    var componentRef = this.getFrameworkComponentInstance();
                    return wrapper.getFrameworkComponentInstance()[name].apply(componentRef, args);
                };
                DynamicAgNg2Component.prototype.addMethod = function (name, callback) {
                    wrapper[name] = callback;
                };
                return DynamicAgNg2Component;
            }(BaseGuiComponent));
            var wrapper = new DynamicAgNg2Component();
            return wrapper;
        };
        AngularFrameworkComponentWrapper.prototype.createComponent = function (componentType) {
            // used to cache the factory, but this a) caused issues when used with either webpack/angularcli with --prod
            // but more significantly, the underlying implementation of resolveComponentFactory uses a map too, so us
            // caching the factory here yields no performance benefits
            var factory = this.componentFactoryResolver.resolveComponentFactory(componentType);
            return this.viewContainerRef.createComponent(factory);
        };
        AngularFrameworkComponentWrapper = __decorate([
            core.Injectable()
        ], AngularFrameworkComponentWrapper);
        return AngularFrameworkComponentWrapper;
    }(core$1.BaseComponentWrapper));
    var BaseGuiComponent = /** @class */ (function () {
        function BaseGuiComponent() {
        }
        BaseGuiComponent.prototype.init = function (params) {
            this._params = params;
            this._componentRef = this.createComponent();
            this._agAwareComponent = this._componentRef.instance;
            this._frameworkComponentInstance = this._componentRef.instance;
            this._eGui = this._componentRef.location.nativeElement;
            this._agAwareComponent.agInit(this._params);
        };
        BaseGuiComponent.prototype.getGui = function () {
            return this._eGui;
        };
        BaseGuiComponent.prototype.destroy = function () {
            if (this._componentRef) {
                this._componentRef.destroy();
            }
        };
        BaseGuiComponent.prototype.getFrameworkComponentInstance = function () {
            return this._frameworkComponentInstance;
        };
        return BaseGuiComponent;
    }());

    var AgGridAngular = /** @class */ (function () {
        function AgGridAngular(elementDef, viewContainerRef, angularFrameworkOverrides, frameworkComponentWrapper, componentFactoryResolver) {
            this.viewContainerRef = viewContainerRef;
            this.angularFrameworkOverrides = angularFrameworkOverrides;
            this.frameworkComponentWrapper = frameworkComponentWrapper;
            this.componentFactoryResolver = componentFactoryResolver;
            this._initialised = false;
            this._destroyed = false;
            // in order to ensure firing of gridReady is deterministic
            this._fullyReady = core$1.AgPromise.resolve(true);
            // @START@
            this.alignedGrids = undefined;
            this.rowData = undefined;
            this.columnDefs = undefined;
            this.excelStyles = undefined;
            this.pinnedTopRowData = undefined;
            this.pinnedBottomRowData = undefined;
            this.chartThemes = undefined;
            this.components = undefined;
            this.frameworkComponents = undefined;
            this.rowStyle = undefined;
            this.context = undefined;
            this.autoGroupColumnDef = undefined;
            this.localeText = undefined;
            this.icons = undefined;
            this.datasource = undefined;
            this.serverSideDatasource = undefined;
            this.viewportDatasource = undefined;
            this.groupRowRendererParams = undefined;
            this.aggFuncs = undefined;
            this.fullWidthCellRendererParams = undefined;
            this.defaultColGroupDef = undefined;
            this.defaultColDef = undefined;
            /** @deprecated Use defaultCsvExportParams or defaultExcelExportParams
             */
            this.defaultExportParams = undefined;
            this.defaultCsvExportParams = undefined;
            this.defaultExcelExportParams = undefined;
            this.columnTypes = undefined;
            this.rowClassRules = undefined;
            this.detailCellRendererParams = undefined;
            this.loadingCellRendererParams = undefined;
            this.loadingOverlayComponentParams = undefined;
            this.noRowsOverlayComponentParams = undefined;
            this.popupParent = undefined;
            this.colResizeDefault = undefined;
            this.statusBar = undefined;
            this.sideBar = undefined;
            this.chartThemeOverrides = undefined;
            this.customChartThemes = undefined;
            this.sortingOrder = undefined;
            this.rowClass = undefined;
            this.rowSelection = undefined;
            this.overlayLoadingTemplate = undefined;
            this.overlayNoRowsTemplate = undefined;
            this.quickFilterText = undefined;
            this.rowModelType = undefined;
            this.editType = undefined;
            this.domLayout = undefined;
            this.clipboardDeliminator = undefined;
            this.rowGroupPanelShow = undefined;
            this.multiSortKey = undefined;
            this.pivotColumnGroupTotals = undefined;
            this.pivotRowTotals = undefined;
            this.pivotPanelShow = undefined;
            this.fillHandleDirection = undefined;
            this.serverSideStoreType = undefined;
            this.groupDisplayType = undefined;
            this.treeDataDisplayType = undefined;
            this.rowHeight = undefined;
            this.detailRowHeight = undefined;
            this.rowBuffer = undefined;
            this.colWidth = undefined;
            this.headerHeight = undefined;
            this.groupHeaderHeight = undefined;
            this.floatingFiltersHeight = undefined;
            this.pivotHeaderHeight = undefined;
            this.pivotGroupHeaderHeight = undefined;
            this.groupDefaultExpanded = undefined;
            this.minColWidth = undefined;
            this.maxColWidth = undefined;
            this.viewportRowModelPageSize = undefined;
            this.viewportRowModelBufferSize = undefined;
            this.autoSizePadding = undefined;
            this.maxBlocksInCache = undefined;
            this.maxConcurrentDatasourceRequests = undefined;
            this.tooltipShowDelay = undefined;
            this.cacheOverflowSize = undefined;
            this.paginationPageSize = undefined;
            this.cacheBlockSize = undefined;
            this.infiniteInitialRowCount = undefined;
            this.scrollbarWidth = undefined;
            this.batchUpdateWaitMillis = undefined;
            this.asyncTransactionWaitMillis = undefined;
            this.blockLoadDebounceMillis = undefined;
            this.keepDetailRowsCount = undefined;
            this.undoRedoCellEditingLimit = undefined;
            this.cellFlashDelay = undefined;
            this.cellFadeDelay = undefined;
            this.tabIndex = undefined;
            this.localeTextFunc = undefined;
            /** @deprecated - this is now groupRowRendererParams.innerRenderer
             */
            this.groupRowInnerRenderer = undefined;
            /** @deprecated - this is now groupRowRendererParams.innerRendererFramework
             */
            this.groupRowInnerRendererFramework = undefined;
            this.dateComponent = undefined;
            this.dateComponentFramework = undefined;
            this.groupRowRenderer = undefined;
            this.groupRowRendererFramework = undefined;
            this.isExternalFilterPresent = undefined;
            this.getRowHeight = undefined;
            this.doesExternalFilterPass = undefined;
            this.getRowClass = undefined;
            this.getRowStyle = undefined;
            this.getContextMenuItems = undefined;
            this.getMainMenuItems = undefined;
            this.processRowPostCreate = undefined;
            this.processCellForClipboard = undefined;
            this.groupRowAggNodes = undefined;
            this.getRowNodeId = undefined;
            this.isFullWidthCell = undefined;
            this.fullWidthCellRenderer = undefined;
            this.fullWidthCellRendererFramework = undefined;
            this.processSecondaryColDef = undefined;
            this.processSecondaryColGroupDef = undefined;
            this.getBusinessKeyForNode = undefined;
            this.sendToClipboard = undefined;
            this.navigateToNextHeader = undefined;
            this.tabToNextHeader = undefined;
            this.navigateToNextCell = undefined;
            this.tabToNextCell = undefined;
            this.processCellFromClipboard = undefined;
            this.getDocument = undefined;
            this.postProcessPopup = undefined;
            this.getChildCount = undefined;
            this.getDataPath = undefined;
            this.loadingCellRenderer = undefined;
            this.loadingCellRendererFramework = undefined;
            this.loadingOverlayComponent = undefined;
            this.loadingOverlayComponentFramework = undefined;
            this.noRowsOverlayComponent = undefined;
            this.noRowsOverlayComponentFramework = undefined;
            this.detailCellRenderer = undefined;
            this.detailCellRendererFramework = undefined;
            this.isRowMaster = undefined;
            this.isRowSelectable = undefined;
            this.postSort = undefined;
            this.processHeaderForClipboard = undefined;
            this.paginationNumberFormatter = undefined;
            this.processDataFromClipboard = undefined;
            this.getServerSideGroupKey = undefined;
            this.isServerSideGroup = undefined;
            /** Allows user to suppress certain keyboard events     */
            this.suppressKeyboardEvent = undefined;
            this.createChartContainer = undefined;
            /** @deprecated
             */
            this.processChartOptions = undefined;
            this.getChartToolbarItems = undefined;
            this.fillOperation = undefined;
            this.isApplyServerSideTransaction = undefined;
            this.getServerSideStoreParams = undefined;
            this.isServerSideGroupOpenByDefault = undefined;
            this.isGroupOpenByDefault = undefined;
            /** @deprecated - Use defaultGroupOrderComparator instead
             */
            this.defaultGroupSortComparator = undefined;
            this.defaultGroupOrderComparator = undefined;
            this.suppressMakeColumnVisibleAfterUnGroup = undefined;
            this.suppressRowClickSelection = undefined;
            this.suppressCellSelection = undefined;
            this.suppressHorizontalScroll = undefined;
            this.alwaysShowHorizontalScroll = undefined;
            this.alwaysShowVerticalScroll = undefined;
            this.debug = undefined;
            this.enableBrowserTooltips = undefined;
            this.enableCellExpressions = undefined;
            this.angularCompileRows = undefined;
            this.angularCompileFilters = undefined;
            /** @deprecated - Use groupDisplayType = 'custom' instead
             */
            this.groupSuppressAutoColumn = undefined;
            this.groupSelectsChildren = undefined;
            this.groupIncludeFooter = undefined;
            this.groupIncludeTotalFooter = undefined;
            /** @deprecated - Use groupDisplayType = 'groupRows' instead
             */
            this.groupUseEntireRow = undefined;
            this.groupSuppressBlankHeader = undefined;
            this.suppressMenuHide = undefined;
            this.suppressRowDeselection = undefined;
            this.unSortIcon = undefined;
            this.suppressMultiSort = undefined;
            this.singleClickEdit = undefined;
            this.suppressLoadingOverlay = undefined;
            this.suppressNoRowsOverlay = undefined;
            this.suppressAutoSize = undefined;
            this.skipHeaderOnAutoSize = undefined;
            this.suppressParentsInRowNodes = undefined;
            this.suppressColumnMoveAnimation = undefined;
            this.suppressMovableColumns = undefined;
            this.suppressFieldDotNotation = undefined;
            this.enableRangeSelection = undefined;
            this.enableRangeHandle = undefined;
            this.enableFillHandle = undefined;
            this.suppressClearOnFillReduction = undefined;
            this.deltaSort = undefined;
            this.suppressTouch = undefined;
            this.suppressAsyncEvents = undefined;
            this.allowContextMenuWithControlKey = undefined;
            this.suppressContextMenu = undefined;
            /** @deprecated - no longer needed, transaction updates keep group state
             */
            this.rememberGroupStateWhenNewData = undefined;
            this.enableCellChangeFlash = undefined;
            this.suppressDragLeaveHidesColumns = undefined;
            this.suppressMiddleClickScrolls = undefined;
            this.suppressPreventDefaultOnMouseWheel = undefined;
            this.suppressCopyRowsToClipboard = undefined;
            this.copyHeadersToClipboard = undefined;
            this.pivotMode = undefined;
            this.suppressAggFuncInHeader = undefined;
            this.suppressColumnVirtualisation = undefined;
            this.suppressAggAtRootLevel = undefined;
            this.suppressFocusAfterRefresh = undefined;
            this.functionsPassive = undefined;
            this.functionsReadOnly = undefined;
            this.animateRows = undefined;
            this.groupSelectsFiltered = undefined;
            this.groupRemoveSingleChildren = undefined;
            this.groupRemoveLowestSingleChildren = undefined;
            this.enableRtl = undefined;
            this.suppressClickEdit = undefined;
            this.rowDragManaged = undefined;
            this.suppressRowDrag = undefined;
            this.suppressMoveWhenRowDragging = undefined;
            this.enableMultiRowDragging = undefined;
            this.enableGroupEdit = undefined;
            this.embedFullWidthRows = undefined;
            /** @deprecated
             */
            this.deprecatedEmbedFullWidthRows = undefined;
            this.suppressPaginationPanel = undefined;
            /** @deprecated Use floatingFilter on the colDef instead
             */
            this.floatingFilter = undefined;
            this.groupHideOpenParents = undefined;
            /** @deprecated - Use groupDisplayType = 'multipleColumns' instead
             */
            this.groupMultiAutoColumn = undefined;
            this.pagination = undefined;
            /** @deprecated Use stopEditingWhenCellsLoseFocus instead
             */
            this.stopEditingWhenGridLosesFocus = undefined;
            this.paginationAutoPageSize = undefined;
            this.suppressScrollOnNewData = undefined;
            this.purgeClosedRowNodes = undefined;
            this.cacheQuickFilter = undefined;
            /** @deprecated
             */
            this.deltaRowDataMode = undefined;
            this.ensureDomOrder = undefined;
            this.accentedSort = undefined;
            this.suppressChangeDetection = undefined;
            this.valueCache = undefined;
            this.valueCacheNeverExpires = undefined;
            this.aggregateOnlyChangedColumns = undefined;
            this.suppressAnimationFrame = undefined;
            this.suppressExcelExport = undefined;
            this.suppressCsvExport = undefined;
            this.treeData = undefined;
            this.masterDetail = undefined;
            this.suppressMultiRangeSelection = undefined;
            this.enterMovesDownAfterEdit = undefined;
            this.enterMovesDown = undefined;
            this.suppressPropertyNamesCheck = undefined;
            this.rowMultiSelectWithClick = undefined;
            this.suppressEnterpriseResetOnNewColumns = undefined;
            this.enableOldSetFilterModel = undefined;
            this.suppressRowHoverHighlight = undefined;
            this.suppressRowTransform = undefined;
            this.suppressClipboardPaste = undefined;
            this.suppressLastEmptyLineOnPaste = undefined;
            this.serverSideSortingAlwaysResets = undefined;
            /** @deprecated
             */
            this.suppressSetColumnStateEvents = undefined;
            /** @deprecated
             */
            this.suppressColumnStateEvents = undefined;
            this.enableCharts = undefined;
            /** @deprecated
             */
            this.deltaColumnMode = undefined;
            this.suppressMaintainUnsortedOrder = undefined;
            this.enableCellTextSelection = undefined;
            /** Set once in init, can never change     */
            this.suppressBrowserResizeObserver = undefined;
            this.suppressMaxRenderedRowRestriction = undefined;
            this.excludeChildrenWhenTreeDataFiltering = undefined;
            this.tooltipMouseTrack = undefined;
            this.keepDetailRows = undefined;
            this.paginateChildRows = undefined;
            this.preventDefaultOnContextMenu = undefined;
            this.undoRedoCellEditing = undefined;
            this.allowDragFromColumnsToolPanel = undefined;
            this.immutableData = undefined;
            /** @deprecated
             */
            this.immutableColumns = undefined;
            this.pivotSuppressAutoColumn = undefined;
            this.suppressExpandablePivotGroups = undefined;
            /** @deprecated
             */
            this.applyColumnDefOrder = undefined;
            this.debounceVerticalScrollbar = undefined;
            this.detailRowAutoHeight = undefined;
            this.serverSideFilteringAlwaysResets = undefined;
            this.suppressAggFilteredOnly = undefined;
            this.showOpenedGroup = undefined;
            this.suppressClipboardApi = undefined;
            this.suppressModelUpdateAfterUpdateTransaction = undefined;
            this.stopEditingWhenCellsLoseFocus = undefined;
            this.maintainColumnOrder = undefined;
            this.groupMaintainOrder = undefined;
            this.columnHoverHighlight = undefined;
            /** @deprecated
             */
            this.allowProcessChartOptions = undefined;
            this.columnEverythingChanged = new core.EventEmitter();
            this.newColumnsLoaded = new core.EventEmitter();
            this.columnPivotModeChanged = new core.EventEmitter();
            this.columnRowGroupChanged = new core.EventEmitter();
            this.expandOrCollapseAll = new core.EventEmitter();
            this.columnPivotChanged = new core.EventEmitter();
            this.gridColumnsChanged = new core.EventEmitter();
            this.columnValueChanged = new core.EventEmitter();
            this.columnMoved = new core.EventEmitter();
            this.columnVisible = new core.EventEmitter();
            this.columnPinned = new core.EventEmitter();
            this.columnGroupOpened = new core.EventEmitter();
            this.columnResized = new core.EventEmitter();
            this.displayedColumnsChanged = new core.EventEmitter();
            this.virtualColumnsChanged = new core.EventEmitter();
            this.asyncTransactionsFlushed = new core.EventEmitter();
            this.rowGroupOpened = new core.EventEmitter();
            this.rowDataChanged = new core.EventEmitter();
            this.rowDataUpdated = new core.EventEmitter();
            this.pinnedRowDataChanged = new core.EventEmitter();
            this.rangeSelectionChanged = new core.EventEmitter();
            this.chartCreated = new core.EventEmitter();
            this.chartRangeSelectionChanged = new core.EventEmitter();
            this.chartOptionsChanged = new core.EventEmitter();
            this.chartDestroyed = new core.EventEmitter();
            this.toolPanelVisibleChanged = new core.EventEmitter();
            this.modelUpdated = new core.EventEmitter();
            this.pasteStart = new core.EventEmitter();
            this.pasteEnd = new core.EventEmitter();
            this.fillStart = new core.EventEmitter();
            this.fillEnd = new core.EventEmitter();
            this.cellClicked = new core.EventEmitter();
            this.cellDoubleClicked = new core.EventEmitter();
            this.cellMouseDown = new core.EventEmitter();
            this.cellContextMenu = new core.EventEmitter();
            this.cellValueChanged = new core.EventEmitter();
            this.rowValueChanged = new core.EventEmitter();
            this.cellFocused = new core.EventEmitter();
            this.rowSelected = new core.EventEmitter();
            this.selectionChanged = new core.EventEmitter();
            this.cellKeyDown = new core.EventEmitter();
            this.cellKeyPress = new core.EventEmitter();
            this.cellMouseOver = new core.EventEmitter();
            this.cellMouseOut = new core.EventEmitter();
            this.filterChanged = new core.EventEmitter();
            this.filterModified = new core.EventEmitter();
            this.filterOpened = new core.EventEmitter();
            this.sortChanged = new core.EventEmitter();
            this.virtualRowRemoved = new core.EventEmitter();
            this.rowClicked = new core.EventEmitter();
            this.rowDoubleClicked = new core.EventEmitter();
            this.gridReady = new core.EventEmitter();
            this.gridSizeChanged = new core.EventEmitter();
            this.viewportChanged = new core.EventEmitter();
            this.firstDataRendered = new core.EventEmitter();
            this.dragStarted = new core.EventEmitter();
            this.dragStopped = new core.EventEmitter();
            this.rowEditingStarted = new core.EventEmitter();
            this.rowEditingStopped = new core.EventEmitter();
            this.cellEditingStarted = new core.EventEmitter();
            this.cellEditingStopped = new core.EventEmitter();
            this.bodyScroll = new core.EventEmitter();
            this.paginationChanged = new core.EventEmitter();
            this.componentStateChanged = new core.EventEmitter();
            this.rowDragEnter = new core.EventEmitter();
            this.rowDragMove = new core.EventEmitter();
            this.rowDragLeave = new core.EventEmitter();
            this.rowDragEnd = new core.EventEmitter();
            this.columnRowGroupChangeRequest = new core.EventEmitter();
            this.columnPivotChangeRequest = new core.EventEmitter();
            this.columnValueChangeRequest = new core.EventEmitter();
            this.columnAggFuncChangeRequest = new core.EventEmitter();
            this._nativeElement = elementDef.nativeElement;
        }
        AgGridAngular.prototype.ngAfterViewInit = function () {
            this.frameworkComponentWrapper.setViewContainerRef(this.viewContainerRef);
            this.frameworkComponentWrapper.setComponentFactoryResolver(this.componentFactoryResolver);
            this.angularFrameworkOverrides.setEmitterUsedCallback(this.isEmitterUsed.bind(this));
            this.gridOptions = core$1.ComponentUtil.copyAttributesToGridOptions(this.gridOptions, this, true);
            this.gridParams = {
                globalEventListener: this.globalEventListener.bind(this),
                frameworkOverrides: this.angularFrameworkOverrides,
                providedBeanInstances: {
                    frameworkComponentWrapper: this.frameworkComponentWrapper
                },
                modules: (this.modules || [])
            };
            if (this.columns && this.columns.length > 0) {
                this.gridOptions.columnDefs = this.columns
                    .map(function (column) {
                    return column.toColDef();
                });
            }
            new core$1.Grid(this._nativeElement, this.gridOptions, this.gridParams);
            if (this.gridOptions.api) {
                this.api = this.gridOptions.api;
            }
            if (this.gridOptions.columnApi) {
                this.columnApi = this.gridOptions.columnApi;
            }
            this._initialised = true;
            // sometimes, especially in large client apps gridReady can fire before ngAfterViewInit
            // this ties these together so that gridReady will always fire after agGridAngular's ngAfterViewInit
            // the actual containing component's ngAfterViewInit will fire just after agGridAngular's
            this._fullyReady.resolveNow(null, function (resolve) { return resolve; });
        };
        AgGridAngular.prototype.ngOnChanges = function (changes) {
            if (this._initialised) {
                core$1.ComponentUtil.processOnChange(changes, this.gridOptions, this.api, this.columnApi);
            }
        };
        AgGridAngular.prototype.ngOnDestroy = function () {
            if (this._initialised) {
                // need to do this before the destroy, so we know not to emit any events
                // while tearing down the grid.
                this._destroyed = true;
                if (this.api) {
                    this.api.destroy();
                }
            }
        };
        // we'll emit the emit if a user is listening for a given event either on the component via normal angular binding
        // or via gridOptions
        AgGridAngular.prototype.isEmitterUsed = function (eventType) {
            var emitter = this[eventType];
            var hasEmitter = !!emitter && emitter.observers && emitter.observers.length > 0;
            // gridReady => onGridReady
            var asEventName = "on" + eventType.charAt(0).toUpperCase() + eventType.substring(1);
            var hasGridOptionListener = !!this.gridOptions && !!this.gridOptions[asEventName];
            return hasEmitter || hasGridOptionListener;
        };
        AgGridAngular.prototype.globalEventListener = function (eventType, event) {
            // if we are tearing down, don't emit angular events, as this causes
            // problems with the angular router
            if (this._destroyed) {
                return;
            }
            // generically look up the eventType
            var emitter = this[eventType];
            if (emitter && this.isEmitterUsed(eventType)) {
                if (eventType === 'gridReady') {
                    // if the user is listening for gridReady, wait for ngAfterViewInit to fire first, then emit the
                    // gridReady event
                    this._fullyReady.then((function (result) {
                        emitter.emit(event);
                    }));
                }
                else {
                    emitter.emit(event);
                }
            }
        };
        AgGridAngular.ctorParameters = function () { return [
            { type: core.ElementRef },
            { type: core.ViewContainerRef },
            { type: AngularFrameworkOverrides },
            { type: AngularFrameworkComponentWrapper },
            { type: core.ComponentFactoryResolver }
        ]; };
        __decorate([
            core.ContentChildren(AgGridColumn),
            __metadata("design:type", core.QueryList)
        ], AgGridAngular.prototype, "columns", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Object)
        ], AgGridAngular.prototype, "gridOptions", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Array)
        ], AgGridAngular.prototype, "modules", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Array)
        ], AgGridAngular.prototype, "alignedGrids", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Array)
        ], AgGridAngular.prototype, "rowData", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Array)
        ], AgGridAngular.prototype, "columnDefs", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Array)
        ], AgGridAngular.prototype, "excelStyles", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Array)
        ], AgGridAngular.prototype, "pinnedTopRowData", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Array)
        ], AgGridAngular.prototype, "pinnedBottomRowData", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Array)
        ], AgGridAngular.prototype, "chartThemes", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Object)
        ], AgGridAngular.prototype, "components", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Object)
        ], AgGridAngular.prototype, "frameworkComponents", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Object)
        ], AgGridAngular.prototype, "rowStyle", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Object)
        ], AgGridAngular.prototype, "context", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Object)
        ], AgGridAngular.prototype, "autoGroupColumnDef", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Object)
        ], AgGridAngular.prototype, "localeText", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Object)
        ], AgGridAngular.prototype, "icons", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Object)
        ], AgGridAngular.prototype, "datasource", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Object)
        ], AgGridAngular.prototype, "serverSideDatasource", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Object)
        ], AgGridAngular.prototype, "viewportDatasource", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Object)
        ], AgGridAngular.prototype, "groupRowRendererParams", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Object)
        ], AgGridAngular.prototype, "aggFuncs", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Object)
        ], AgGridAngular.prototype, "fullWidthCellRendererParams", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Object)
        ], AgGridAngular.prototype, "defaultColGroupDef", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Object)
        ], AgGridAngular.prototype, "defaultColDef", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Object)
        ], AgGridAngular.prototype, "defaultExportParams", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Object)
        ], AgGridAngular.prototype, "defaultCsvExportParams", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Object)
        ], AgGridAngular.prototype, "defaultExcelExportParams", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Object)
        ], AgGridAngular.prototype, "columnTypes", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Object)
        ], AgGridAngular.prototype, "rowClassRules", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Object)
        ], AgGridAngular.prototype, "detailCellRendererParams", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Object)
        ], AgGridAngular.prototype, "loadingCellRendererParams", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Object)
        ], AgGridAngular.prototype, "loadingOverlayComponentParams", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Object)
        ], AgGridAngular.prototype, "noRowsOverlayComponentParams", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", HTMLElement)
        ], AgGridAngular.prototype, "popupParent", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", String)
        ], AgGridAngular.prototype, "colResizeDefault", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Object)
        ], AgGridAngular.prototype, "statusBar", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Object)
        ], AgGridAngular.prototype, "sideBar", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Object)
        ], AgGridAngular.prototype, "chartThemeOverrides", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Object)
        ], AgGridAngular.prototype, "customChartThemes", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Array)
        ], AgGridAngular.prototype, "sortingOrder", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Object)
        ], AgGridAngular.prototype, "rowClass", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", String)
        ], AgGridAngular.prototype, "rowSelection", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", String)
        ], AgGridAngular.prototype, "overlayLoadingTemplate", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", String)
        ], AgGridAngular.prototype, "overlayNoRowsTemplate", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", String)
        ], AgGridAngular.prototype, "quickFilterText", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", String)
        ], AgGridAngular.prototype, "rowModelType", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", String)
        ], AgGridAngular.prototype, "editType", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", String)
        ], AgGridAngular.prototype, "domLayout", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", String)
        ], AgGridAngular.prototype, "clipboardDeliminator", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", String)
        ], AgGridAngular.prototype, "rowGroupPanelShow", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", String)
        ], AgGridAngular.prototype, "multiSortKey", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", String)
        ], AgGridAngular.prototype, "pivotColumnGroupTotals", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", String)
        ], AgGridAngular.prototype, "pivotRowTotals", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", String)
        ], AgGridAngular.prototype, "pivotPanelShow", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", String)
        ], AgGridAngular.prototype, "fillHandleDirection", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", String)
        ], AgGridAngular.prototype, "serverSideStoreType", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", String)
        ], AgGridAngular.prototype, "groupDisplayType", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", String)
        ], AgGridAngular.prototype, "treeDataDisplayType", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Number)
        ], AgGridAngular.prototype, "rowHeight", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Number)
        ], AgGridAngular.prototype, "detailRowHeight", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Number)
        ], AgGridAngular.prototype, "rowBuffer", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Number)
        ], AgGridAngular.prototype, "colWidth", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Number)
        ], AgGridAngular.prototype, "headerHeight", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Number)
        ], AgGridAngular.prototype, "groupHeaderHeight", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Number)
        ], AgGridAngular.prototype, "floatingFiltersHeight", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Number)
        ], AgGridAngular.prototype, "pivotHeaderHeight", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Number)
        ], AgGridAngular.prototype, "pivotGroupHeaderHeight", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Number)
        ], AgGridAngular.prototype, "groupDefaultExpanded", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Number)
        ], AgGridAngular.prototype, "minColWidth", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Number)
        ], AgGridAngular.prototype, "maxColWidth", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Number)
        ], AgGridAngular.prototype, "viewportRowModelPageSize", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Number)
        ], AgGridAngular.prototype, "viewportRowModelBufferSize", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Number)
        ], AgGridAngular.prototype, "autoSizePadding", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Number)
        ], AgGridAngular.prototype, "maxBlocksInCache", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Number)
        ], AgGridAngular.prototype, "maxConcurrentDatasourceRequests", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Number)
        ], AgGridAngular.prototype, "tooltipShowDelay", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Number)
        ], AgGridAngular.prototype, "cacheOverflowSize", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Number)
        ], AgGridAngular.prototype, "paginationPageSize", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Number)
        ], AgGridAngular.prototype, "cacheBlockSize", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Number)
        ], AgGridAngular.prototype, "infiniteInitialRowCount", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Number)
        ], AgGridAngular.prototype, "scrollbarWidth", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Number)
        ], AgGridAngular.prototype, "batchUpdateWaitMillis", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Number)
        ], AgGridAngular.prototype, "asyncTransactionWaitMillis", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Number)
        ], AgGridAngular.prototype, "blockLoadDebounceMillis", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Number)
        ], AgGridAngular.prototype, "keepDetailRowsCount", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Number)
        ], AgGridAngular.prototype, "undoRedoCellEditingLimit", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Number)
        ], AgGridAngular.prototype, "cellFlashDelay", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Number)
        ], AgGridAngular.prototype, "cellFadeDelay", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Number)
        ], AgGridAngular.prototype, "tabIndex", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Function)
        ], AgGridAngular.prototype, "localeTextFunc", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Object)
        ], AgGridAngular.prototype, "groupRowInnerRenderer", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Object)
        ], AgGridAngular.prototype, "groupRowInnerRendererFramework", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Object)
        ], AgGridAngular.prototype, "dateComponent", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Object)
        ], AgGridAngular.prototype, "dateComponentFramework", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Object)
        ], AgGridAngular.prototype, "groupRowRenderer", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Object)
        ], AgGridAngular.prototype, "groupRowRendererFramework", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Function)
        ], AgGridAngular.prototype, "isExternalFilterPresent", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Function)
        ], AgGridAngular.prototype, "getRowHeight", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Function)
        ], AgGridAngular.prototype, "doesExternalFilterPass", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Function)
        ], AgGridAngular.prototype, "getRowClass", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Function)
        ], AgGridAngular.prototype, "getRowStyle", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Function)
        ], AgGridAngular.prototype, "getContextMenuItems", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Function)
        ], AgGridAngular.prototype, "getMainMenuItems", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Function)
        ], AgGridAngular.prototype, "processRowPostCreate", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Function)
        ], AgGridAngular.prototype, "processCellForClipboard", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Function)
        ], AgGridAngular.prototype, "groupRowAggNodes", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Function)
        ], AgGridAngular.prototype, "getRowNodeId", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Function)
        ], AgGridAngular.prototype, "isFullWidthCell", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Object)
        ], AgGridAngular.prototype, "fullWidthCellRenderer", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Object)
        ], AgGridAngular.prototype, "fullWidthCellRendererFramework", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Function)
        ], AgGridAngular.prototype, "processSecondaryColDef", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Function)
        ], AgGridAngular.prototype, "processSecondaryColGroupDef", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Function)
        ], AgGridAngular.prototype, "getBusinessKeyForNode", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Function)
        ], AgGridAngular.prototype, "sendToClipboard", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Function)
        ], AgGridAngular.prototype, "navigateToNextHeader", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Function)
        ], AgGridAngular.prototype, "tabToNextHeader", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Function)
        ], AgGridAngular.prototype, "navigateToNextCell", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Function)
        ], AgGridAngular.prototype, "tabToNextCell", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Function)
        ], AgGridAngular.prototype, "processCellFromClipboard", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Function)
        ], AgGridAngular.prototype, "getDocument", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Function)
        ], AgGridAngular.prototype, "postProcessPopup", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Function)
        ], AgGridAngular.prototype, "getChildCount", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Function)
        ], AgGridAngular.prototype, "getDataPath", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Object)
        ], AgGridAngular.prototype, "loadingCellRenderer", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Object)
        ], AgGridAngular.prototype, "loadingCellRendererFramework", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Object)
        ], AgGridAngular.prototype, "loadingOverlayComponent", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Object)
        ], AgGridAngular.prototype, "loadingOverlayComponentFramework", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Object)
        ], AgGridAngular.prototype, "noRowsOverlayComponent", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Object)
        ], AgGridAngular.prototype, "noRowsOverlayComponentFramework", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Object)
        ], AgGridAngular.prototype, "detailCellRenderer", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Object)
        ], AgGridAngular.prototype, "detailCellRendererFramework", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Function)
        ], AgGridAngular.prototype, "isRowMaster", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Function)
        ], AgGridAngular.prototype, "isRowSelectable", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Function)
        ], AgGridAngular.prototype, "postSort", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Function)
        ], AgGridAngular.prototype, "processHeaderForClipboard", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Function)
        ], AgGridAngular.prototype, "paginationNumberFormatter", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Function)
        ], AgGridAngular.prototype, "processDataFromClipboard", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Function)
        ], AgGridAngular.prototype, "getServerSideGroupKey", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Function)
        ], AgGridAngular.prototype, "isServerSideGroup", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Function)
        ], AgGridAngular.prototype, "suppressKeyboardEvent", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Function)
        ], AgGridAngular.prototype, "createChartContainer", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Function)
        ], AgGridAngular.prototype, "processChartOptions", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Function)
        ], AgGridAngular.prototype, "getChartToolbarItems", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Function)
        ], AgGridAngular.prototype, "fillOperation", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Function)
        ], AgGridAngular.prototype, "isApplyServerSideTransaction", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Function)
        ], AgGridAngular.prototype, "getServerSideStoreParams", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Function)
        ], AgGridAngular.prototype, "isServerSideGroupOpenByDefault", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Function)
        ], AgGridAngular.prototype, "isGroupOpenByDefault", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Function)
        ], AgGridAngular.prototype, "defaultGroupSortComparator", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Function)
        ], AgGridAngular.prototype, "defaultGroupOrderComparator", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Boolean)
        ], AgGridAngular.prototype, "suppressMakeColumnVisibleAfterUnGroup", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Boolean)
        ], AgGridAngular.prototype, "suppressRowClickSelection", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Boolean)
        ], AgGridAngular.prototype, "suppressCellSelection", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Boolean)
        ], AgGridAngular.prototype, "suppressHorizontalScroll", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Boolean)
        ], AgGridAngular.prototype, "alwaysShowHorizontalScroll", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Boolean)
        ], AgGridAngular.prototype, "alwaysShowVerticalScroll", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Boolean)
        ], AgGridAngular.prototype, "debug", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Boolean)
        ], AgGridAngular.prototype, "enableBrowserTooltips", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Boolean)
        ], AgGridAngular.prototype, "enableCellExpressions", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Boolean)
        ], AgGridAngular.prototype, "angularCompileRows", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Boolean)
        ], AgGridAngular.prototype, "angularCompileFilters", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Boolean)
        ], AgGridAngular.prototype, "groupSuppressAutoColumn", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Boolean)
        ], AgGridAngular.prototype, "groupSelectsChildren", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Boolean)
        ], AgGridAngular.prototype, "groupIncludeFooter", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Boolean)
        ], AgGridAngular.prototype, "groupIncludeTotalFooter", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Boolean)
        ], AgGridAngular.prototype, "groupUseEntireRow", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Boolean)
        ], AgGridAngular.prototype, "groupSuppressBlankHeader", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Boolean)
        ], AgGridAngular.prototype, "suppressMenuHide", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Boolean)
        ], AgGridAngular.prototype, "suppressRowDeselection", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Boolean)
        ], AgGridAngular.prototype, "unSortIcon", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Boolean)
        ], AgGridAngular.prototype, "suppressMultiSort", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Boolean)
        ], AgGridAngular.prototype, "singleClickEdit", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Boolean)
        ], AgGridAngular.prototype, "suppressLoadingOverlay", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Boolean)
        ], AgGridAngular.prototype, "suppressNoRowsOverlay", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Boolean)
        ], AgGridAngular.prototype, "suppressAutoSize", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Boolean)
        ], AgGridAngular.prototype, "skipHeaderOnAutoSize", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Boolean)
        ], AgGridAngular.prototype, "suppressParentsInRowNodes", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Boolean)
        ], AgGridAngular.prototype, "suppressColumnMoveAnimation", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Boolean)
        ], AgGridAngular.prototype, "suppressMovableColumns", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Boolean)
        ], AgGridAngular.prototype, "suppressFieldDotNotation", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Boolean)
        ], AgGridAngular.prototype, "enableRangeSelection", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Boolean)
        ], AgGridAngular.prototype, "enableRangeHandle", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Boolean)
        ], AgGridAngular.prototype, "enableFillHandle", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Boolean)
        ], AgGridAngular.prototype, "suppressClearOnFillReduction", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Boolean)
        ], AgGridAngular.prototype, "deltaSort", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Boolean)
        ], AgGridAngular.prototype, "suppressTouch", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Boolean)
        ], AgGridAngular.prototype, "suppressAsyncEvents", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Boolean)
        ], AgGridAngular.prototype, "allowContextMenuWithControlKey", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Boolean)
        ], AgGridAngular.prototype, "suppressContextMenu", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Boolean)
        ], AgGridAngular.prototype, "rememberGroupStateWhenNewData", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Boolean)
        ], AgGridAngular.prototype, "enableCellChangeFlash", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Boolean)
        ], AgGridAngular.prototype, "suppressDragLeaveHidesColumns", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Boolean)
        ], AgGridAngular.prototype, "suppressMiddleClickScrolls", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Boolean)
        ], AgGridAngular.prototype, "suppressPreventDefaultOnMouseWheel", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Boolean)
        ], AgGridAngular.prototype, "suppressCopyRowsToClipboard", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Boolean)
        ], AgGridAngular.prototype, "copyHeadersToClipboard", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Boolean)
        ], AgGridAngular.prototype, "pivotMode", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Boolean)
        ], AgGridAngular.prototype, "suppressAggFuncInHeader", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Boolean)
        ], AgGridAngular.prototype, "suppressColumnVirtualisation", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Boolean)
        ], AgGridAngular.prototype, "suppressAggAtRootLevel", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Boolean)
        ], AgGridAngular.prototype, "suppressFocusAfterRefresh", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Boolean)
        ], AgGridAngular.prototype, "functionsPassive", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Boolean)
        ], AgGridAngular.prototype, "functionsReadOnly", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Boolean)
        ], AgGridAngular.prototype, "animateRows", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Boolean)
        ], AgGridAngular.prototype, "groupSelectsFiltered", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Boolean)
        ], AgGridAngular.prototype, "groupRemoveSingleChildren", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Boolean)
        ], AgGridAngular.prototype, "groupRemoveLowestSingleChildren", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Boolean)
        ], AgGridAngular.prototype, "enableRtl", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Boolean)
        ], AgGridAngular.prototype, "suppressClickEdit", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Boolean)
        ], AgGridAngular.prototype, "rowDragManaged", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Boolean)
        ], AgGridAngular.prototype, "suppressRowDrag", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Boolean)
        ], AgGridAngular.prototype, "suppressMoveWhenRowDragging", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Boolean)
        ], AgGridAngular.prototype, "enableMultiRowDragging", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Boolean)
        ], AgGridAngular.prototype, "enableGroupEdit", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Boolean)
        ], AgGridAngular.prototype, "embedFullWidthRows", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Boolean)
        ], AgGridAngular.prototype, "deprecatedEmbedFullWidthRows", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Boolean)
        ], AgGridAngular.prototype, "suppressPaginationPanel", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Boolean)
        ], AgGridAngular.prototype, "floatingFilter", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Boolean)
        ], AgGridAngular.prototype, "groupHideOpenParents", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Boolean)
        ], AgGridAngular.prototype, "groupMultiAutoColumn", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Boolean)
        ], AgGridAngular.prototype, "pagination", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Boolean)
        ], AgGridAngular.prototype, "stopEditingWhenGridLosesFocus", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Boolean)
        ], AgGridAngular.prototype, "paginationAutoPageSize", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Boolean)
        ], AgGridAngular.prototype, "suppressScrollOnNewData", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Boolean)
        ], AgGridAngular.prototype, "purgeClosedRowNodes", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Boolean)
        ], AgGridAngular.prototype, "cacheQuickFilter", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Boolean)
        ], AgGridAngular.prototype, "deltaRowDataMode", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Boolean)
        ], AgGridAngular.prototype, "ensureDomOrder", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Boolean)
        ], AgGridAngular.prototype, "accentedSort", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Boolean)
        ], AgGridAngular.prototype, "suppressChangeDetection", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Boolean)
        ], AgGridAngular.prototype, "valueCache", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Boolean)
        ], AgGridAngular.prototype, "valueCacheNeverExpires", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Boolean)
        ], AgGridAngular.prototype, "aggregateOnlyChangedColumns", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Boolean)
        ], AgGridAngular.prototype, "suppressAnimationFrame", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Boolean)
        ], AgGridAngular.prototype, "suppressExcelExport", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Boolean)
        ], AgGridAngular.prototype, "suppressCsvExport", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Boolean)
        ], AgGridAngular.prototype, "treeData", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Boolean)
        ], AgGridAngular.prototype, "masterDetail", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Boolean)
        ], AgGridAngular.prototype, "suppressMultiRangeSelection", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Boolean)
        ], AgGridAngular.prototype, "enterMovesDownAfterEdit", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Boolean)
        ], AgGridAngular.prototype, "enterMovesDown", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Boolean)
        ], AgGridAngular.prototype, "suppressPropertyNamesCheck", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Boolean)
        ], AgGridAngular.prototype, "rowMultiSelectWithClick", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Boolean)
        ], AgGridAngular.prototype, "suppressEnterpriseResetOnNewColumns", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Boolean)
        ], AgGridAngular.prototype, "enableOldSetFilterModel", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Boolean)
        ], AgGridAngular.prototype, "suppressRowHoverHighlight", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Boolean)
        ], AgGridAngular.prototype, "suppressRowTransform", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Boolean)
        ], AgGridAngular.prototype, "suppressClipboardPaste", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Boolean)
        ], AgGridAngular.prototype, "suppressLastEmptyLineOnPaste", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Boolean)
        ], AgGridAngular.prototype, "serverSideSortingAlwaysResets", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Boolean)
        ], AgGridAngular.prototype, "suppressSetColumnStateEvents", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Boolean)
        ], AgGridAngular.prototype, "suppressColumnStateEvents", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Boolean)
        ], AgGridAngular.prototype, "enableCharts", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Boolean)
        ], AgGridAngular.prototype, "deltaColumnMode", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Boolean)
        ], AgGridAngular.prototype, "suppressMaintainUnsortedOrder", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Boolean)
        ], AgGridAngular.prototype, "enableCellTextSelection", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Boolean)
        ], AgGridAngular.prototype, "suppressBrowserResizeObserver", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Boolean)
        ], AgGridAngular.prototype, "suppressMaxRenderedRowRestriction", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Boolean)
        ], AgGridAngular.prototype, "excludeChildrenWhenTreeDataFiltering", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Boolean)
        ], AgGridAngular.prototype, "tooltipMouseTrack", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Boolean)
        ], AgGridAngular.prototype, "keepDetailRows", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Boolean)
        ], AgGridAngular.prototype, "paginateChildRows", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Boolean)
        ], AgGridAngular.prototype, "preventDefaultOnContextMenu", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Boolean)
        ], AgGridAngular.prototype, "undoRedoCellEditing", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Boolean)
        ], AgGridAngular.prototype, "allowDragFromColumnsToolPanel", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Boolean)
        ], AgGridAngular.prototype, "immutableData", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Boolean)
        ], AgGridAngular.prototype, "immutableColumns", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Boolean)
        ], AgGridAngular.prototype, "pivotSuppressAutoColumn", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Boolean)
        ], AgGridAngular.prototype, "suppressExpandablePivotGroups", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Boolean)
        ], AgGridAngular.prototype, "applyColumnDefOrder", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Boolean)
        ], AgGridAngular.prototype, "debounceVerticalScrollbar", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Boolean)
        ], AgGridAngular.prototype, "detailRowAutoHeight", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Boolean)
        ], AgGridAngular.prototype, "serverSideFilteringAlwaysResets", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Boolean)
        ], AgGridAngular.prototype, "suppressAggFilteredOnly", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Boolean)
        ], AgGridAngular.prototype, "showOpenedGroup", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Boolean)
        ], AgGridAngular.prototype, "suppressClipboardApi", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Boolean)
        ], AgGridAngular.prototype, "suppressModelUpdateAfterUpdateTransaction", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Boolean)
        ], AgGridAngular.prototype, "stopEditingWhenCellsLoseFocus", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Boolean)
        ], AgGridAngular.prototype, "maintainColumnOrder", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Boolean)
        ], AgGridAngular.prototype, "groupMaintainOrder", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Boolean)
        ], AgGridAngular.prototype, "columnHoverHighlight", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Boolean)
        ], AgGridAngular.prototype, "allowProcessChartOptions", void 0);
        __decorate([
            core.Output(),
            __metadata("design:type", core.EventEmitter)
        ], AgGridAngular.prototype, "columnEverythingChanged", void 0);
        __decorate([
            core.Output(),
            __metadata("design:type", core.EventEmitter)
        ], AgGridAngular.prototype, "newColumnsLoaded", void 0);
        __decorate([
            core.Output(),
            __metadata("design:type", core.EventEmitter)
        ], AgGridAngular.prototype, "columnPivotModeChanged", void 0);
        __decorate([
            core.Output(),
            __metadata("design:type", core.EventEmitter)
        ], AgGridAngular.prototype, "columnRowGroupChanged", void 0);
        __decorate([
            core.Output(),
            __metadata("design:type", core.EventEmitter)
        ], AgGridAngular.prototype, "expandOrCollapseAll", void 0);
        __decorate([
            core.Output(),
            __metadata("design:type", core.EventEmitter)
        ], AgGridAngular.prototype, "columnPivotChanged", void 0);
        __decorate([
            core.Output(),
            __metadata("design:type", core.EventEmitter)
        ], AgGridAngular.prototype, "gridColumnsChanged", void 0);
        __decorate([
            core.Output(),
            __metadata("design:type", core.EventEmitter)
        ], AgGridAngular.prototype, "columnValueChanged", void 0);
        __decorate([
            core.Output(),
            __metadata("design:type", core.EventEmitter)
        ], AgGridAngular.prototype, "columnMoved", void 0);
        __decorate([
            core.Output(),
            __metadata("design:type", core.EventEmitter)
        ], AgGridAngular.prototype, "columnVisible", void 0);
        __decorate([
            core.Output(),
            __metadata("design:type", core.EventEmitter)
        ], AgGridAngular.prototype, "columnPinned", void 0);
        __decorate([
            core.Output(),
            __metadata("design:type", core.EventEmitter)
        ], AgGridAngular.prototype, "columnGroupOpened", void 0);
        __decorate([
            core.Output(),
            __metadata("design:type", core.EventEmitter)
        ], AgGridAngular.prototype, "columnResized", void 0);
        __decorate([
            core.Output(),
            __metadata("design:type", core.EventEmitter)
        ], AgGridAngular.prototype, "displayedColumnsChanged", void 0);
        __decorate([
            core.Output(),
            __metadata("design:type", core.EventEmitter)
        ], AgGridAngular.prototype, "virtualColumnsChanged", void 0);
        __decorate([
            core.Output(),
            __metadata("design:type", core.EventEmitter)
        ], AgGridAngular.prototype, "asyncTransactionsFlushed", void 0);
        __decorate([
            core.Output(),
            __metadata("design:type", core.EventEmitter)
        ], AgGridAngular.prototype, "rowGroupOpened", void 0);
        __decorate([
            core.Output(),
            __metadata("design:type", core.EventEmitter)
        ], AgGridAngular.prototype, "rowDataChanged", void 0);
        __decorate([
            core.Output(),
            __metadata("design:type", core.EventEmitter)
        ], AgGridAngular.prototype, "rowDataUpdated", void 0);
        __decorate([
            core.Output(),
            __metadata("design:type", core.EventEmitter)
        ], AgGridAngular.prototype, "pinnedRowDataChanged", void 0);
        __decorate([
            core.Output(),
            __metadata("design:type", core.EventEmitter)
        ], AgGridAngular.prototype, "rangeSelectionChanged", void 0);
        __decorate([
            core.Output(),
            __metadata("design:type", core.EventEmitter)
        ], AgGridAngular.prototype, "chartCreated", void 0);
        __decorate([
            core.Output(),
            __metadata("design:type", core.EventEmitter)
        ], AgGridAngular.prototype, "chartRangeSelectionChanged", void 0);
        __decorate([
            core.Output(),
            __metadata("design:type", core.EventEmitter)
        ], AgGridAngular.prototype, "chartOptionsChanged", void 0);
        __decorate([
            core.Output(),
            __metadata("design:type", core.EventEmitter)
        ], AgGridAngular.prototype, "chartDestroyed", void 0);
        __decorate([
            core.Output(),
            __metadata("design:type", core.EventEmitter)
        ], AgGridAngular.prototype, "toolPanelVisibleChanged", void 0);
        __decorate([
            core.Output(),
            __metadata("design:type", core.EventEmitter)
        ], AgGridAngular.prototype, "modelUpdated", void 0);
        __decorate([
            core.Output(),
            __metadata("design:type", core.EventEmitter)
        ], AgGridAngular.prototype, "pasteStart", void 0);
        __decorate([
            core.Output(),
            __metadata("design:type", core.EventEmitter)
        ], AgGridAngular.prototype, "pasteEnd", void 0);
        __decorate([
            core.Output(),
            __metadata("design:type", core.EventEmitter)
        ], AgGridAngular.prototype, "fillStart", void 0);
        __decorate([
            core.Output(),
            __metadata("design:type", core.EventEmitter)
        ], AgGridAngular.prototype, "fillEnd", void 0);
        __decorate([
            core.Output(),
            __metadata("design:type", core.EventEmitter)
        ], AgGridAngular.prototype, "cellClicked", void 0);
        __decorate([
            core.Output(),
            __metadata("design:type", core.EventEmitter)
        ], AgGridAngular.prototype, "cellDoubleClicked", void 0);
        __decorate([
            core.Output(),
            __metadata("design:type", core.EventEmitter)
        ], AgGridAngular.prototype, "cellMouseDown", void 0);
        __decorate([
            core.Output(),
            __metadata("design:type", core.EventEmitter)
        ], AgGridAngular.prototype, "cellContextMenu", void 0);
        __decorate([
            core.Output(),
            __metadata("design:type", core.EventEmitter)
        ], AgGridAngular.prototype, "cellValueChanged", void 0);
        __decorate([
            core.Output(),
            __metadata("design:type", core.EventEmitter)
        ], AgGridAngular.prototype, "rowValueChanged", void 0);
        __decorate([
            core.Output(),
            __metadata("design:type", core.EventEmitter)
        ], AgGridAngular.prototype, "cellFocused", void 0);
        __decorate([
            core.Output(),
            __metadata("design:type", core.EventEmitter)
        ], AgGridAngular.prototype, "rowSelected", void 0);
        __decorate([
            core.Output(),
            __metadata("design:type", core.EventEmitter)
        ], AgGridAngular.prototype, "selectionChanged", void 0);
        __decorate([
            core.Output(),
            __metadata("design:type", core.EventEmitter)
        ], AgGridAngular.prototype, "cellKeyDown", void 0);
        __decorate([
            core.Output(),
            __metadata("design:type", core.EventEmitter)
        ], AgGridAngular.prototype, "cellKeyPress", void 0);
        __decorate([
            core.Output(),
            __metadata("design:type", core.EventEmitter)
        ], AgGridAngular.prototype, "cellMouseOver", void 0);
        __decorate([
            core.Output(),
            __metadata("design:type", core.EventEmitter)
        ], AgGridAngular.prototype, "cellMouseOut", void 0);
        __decorate([
            core.Output(),
            __metadata("design:type", core.EventEmitter)
        ], AgGridAngular.prototype, "filterChanged", void 0);
        __decorate([
            core.Output(),
            __metadata("design:type", core.EventEmitter)
        ], AgGridAngular.prototype, "filterModified", void 0);
        __decorate([
            core.Output(),
            __metadata("design:type", core.EventEmitter)
        ], AgGridAngular.prototype, "filterOpened", void 0);
        __decorate([
            core.Output(),
            __metadata("design:type", core.EventEmitter)
        ], AgGridAngular.prototype, "sortChanged", void 0);
        __decorate([
            core.Output(),
            __metadata("design:type", core.EventEmitter)
        ], AgGridAngular.prototype, "virtualRowRemoved", void 0);
        __decorate([
            core.Output(),
            __metadata("design:type", core.EventEmitter)
        ], AgGridAngular.prototype, "rowClicked", void 0);
        __decorate([
            core.Output(),
            __metadata("design:type", core.EventEmitter)
        ], AgGridAngular.prototype, "rowDoubleClicked", void 0);
        __decorate([
            core.Output(),
            __metadata("design:type", core.EventEmitter)
        ], AgGridAngular.prototype, "gridReady", void 0);
        __decorate([
            core.Output(),
            __metadata("design:type", core.EventEmitter)
        ], AgGridAngular.prototype, "gridSizeChanged", void 0);
        __decorate([
            core.Output(),
            __metadata("design:type", core.EventEmitter)
        ], AgGridAngular.prototype, "viewportChanged", void 0);
        __decorate([
            core.Output(),
            __metadata("design:type", core.EventEmitter)
        ], AgGridAngular.prototype, "firstDataRendered", void 0);
        __decorate([
            core.Output(),
            __metadata("design:type", core.EventEmitter)
        ], AgGridAngular.prototype, "dragStarted", void 0);
        __decorate([
            core.Output(),
            __metadata("design:type", core.EventEmitter)
        ], AgGridAngular.prototype, "dragStopped", void 0);
        __decorate([
            core.Output(),
            __metadata("design:type", core.EventEmitter)
        ], AgGridAngular.prototype, "rowEditingStarted", void 0);
        __decorate([
            core.Output(),
            __metadata("design:type", core.EventEmitter)
        ], AgGridAngular.prototype, "rowEditingStopped", void 0);
        __decorate([
            core.Output(),
            __metadata("design:type", core.EventEmitter)
        ], AgGridAngular.prototype, "cellEditingStarted", void 0);
        __decorate([
            core.Output(),
            __metadata("design:type", core.EventEmitter)
        ], AgGridAngular.prototype, "cellEditingStopped", void 0);
        __decorate([
            core.Output(),
            __metadata("design:type", core.EventEmitter)
        ], AgGridAngular.prototype, "bodyScroll", void 0);
        __decorate([
            core.Output(),
            __metadata("design:type", core.EventEmitter)
        ], AgGridAngular.prototype, "paginationChanged", void 0);
        __decorate([
            core.Output(),
            __metadata("design:type", core.EventEmitter)
        ], AgGridAngular.prototype, "componentStateChanged", void 0);
        __decorate([
            core.Output(),
            __metadata("design:type", core.EventEmitter)
        ], AgGridAngular.prototype, "rowDragEnter", void 0);
        __decorate([
            core.Output(),
            __metadata("design:type", core.EventEmitter)
        ], AgGridAngular.prototype, "rowDragMove", void 0);
        __decorate([
            core.Output(),
            __metadata("design:type", core.EventEmitter)
        ], AgGridAngular.prototype, "rowDragLeave", void 0);
        __decorate([
            core.Output(),
            __metadata("design:type", core.EventEmitter)
        ], AgGridAngular.prototype, "rowDragEnd", void 0);
        __decorate([
            core.Output(),
            __metadata("design:type", core.EventEmitter)
        ], AgGridAngular.prototype, "columnRowGroupChangeRequest", void 0);
        __decorate([
            core.Output(),
            __metadata("design:type", core.EventEmitter)
        ], AgGridAngular.prototype, "columnPivotChangeRequest", void 0);
        __decorate([
            core.Output(),
            __metadata("design:type", core.EventEmitter)
        ], AgGridAngular.prototype, "columnValueChangeRequest", void 0);
        __decorate([
            core.Output(),
            __metadata("design:type", core.EventEmitter)
        ], AgGridAngular.prototype, "columnAggFuncChangeRequest", void 0);
        AgGridAngular = __decorate([
            core.Component({
                selector: 'ag-grid-angular',
                template: '',
                providers: [
                    AngularFrameworkOverrides,
                    AngularFrameworkComponentWrapper
                ],
                // tell angular we don't want view encapsulation, we don't want a shadow root
                encapsulation: core.ViewEncapsulation.None
            }),
            __metadata("design:paramtypes", [core.ElementRef,
                core.ViewContainerRef,
                AngularFrameworkOverrides,
                AngularFrameworkComponentWrapper,
                core.ComponentFactoryResolver])
        ], AgGridAngular);
        return AgGridAngular;
    }());

    var AgGridModule = /** @class */ (function () {
        function AgGridModule() {
        }
        AgGridModule_1 = AgGridModule;
        AgGridModule.withComponents = function (components) {
            return {
                ngModule: AgGridModule_1,
                providers: [
                    { provide: core.ANALYZE_FOR_ENTRY_COMPONENTS, useValue: components, multi: true }
                ],
            };
        };
        AgGridModule.forRoot = function (components) {
            return {
                ngModule: AgGridModule_1,
                providers: [
                    { provide: core.ANALYZE_FOR_ENTRY_COMPONENTS, useValue: components, multi: true }
                ],
            };
        };
        var AgGridModule_1;
        AgGridModule = AgGridModule_1 = __decorate([
            core.NgModule({
                declarations: [AgGridAngular, AgGridColumn],
                imports: [],
                exports: [AgGridAngular, AgGridColumn]
            })
        ], AgGridModule);
        return AgGridModule;
    }());

    exports.AgGridAngular = AgGridAngular;
    exports.AgGridColumn = AgGridColumn;
    exports.AgGridModule = AgGridModule;
    exports.AngularFrameworkComponentWrapper = AngularFrameworkComponentWrapper;
    exports.AngularFrameworkOverrides = AngularFrameworkOverrides;

    Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=ag-grid-community-angular.umd.js.map
