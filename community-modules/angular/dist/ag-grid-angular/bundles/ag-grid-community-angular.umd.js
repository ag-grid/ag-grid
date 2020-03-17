(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@angular/core'), require('@ag-grid-community/core')) :
    typeof define === 'function' && define.amd ? define('@ag-grid-community/angular', ['exports', '@angular/core', '@ag-grid-community/core'], factory) :
    (global = global || self, factory((global['ag-grid-community'] = global['ag-grid-community'] || {}, global['ag-grid-community'].angular = {}), global.ng.core, global.agGrid));
}(this, (function (exports, core, core$1) { 'use strict';

    /*! *****************************************************************************
    Copyright (c) Microsoft Corporation. All rights reserved.
    Licensed under the Apache License, Version 2.0 (the "License"); you may not use
    this file except in compliance with the License. You may obtain a copy of the
    License at http://www.apache.org/licenses/LICENSE-2.0

    THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
    KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
    WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
    MERCHANTABLITY OR NON-INFRINGEMENT.

    See the Apache Version 2.0 License for specific language governing permissions
    and limitations under the License.
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

    function __exportStar(m, exports) {
        for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
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
        ;
        AgGridColumn.prototype.createColDefFromGridColumn = function (from) {
            var colDef = {};
            Object.assign(colDef, from);
            delete colDef.childColumns;
            return colDef;
        };
        ;
        var AgGridColumn_1;
        __decorate([
            core.ContentChildren(AgGridColumn_1)
        ], AgGridColumn.prototype, "childColumns", void 0);
        __decorate([
            core.Input()
        ], AgGridColumn.prototype, "children", void 0);
        __decorate([
            core.Input()
        ], AgGridColumn.prototype, "sortingOrder", void 0);
        __decorate([
            core.Input()
        ], AgGridColumn.prototype, "allowedAggFuncs", void 0);
        __decorate([
            core.Input()
        ], AgGridColumn.prototype, "menuTabs", void 0);
        __decorate([
            core.Input()
        ], AgGridColumn.prototype, "cellClassRules", void 0);
        __decorate([
            core.Input()
        ], AgGridColumn.prototype, "icons", void 0);
        __decorate([
            core.Input()
        ], AgGridColumn.prototype, "headerGroupComponent", void 0);
        __decorate([
            core.Input()
        ], AgGridColumn.prototype, "headerGroupComponentFramework", void 0);
        __decorate([
            core.Input()
        ], AgGridColumn.prototype, "headerGroupComponentParams", void 0);
        __decorate([
            core.Input()
        ], AgGridColumn.prototype, "cellStyle", void 0);
        __decorate([
            core.Input()
        ], AgGridColumn.prototype, "cellRendererParams", void 0);
        __decorate([
            core.Input()
        ], AgGridColumn.prototype, "cellEditorFramework", void 0);
        __decorate([
            core.Input()
        ], AgGridColumn.prototype, "cellEditorParams", void 0);
        __decorate([
            core.Input()
        ], AgGridColumn.prototype, "pinnedRowCellRendererFramework", void 0);
        __decorate([
            core.Input()
        ], AgGridColumn.prototype, "pinnedRowCellRendererParams", void 0);
        __decorate([
            core.Input()
        ], AgGridColumn.prototype, "filterFramework", void 0);
        __decorate([
            core.Input()
        ], AgGridColumn.prototype, "filterParams", void 0);
        __decorate([
            core.Input()
        ], AgGridColumn.prototype, "headerComponent", void 0);
        __decorate([
            core.Input()
        ], AgGridColumn.prototype, "headerComponentFramework", void 0);
        __decorate([
            core.Input()
        ], AgGridColumn.prototype, "headerComponentParams", void 0);
        __decorate([
            core.Input()
        ], AgGridColumn.prototype, "floatingFilterComponent", void 0);
        __decorate([
            core.Input()
        ], AgGridColumn.prototype, "floatingFilterComponentParams", void 0);
        __decorate([
            core.Input()
        ], AgGridColumn.prototype, "floatingFilterComponentFramework", void 0);
        __decorate([
            core.Input()
        ], AgGridColumn.prototype, "tooltipComponent", void 0);
        __decorate([
            core.Input()
        ], AgGridColumn.prototype, "tooltipComponentParams", void 0);
        __decorate([
            core.Input()
        ], AgGridColumn.prototype, "tooltipComponentFramework", void 0);
        __decorate([
            core.Input()
        ], AgGridColumn.prototype, "refData", void 0);
        __decorate([
            core.Input()
        ], AgGridColumn.prototype, "headerName", void 0);
        __decorate([
            core.Input()
        ], AgGridColumn.prototype, "columnGroupShow", void 0);
        __decorate([
            core.Input()
        ], AgGridColumn.prototype, "headerClass", void 0);
        __decorate([
            core.Input()
        ], AgGridColumn.prototype, "toolPanelClass", void 0);
        __decorate([
            core.Input()
        ], AgGridColumn.prototype, "headerValueGetter", void 0);
        __decorate([
            core.Input()
        ], AgGridColumn.prototype, "groupId", void 0);
        __decorate([
            core.Input()
        ], AgGridColumn.prototype, "colId", void 0);
        __decorate([
            core.Input()
        ], AgGridColumn.prototype, "sort", void 0);
        __decorate([
            core.Input()
        ], AgGridColumn.prototype, "field", void 0);
        __decorate([
            core.Input()
        ], AgGridColumn.prototype, "type", void 0);
        __decorate([
            core.Input()
        ], AgGridColumn.prototype, "tooltipField", void 0);
        __decorate([
            core.Input()
        ], AgGridColumn.prototype, "headerTooltip", void 0);
        __decorate([
            core.Input()
        ], AgGridColumn.prototype, "cellClass", void 0);
        __decorate([
            core.Input()
        ], AgGridColumn.prototype, "showRowGroup", void 0);
        __decorate([
            core.Input()
        ], AgGridColumn.prototype, "filter", void 0);
        __decorate([
            core.Input()
        ], AgGridColumn.prototype, "aggFunc", void 0);
        __decorate([
            core.Input()
        ], AgGridColumn.prototype, "cellRenderer", void 0);
        __decorate([
            core.Input()
        ], AgGridColumn.prototype, "cellEditor", void 0);
        __decorate([
            core.Input()
        ], AgGridColumn.prototype, "pinned", void 0);
        __decorate([
            core.Input()
        ], AgGridColumn.prototype, "chartDataType", void 0);
        __decorate([
            core.Input()
        ], AgGridColumn.prototype, "sortedAt", void 0);
        __decorate([
            core.Input()
        ], AgGridColumn.prototype, "flex", void 0);
        __decorate([
            core.Input()
        ], AgGridColumn.prototype, "width", void 0);
        __decorate([
            core.Input()
        ], AgGridColumn.prototype, "minWidth", void 0);
        __decorate([
            core.Input()
        ], AgGridColumn.prototype, "maxWidth", void 0);
        __decorate([
            core.Input()
        ], AgGridColumn.prototype, "rowGroupIndex", void 0);
        __decorate([
            core.Input()
        ], AgGridColumn.prototype, "pivotIndex", void 0);
        __decorate([
            core.Input()
        ], AgGridColumn.prototype, "dndSourceOnRowDrag", void 0);
        __decorate([
            core.Input()
        ], AgGridColumn.prototype, "valueGetter", void 0);
        __decorate([
            core.Input()
        ], AgGridColumn.prototype, "valueSetter", void 0);
        __decorate([
            core.Input()
        ], AgGridColumn.prototype, "filterValueGetter", void 0);
        __decorate([
            core.Input()
        ], AgGridColumn.prototype, "keyCreator", void 0);
        __decorate([
            core.Input()
        ], AgGridColumn.prototype, "cellRendererFramework", void 0);
        __decorate([
            core.Input()
        ], AgGridColumn.prototype, "pinnedRowCellRenderer", void 0);
        __decorate([
            core.Input()
        ], AgGridColumn.prototype, "valueFormatter", void 0);
        __decorate([
            core.Input()
        ], AgGridColumn.prototype, "pinnedRowValueFormatter", void 0);
        __decorate([
            core.Input()
        ], AgGridColumn.prototype, "valueParser", void 0);
        __decorate([
            core.Input()
        ], AgGridColumn.prototype, "comparator", void 0);
        __decorate([
            core.Input()
        ], AgGridColumn.prototype, "equals", void 0);
        __decorate([
            core.Input()
        ], AgGridColumn.prototype, "pivotComparator", void 0);
        __decorate([
            core.Input()
        ], AgGridColumn.prototype, "suppressKeyboardEvent", void 0);
        __decorate([
            core.Input()
        ], AgGridColumn.prototype, "colSpan", void 0);
        __decorate([
            core.Input()
        ], AgGridColumn.prototype, "rowSpan", void 0);
        __decorate([
            core.Input()
        ], AgGridColumn.prototype, "getQuickFilterText", void 0);
        __decorate([
            core.Input()
        ], AgGridColumn.prototype, "newValueHandler", void 0);
        __decorate([
            core.Input()
        ], AgGridColumn.prototype, "onCellValueChanged", void 0);
        __decorate([
            core.Input()
        ], AgGridColumn.prototype, "onCellClicked", void 0);
        __decorate([
            core.Input()
        ], AgGridColumn.prototype, "onCellDoubleClicked", void 0);
        __decorate([
            core.Input()
        ], AgGridColumn.prototype, "onCellContextMenu", void 0);
        __decorate([
            core.Input()
        ], AgGridColumn.prototype, "rowDragText", void 0);
        __decorate([
            core.Input()
        ], AgGridColumn.prototype, "tooltip", void 0);
        __decorate([
            core.Input()
        ], AgGridColumn.prototype, "tooltipValueGetter", void 0);
        __decorate([
            core.Input()
        ], AgGridColumn.prototype, "cellRendererSelector", void 0);
        __decorate([
            core.Input()
        ], AgGridColumn.prototype, "cellEditorSelector", void 0);
        __decorate([
            core.Input()
        ], AgGridColumn.prototype, "suppressCellFlash", void 0);
        __decorate([
            core.Input()
        ], AgGridColumn.prototype, "suppressColumnsToolPanel", void 0);
        __decorate([
            core.Input()
        ], AgGridColumn.prototype, "suppressFiltersToolPanel", void 0);
        __decorate([
            core.Input()
        ], AgGridColumn.prototype, "openByDefault", void 0);
        __decorate([
            core.Input()
        ], AgGridColumn.prototype, "marryChildren", void 0);
        __decorate([
            core.Input()
        ], AgGridColumn.prototype, "hide", void 0);
        __decorate([
            core.Input()
        ], AgGridColumn.prototype, "rowGroup", void 0);
        __decorate([
            core.Input()
        ], AgGridColumn.prototype, "pivot", void 0);
        __decorate([
            core.Input()
        ], AgGridColumn.prototype, "checkboxSelection", void 0);
        __decorate([
            core.Input()
        ], AgGridColumn.prototype, "headerCheckboxSelection", void 0);
        __decorate([
            core.Input()
        ], AgGridColumn.prototype, "headerCheckboxSelectionFilteredOnly", void 0);
        __decorate([
            core.Input()
        ], AgGridColumn.prototype, "suppressMenu", void 0);
        __decorate([
            core.Input()
        ], AgGridColumn.prototype, "suppressSorting", void 0);
        __decorate([
            core.Input()
        ], AgGridColumn.prototype, "suppressMovable", void 0);
        __decorate([
            core.Input()
        ], AgGridColumn.prototype, "suppressFilter", void 0);
        __decorate([
            core.Input()
        ], AgGridColumn.prototype, "lockPosition", void 0);
        __decorate([
            core.Input()
        ], AgGridColumn.prototype, "lockVisible", void 0);
        __decorate([
            core.Input()
        ], AgGridColumn.prototype, "lockPinned", void 0);
        __decorate([
            core.Input()
        ], AgGridColumn.prototype, "unSortIcon", void 0);
        __decorate([
            core.Input()
        ], AgGridColumn.prototype, "suppressSizeToFit", void 0);
        __decorate([
            core.Input()
        ], AgGridColumn.prototype, "suppressResize", void 0);
        __decorate([
            core.Input()
        ], AgGridColumn.prototype, "suppressAutoSize", void 0);
        __decorate([
            core.Input()
        ], AgGridColumn.prototype, "enableRowGroup", void 0);
        __decorate([
            core.Input()
        ], AgGridColumn.prototype, "enablePivot", void 0);
        __decorate([
            core.Input()
        ], AgGridColumn.prototype, "enableValue", void 0);
        __decorate([
            core.Input()
        ], AgGridColumn.prototype, "editable", void 0);
        __decorate([
            core.Input()
        ], AgGridColumn.prototype, "suppressPaste", void 0);
        __decorate([
            core.Input()
        ], AgGridColumn.prototype, "suppressNavigable", void 0);
        __decorate([
            core.Input()
        ], AgGridColumn.prototype, "enableCellChangeFlash", void 0);
        __decorate([
            core.Input()
        ], AgGridColumn.prototype, "rowDrag", void 0);
        __decorate([
            core.Input()
        ], AgGridColumn.prototype, "dndSource", void 0);
        __decorate([
            core.Input()
        ], AgGridColumn.prototype, "autoHeight", void 0);
        __decorate([
            core.Input()
        ], AgGridColumn.prototype, "sortable", void 0);
        __decorate([
            core.Input()
        ], AgGridColumn.prototype, "resizable", void 0);
        __decorate([
            core.Input()
        ], AgGridColumn.prototype, "singleClickEdit", void 0);
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
        AngularFrameworkOverrides.prototype.setTimeout = function (action, timeout) {
            this._ngZone.runOutsideAngular(function () {
                window.setTimeout(function () {
                    action();
                }, timeout);
            });
        };
        AngularFrameworkOverrides.prototype.addEventListenerOutsideAngular = function (element, type, listener, useCapture) {
            var _this = this;
            this._ngZone.runOutsideAngular(function () {
                _super.prototype.addEventListenerOutsideAngular.call(_this, element, type, listener, useCapture);
            });
        };
        AngularFrameworkOverrides.ctorParameters = function () { return [
            { type: core.NgZone }
        ]; };
        AngularFrameworkOverrides = __decorate([
            core.Injectable()
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
        function AgGridAngular(elementDef, viewContainerRef, angularFrameworkOverrides, frameworkComponentWrapper, _componentFactoryResolver) {
            this.viewContainerRef = viewContainerRef;
            this.angularFrameworkOverrides = angularFrameworkOverrides;
            this.frameworkComponentWrapper = frameworkComponentWrapper;
            this._componentFactoryResolver = _componentFactoryResolver;
            this._initialised = false;
            this._destroyed = false;
            // in order to ensure firing of gridReady is deterministic
            this._fullyReady = new core$1.Promise(function (resolve) {
                resolve(true);
            });
            // @START@
            this.slaveGrids = undefined;
            this.alignedGrids = undefined;
            this.rowData = undefined;
            this.columnDefs = undefined;
            this.excelStyles = undefined;
            this.pinnedTopRowData = undefined;
            this.pinnedBottomRowData = undefined;
            this.components = undefined;
            this.frameworkComponents = undefined;
            this.rowStyle = undefined;
            this.context = undefined;
            this.autoGroupColumnDef = undefined;
            this.groupColumnDef = undefined;
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
            this.defaultExportParams = undefined;
            this.columnTypes = undefined;
            this.rowClassRules = undefined;
            this.detailGridOptions = undefined;
            this.detailCellRendererParams = undefined;
            this.loadingCellRendererParams = undefined;
            this.loadingOverlayComponentParams = undefined;
            this.noRowsOverlayComponentParams = undefined;
            this.popupParent = undefined;
            this.colResizeDefault = undefined;
            this.reduxStore = undefined;
            this.statusBar = undefined;
            this.sideBar = undefined;
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
            this.paginationStartPage = undefined;
            this.infiniteBlockSize = undefined;
            this.batchUpdateWaitMillis = undefined;
            this.blockLoadDebounceMillis = undefined;
            this.keepDetailRowsCount = undefined;
            this.undoRedoCellEditingLimit = undefined;
            this.localeTextFunc = undefined;
            this.groupRowInnerRenderer = undefined;
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
            this.getRowClassRules = undefined;
            this.traverseNode = undefined;
            this.getContextMenuItems = undefined;
            this.getMainMenuItems = undefined;
            this.processRowPostCreate = undefined;
            this.processCellForClipboard = undefined;
            this.getNodeChildDetails = undefined;
            this.groupRowAggNodes = undefined;
            this.getRowNodeId = undefined;
            this.isFullWidthCell = undefined;
            this.fullWidthCellRenderer = undefined;
            this.fullWidthCellRendererFramework = undefined;
            this.doesDataFlower = undefined;
            this.processSecondaryColDef = undefined;
            this.processSecondaryColGroupDef = undefined;
            this.getBusinessKeyForNode = undefined;
            this.sendToClipboard = undefined;
            this.navigateToNextCell = undefined;
            this.tabToNextCell = undefined;
            this.getDetailRowData = undefined;
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
            this.defaultGroupSortComparator = undefined;
            this.isRowMaster = undefined;
            this.isRowSelectable = undefined;
            this.postSort = undefined;
            this.processHeaderForClipboard = undefined;
            this.paginationNumberFormatter = undefined;
            this.processDataFromClipboard = undefined;
            this.getServerSideGroupKey = undefined;
            this.isServerSideGroup = undefined;
            this.suppressKeyboardEvent = undefined;
            this.createChartContainer = undefined;
            this.processChartOptions = undefined;
            this.getChartToolbarItems = undefined;
            this.fillOperation = undefined;
            this.toolPanelSuppressRowGroups = undefined;
            this.toolPanelSuppressValues = undefined;
            this.toolPanelSuppressPivots = undefined;
            this.toolPanelSuppressPivotMode = undefined;
            this.toolPanelSuppressSideButtons = undefined;
            this.toolPanelSuppressColumnFilter = undefined;
            this.toolPanelSuppressColumnSelectAll = undefined;
            this.toolPanelSuppressColumnExpandAll = undefined;
            this.suppressMakeColumnVisibleAfterUnGroup = undefined;
            this.suppressRowClickSelection = undefined;
            this.suppressCellSelection = undefined;
            this.suppressHorizontalScroll = undefined;
            this.alwaysShowVerticalScroll = undefined;
            this.debug = undefined;
            this.enableBrowserTooltips = undefined;
            this.enableColResize = undefined;
            this.enableCellExpressions = undefined;
            this.enableSorting = undefined;
            this.enableServerSideSorting = undefined;
            this.enableFilter = undefined;
            this.enableServerSideFilter = undefined;
            this.angularCompileRows = undefined;
            this.angularCompileFilters = undefined;
            this.angularCompileHeaders = undefined;
            this.groupSuppressAutoColumn = undefined;
            this.groupSelectsChildren = undefined;
            this.groupIncludeFooter = undefined;
            this.groupIncludeTotalFooter = undefined;
            this.groupUseEntireRow = undefined;
            this.groupSuppressRow = undefined;
            this.groupSuppressBlankHeader = undefined;
            this.forPrint = undefined;
            this.suppressMenuHide = undefined;
            this.rowDeselection = undefined;
            this.unSortIcon = undefined;
            this.suppressMultiSort = undefined;
            this.singleClickEdit = undefined;
            this.suppressLoadingOverlay = undefined;
            this.suppressNoRowsOverlay = undefined;
            this.suppressAutoSize = undefined;
            this.skipHeaderOnAutoSize = undefined;
            this.suppressParentsInRowNodes = undefined;
            this.showToolPanel = undefined;
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
            this.suppressMenuFilterPanel = undefined;
            this.suppressMenuMainPanel = undefined;
            this.suppressMenuColumnPanel = undefined;
            this.rememberGroupStateWhenNewData = undefined;
            this.enableCellChangeFlash = undefined;
            this.suppressDragLeaveHidesColumns = undefined;
            this.suppressMiddleClickScrolls = undefined;
            this.suppressPreventDefaultOnMouseWheel = undefined;
            this.suppressUseColIdForGroups = undefined;
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
            this.deprecatedEmbedFullWidthRows = undefined;
            this.suppressTabbing = undefined;
            this.suppressPaginationPanel = undefined;
            this.floatingFilter = undefined;
            this.groupHideOpenParents = undefined;
            this.groupMultiAutoColumn = undefined;
            this.pagination = undefined;
            this.stopEditingWhenGridLosesFocus = undefined;
            this.paginationAutoPageSize = undefined;
            this.suppressScrollOnNewData = undefined;
            this.purgeClosedRowNodes = undefined;
            this.cacheQuickFilter = undefined;
            this.deltaRowDataMode = undefined;
            this.ensureDomOrder = undefined;
            this.accentedSort = undefined;
            this.pivotTotals = undefined;
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
            this.contractColumnSelection = undefined;
            this.suppressEnterpriseResetOnNewColumns = undefined;
            this.enableOldSetFilterModel = undefined;
            this.suppressRowHoverHighlight = undefined;
            this.gridAutoHeight = undefined;
            this.suppressRowTransform = undefined;
            this.suppressClipboardPaste = undefined;
            this.serverSideSortingAlwaysResets = undefined;
            this.reactNext = undefined;
            this.suppressSetColumnStateEvents = undefined;
            this.enableCharts = undefined;
            this.deltaColumnMode = undefined;
            this.suppressMaintainUnsortedOrder = undefined;
            this.enableCellTextSelection = undefined;
            this.suppressBrowserResizeObserver = undefined;
            this.suppressMaxRenderedRowRestriction = undefined;
            this.excludeChildrenWhenTreeDataFiltering = undefined;
            this.keepDetailRows = undefined;
            this.paginateChildRows = undefined;
            this.preventDefaultOnContextMenu = undefined;
            this.undoRedoCellEditing = undefined;
            this.allowDragFromColumnsToolPanel = undefined;
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
            this.animationQueueEmpty = new core.EventEmitter();
            this.heightScaleChanged = new core.EventEmitter();
            this.paginationChanged = new core.EventEmitter();
            this.componentStateChanged = new core.EventEmitter();
            this.bodyHeightChanged = new core.EventEmitter();
            this.displayedColumnsWidthChanged = new core.EventEmitter();
            this.scrollVisibilityChanged = new core.EventEmitter();
            this.columnHoverChanged = new core.EventEmitter();
            this.flashCells = new core.EventEmitter();
            this.rowDragEnter = new core.EventEmitter();
            this.rowDragMove = new core.EventEmitter();
            this.rowDragLeave = new core.EventEmitter();
            this.rowDragEnd = new core.EventEmitter();
            this.popupToFront = new core.EventEmitter();
            this.columnRowGroupChangeRequest = new core.EventEmitter();
            this.columnPivotChangeRequest = new core.EventEmitter();
            this.columnValueChangeRequest = new core.EventEmitter();
            this.columnAggFuncChangeRequest = new core.EventEmitter();
            this.keyboardFocus = new core.EventEmitter();
            this.mouseFocus = new core.EventEmitter();
            this._nativeElement = elementDef.nativeElement;
            this.frameworkComponentWrapper.setViewContainerRef(this.viewContainerRef);
            this.frameworkComponentWrapper.setComponentFactoryResolver(this._componentFactoryResolver);
        }
        AgGridAngular.prototype.ngAfterViewInit = function () {
            this.checkForDeprecatedEvents();
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
        AgGridAngular.prototype.checkForDeprecatedEvents = function () {
            var _this = this;
            core$1.Utils.iterateObject(core$1.Events, function (key, eventName) {
                if (_this[eventName] && _this[eventName].observers.length > 0) {
                    core$1.GridOptionsWrapper.checkEventDeprecation(eventName);
                }
            });
        };
        AgGridAngular.prototype.globalEventListener = function (eventType, event) {
            // if we are tearing down, don't emit angular events, as this causes
            // problems with the angular router
            if (this._destroyed) {
                return;
            }
            // generically look up the eventType
            var emitter = this[eventType];
            if (emitter) {
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
            else {
                console.log('ag-Grid-angular: could not find EventEmitter: ' + eventType);
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
            core.ContentChildren(AgGridColumn)
        ], AgGridAngular.prototype, "columns", void 0);
        __decorate([
            core.Input()
        ], AgGridAngular.prototype, "gridOptions", void 0);
        __decorate([
            core.Input()
        ], AgGridAngular.prototype, "modules", void 0);
        __decorate([
            core.Input()
        ], AgGridAngular.prototype, "slaveGrids", void 0);
        __decorate([
            core.Input()
        ], AgGridAngular.prototype, "alignedGrids", void 0);
        __decorate([
            core.Input()
        ], AgGridAngular.prototype, "rowData", void 0);
        __decorate([
            core.Input()
        ], AgGridAngular.prototype, "columnDefs", void 0);
        __decorate([
            core.Input()
        ], AgGridAngular.prototype, "excelStyles", void 0);
        __decorate([
            core.Input()
        ], AgGridAngular.prototype, "pinnedTopRowData", void 0);
        __decorate([
            core.Input()
        ], AgGridAngular.prototype, "pinnedBottomRowData", void 0);
        __decorate([
            core.Input()
        ], AgGridAngular.prototype, "components", void 0);
        __decorate([
            core.Input()
        ], AgGridAngular.prototype, "frameworkComponents", void 0);
        __decorate([
            core.Input()
        ], AgGridAngular.prototype, "rowStyle", void 0);
        __decorate([
            core.Input()
        ], AgGridAngular.prototype, "context", void 0);
        __decorate([
            core.Input()
        ], AgGridAngular.prototype, "autoGroupColumnDef", void 0);
        __decorate([
            core.Input()
        ], AgGridAngular.prototype, "groupColumnDef", void 0);
        __decorate([
            core.Input()
        ], AgGridAngular.prototype, "localeText", void 0);
        __decorate([
            core.Input()
        ], AgGridAngular.prototype, "icons", void 0);
        __decorate([
            core.Input()
        ], AgGridAngular.prototype, "datasource", void 0);
        __decorate([
            core.Input()
        ], AgGridAngular.prototype, "serverSideDatasource", void 0);
        __decorate([
            core.Input()
        ], AgGridAngular.prototype, "viewportDatasource", void 0);
        __decorate([
            core.Input()
        ], AgGridAngular.prototype, "groupRowRendererParams", void 0);
        __decorate([
            core.Input()
        ], AgGridAngular.prototype, "aggFuncs", void 0);
        __decorate([
            core.Input()
        ], AgGridAngular.prototype, "fullWidthCellRendererParams", void 0);
        __decorate([
            core.Input()
        ], AgGridAngular.prototype, "defaultColGroupDef", void 0);
        __decorate([
            core.Input()
        ], AgGridAngular.prototype, "defaultColDef", void 0);
        __decorate([
            core.Input()
        ], AgGridAngular.prototype, "defaultExportParams", void 0);
        __decorate([
            core.Input()
        ], AgGridAngular.prototype, "columnTypes", void 0);
        __decorate([
            core.Input()
        ], AgGridAngular.prototype, "rowClassRules", void 0);
        __decorate([
            core.Input()
        ], AgGridAngular.prototype, "detailGridOptions", void 0);
        __decorate([
            core.Input()
        ], AgGridAngular.prototype, "detailCellRendererParams", void 0);
        __decorate([
            core.Input()
        ], AgGridAngular.prototype, "loadingCellRendererParams", void 0);
        __decorate([
            core.Input()
        ], AgGridAngular.prototype, "loadingOverlayComponentParams", void 0);
        __decorate([
            core.Input()
        ], AgGridAngular.prototype, "noRowsOverlayComponentParams", void 0);
        __decorate([
            core.Input()
        ], AgGridAngular.prototype, "popupParent", void 0);
        __decorate([
            core.Input()
        ], AgGridAngular.prototype, "colResizeDefault", void 0);
        __decorate([
            core.Input()
        ], AgGridAngular.prototype, "reduxStore", void 0);
        __decorate([
            core.Input()
        ], AgGridAngular.prototype, "statusBar", void 0);
        __decorate([
            core.Input()
        ], AgGridAngular.prototype, "sideBar", void 0);
        __decorate([
            core.Input()
        ], AgGridAngular.prototype, "sortingOrder", void 0);
        __decorate([
            core.Input()
        ], AgGridAngular.prototype, "rowClass", void 0);
        __decorate([
            core.Input()
        ], AgGridAngular.prototype, "rowSelection", void 0);
        __decorate([
            core.Input()
        ], AgGridAngular.prototype, "overlayLoadingTemplate", void 0);
        __decorate([
            core.Input()
        ], AgGridAngular.prototype, "overlayNoRowsTemplate", void 0);
        __decorate([
            core.Input()
        ], AgGridAngular.prototype, "quickFilterText", void 0);
        __decorate([
            core.Input()
        ], AgGridAngular.prototype, "rowModelType", void 0);
        __decorate([
            core.Input()
        ], AgGridAngular.prototype, "editType", void 0);
        __decorate([
            core.Input()
        ], AgGridAngular.prototype, "domLayout", void 0);
        __decorate([
            core.Input()
        ], AgGridAngular.prototype, "clipboardDeliminator", void 0);
        __decorate([
            core.Input()
        ], AgGridAngular.prototype, "rowGroupPanelShow", void 0);
        __decorate([
            core.Input()
        ], AgGridAngular.prototype, "multiSortKey", void 0);
        __decorate([
            core.Input()
        ], AgGridAngular.prototype, "pivotColumnGroupTotals", void 0);
        __decorate([
            core.Input()
        ], AgGridAngular.prototype, "pivotRowTotals", void 0);
        __decorate([
            core.Input()
        ], AgGridAngular.prototype, "pivotPanelShow", void 0);
        __decorate([
            core.Input()
        ], AgGridAngular.prototype, "rowHeight", void 0);
        __decorate([
            core.Input()
        ], AgGridAngular.prototype, "detailRowHeight", void 0);
        __decorate([
            core.Input()
        ], AgGridAngular.prototype, "rowBuffer", void 0);
        __decorate([
            core.Input()
        ], AgGridAngular.prototype, "colWidth", void 0);
        __decorate([
            core.Input()
        ], AgGridAngular.prototype, "headerHeight", void 0);
        __decorate([
            core.Input()
        ], AgGridAngular.prototype, "groupHeaderHeight", void 0);
        __decorate([
            core.Input()
        ], AgGridAngular.prototype, "floatingFiltersHeight", void 0);
        __decorate([
            core.Input()
        ], AgGridAngular.prototype, "pivotHeaderHeight", void 0);
        __decorate([
            core.Input()
        ], AgGridAngular.prototype, "pivotGroupHeaderHeight", void 0);
        __decorate([
            core.Input()
        ], AgGridAngular.prototype, "groupDefaultExpanded", void 0);
        __decorate([
            core.Input()
        ], AgGridAngular.prototype, "minColWidth", void 0);
        __decorate([
            core.Input()
        ], AgGridAngular.prototype, "maxColWidth", void 0);
        __decorate([
            core.Input()
        ], AgGridAngular.prototype, "viewportRowModelPageSize", void 0);
        __decorate([
            core.Input()
        ], AgGridAngular.prototype, "viewportRowModelBufferSize", void 0);
        __decorate([
            core.Input()
        ], AgGridAngular.prototype, "autoSizePadding", void 0);
        __decorate([
            core.Input()
        ], AgGridAngular.prototype, "maxBlocksInCache", void 0);
        __decorate([
            core.Input()
        ], AgGridAngular.prototype, "maxConcurrentDatasourceRequests", void 0);
        __decorate([
            core.Input()
        ], AgGridAngular.prototype, "tooltipShowDelay", void 0);
        __decorate([
            core.Input()
        ], AgGridAngular.prototype, "cacheOverflowSize", void 0);
        __decorate([
            core.Input()
        ], AgGridAngular.prototype, "paginationPageSize", void 0);
        __decorate([
            core.Input()
        ], AgGridAngular.prototype, "cacheBlockSize", void 0);
        __decorate([
            core.Input()
        ], AgGridAngular.prototype, "infiniteInitialRowCount", void 0);
        __decorate([
            core.Input()
        ], AgGridAngular.prototype, "scrollbarWidth", void 0);
        __decorate([
            core.Input()
        ], AgGridAngular.prototype, "paginationStartPage", void 0);
        __decorate([
            core.Input()
        ], AgGridAngular.prototype, "infiniteBlockSize", void 0);
        __decorate([
            core.Input()
        ], AgGridAngular.prototype, "batchUpdateWaitMillis", void 0);
        __decorate([
            core.Input()
        ], AgGridAngular.prototype, "blockLoadDebounceMillis", void 0);
        __decorate([
            core.Input()
        ], AgGridAngular.prototype, "keepDetailRowsCount", void 0);
        __decorate([
            core.Input()
        ], AgGridAngular.prototype, "undoRedoCellEditingLimit", void 0);
        __decorate([
            core.Input()
        ], AgGridAngular.prototype, "localeTextFunc", void 0);
        __decorate([
            core.Input()
        ], AgGridAngular.prototype, "groupRowInnerRenderer", void 0);
        __decorate([
            core.Input()
        ], AgGridAngular.prototype, "groupRowInnerRendererFramework", void 0);
        __decorate([
            core.Input()
        ], AgGridAngular.prototype, "dateComponent", void 0);
        __decorate([
            core.Input()
        ], AgGridAngular.prototype, "dateComponentFramework", void 0);
        __decorate([
            core.Input()
        ], AgGridAngular.prototype, "groupRowRenderer", void 0);
        __decorate([
            core.Input()
        ], AgGridAngular.prototype, "groupRowRendererFramework", void 0);
        __decorate([
            core.Input()
        ], AgGridAngular.prototype, "isExternalFilterPresent", void 0);
        __decorate([
            core.Input()
        ], AgGridAngular.prototype, "getRowHeight", void 0);
        __decorate([
            core.Input()
        ], AgGridAngular.prototype, "doesExternalFilterPass", void 0);
        __decorate([
            core.Input()
        ], AgGridAngular.prototype, "getRowClass", void 0);
        __decorate([
            core.Input()
        ], AgGridAngular.prototype, "getRowStyle", void 0);
        __decorate([
            core.Input()
        ], AgGridAngular.prototype, "getRowClassRules", void 0);
        __decorate([
            core.Input()
        ], AgGridAngular.prototype, "traverseNode", void 0);
        __decorate([
            core.Input()
        ], AgGridAngular.prototype, "getContextMenuItems", void 0);
        __decorate([
            core.Input()
        ], AgGridAngular.prototype, "getMainMenuItems", void 0);
        __decorate([
            core.Input()
        ], AgGridAngular.prototype, "processRowPostCreate", void 0);
        __decorate([
            core.Input()
        ], AgGridAngular.prototype, "processCellForClipboard", void 0);
        __decorate([
            core.Input()
        ], AgGridAngular.prototype, "getNodeChildDetails", void 0);
        __decorate([
            core.Input()
        ], AgGridAngular.prototype, "groupRowAggNodes", void 0);
        __decorate([
            core.Input()
        ], AgGridAngular.prototype, "getRowNodeId", void 0);
        __decorate([
            core.Input()
        ], AgGridAngular.prototype, "isFullWidthCell", void 0);
        __decorate([
            core.Input()
        ], AgGridAngular.prototype, "fullWidthCellRenderer", void 0);
        __decorate([
            core.Input()
        ], AgGridAngular.prototype, "fullWidthCellRendererFramework", void 0);
        __decorate([
            core.Input()
        ], AgGridAngular.prototype, "doesDataFlower", void 0);
        __decorate([
            core.Input()
        ], AgGridAngular.prototype, "processSecondaryColDef", void 0);
        __decorate([
            core.Input()
        ], AgGridAngular.prototype, "processSecondaryColGroupDef", void 0);
        __decorate([
            core.Input()
        ], AgGridAngular.prototype, "getBusinessKeyForNode", void 0);
        __decorate([
            core.Input()
        ], AgGridAngular.prototype, "sendToClipboard", void 0);
        __decorate([
            core.Input()
        ], AgGridAngular.prototype, "navigateToNextCell", void 0);
        __decorate([
            core.Input()
        ], AgGridAngular.prototype, "tabToNextCell", void 0);
        __decorate([
            core.Input()
        ], AgGridAngular.prototype, "getDetailRowData", void 0);
        __decorate([
            core.Input()
        ], AgGridAngular.prototype, "processCellFromClipboard", void 0);
        __decorate([
            core.Input()
        ], AgGridAngular.prototype, "getDocument", void 0);
        __decorate([
            core.Input()
        ], AgGridAngular.prototype, "postProcessPopup", void 0);
        __decorate([
            core.Input()
        ], AgGridAngular.prototype, "getChildCount", void 0);
        __decorate([
            core.Input()
        ], AgGridAngular.prototype, "getDataPath", void 0);
        __decorate([
            core.Input()
        ], AgGridAngular.prototype, "loadingCellRenderer", void 0);
        __decorate([
            core.Input()
        ], AgGridAngular.prototype, "loadingCellRendererFramework", void 0);
        __decorate([
            core.Input()
        ], AgGridAngular.prototype, "loadingOverlayComponent", void 0);
        __decorate([
            core.Input()
        ], AgGridAngular.prototype, "loadingOverlayComponentFramework", void 0);
        __decorate([
            core.Input()
        ], AgGridAngular.prototype, "noRowsOverlayComponent", void 0);
        __decorate([
            core.Input()
        ], AgGridAngular.prototype, "noRowsOverlayComponentFramework", void 0);
        __decorate([
            core.Input()
        ], AgGridAngular.prototype, "detailCellRenderer", void 0);
        __decorate([
            core.Input()
        ], AgGridAngular.prototype, "detailCellRendererFramework", void 0);
        __decorate([
            core.Input()
        ], AgGridAngular.prototype, "defaultGroupSortComparator", void 0);
        __decorate([
            core.Input()
        ], AgGridAngular.prototype, "isRowMaster", void 0);
        __decorate([
            core.Input()
        ], AgGridAngular.prototype, "isRowSelectable", void 0);
        __decorate([
            core.Input()
        ], AgGridAngular.prototype, "postSort", void 0);
        __decorate([
            core.Input()
        ], AgGridAngular.prototype, "processHeaderForClipboard", void 0);
        __decorate([
            core.Input()
        ], AgGridAngular.prototype, "paginationNumberFormatter", void 0);
        __decorate([
            core.Input()
        ], AgGridAngular.prototype, "processDataFromClipboard", void 0);
        __decorate([
            core.Input()
        ], AgGridAngular.prototype, "getServerSideGroupKey", void 0);
        __decorate([
            core.Input()
        ], AgGridAngular.prototype, "isServerSideGroup", void 0);
        __decorate([
            core.Input()
        ], AgGridAngular.prototype, "suppressKeyboardEvent", void 0);
        __decorate([
            core.Input()
        ], AgGridAngular.prototype, "createChartContainer", void 0);
        __decorate([
            core.Input()
        ], AgGridAngular.prototype, "processChartOptions", void 0);
        __decorate([
            core.Input()
        ], AgGridAngular.prototype, "getChartToolbarItems", void 0);
        __decorate([
            core.Input()
        ], AgGridAngular.prototype, "fillOperation", void 0);
        __decorate([
            core.Input()
        ], AgGridAngular.prototype, "toolPanelSuppressRowGroups", void 0);
        __decorate([
            core.Input()
        ], AgGridAngular.prototype, "toolPanelSuppressValues", void 0);
        __decorate([
            core.Input()
        ], AgGridAngular.prototype, "toolPanelSuppressPivots", void 0);
        __decorate([
            core.Input()
        ], AgGridAngular.prototype, "toolPanelSuppressPivotMode", void 0);
        __decorate([
            core.Input()
        ], AgGridAngular.prototype, "toolPanelSuppressSideButtons", void 0);
        __decorate([
            core.Input()
        ], AgGridAngular.prototype, "toolPanelSuppressColumnFilter", void 0);
        __decorate([
            core.Input()
        ], AgGridAngular.prototype, "toolPanelSuppressColumnSelectAll", void 0);
        __decorate([
            core.Input()
        ], AgGridAngular.prototype, "toolPanelSuppressColumnExpandAll", void 0);
        __decorate([
            core.Input()
        ], AgGridAngular.prototype, "suppressMakeColumnVisibleAfterUnGroup", void 0);
        __decorate([
            core.Input()
        ], AgGridAngular.prototype, "suppressRowClickSelection", void 0);
        __decorate([
            core.Input()
        ], AgGridAngular.prototype, "suppressCellSelection", void 0);
        __decorate([
            core.Input()
        ], AgGridAngular.prototype, "suppressHorizontalScroll", void 0);
        __decorate([
            core.Input()
        ], AgGridAngular.prototype, "alwaysShowVerticalScroll", void 0);
        __decorate([
            core.Input()
        ], AgGridAngular.prototype, "debug", void 0);
        __decorate([
            core.Input()
        ], AgGridAngular.prototype, "enableBrowserTooltips", void 0);
        __decorate([
            core.Input()
        ], AgGridAngular.prototype, "enableColResize", void 0);
        __decorate([
            core.Input()
        ], AgGridAngular.prototype, "enableCellExpressions", void 0);
        __decorate([
            core.Input()
        ], AgGridAngular.prototype, "enableSorting", void 0);
        __decorate([
            core.Input()
        ], AgGridAngular.prototype, "enableServerSideSorting", void 0);
        __decorate([
            core.Input()
        ], AgGridAngular.prototype, "enableFilter", void 0);
        __decorate([
            core.Input()
        ], AgGridAngular.prototype, "enableServerSideFilter", void 0);
        __decorate([
            core.Input()
        ], AgGridAngular.prototype, "angularCompileRows", void 0);
        __decorate([
            core.Input()
        ], AgGridAngular.prototype, "angularCompileFilters", void 0);
        __decorate([
            core.Input()
        ], AgGridAngular.prototype, "angularCompileHeaders", void 0);
        __decorate([
            core.Input()
        ], AgGridAngular.prototype, "groupSuppressAutoColumn", void 0);
        __decorate([
            core.Input()
        ], AgGridAngular.prototype, "groupSelectsChildren", void 0);
        __decorate([
            core.Input()
        ], AgGridAngular.prototype, "groupIncludeFooter", void 0);
        __decorate([
            core.Input()
        ], AgGridAngular.prototype, "groupIncludeTotalFooter", void 0);
        __decorate([
            core.Input()
        ], AgGridAngular.prototype, "groupUseEntireRow", void 0);
        __decorate([
            core.Input()
        ], AgGridAngular.prototype, "groupSuppressRow", void 0);
        __decorate([
            core.Input()
        ], AgGridAngular.prototype, "groupSuppressBlankHeader", void 0);
        __decorate([
            core.Input()
        ], AgGridAngular.prototype, "forPrint", void 0);
        __decorate([
            core.Input()
        ], AgGridAngular.prototype, "suppressMenuHide", void 0);
        __decorate([
            core.Input()
        ], AgGridAngular.prototype, "rowDeselection", void 0);
        __decorate([
            core.Input()
        ], AgGridAngular.prototype, "unSortIcon", void 0);
        __decorate([
            core.Input()
        ], AgGridAngular.prototype, "suppressMultiSort", void 0);
        __decorate([
            core.Input()
        ], AgGridAngular.prototype, "singleClickEdit", void 0);
        __decorate([
            core.Input()
        ], AgGridAngular.prototype, "suppressLoadingOverlay", void 0);
        __decorate([
            core.Input()
        ], AgGridAngular.prototype, "suppressNoRowsOverlay", void 0);
        __decorate([
            core.Input()
        ], AgGridAngular.prototype, "suppressAutoSize", void 0);
        __decorate([
            core.Input()
        ], AgGridAngular.prototype, "skipHeaderOnAutoSize", void 0);
        __decorate([
            core.Input()
        ], AgGridAngular.prototype, "suppressParentsInRowNodes", void 0);
        __decorate([
            core.Input()
        ], AgGridAngular.prototype, "showToolPanel", void 0);
        __decorate([
            core.Input()
        ], AgGridAngular.prototype, "suppressColumnMoveAnimation", void 0);
        __decorate([
            core.Input()
        ], AgGridAngular.prototype, "suppressMovableColumns", void 0);
        __decorate([
            core.Input()
        ], AgGridAngular.prototype, "suppressFieldDotNotation", void 0);
        __decorate([
            core.Input()
        ], AgGridAngular.prototype, "enableRangeSelection", void 0);
        __decorate([
            core.Input()
        ], AgGridAngular.prototype, "enableRangeHandle", void 0);
        __decorate([
            core.Input()
        ], AgGridAngular.prototype, "enableFillHandle", void 0);
        __decorate([
            core.Input()
        ], AgGridAngular.prototype, "suppressClearOnFillReduction", void 0);
        __decorate([
            core.Input()
        ], AgGridAngular.prototype, "deltaSort", void 0);
        __decorate([
            core.Input()
        ], AgGridAngular.prototype, "suppressTouch", void 0);
        __decorate([
            core.Input()
        ], AgGridAngular.prototype, "suppressAsyncEvents", void 0);
        __decorate([
            core.Input()
        ], AgGridAngular.prototype, "allowContextMenuWithControlKey", void 0);
        __decorate([
            core.Input()
        ], AgGridAngular.prototype, "suppressContextMenu", void 0);
        __decorate([
            core.Input()
        ], AgGridAngular.prototype, "suppressMenuFilterPanel", void 0);
        __decorate([
            core.Input()
        ], AgGridAngular.prototype, "suppressMenuMainPanel", void 0);
        __decorate([
            core.Input()
        ], AgGridAngular.prototype, "suppressMenuColumnPanel", void 0);
        __decorate([
            core.Input()
        ], AgGridAngular.prototype, "rememberGroupStateWhenNewData", void 0);
        __decorate([
            core.Input()
        ], AgGridAngular.prototype, "enableCellChangeFlash", void 0);
        __decorate([
            core.Input()
        ], AgGridAngular.prototype, "suppressDragLeaveHidesColumns", void 0);
        __decorate([
            core.Input()
        ], AgGridAngular.prototype, "suppressMiddleClickScrolls", void 0);
        __decorate([
            core.Input()
        ], AgGridAngular.prototype, "suppressPreventDefaultOnMouseWheel", void 0);
        __decorate([
            core.Input()
        ], AgGridAngular.prototype, "suppressUseColIdForGroups", void 0);
        __decorate([
            core.Input()
        ], AgGridAngular.prototype, "suppressCopyRowsToClipboard", void 0);
        __decorate([
            core.Input()
        ], AgGridAngular.prototype, "copyHeadersToClipboard", void 0);
        __decorate([
            core.Input()
        ], AgGridAngular.prototype, "pivotMode", void 0);
        __decorate([
            core.Input()
        ], AgGridAngular.prototype, "suppressAggFuncInHeader", void 0);
        __decorate([
            core.Input()
        ], AgGridAngular.prototype, "suppressColumnVirtualisation", void 0);
        __decorate([
            core.Input()
        ], AgGridAngular.prototype, "suppressAggAtRootLevel", void 0);
        __decorate([
            core.Input()
        ], AgGridAngular.prototype, "suppressFocusAfterRefresh", void 0);
        __decorate([
            core.Input()
        ], AgGridAngular.prototype, "functionsPassive", void 0);
        __decorate([
            core.Input()
        ], AgGridAngular.prototype, "functionsReadOnly", void 0);
        __decorate([
            core.Input()
        ], AgGridAngular.prototype, "animateRows", void 0);
        __decorate([
            core.Input()
        ], AgGridAngular.prototype, "groupSelectsFiltered", void 0);
        __decorate([
            core.Input()
        ], AgGridAngular.prototype, "groupRemoveSingleChildren", void 0);
        __decorate([
            core.Input()
        ], AgGridAngular.prototype, "groupRemoveLowestSingleChildren", void 0);
        __decorate([
            core.Input()
        ], AgGridAngular.prototype, "enableRtl", void 0);
        __decorate([
            core.Input()
        ], AgGridAngular.prototype, "suppressClickEdit", void 0);
        __decorate([
            core.Input()
        ], AgGridAngular.prototype, "rowDragManaged", void 0);
        __decorate([
            core.Input()
        ], AgGridAngular.prototype, "suppressRowDrag", void 0);
        __decorate([
            core.Input()
        ], AgGridAngular.prototype, "suppressMoveWhenRowDragging", void 0);
        __decorate([
            core.Input()
        ], AgGridAngular.prototype, "enableMultiRowDragging", void 0);
        __decorate([
            core.Input()
        ], AgGridAngular.prototype, "enableGroupEdit", void 0);
        __decorate([
            core.Input()
        ], AgGridAngular.prototype, "embedFullWidthRows", void 0);
        __decorate([
            core.Input()
        ], AgGridAngular.prototype, "deprecatedEmbedFullWidthRows", void 0);
        __decorate([
            core.Input()
        ], AgGridAngular.prototype, "suppressTabbing", void 0);
        __decorate([
            core.Input()
        ], AgGridAngular.prototype, "suppressPaginationPanel", void 0);
        __decorate([
            core.Input()
        ], AgGridAngular.prototype, "floatingFilter", void 0);
        __decorate([
            core.Input()
        ], AgGridAngular.prototype, "groupHideOpenParents", void 0);
        __decorate([
            core.Input()
        ], AgGridAngular.prototype, "groupMultiAutoColumn", void 0);
        __decorate([
            core.Input()
        ], AgGridAngular.prototype, "pagination", void 0);
        __decorate([
            core.Input()
        ], AgGridAngular.prototype, "stopEditingWhenGridLosesFocus", void 0);
        __decorate([
            core.Input()
        ], AgGridAngular.prototype, "paginationAutoPageSize", void 0);
        __decorate([
            core.Input()
        ], AgGridAngular.prototype, "suppressScrollOnNewData", void 0);
        __decorate([
            core.Input()
        ], AgGridAngular.prototype, "purgeClosedRowNodes", void 0);
        __decorate([
            core.Input()
        ], AgGridAngular.prototype, "cacheQuickFilter", void 0);
        __decorate([
            core.Input()
        ], AgGridAngular.prototype, "deltaRowDataMode", void 0);
        __decorate([
            core.Input()
        ], AgGridAngular.prototype, "ensureDomOrder", void 0);
        __decorate([
            core.Input()
        ], AgGridAngular.prototype, "accentedSort", void 0);
        __decorate([
            core.Input()
        ], AgGridAngular.prototype, "pivotTotals", void 0);
        __decorate([
            core.Input()
        ], AgGridAngular.prototype, "suppressChangeDetection", void 0);
        __decorate([
            core.Input()
        ], AgGridAngular.prototype, "valueCache", void 0);
        __decorate([
            core.Input()
        ], AgGridAngular.prototype, "valueCacheNeverExpires", void 0);
        __decorate([
            core.Input()
        ], AgGridAngular.prototype, "aggregateOnlyChangedColumns", void 0);
        __decorate([
            core.Input()
        ], AgGridAngular.prototype, "suppressAnimationFrame", void 0);
        __decorate([
            core.Input()
        ], AgGridAngular.prototype, "suppressExcelExport", void 0);
        __decorate([
            core.Input()
        ], AgGridAngular.prototype, "suppressCsvExport", void 0);
        __decorate([
            core.Input()
        ], AgGridAngular.prototype, "treeData", void 0);
        __decorate([
            core.Input()
        ], AgGridAngular.prototype, "masterDetail", void 0);
        __decorate([
            core.Input()
        ], AgGridAngular.prototype, "suppressMultiRangeSelection", void 0);
        __decorate([
            core.Input()
        ], AgGridAngular.prototype, "enterMovesDownAfterEdit", void 0);
        __decorate([
            core.Input()
        ], AgGridAngular.prototype, "enterMovesDown", void 0);
        __decorate([
            core.Input()
        ], AgGridAngular.prototype, "suppressPropertyNamesCheck", void 0);
        __decorate([
            core.Input()
        ], AgGridAngular.prototype, "rowMultiSelectWithClick", void 0);
        __decorate([
            core.Input()
        ], AgGridAngular.prototype, "contractColumnSelection", void 0);
        __decorate([
            core.Input()
        ], AgGridAngular.prototype, "suppressEnterpriseResetOnNewColumns", void 0);
        __decorate([
            core.Input()
        ], AgGridAngular.prototype, "enableOldSetFilterModel", void 0);
        __decorate([
            core.Input()
        ], AgGridAngular.prototype, "suppressRowHoverHighlight", void 0);
        __decorate([
            core.Input()
        ], AgGridAngular.prototype, "gridAutoHeight", void 0);
        __decorate([
            core.Input()
        ], AgGridAngular.prototype, "suppressRowTransform", void 0);
        __decorate([
            core.Input()
        ], AgGridAngular.prototype, "suppressClipboardPaste", void 0);
        __decorate([
            core.Input()
        ], AgGridAngular.prototype, "serverSideSortingAlwaysResets", void 0);
        __decorate([
            core.Input()
        ], AgGridAngular.prototype, "reactNext", void 0);
        __decorate([
            core.Input()
        ], AgGridAngular.prototype, "suppressSetColumnStateEvents", void 0);
        __decorate([
            core.Input()
        ], AgGridAngular.prototype, "enableCharts", void 0);
        __decorate([
            core.Input()
        ], AgGridAngular.prototype, "deltaColumnMode", void 0);
        __decorate([
            core.Input()
        ], AgGridAngular.prototype, "suppressMaintainUnsortedOrder", void 0);
        __decorate([
            core.Input()
        ], AgGridAngular.prototype, "enableCellTextSelection", void 0);
        __decorate([
            core.Input()
        ], AgGridAngular.prototype, "suppressBrowserResizeObserver", void 0);
        __decorate([
            core.Input()
        ], AgGridAngular.prototype, "suppressMaxRenderedRowRestriction", void 0);
        __decorate([
            core.Input()
        ], AgGridAngular.prototype, "excludeChildrenWhenTreeDataFiltering", void 0);
        __decorate([
            core.Input()
        ], AgGridAngular.prototype, "keepDetailRows", void 0);
        __decorate([
            core.Input()
        ], AgGridAngular.prototype, "paginateChildRows", void 0);
        __decorate([
            core.Input()
        ], AgGridAngular.prototype, "preventDefaultOnContextMenu", void 0);
        __decorate([
            core.Input()
        ], AgGridAngular.prototype, "undoRedoCellEditing", void 0);
        __decorate([
            core.Input()
        ], AgGridAngular.prototype, "allowDragFromColumnsToolPanel", void 0);
        __decorate([
            core.Output()
        ], AgGridAngular.prototype, "columnEverythingChanged", void 0);
        __decorate([
            core.Output()
        ], AgGridAngular.prototype, "newColumnsLoaded", void 0);
        __decorate([
            core.Output()
        ], AgGridAngular.prototype, "columnPivotModeChanged", void 0);
        __decorate([
            core.Output()
        ], AgGridAngular.prototype, "columnRowGroupChanged", void 0);
        __decorate([
            core.Output()
        ], AgGridAngular.prototype, "expandOrCollapseAll", void 0);
        __decorate([
            core.Output()
        ], AgGridAngular.prototype, "columnPivotChanged", void 0);
        __decorate([
            core.Output()
        ], AgGridAngular.prototype, "gridColumnsChanged", void 0);
        __decorate([
            core.Output()
        ], AgGridAngular.prototype, "columnValueChanged", void 0);
        __decorate([
            core.Output()
        ], AgGridAngular.prototype, "columnMoved", void 0);
        __decorate([
            core.Output()
        ], AgGridAngular.prototype, "columnVisible", void 0);
        __decorate([
            core.Output()
        ], AgGridAngular.prototype, "columnPinned", void 0);
        __decorate([
            core.Output()
        ], AgGridAngular.prototype, "columnGroupOpened", void 0);
        __decorate([
            core.Output()
        ], AgGridAngular.prototype, "columnResized", void 0);
        __decorate([
            core.Output()
        ], AgGridAngular.prototype, "displayedColumnsChanged", void 0);
        __decorate([
            core.Output()
        ], AgGridAngular.prototype, "virtualColumnsChanged", void 0);
        __decorate([
            core.Output()
        ], AgGridAngular.prototype, "rowGroupOpened", void 0);
        __decorate([
            core.Output()
        ], AgGridAngular.prototype, "rowDataChanged", void 0);
        __decorate([
            core.Output()
        ], AgGridAngular.prototype, "rowDataUpdated", void 0);
        __decorate([
            core.Output()
        ], AgGridAngular.prototype, "pinnedRowDataChanged", void 0);
        __decorate([
            core.Output()
        ], AgGridAngular.prototype, "rangeSelectionChanged", void 0);
        __decorate([
            core.Output()
        ], AgGridAngular.prototype, "chartCreated", void 0);
        __decorate([
            core.Output()
        ], AgGridAngular.prototype, "chartRangeSelectionChanged", void 0);
        __decorate([
            core.Output()
        ], AgGridAngular.prototype, "chartOptionsChanged", void 0);
        __decorate([
            core.Output()
        ], AgGridAngular.prototype, "chartDestroyed", void 0);
        __decorate([
            core.Output()
        ], AgGridAngular.prototype, "toolPanelVisibleChanged", void 0);
        __decorate([
            core.Output()
        ], AgGridAngular.prototype, "modelUpdated", void 0);
        __decorate([
            core.Output()
        ], AgGridAngular.prototype, "pasteStart", void 0);
        __decorate([
            core.Output()
        ], AgGridAngular.prototype, "pasteEnd", void 0);
        __decorate([
            core.Output()
        ], AgGridAngular.prototype, "fillStart", void 0);
        __decorate([
            core.Output()
        ], AgGridAngular.prototype, "fillEnd", void 0);
        __decorate([
            core.Output()
        ], AgGridAngular.prototype, "cellClicked", void 0);
        __decorate([
            core.Output()
        ], AgGridAngular.prototype, "cellDoubleClicked", void 0);
        __decorate([
            core.Output()
        ], AgGridAngular.prototype, "cellMouseDown", void 0);
        __decorate([
            core.Output()
        ], AgGridAngular.prototype, "cellContextMenu", void 0);
        __decorate([
            core.Output()
        ], AgGridAngular.prototype, "cellValueChanged", void 0);
        __decorate([
            core.Output()
        ], AgGridAngular.prototype, "rowValueChanged", void 0);
        __decorate([
            core.Output()
        ], AgGridAngular.prototype, "cellFocused", void 0);
        __decorate([
            core.Output()
        ], AgGridAngular.prototype, "rowSelected", void 0);
        __decorate([
            core.Output()
        ], AgGridAngular.prototype, "selectionChanged", void 0);
        __decorate([
            core.Output()
        ], AgGridAngular.prototype, "cellKeyDown", void 0);
        __decorate([
            core.Output()
        ], AgGridAngular.prototype, "cellKeyPress", void 0);
        __decorate([
            core.Output()
        ], AgGridAngular.prototype, "cellMouseOver", void 0);
        __decorate([
            core.Output()
        ], AgGridAngular.prototype, "cellMouseOut", void 0);
        __decorate([
            core.Output()
        ], AgGridAngular.prototype, "filterChanged", void 0);
        __decorate([
            core.Output()
        ], AgGridAngular.prototype, "filterModified", void 0);
        __decorate([
            core.Output()
        ], AgGridAngular.prototype, "filterOpened", void 0);
        __decorate([
            core.Output()
        ], AgGridAngular.prototype, "sortChanged", void 0);
        __decorate([
            core.Output()
        ], AgGridAngular.prototype, "virtualRowRemoved", void 0);
        __decorate([
            core.Output()
        ], AgGridAngular.prototype, "rowClicked", void 0);
        __decorate([
            core.Output()
        ], AgGridAngular.prototype, "rowDoubleClicked", void 0);
        __decorate([
            core.Output()
        ], AgGridAngular.prototype, "gridReady", void 0);
        __decorate([
            core.Output()
        ], AgGridAngular.prototype, "gridSizeChanged", void 0);
        __decorate([
            core.Output()
        ], AgGridAngular.prototype, "viewportChanged", void 0);
        __decorate([
            core.Output()
        ], AgGridAngular.prototype, "firstDataRendered", void 0);
        __decorate([
            core.Output()
        ], AgGridAngular.prototype, "dragStarted", void 0);
        __decorate([
            core.Output()
        ], AgGridAngular.prototype, "dragStopped", void 0);
        __decorate([
            core.Output()
        ], AgGridAngular.prototype, "rowEditingStarted", void 0);
        __decorate([
            core.Output()
        ], AgGridAngular.prototype, "rowEditingStopped", void 0);
        __decorate([
            core.Output()
        ], AgGridAngular.prototype, "cellEditingStarted", void 0);
        __decorate([
            core.Output()
        ], AgGridAngular.prototype, "cellEditingStopped", void 0);
        __decorate([
            core.Output()
        ], AgGridAngular.prototype, "bodyScroll", void 0);
        __decorate([
            core.Output()
        ], AgGridAngular.prototype, "animationQueueEmpty", void 0);
        __decorate([
            core.Output()
        ], AgGridAngular.prototype, "heightScaleChanged", void 0);
        __decorate([
            core.Output()
        ], AgGridAngular.prototype, "paginationChanged", void 0);
        __decorate([
            core.Output()
        ], AgGridAngular.prototype, "componentStateChanged", void 0);
        __decorate([
            core.Output()
        ], AgGridAngular.prototype, "bodyHeightChanged", void 0);
        __decorate([
            core.Output()
        ], AgGridAngular.prototype, "displayedColumnsWidthChanged", void 0);
        __decorate([
            core.Output()
        ], AgGridAngular.prototype, "scrollVisibilityChanged", void 0);
        __decorate([
            core.Output()
        ], AgGridAngular.prototype, "columnHoverChanged", void 0);
        __decorate([
            core.Output()
        ], AgGridAngular.prototype, "flashCells", void 0);
        __decorate([
            core.Output()
        ], AgGridAngular.prototype, "rowDragEnter", void 0);
        __decorate([
            core.Output()
        ], AgGridAngular.prototype, "rowDragMove", void 0);
        __decorate([
            core.Output()
        ], AgGridAngular.prototype, "rowDragLeave", void 0);
        __decorate([
            core.Output()
        ], AgGridAngular.prototype, "rowDragEnd", void 0);
        __decorate([
            core.Output()
        ], AgGridAngular.prototype, "popupToFront", void 0);
        __decorate([
            core.Output()
        ], AgGridAngular.prototype, "columnRowGroupChangeRequest", void 0);
        __decorate([
            core.Output()
        ], AgGridAngular.prototype, "columnPivotChangeRequest", void 0);
        __decorate([
            core.Output()
        ], AgGridAngular.prototype, "columnValueChangeRequest", void 0);
        __decorate([
            core.Output()
        ], AgGridAngular.prototype, "columnAggFuncChangeRequest", void 0);
        __decorate([
            core.Output()
        ], AgGridAngular.prototype, "keyboardFocus", void 0);
        __decorate([
            core.Output()
        ], AgGridAngular.prototype, "mouseFocus", void 0);
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
            })
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
    exports.ɵa = AngularFrameworkOverrides;
    exports.ɵb = AngularFrameworkComponentWrapper;

    Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=ag-grid-community-angular.umd.js.map
