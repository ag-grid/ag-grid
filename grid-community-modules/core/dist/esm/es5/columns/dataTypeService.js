/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v30.0.0
 * @link https://www.ag-grid.com/
 * @license MIT
 */
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
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
import { Autowired, Bean, PostConstruct } from '../context/context';
import { BeanStub } from '../context/beanStub';
import { Events } from '../eventKeys';
import { getValueUsingField } from '../utils/object';
import { ModuleRegistry } from '../modules/moduleRegistry';
import { ModuleNames } from '../modules/moduleNames';
import { doOnce } from '../utils/function';
import { KeyCode } from '../constants/keyCode';
import { exists, toStringOrNull } from '../utils/generic';
import { parseDateTimeFromString, serialiseDate } from '../utils/date';
var MONTH_LOCALE_TEXT = {
    january: 'January',
    february: 'February',
    march: 'March',
    april: 'April',
    may: 'May',
    june: 'June',
    july: 'July',
    august: 'August',
    september: 'September',
    october: 'October',
    november: 'November',
    december: 'December'
};
var MONTH_KEYS = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];
var DataTypeService = /** @class */ (function (_super) {
    __extends(DataTypeService, _super);
    function DataTypeService() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.dataTypeDefinitions = {};
        _this.isWaitingForRowData = false;
        return _this;
    }
    DataTypeService.prototype.init = function () {
        var _this = this;
        this.groupHideOpenParents = this.gridOptionsService.is('groupHideOpenParents');
        this.addManagedPropertyListener('groupHideOpenParents', function () {
            _this.groupHideOpenParents = _this.gridOptionsService.is('groupHideOpenParents');
        });
        this.processDataTypeDefinitions();
        this.addManagedPropertyListener('dataTypeDefinitions', function () {
            _this.processDataTypeDefinitions();
            _this.columnModel.recreateColumnDefs('gridOptionsChanged');
        });
    };
    DataTypeService.prototype.processDataTypeDefinitions = function () {
        var _this = this;
        var _a;
        var defaultDataTypes = this.getDefaultDataTypes();
        this.dataTypeDefinitions = {};
        Object.entries(defaultDataTypes).forEach(function (_a) {
            var _b = __read(_a, 2), cellDataType = _b[0], dataTypeDefinition = _b[1];
            _this.dataTypeDefinitions[cellDataType] = __assign(__assign({}, dataTypeDefinition), { groupSafeValueFormatter: _this.createGroupSafeValueFormatter(dataTypeDefinition) });
        });
        var dataTypeDefinitions = (_a = this.gridOptionsService.get('dataTypeDefinitions')) !== null && _a !== void 0 ? _a : {};
        this.dataTypeMatchers = {};
        Object.entries(dataTypeDefinitions).forEach(function (_a) {
            var _b = __read(_a, 2), cellDataType = _b[0], dataTypeDefinition = _b[1];
            var mergedDataTypeDefinition = _this.processDataTypeDefinition(dataTypeDefinition, dataTypeDefinitions, [cellDataType], defaultDataTypes);
            if (mergedDataTypeDefinition) {
                _this.dataTypeDefinitions[cellDataType] = mergedDataTypeDefinition;
                if (dataTypeDefinition.dataTypeMatcher) {
                    _this.dataTypeMatchers[cellDataType] = dataTypeDefinition.dataTypeMatcher;
                }
            }
        });
        this.checkObjectValueHandlers(defaultDataTypes);
        ['dateString', 'text', 'number', 'boolean', 'date'].forEach(function (cellDataType) {
            var overriddenDataTypeMatcher = _this.dataTypeMatchers[cellDataType];
            if (overriddenDataTypeMatcher) {
                // remove to maintain correct ordering
                delete _this.dataTypeMatchers[cellDataType];
            }
            _this.dataTypeMatchers[cellDataType] = overriddenDataTypeMatcher !== null && overriddenDataTypeMatcher !== void 0 ? overriddenDataTypeMatcher : defaultDataTypes[cellDataType].dataTypeMatcher;
        });
    };
    DataTypeService.prototype.mergeDataTypeDefinitions = function (parentDataTypeDefinition, childDataTypeDefinition) {
        var mergedDataTypeDefinition = __assign(__assign({}, parentDataTypeDefinition), childDataTypeDefinition);
        if (parentDataTypeDefinition.columnTypes &&
            childDataTypeDefinition.columnTypes &&
            childDataTypeDefinition.appendColumnTypes) {
            mergedDataTypeDefinition.columnTypes = __spreadArray(__spreadArray([], __read(this.convertColumnTypes(parentDataTypeDefinition.columnTypes))), __read(this.convertColumnTypes(childDataTypeDefinition.columnTypes)));
        }
        return mergedDataTypeDefinition;
    };
    DataTypeService.prototype.processDataTypeDefinition = function (dataTypeDefinition, dataTypeDefinitions, alreadyProcessedDataTypes, defaultDataTypes) {
        var mergedDataTypeDefinition;
        var extendsCellDataType = dataTypeDefinition.extendsDataType;
        if (dataTypeDefinition.extendsDataType === dataTypeDefinition.baseDataType) {
            var baseDataTypeDefinition = defaultDataTypes[extendsCellDataType];
            if (!this.validateDataTypeDefinition(dataTypeDefinition, baseDataTypeDefinition, extendsCellDataType)) {
                return undefined;
            }
            mergedDataTypeDefinition = this.mergeDataTypeDefinitions(baseDataTypeDefinition, dataTypeDefinition);
        }
        else {
            if (alreadyProcessedDataTypes.includes(extendsCellDataType)) {
                doOnce(function () { return console.warn('AG Grid: Data type definition hierarchies (via the "extendsDataType" property) cannot contain circular references.'); }, 'dataTypeExtendsCircularRef');
                return undefined;
            }
            var extendedDataTypeDefinition = dataTypeDefinitions[extendsCellDataType];
            if (!this.validateDataTypeDefinition(dataTypeDefinition, extendedDataTypeDefinition, extendsCellDataType)) {
                return undefined;
            }
            var mergedExtendedDataTypeDefinition = this.processDataTypeDefinition(extendedDataTypeDefinition, dataTypeDefinitions, __spreadArray(__spreadArray([], __read(alreadyProcessedDataTypes)), [extendsCellDataType]), defaultDataTypes);
            if (!mergedExtendedDataTypeDefinition) {
                return undefined;
            }
            mergedDataTypeDefinition = this.mergeDataTypeDefinitions(mergedExtendedDataTypeDefinition, dataTypeDefinition);
        }
        return __assign(__assign({}, mergedDataTypeDefinition), { groupSafeValueFormatter: this.createGroupSafeValueFormatter(mergedDataTypeDefinition) });
    };
    DataTypeService.prototype.validateDataTypeDefinition = function (dataTypeDefinition, parentDataTypeDefinition, parentCellDataType) {
        if (!parentDataTypeDefinition) {
            doOnce(function () { return console.warn("AG Grid: The data type definition " + parentCellDataType + " does not exist."); }, 'dataTypeDefMissing' + parentCellDataType);
            return false;
        }
        if (parentDataTypeDefinition.baseDataType !== dataTypeDefinition.baseDataType) {
            doOnce(function () { return console.warn('AG Grid: The "baseDataType" property of a data type definition must match that of its parent.'); }, 'dataTypeBaseTypesMatch');
            return false;
        }
        return true;
    };
    DataTypeService.prototype.createGroupSafeValueFormatter = function (dataTypeDefinition) {
        var _this = this;
        if (!dataTypeDefinition.valueFormatter) {
            return undefined;
        }
        return function (params) {
            var _a, _b;
            if ((_a = params.node) === null || _a === void 0 ? void 0 : _a.group) {
                var aggFunc = params.column.getAggFunc();
                if (aggFunc) {
                    // the resulting type of these will be the same, so we call valueFormatter anyway
                    if (aggFunc === 'first' || aggFunc === 'last') {
                        return dataTypeDefinition.valueFormatter(params);
                    }
                    if (dataTypeDefinition.baseDataType === 'number' && aggFunc !== 'count') {
                        if (typeof params.value === 'number') {
                            return dataTypeDefinition.valueFormatter(params);
                        }
                        if (typeof params.value === 'object') {
                            if (!params.value) {
                                return undefined;
                            }
                            if ('toNumber' in params.value) {
                                return dataTypeDefinition.valueFormatter(__assign(__assign({}, params), { value: params.value.toNumber() }));
                            }
                            if ('value' in params.value) {
                                return dataTypeDefinition.valueFormatter(__assign(__assign({}, params), { value: params.value.value }));
                            }
                        }
                    }
                }
                return undefined;
            }
            else if (_this.groupHideOpenParents && params.column.isRowGroupActive()) {
                // `groupHideOpenParents` passes leaf values in the group column, so need to format still.
                // If it's not a string, we know it hasn't been formatted. Otherwise check the data type matcher.
                if (typeof params.value !== 'string' || ((_b = dataTypeDefinition.dataTypeMatcher) === null || _b === void 0 ? void 0 : _b.call(dataTypeDefinition, params.value))) {
                    return dataTypeDefinition.valueFormatter(params);
                }
                return undefined;
            }
            return dataTypeDefinition.valueFormatter(params);
        };
    };
    DataTypeService.prototype.updateColDefAndGetDataTypeDefinitionColumnType = function (colDef, userColDef, colId) {
        var cellDataType = userColDef.cellDataType;
        var field = userColDef.field;
        if (cellDataType === undefined) {
            cellDataType = colDef.cellDataType;
        }
        if ((cellDataType == null || cellDataType === true)) {
            cellDataType = this.canInferCellDataType(colDef, userColDef) ? this.inferCellDataType(field) : false;
        }
        if (!cellDataType) {
            colDef.cellDataType = false;
            return undefined;
        }
        var dataTypeDefinition = this.dataTypeDefinitions[cellDataType];
        if (!dataTypeDefinition) {
            doOnce(function () { return console.warn("AG Grid: Missing data type definition - \"" + cellDataType + "\""); }, 'dataTypeMissing' + cellDataType);
            return undefined;
        }
        colDef.cellDataType = cellDataType;
        if (dataTypeDefinition.groupSafeValueFormatter) {
            colDef.valueFormatter = dataTypeDefinition.groupSafeValueFormatter;
        }
        if (dataTypeDefinition.valueParser) {
            colDef.valueParser = dataTypeDefinition.valueParser;
        }
        if (!dataTypeDefinition.suppressDefaultProperties) {
            this.setColDefPropertiesForBaseDataType(colDef, dataTypeDefinition, colId);
        }
        return dataTypeDefinition.columnTypes;
    };
    DataTypeService.prototype.updateColDefAndGetColumnType = function (colDef, userColDef, colId) {
        var _a, _b;
        var dataTypeDefinitionColumnType = this.updateColDefAndGetDataTypeDefinitionColumnType(colDef, userColDef, colId);
        var columnTypes = (_b = (_a = userColDef.type) !== null && _a !== void 0 ? _a : dataTypeDefinitionColumnType) !== null && _b !== void 0 ? _b : colDef.type;
        return columnTypes ? this.convertColumnTypes(columnTypes) : undefined;
    };
    DataTypeService.prototype.canInferCellDataType = function (colDef, userColDef) {
        var _this = this;
        var _a;
        if (this.rowModel.getType() !== 'clientSide') {
            return false;
        }
        var propsToCheckForInference = { cellRenderer: true, valueGetter: true, valueParser: true, refData: true };
        if (this.doColDefPropsPreventInference(userColDef, propsToCheckForInference)) {
            return false;
        }
        var columnTypes = userColDef.type === null ? colDef.type : userColDef.type;
        if (columnTypes) {
            var columnTypeDefs_1 = (_a = this.gridOptionsService.get('columnTypes')) !== null && _a !== void 0 ? _a : {};
            var hasPropsPreventingInference = this.convertColumnTypes(columnTypes).some(function (columnType) {
                var columnTypeDef = columnTypeDefs_1[columnType.trim()];
                return columnTypeDef && _this.doColDefPropsPreventInference(columnTypeDef, propsToCheckForInference);
            });
            if (hasPropsPreventingInference) {
                return false;
            }
        }
        return !this.doColDefPropsPreventInference(colDef, propsToCheckForInference);
    };
    DataTypeService.prototype.doColDefPropsPreventInference = function (colDef, propsToCheckForInference) {
        var _this = this;
        return [
            ['cellRenderer', 'agSparklineCellRenderer'], ['valueGetter', undefined], ['valueParser', undefined], ['refData', undefined]
        ].some(function (_a) {
            var _b = __read(_a, 2), prop = _b[0], comparisonValue = _b[1];
            return _this.doesColDefPropPreventInference(colDef, propsToCheckForInference, prop, comparisonValue);
        });
    };
    DataTypeService.prototype.doesColDefPropPreventInference = function (colDef, checkProps, prop, comparisonValue) {
        if (!checkProps[prop]) {
            return false;
        }
        var value = colDef[prop];
        if (value === null) {
            checkProps[prop] = false;
            return false;
        }
        else {
            return comparisonValue === undefined ? !!value : value === comparisonValue;
        }
    };
    DataTypeService.prototype.inferCellDataType = function (field) {
        var _a;
        if (!field) {
            return undefined;
        }
        var rowData = this.gridOptionsService.get('rowData');
        var value;
        var fieldContainsDots = field.indexOf('.') >= 0 && !this.gridOptionsService.is('suppressFieldDotNotation');
        if (rowData === null || rowData === void 0 ? void 0 : rowData.length) {
            value = getValueUsingField(rowData[0], field, fieldContainsDots);
        }
        else {
            var rowNodes = this.rowModel
                .getRootNode()
                .allLeafChildren;
            if (rowNodes === null || rowNodes === void 0 ? void 0 : rowNodes.length) {
                value = getValueUsingField(rowNodes[0].data, field, fieldContainsDots);
            }
            else {
                this.initWaitForRowData();
            }
        }
        if (value == null) {
            return undefined;
        }
        var _b = __read((_a = Object.entries(this.dataTypeMatchers).find(function (_a) {
            var _b = __read(_a, 2), _cellDataType = _b[0], dataTypeMatcher = _b[1];
            return dataTypeMatcher(value);
        })) !== null && _a !== void 0 ? _a : ['object'], 1), cellDataType = _b[0];
        return cellDataType;
    };
    DataTypeService.prototype.initWaitForRowData = function () {
        var _this = this;
        if (this.isWaitingForRowData) {
            return;
        }
        this.isWaitingForRowData = true;
        var destroyFunc = this.addManagedListener(this.eventService, Events.EVENT_ROW_DATA_UPDATED, function () {
            destroyFunc === null || destroyFunc === void 0 ? void 0 : destroyFunc();
            _this.isWaitingForRowData = false;
            setTimeout(function () {
                // ensure event handled async
                _this.columnModel.recreateColumnDefs('rowDataUpdated');
            });
        });
    };
    DataTypeService.prototype.checkObjectValueHandlers = function (defaultDataTypes) {
        var resolvedObjectDataTypeDefinition = this.dataTypeDefinitions.object;
        var defaultObjectDataTypeDefinition = defaultDataTypes.object;
        this.hasObjectValueParser = resolvedObjectDataTypeDefinition.valueParser !== defaultObjectDataTypeDefinition.valueParser;
        this.hasObjectValueFormatter = resolvedObjectDataTypeDefinition.valueFormatter !== defaultObjectDataTypeDefinition.valueFormatter;
    };
    DataTypeService.prototype.convertColumnTypes = function (type) {
        var typeKeys = [];
        if (type instanceof Array) {
            var invalidArray = type.some(function (a) { return typeof a !== 'string'; });
            if (invalidArray) {
                console.warn("AG Grid: if colDef.type is supplied an array it should be of type 'string[]'");
            }
            else {
                typeKeys = type;
            }
        }
        else if (typeof type === 'string') {
            typeKeys = type.split(',');
        }
        else {
            console.warn("AG Grid: colDef.type should be of type 'string' | 'string[]'");
        }
        return typeKeys;
    };
    DataTypeService.prototype.getDateStringTypeDefinition = function () {
        return this.dataTypeDefinitions.dateString;
    };
    DataTypeService.prototype.getDateParserFunction = function () {
        return this.getDateStringTypeDefinition().dateParser;
    };
    DataTypeService.prototype.getDateFormatterFunction = function () {
        return this.getDateStringTypeDefinition().dateFormatter;
    };
    DataTypeService.prototype.checkType = function (column, value) {
        var _a;
        var colDef = column.getColDef();
        if (!colDef.cellDataType || value == null) {
            return true;
        }
        var dataTypeMatcher = (_a = this.dataTypeDefinitions[colDef.cellDataType]) === null || _a === void 0 ? void 0 : _a.dataTypeMatcher;
        if (!dataTypeMatcher) {
            return true;
        }
        return dataTypeMatcher(value);
    };
    DataTypeService.prototype.validateColDef = function (colDef) {
        if (colDef.cellDataType === 'object') {
            if (colDef.valueFormatter === this.dataTypeDefinitions.object.groupSafeValueFormatter && !this.hasObjectValueFormatter) {
                doOnce(function () { return console.warn('AG Grid: Cell data type is "object" but no value formatter has been provided. Please either provide an object data type definition with a value formatter, or set "colDef.valueFormatter"'); }, 'dataTypeObjectValueFormatter');
            }
            if (colDef.editable && colDef.valueParser === this.dataTypeDefinitions.object.valueParser && !this.hasObjectValueParser) {
                doOnce(function () { return console.warn('AG Grid: Cell data type is "object" but no value parser has been provided. Please either provide an object data type definition with a value parser, or set "colDef.valueParser"'); }, 'dataTypeObjectValueParser');
            }
        }
    };
    DataTypeService.prototype.setColDefPropertiesForBaseDataType = function (colDef, dataTypeDefinition, colId) {
        var _this = this;
        var formatValue = function (column, node, value) {
            var valueFormatter = column.getColDef().valueFormatter;
            if (valueFormatter === dataTypeDefinition.groupSafeValueFormatter) {
                valueFormatter = dataTypeDefinition.valueFormatter;
            }
            return _this.valueFormatterService.formatValue(column, node, value, valueFormatter);
        };
        var usingSetFilter = ModuleRegistry.isRegistered(ModuleNames.SetFilterModule, this.context.getGridId());
        var translate = this.localeService.getLocaleTextFunc();
        colDef.useValueFormatterForExport = true;
        colDef.useValueParserForImport = true;
        switch (dataTypeDefinition.baseDataType) {
            case 'number': {
                colDef.cellEditor = 'agNumberCellEditor';
                if (usingSetFilter) {
                    colDef.filterParams = {
                        comparator: function (a, b) {
                            var valA = a == null ? 0 : parseInt(a);
                            var valB = b == null ? 0 : parseInt(b);
                            if (valA === valB)
                                return 0;
                            return valA > valB ? 1 : -1;
                        },
                    };
                }
                break;
            }
            case 'boolean': {
                colDef.cellEditor = 'agCheckboxCellEditor';
                colDef.cellRenderer = 'agCheckboxCellRenderer';
                colDef.suppressKeyboardEvent = function (params) { return !!params.colDef.editable && params.event.key === KeyCode.SPACE; };
                if (usingSetFilter) {
                    colDef.filterParams = {
                        valueFormatter: function (params) {
                            if (!exists(params.value)) {
                                return translate('blanks', '(Blanks)');
                            }
                            return translate(String(params.value), params.value ? 'True' : 'False');
                        }
                    };
                }
                else {
                    colDef.filterParams = {
                        maxNumConditions: 1,
                        filterOptions: [
                            'empty',
                            {
                                displayKey: 'true',
                                displayName: 'True',
                                predicate: function (_filterValues, cellValue) { return cellValue; },
                                numberOfInputs: 0,
                            },
                            {
                                displayKey: 'false',
                                displayName: 'False',
                                predicate: function (_filterValues, cellValue) { return cellValue === false; },
                                numberOfInputs: 0,
                            },
                        ]
                    };
                }
                break;
            }
            case 'date': {
                colDef.cellEditor = 'agDateCellEditor';
                colDef.keyCreator = function (params) { return formatValue(params.column, params.node, params.value); };
                if (usingSetFilter) {
                    colDef.filterParams = {
                        valueFormatter: function (params) {
                            var valueFormatted = formatValue(params.column, params.node, params.value);
                            return exists(valueFormatted) ? valueFormatted : translate('blanks', '(Blanks)');
                        },
                        treeList: true,
                        treeListFormatter: function (pathKey, level) {
                            if (level === 1 && pathKey != null) {
                                var monthKey = MONTH_KEYS[Number(pathKey) - 1];
                                return translate(monthKey, MONTH_LOCALE_TEXT[monthKey]);
                            }
                            return pathKey !== null && pathKey !== void 0 ? pathKey : translate('blanks', '(Blanks)');
                        }
                    };
                }
                break;
            }
            case 'dateString': {
                colDef.cellEditor = 'agDateStringCellEditor';
                colDef.keyCreator = function (params) { return formatValue(params.column, params.node, params.value); };
                var convertToDate_1 = this.getDateParserFunction();
                if (usingSetFilter) {
                    colDef.filterParams = {
                        valueFormatter: function (params) {
                            var valueFormatted = formatValue(params.column, params.node, params.value);
                            return exists(valueFormatted) ? valueFormatted : translate('blanks', '(Blanks)');
                        },
                        treeList: true,
                        treeListPathGetter: function (value) {
                            var date = convertToDate_1(value !== null && value !== void 0 ? value : undefined);
                            return date ? [String(date.getFullYear()), String(date.getMonth() + 1), String(date.getDate())] : null;
                        },
                        treeListFormatter: function (pathKey, level) {
                            if (level === 1 && pathKey != null) {
                                var monthKey = MONTH_KEYS[Number(pathKey) - 1];
                                return translate(monthKey, MONTH_LOCALE_TEXT[monthKey]);
                            }
                            return pathKey !== null && pathKey !== void 0 ? pathKey : translate('blanks', '(Blanks)');
                        }
                    };
                }
                else {
                    colDef.filterParams = {
                        comparator: function (filterDate, cellValue) {
                            var cellAsDate = convertToDate_1(cellValue);
                            if (cellValue == null || cellAsDate < filterDate) {
                                return -1;
                            }
                            if (cellAsDate > filterDate) {
                                return 1;
                            }
                            return 0;
                        }
                    };
                }
                break;
            }
            case 'object': {
                colDef.cellEditorParams = {
                    useFormatter: true,
                };
                colDef.comparator = function (a, b) {
                    var column = _this.columnModel.getPrimaryColumn(colId);
                    var colDef = column === null || column === void 0 ? void 0 : column.getColDef();
                    if (!column || !colDef) {
                        return 0;
                    }
                    var valA = a == null ? '' : formatValue(column, null, a);
                    var valB = b == null ? '' : formatValue(column, null, b);
                    if (valA === valB)
                        return 0;
                    return valA > valB ? 1 : -1;
                };
                colDef.keyCreator = function (params) { return formatValue(params.column, params.node, params.value); };
                if (usingSetFilter) {
                    colDef.filterParams = {
                        valueFormatter: function (params) {
                            var valueFormatted = formatValue(params.column, params.node, params.value);
                            return exists(valueFormatted) ? valueFormatted : translate('blanks', '(Blanks)');
                        }
                    };
                }
                else {
                    colDef.filterValueGetter = function (params) { return formatValue(params.column, params.node, _this.valueService.getValue(params.column, params.node)); };
                }
                break;
            }
        }
    };
    DataTypeService.prototype.getDefaultDataTypes = function () {
        var defaultDateFormatMatcher = function (value) { return !!value.match('\\d{4}-\\d{2}-\\d{2}'); };
        var translate = this.localeService.getLocaleTextFunc();
        return {
            number: {
                baseDataType: 'number',
                valueParser: function (params) { return params.newValue === '' ? null : Number(params.newValue); },
                valueFormatter: function (params) {
                    if (params.value == null) {
                        return '';
                    }
                    if (typeof params.value !== 'number' || isNaN(params.value)) {
                        return translate('invalidNumber', 'Invalid Number');
                    }
                    return String(params.value);
                },
                dataTypeMatcher: function (value) { return typeof value === 'number'; },
            },
            text: {
                baseDataType: 'text',
                valueParser: function (params) { return params.newValue === '' ? null : toStringOrNull(params.newValue); },
                dataTypeMatcher: function (value) { return typeof value === 'string'; },
            },
            boolean: {
                baseDataType: 'boolean',
                valueParser: function (params) { return params.newValue === '' ? null : String(params.newValue).toLowerCase() === 'true'; },
                valueFormatter: function (params) { return params.value == null ? '' : String(params.value); },
                dataTypeMatcher: function (value) { return typeof value === 'boolean'; },
            },
            date: {
                baseDataType: 'date',
                valueParser: function (params) { return parseDateTimeFromString(params.newValue == null ? null : String(params.newValue)); },
                valueFormatter: function (params) {
                    var _a;
                    if (params.value == null) {
                        return '';
                    }
                    if (!(params.value instanceof Date) || isNaN(params.value.getTime())) {
                        return translate('invalidDate', 'Invalid Date');
                    }
                    return (_a = serialiseDate(params.value, false)) !== null && _a !== void 0 ? _a : '';
                },
                dataTypeMatcher: function (value) { return value instanceof Date; },
            },
            dateString: {
                baseDataType: 'dateString',
                dateParser: function (value) { var _a; return (_a = parseDateTimeFromString(value)) !== null && _a !== void 0 ? _a : undefined; },
                dateFormatter: function (value) { var _a; return (_a = serialiseDate(value !== null && value !== void 0 ? value : null, false)) !== null && _a !== void 0 ? _a : undefined; },
                valueParser: function (params) { return defaultDateFormatMatcher(String(params.newValue)) ? params.newValue : null; },
                valueFormatter: function (params) { return defaultDateFormatMatcher(String(params.value)) ? params.value : ''; },
                dataTypeMatcher: function (value) { return typeof value === 'string' && defaultDateFormatMatcher(value); },
            },
            object: {
                baseDataType: 'object',
                valueParser: function () { return null; },
                valueFormatter: function (params) { var _a; return (_a = toStringOrNull(params.value)) !== null && _a !== void 0 ? _a : ''; },
            }
        };
    };
    __decorate([
        Autowired('rowModel')
    ], DataTypeService.prototype, "rowModel", void 0);
    __decorate([
        Autowired('columnModel')
    ], DataTypeService.prototype, "columnModel", void 0);
    __decorate([
        Autowired('valueService')
    ], DataTypeService.prototype, "valueService", void 0);
    __decorate([
        Autowired('valueFormatterService')
    ], DataTypeService.prototype, "valueFormatterService", void 0);
    __decorate([
        PostConstruct
    ], DataTypeService.prototype, "init", null);
    DataTypeService = __decorate([
        Bean('dataTypeService')
    ], DataTypeService);
    return DataTypeService;
}(BeanStub));
export { DataTypeService };
