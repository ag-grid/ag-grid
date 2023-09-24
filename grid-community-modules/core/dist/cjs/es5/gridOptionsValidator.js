"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __read = (this && this.__read) || function (o, n) {
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
};
var __spreadArray = (this && this.__spreadArray) || function (to, from) {
    for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
        to[j] = from[i];
    return to;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.matchesTreeDataDisplayType = exports.matchesGroupDisplayType = exports.GridOptionsValidator = exports.logDeprecation = void 0;
var colDefUtil_1 = require("./components/colDefUtil");
var componentUtil_1 = require("./components/componentUtil");
var context_1 = require("./context/context");
var moduleNames_1 = require("./modules/moduleNames");
var moduleRegistry_1 = require("./modules/moduleRegistry");
var propertyKeys_1 = require("./propertyKeys");
var function_1 = require("./utils/function");
var fuzzyMatch_1 = require("./utils/fuzzyMatch");
var object_1 = require("./utils/object");
function logDeprecation(version, oldProp, newProp, message) {
    var newPropMsg = newProp ? "Please use '" + newProp + "' instead. " : '';
    function_1.doOnce(function () { return console.warn("AG Grid: since v" + version + ", '" + oldProp + "' is deprecated. " + newPropMsg + (message !== null && message !== void 0 ? message : '')); }, "Deprecated_" + oldProp);
}
exports.logDeprecation = logDeprecation;
// Vue adds these properties to all objects, so we ignore them when checking for invalid properties
var VUE_FRAMEWORK_PROPS = ['__ob__', '__v_skip', '__metadata__'];
var GridOptionsValidator = /** @class */ (function () {
    function GridOptionsValidator() {
        this.deprecatedProperties = {
            rememberGroupStateWhenNewData: { version: '24', message: 'Now that transaction updates are possible and they keep group state, this feature is no longer needed.' },
            serverSideFilteringAlwaysResets: { version: '28.0', newProp: 'serverSideOnlyRefreshFilteredGroups', copyToNewProp: true, },
            serverSideSortingAlwaysResets: { version: '28.0', newProp: 'serverSideSortAllLevels', copyToNewProp: true, },
            suppressReactUi: { version: '28', message: 'The legacy React rendering engine is deprecated and will be removed in the next major version of the grid.' },
            processSecondaryColDef: { version: '28', newProp: 'processPivotResultColDef', copyToNewProp: true },
            processSecondaryColGroupDef: { version: '28', newProp: 'processPivotResultColGroupDef', copyToNewProp: true },
            getServerSideStoreParams: { version: '28', newProp: 'getServerSideGroupLevelParams', copyToNewProp: true },
            serverSideInfiniteScroll: { version: '29', message: 'Infinite Scrolling is now the default behaviour. This can be suppressed with `suppressServerSideInfiniteScroll`.' },
            enableChartToolPanelsButton: { version: '29', message: 'The Chart Tool Panels button is now enabled by default. To hide the Chart Tool Panels button and display the hamburger button instead, set suppressChartToolPanelsButton=true.' },
            functionsPassive: { version: '29.2' },
            onColumnRowGroupChangeRequest: { version: '29.2' },
            onColumnPivotChangeRequest: { version: '29.2' },
            onColumnValueChangeRequest: { version: '29.2' },
            onColumnAggFuncChangeRequest: { version: '29.2' },
            serverSideFilterAllLevels: { version: '30', message: 'All server-side group levels are now filtered by default. This can be toggled using `serverSideOnlyRefreshFilteredGroups`.' },
            suppressAggAtRootLevel: { version: '30', message: 'The root level aggregation is now suppressed by default. This can be toggled using  `alwaysAggregateAtRootLevel`.' },
            excludeHiddenColumnsFromQuickFilter: { version: '30', message: 'Hidden columns are now excluded from the Quick Filter by default. This can be toggled using `includeHiddenColumnsInQuickFilter`.' },
            enterMovesDown: { version: '30', newProp: 'enterNavigatesVertically', copyToNewProp: true },
            enterMovesDownAfterEdit: { version: '30', newProp: 'enterNavigatesVerticallyAfterEdit', copyToNewProp: true },
            suppressParentsInRowNodes: { version: '30.2', message: 'Using suppressParentsInRowNodes is no longer recommended. To serialize nodes it is now recommended to instead remove the parent node reference before serialization.' },
        };
    }
    GridOptionsValidator.prototype.pickOneWarning = function (prop1, prop2) {
        console.warn("AG Grid: " + prop1 + " and " + prop2 + " do not work with each other, you need to pick one.");
    };
    GridOptionsValidator.prototype.init = function () {
        var _this = this;
        this.checkForDeprecated();
        this.checkForViolations();
        if (this.gridOptions.suppressPropertyNamesCheck !== true) {
            this.checkGridOptionsProperties();
            this.checkColumnDefProperties();
        }
        this.checkColumnDefViolations();
        if (this.gridOptionsService.is('groupSelectsChildren') && this.gridOptionsService.is('suppressParentsInRowNodes')) {
            console.warn("AG Grid: 'groupSelectsChildren' does not work with 'suppressParentsInRowNodes', this selection method needs the part in rowNode to work");
        }
        if (this.gridOptionsService.is('groupSelectsChildren')) {
            if (this.gridOptionsService.get('rowSelection') !== 'multiple') {
                console.warn("AG Grid: rowSelection must be 'multiple' for groupSelectsChildren to make sense");
            }
        }
        if (this.gridOptionsService.is('groupRemoveSingleChildren') && this.gridOptionsService.is('groupHideOpenParents')) {
            this.pickOneWarning('groupRemoveSingleChildren', 'groupHideOpenParents');
        }
        if (this.gridOptionsService.isRowModelType('serverSide')) {
            var msg = function (prop, alt) { return ("AG Grid: '" + prop + "' is not supported on the Server-Side Row Model." + (alt ? " Please use " + alt + " instead." : '')); };
            if (this.gridOptionsService.exists('groupDefaultExpanded')) {
                console.warn(msg('groupDefaultExpanded', 'isServerSideGroupOpenByDefault callback'));
            }
            if (this.gridOptionsService.exists('groupIncludeFooter') && this.gridOptionsService.is('suppressServerSideInfiniteScroll')) {
                console.warn(msg('groupIncludeFooter'));
            }
            if (this.gridOptionsService.exists('groupIncludeTotalFooter')) {
                console.warn(msg('groupIncludeTotalFooter'));
            }
        }
        if (this.gridOptionsService.is('enableRangeSelection')) {
            moduleRegistry_1.ModuleRegistry.__assertRegistered(moduleNames_1.ModuleNames.RangeSelectionModule, 'enableRangeSelection', this.gridOptionsService.getGridId());
        }
        else if (this.gridOptionsService.is('enableRangeHandle') || this.gridOptionsService.is('enableFillHandle')) {
            console.warn("AG Grid: 'enableRangeHandle' or 'enableFillHandle' will not work unless 'enableRangeSelection' is set to true");
        }
        var validateRegistered = function (prop, module) { return _this.gridOptionsService.exists(prop) && moduleRegistry_1.ModuleRegistry.__assertRegistered(module, prop, _this.gridOptionsService.getGridId()); };
        // Ensure the SideBar is registered which will then lead them to register Column / Filter Tool panels as required by their config.
        // It is possible to use the SideBar only with your own custom tool panels.
        validateRegistered('sideBar', moduleNames_1.ModuleNames.SideBarModule);
        validateRegistered('statusBar', moduleNames_1.ModuleNames.StatusBarModule);
        validateRegistered('enableCharts', moduleNames_1.ModuleNames.GridChartsModule);
        validateRegistered('getMainMenuItems', moduleNames_1.ModuleNames.MenuModule);
        validateRegistered('getContextMenuItems', moduleNames_1.ModuleNames.MenuModule);
        validateRegistered('allowContextMenuWithControlKey', moduleNames_1.ModuleNames.MenuModule);
        validateRegistered('enableAdvancedFilter', moduleNames_1.ModuleNames.AdvancedFilterModule);
        validateRegistered('treeData', moduleNames_1.ModuleNames.RowGroupingModule);
        validateRegistered('enableRangeSelection', moduleNames_1.ModuleNames.RangeSelectionModule);
        validateRegistered('masterDetail', moduleNames_1.ModuleNames.MasterDetailModule);
    };
    GridOptionsValidator.prototype.checkColumnDefProperties = function () {
        var _this = this;
        if (this.gridOptions.columnDefs == null) {
            return;
        }
        var validProperties = colDefUtil_1.ColDefUtil.ALL_PROPERTIES;
        var validateColDef = function (colDef, propertyName) {
            var userProperties = Object.getOwnPropertyNames(colDef);
            _this.checkProperties(userProperties, __spreadArray(__spreadArray([], __read(validProperties)), __read(VUE_FRAMEWORK_PROPS)), validProperties, propertyName, 'https://www.ag-grid.com/javascript-data-grid/column-properties/');
            if (colDef.children) {
                colDef.children.forEach(function (child) { return validateColDef(child, 'columnDefs.children'); });
            }
        };
        this.gridOptions.columnDefs.forEach(function (colDef) { return validateColDef(colDef, 'columnDefs'); });
        if (this.gridOptions.defaultColDef) {
            validateColDef(this.gridOptions.defaultColDef, 'defaultColDef');
        }
    };
    GridOptionsValidator.prototype.checkColumnDefViolations = function () {
        var _a;
        var rowModel = (_a = this.gridOptionsService.get('rowModelType')) !== null && _a !== void 0 ? _a : 'clientSide';
        var unsupportedPropertiesMap = {
            infinite: ['headerCheckboxSelection', 'headerCheckboxSelectionFilteredOnly', 'headerCheckboxSelectionCurrentPageOnly'],
            viewport: ['headerCheckboxSelection', 'headerCheckboxSelectionFilteredOnly', 'headerCheckboxSelectionCurrentPageOnly'],
            serverSide: ['headerCheckboxSelectionFilteredOnly', 'headerCheckboxSelectionCurrentPageOnly'],
            clientSide: [],
        };
        var unsupportedProperties = unsupportedPropertiesMap[rowModel];
        if (!unsupportedProperties) {
            return;
        }
        var isMultiSelect = this.gridOptionsService.get('rowSelection') === 'multiple';
        var multiSelectDependencies = ['headerCheckboxSelection', 'headerCheckboxSelectionFilteredOnly', 'headerCheckboxSelectionCurrentPageOnly'];
        var validateColDef = function (colDef) {
            if (!isMultiSelect) {
                multiSelectDependencies.forEach(function (property) {
                    if (property in colDef && !!colDef[property]) {
                        console.warn("AG Grid: Column property " + property + " is not supported unless rowSelection='multiple'.");
                    }
                });
            }
            unsupportedProperties.forEach(function (property) {
                if (property in colDef && !!colDef[property]) {
                    console.warn("AG Grid: Column property " + property + " is not supported with the row model type " + rowModel + ".");
                }
            });
        };
        if (this.gridOptions.columnDefs != null) {
            this.gridOptions.columnDefs.forEach(function (colDef) { return validateColDef(colDef); });
        }
        if (this.gridOptions.autoGroupColumnDef != null) {
            validateColDef(this.gridOptions.autoGroupColumnDef);
        }
        if (this.gridOptions.defaultColDef != null) {
            validateColDef(this.gridOptions.defaultColDef);
        }
    };
    GridOptionsValidator.prototype.checkGridOptionsProperties = function () {
        var userProperties = Object.getOwnPropertyNames(this.gridOptions);
        var validProperties = __spreadArray(__spreadArray([], __read(propertyKeys_1.PropertyKeys.ALL_PROPERTIES)), __read(componentUtil_1.ComponentUtil.EVENT_CALLBACKS));
        var validPropertiesAndExceptions = __spreadArray(__spreadArray(__spreadArray(__spreadArray([], __read(validProperties)), ['api', 'columnApi']), __read(VUE_FRAMEWORK_PROPS)), __read(Object.keys(this.deprecatedProperties)));
        this.checkProperties(userProperties, validPropertiesAndExceptions, validProperties, 'gridOptions', 'https://www.ag-grid.com/javascript-data-grid/grid-options/');
    };
    GridOptionsValidator.prototype.checkProperties = function (userProperties, validPropertiesAndExceptions, validProperties, containerName, docsUrl) {
        var invalidProperties = fuzzyMatch_1.fuzzyCheckStrings(userProperties, validPropertiesAndExceptions, validProperties);
        object_1.iterateObject(invalidProperties, function (key, value) {
            function_1.doOnce(function () { return console.warn("AG Grid: invalid " + containerName + " property '" + key + "' did you mean any of these: " + value.slice(0, 8).join(", ")); }, 'invalidProperty' + containerName + key);
        });
        if (Object.keys(invalidProperties).length > 0) {
            function_1.doOnce(function () { return console.warn("AG Grid: to see all the valid " + containerName + " properties please check: " + docsUrl); }, 'invalidProperties' + containerName + docsUrl);
        }
    };
    GridOptionsValidator.prototype.checkForDeprecated = function () {
        // casting to generic object, so typescript compiles even though
        // we are looking for attributes that don't exist
        var options = this.gridOptions;
        Object.entries(this.deprecatedProperties).forEach(function (_a) {
            var _b;
            var _c = __read(_a, 2), oldProp = _c[0], details = _c[1];
            var oldPropValue = options[oldProp];
            if (oldPropValue) {
                logDeprecation(details.version, oldProp, details.newProp, details.message);
                if (details.copyToNewProp && details.newProp && options[details.newProp] == null) {
                    options[details.newProp] = (_b = details.newPropValue) !== null && _b !== void 0 ? _b : oldPropValue;
                }
            }
        });
        // Manual messages and deprecation behaviour that don't fit our standard approach above.
        if (options.serverSideStoreType) {
            console.warn('AG Grid: since v29.0, `serverSideStoreType` has been replaced by `suppressServerSideInfiniteScroll`. Set to false to use Partial Store, and true to use Full Store.');
            options.suppressServerSideInfiniteScroll = options.serverSideStoreType !== 'partial';
        }
    };
    GridOptionsValidator.prototype.checkForViolations = function () {
        if (this.gridOptionsService.is('treeData')) {
            this.treeDataViolations();
        }
    };
    GridOptionsValidator.prototype.treeDataViolations = function () {
        if (this.gridOptionsService.isRowModelType('clientSide')) {
            if (!this.gridOptionsService.exists('getDataPath')) {
                console.warn('AG Grid: property usingTreeData=true with rowModel=clientSide, but you did not ' +
                    'provide getDataPath function, please provide getDataPath function if using tree data.');
            }
        }
        if (this.gridOptionsService.isRowModelType('serverSide')) {
            if (!this.gridOptionsService.exists('isServerSideGroup')) {
                console.warn('AG Grid: property usingTreeData=true with rowModel=serverSide, but you did not ' +
                    'provide isServerSideGroup function, please provide isServerSideGroup function if using tree data.');
            }
            if (!this.gridOptionsService.exists('getServerSideGroupKey')) {
                console.warn('AG Grid: property usingTreeData=true with rowModel=serverSide, but you did not ' +
                    'provide getServerSideGroupKey function, please provide getServerSideGroupKey function if using tree data.');
            }
        }
    };
    __decorate([
        context_1.Autowired('gridOptions')
    ], GridOptionsValidator.prototype, "gridOptions", void 0);
    __decorate([
        context_1.Autowired('gridOptionsService')
    ], GridOptionsValidator.prototype, "gridOptionsService", void 0);
    __decorate([
        context_1.PostConstruct
    ], GridOptionsValidator.prototype, "init", null);
    GridOptionsValidator = __decorate([
        context_1.Bean('gridOptionsValidator')
    ], GridOptionsValidator);
    return GridOptionsValidator;
}());
exports.GridOptionsValidator = GridOptionsValidator;
function matchesGroupDisplayType(toMatch, supplied) {
    var groupDisplayTypeValues = ['groupRows', 'multipleColumns', 'custom', 'singleColumn'];
    if (groupDisplayTypeValues.indexOf(supplied) < 0) {
        console.warn("AG Grid: '" + supplied + "' is not a valid groupDisplayType value - possible values are: '" + groupDisplayTypeValues.join("', '") + "'");
        return false;
    }
    return supplied === toMatch;
}
exports.matchesGroupDisplayType = matchesGroupDisplayType;
function matchesTreeDataDisplayType(toMatch, supplied) {
    var treeDataDisplayTypeValues = ['auto', 'custom'];
    if (treeDataDisplayTypeValues.indexOf(supplied) < 0) {
        console.warn("AG Grid: '" + supplied + "' is not a valid treeDataDisplayType value - possible values are: '" + treeDataDisplayTypeValues.join("', '") + "'");
        return false;
    }
    return supplied === toMatch;
}
exports.matchesTreeDataDisplayType = matchesTreeDataDisplayType;
