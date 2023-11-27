"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataTypeService = void 0;
const context_1 = require("../context/context");
const beanStub_1 = require("../context/beanStub");
const eventKeys_1 = require("../eventKeys");
const object_1 = require("../utils/object");
const moduleRegistry_1 = require("../modules/moduleRegistry");
const moduleNames_1 = require("../modules/moduleNames");
const column_1 = require("../entities/column");
const function_1 = require("../utils/function");
const keyCode_1 = require("../constants/keyCode");
const generic_1 = require("../utils/generic");
const date_1 = require("../utils/date");
const MONTH_LOCALE_TEXT = {
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
const MONTH_KEYS = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];
let DataTypeService = class DataTypeService extends beanStub_1.BeanStub {
    constructor() {
        super(...arguments);
        this.dataTypeDefinitions = {};
        this.isWaitingForRowData = false;
        this.isColumnTypeOverrideInDataTypeDefinitions = false;
        // keep track of any column state updates whilst waiting for data types to be inferred
        this.columnStateUpdatesPendingInference = {};
        this.columnStateUpdateListenerDestroyFuncs = [];
    }
    init() {
        this.groupHideOpenParents = this.gridOptionsService.get('groupHideOpenParents');
        this.addManagedPropertyListener('groupHideOpenParents', () => {
            this.groupHideOpenParents = this.gridOptionsService.get('groupHideOpenParents');
        });
        this.processDataTypeDefinitions();
        this.addManagedPropertyListener('dataTypeDefinitions', () => {
            this.processDataTypeDefinitions();
            this.columnModel.recreateColumnDefs('gridOptionsChanged');
        });
    }
    processDataTypeDefinitions() {
        var _a;
        const defaultDataTypes = this.getDefaultDataTypes();
        this.dataTypeDefinitions = {};
        Object.entries(defaultDataTypes).forEach(([cellDataType, dataTypeDefinition]) => {
            this.dataTypeDefinitions[cellDataType] = Object.assign(Object.assign({}, dataTypeDefinition), { groupSafeValueFormatter: this.createGroupSafeValueFormatter(dataTypeDefinition) });
        });
        const dataTypeDefinitions = (_a = this.gridOptionsService.get('dataTypeDefinitions')) !== null && _a !== void 0 ? _a : {};
        this.dataTypeMatchers = {};
        Object.entries(dataTypeDefinitions).forEach(([cellDataType, dataTypeDefinition]) => {
            const mergedDataTypeDefinition = this.processDataTypeDefinition(dataTypeDefinition, dataTypeDefinitions, [cellDataType], defaultDataTypes);
            if (mergedDataTypeDefinition) {
                this.dataTypeDefinitions[cellDataType] = mergedDataTypeDefinition;
                if (dataTypeDefinition.dataTypeMatcher) {
                    this.dataTypeMatchers[cellDataType] = dataTypeDefinition.dataTypeMatcher;
                }
            }
        });
        this.checkObjectValueHandlers(defaultDataTypes);
        ['dateString', 'text', 'number', 'boolean', 'date'].forEach((cellDataType) => {
            const overriddenDataTypeMatcher = this.dataTypeMatchers[cellDataType];
            if (overriddenDataTypeMatcher) {
                // remove to maintain correct ordering
                delete this.dataTypeMatchers[cellDataType];
            }
            this.dataTypeMatchers[cellDataType] = overriddenDataTypeMatcher !== null && overriddenDataTypeMatcher !== void 0 ? overriddenDataTypeMatcher : defaultDataTypes[cellDataType].dataTypeMatcher;
        });
    }
    mergeDataTypeDefinitions(parentDataTypeDefinition, childDataTypeDefinition) {
        const mergedDataTypeDefinition = Object.assign(Object.assign({}, parentDataTypeDefinition), childDataTypeDefinition);
        if (parentDataTypeDefinition.columnTypes &&
            childDataTypeDefinition.columnTypes &&
            childDataTypeDefinition.appendColumnTypes) {
            mergedDataTypeDefinition.columnTypes = [
                ...this.convertColumnTypes(parentDataTypeDefinition.columnTypes),
                ...this.convertColumnTypes(childDataTypeDefinition.columnTypes),
            ];
        }
        return mergedDataTypeDefinition;
    }
    processDataTypeDefinition(dataTypeDefinition, dataTypeDefinitions, alreadyProcessedDataTypes, defaultDataTypes) {
        let mergedDataTypeDefinition;
        const extendsCellDataType = dataTypeDefinition.extendsDataType;
        if (dataTypeDefinition.columnTypes) {
            this.isColumnTypeOverrideInDataTypeDefinitions = true;
        }
        if (dataTypeDefinition.extendsDataType === dataTypeDefinition.baseDataType) {
            let baseDataTypeDefinition = defaultDataTypes[extendsCellDataType];
            const overriddenBaseDataTypeDefinition = dataTypeDefinitions[extendsCellDataType];
            if (baseDataTypeDefinition && overriddenBaseDataTypeDefinition) {
                // only if it's valid do we override with a provided one
                baseDataTypeDefinition = overriddenBaseDataTypeDefinition;
            }
            if (!this.validateDataTypeDefinition(dataTypeDefinition, baseDataTypeDefinition, extendsCellDataType)) {
                return undefined;
            }
            mergedDataTypeDefinition = this.mergeDataTypeDefinitions(baseDataTypeDefinition, dataTypeDefinition);
        }
        else {
            if (alreadyProcessedDataTypes.includes(extendsCellDataType)) {
                (0, function_1.warnOnce)('Data type definition hierarchies (via the "extendsDataType" property) cannot contain circular references.');
                return undefined;
            }
            const extendedDataTypeDefinition = dataTypeDefinitions[extendsCellDataType];
            if (!this.validateDataTypeDefinition(dataTypeDefinition, extendedDataTypeDefinition, extendsCellDataType)) {
                return undefined;
            }
            const mergedExtendedDataTypeDefinition = this.processDataTypeDefinition(extendedDataTypeDefinition, dataTypeDefinitions, [...alreadyProcessedDataTypes, extendsCellDataType], defaultDataTypes);
            if (!mergedExtendedDataTypeDefinition) {
                return undefined;
            }
            mergedDataTypeDefinition = this.mergeDataTypeDefinitions(mergedExtendedDataTypeDefinition, dataTypeDefinition);
        }
        return Object.assign(Object.assign({}, mergedDataTypeDefinition), { groupSafeValueFormatter: this.createGroupSafeValueFormatter(mergedDataTypeDefinition) });
    }
    validateDataTypeDefinition(dataTypeDefinition, parentDataTypeDefinition, parentCellDataType) {
        if (!parentDataTypeDefinition) {
            (0, function_1.warnOnce)(`The data type definition ${parentCellDataType} does not exist.`);
            return false;
        }
        if (parentDataTypeDefinition.baseDataType !== dataTypeDefinition.baseDataType) {
            (0, function_1.warnOnce)('The "baseDataType" property of a data type definition must match that of its parent.');
            return false;
        }
        return true;
    }
    createGroupSafeValueFormatter(dataTypeDefinition) {
        if (!dataTypeDefinition.valueFormatter) {
            return undefined;
        }
        return (params) => {
            var _a, _b;
            if ((_a = params.node) === null || _a === void 0 ? void 0 : _a.group) {
                const aggFunc = params.column.getAggFunc();
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
                                return dataTypeDefinition.valueFormatter(Object.assign(Object.assign({}, params), { value: params.value.toNumber() }));
                            }
                            if ('value' in params.value) {
                                return dataTypeDefinition.valueFormatter(Object.assign(Object.assign({}, params), { value: params.value.value }));
                            }
                        }
                    }
                }
                // we don't want to double format the value
                // as this is already formatted by using the valueFormatter as the keyCreator
                if (!this.gridOptionsService.get('suppressGroupMaintainValueType')) {
                    return undefined;
                }
            }
            else if (this.groupHideOpenParents && params.column.isRowGroupActive()) {
                // `groupHideOpenParents` passes leaf values in the group column, so need to format still.
                // If it's not a string, we know it hasn't been formatted. Otherwise check the data type matcher.
                if (typeof params.value !== 'string' || ((_b = dataTypeDefinition.dataTypeMatcher) === null || _b === void 0 ? void 0 : _b.call(dataTypeDefinition, params.value))) {
                    return dataTypeDefinition.valueFormatter(params);
                }
                // we don't want to double format the value
                // as this is already formatted by using the valueFormatter as the keyCreator
                if (!this.gridOptionsService.get('suppressGroupMaintainValueType')) {
                    return undefined;
                }
            }
            return dataTypeDefinition.valueFormatter(params);
        };
    }
    updateColDefAndGetDataTypeDefinitionColumnType(colDef, userColDef, colId) {
        let { cellDataType } = userColDef;
        const { field } = userColDef;
        if (cellDataType === undefined) {
            cellDataType = colDef.cellDataType;
        }
        if ((cellDataType == null || cellDataType === true)) {
            cellDataType = this.canInferCellDataType(colDef, userColDef) ? this.inferCellDataType(field, colId) : false;
        }
        if (!cellDataType) {
            colDef.cellDataType = false;
            return undefined;
        }
        const dataTypeDefinition = this.dataTypeDefinitions[cellDataType];
        if (!dataTypeDefinition) {
            (0, function_1.warnOnce)(`Missing data type definition - "${cellDataType}"`);
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
    }
    updateColDefAndGetColumnType(colDef, userColDef, colId) {
        var _a, _b;
        const dataTypeDefinitionColumnType = this.updateColDefAndGetDataTypeDefinitionColumnType(colDef, userColDef, colId);
        const columnTypes = (_b = (_a = userColDef.type) !== null && _a !== void 0 ? _a : dataTypeDefinitionColumnType) !== null && _b !== void 0 ? _b : colDef.type;
        colDef.type = columnTypes;
        return columnTypes ? this.convertColumnTypes(columnTypes) : undefined;
    }
    addColumnListeners(column) {
        if (!this.isWaitingForRowData) {
            return;
        }
        const columnStateUpdates = this.columnStateUpdatesPendingInference[column.getColId()];
        if (!columnStateUpdates) {
            return;
        }
        const columnListener = (event) => {
            columnStateUpdates.add(event.key);
        };
        column.addEventListener(column_1.Column.EVENT_STATE_UPDATED, columnListener);
        this.columnStateUpdateListenerDestroyFuncs.push(() => column.removeEventListener(column_1.Column.EVENT_STATE_UPDATED, columnListener));
    }
    canInferCellDataType(colDef, userColDef) {
        var _a;
        if (this.rowModel.getType() !== 'clientSide') {
            return false;
        }
        const propsToCheckForInference = { cellRenderer: true, valueGetter: true, valueParser: true, refData: true };
        if (this.doColDefPropsPreventInference(userColDef, propsToCheckForInference)) {
            return false;
        }
        const columnTypes = userColDef.type === null ? colDef.type : userColDef.type;
        if (columnTypes) {
            const columnTypeDefs = (_a = this.gridOptionsService.get('columnTypes')) !== null && _a !== void 0 ? _a : {};
            const hasPropsPreventingInference = this.convertColumnTypes(columnTypes).some(columnType => {
                const columnTypeDef = columnTypeDefs[columnType.trim()];
                return columnTypeDef && this.doColDefPropsPreventInference(columnTypeDef, propsToCheckForInference);
            });
            if (hasPropsPreventingInference) {
                return false;
            }
        }
        return !this.doColDefPropsPreventInference(colDef, propsToCheckForInference);
    }
    doColDefPropsPreventInference(colDef, propsToCheckForInference) {
        return [
            ['cellRenderer', 'agSparklineCellRenderer'], ['valueGetter', undefined], ['valueParser', undefined], ['refData', undefined]
        ].some(([prop, comparisonValue]) => this.doesColDefPropPreventInference(colDef, propsToCheckForInference, prop, comparisonValue));
    }
    doesColDefPropPreventInference(colDef, checkProps, prop, comparisonValue) {
        if (!checkProps[prop]) {
            return false;
        }
        const value = colDef[prop];
        if (value === null) {
            checkProps[prop] = false;
            return false;
        }
        else {
            return comparisonValue === undefined ? !!value : value === comparisonValue;
        }
    }
    inferCellDataType(field, colId) {
        var _a;
        if (!field) {
            return undefined;
        }
        let value;
        const initialData = this.getInitialData();
        if (initialData) {
            const fieldContainsDots = field.indexOf('.') >= 0 && !this.gridOptionsService.get('suppressFieldDotNotation');
            value = (0, object_1.getValueUsingField)(initialData, field, fieldContainsDots);
        }
        else {
            this.initWaitForRowData(colId);
        }
        if (value == null) {
            return undefined;
        }
        const [cellDataType] = (_a = Object.entries(this.dataTypeMatchers).find(([_cellDataType, dataTypeMatcher]) => dataTypeMatcher(value))) !== null && _a !== void 0 ? _a : ['object'];
        return cellDataType;
    }
    getInitialData() {
        const rowData = this.gridOptionsService.get('rowData');
        if (rowData === null || rowData === void 0 ? void 0 : rowData.length) {
            return rowData[0];
        }
        else if (this.initialData) {
            return this.initialData;
        }
        else {
            const rowNodes = this.rowModel
                .getRootNode()
                .allLeafChildren;
            if (rowNodes === null || rowNodes === void 0 ? void 0 : rowNodes.length) {
                return rowNodes[0].data;
            }
        }
        return null;
    }
    initWaitForRowData(colId) {
        this.columnStateUpdatesPendingInference[colId] = new Set();
        if (this.isWaitingForRowData) {
            return;
        }
        this.isWaitingForRowData = true;
        const columnTypeOverridesExist = this.isColumnTypeOverrideInDataTypeDefinitions;
        if (columnTypeOverridesExist) {
            this.columnModel.queueResizeOperations();
        }
        const destroyFunc = this.addManagedListener(this.eventService, eventKeys_1.Events.EVENT_ROW_DATA_UPDATE_STARTED, (event) => {
            const { firstRowData } = event;
            if (!firstRowData) {
                return;
            }
            destroyFunc === null || destroyFunc === void 0 ? void 0 : destroyFunc();
            this.isWaitingForRowData = false;
            this.processColumnsPendingInference(firstRowData, columnTypeOverridesExist);
            this.columnStateUpdatesPendingInference = {};
            if (columnTypeOverridesExist) {
                this.columnModel.processResizeOperations();
            }
            const dataTypesInferredEvent = {
                type: eventKeys_1.Events.EVENT_DATA_TYPES_INFERRED
            };
            this.eventService.dispatchEvent(dataTypesInferredEvent);
        });
    }
    isPendingInference() {
        return this.isWaitingForRowData;
    }
    processColumnsPendingInference(firstRowData, columnTypeOverridesExist) {
        this.initialData = firstRowData;
        const state = [];
        this.columnStateUpdateListenerDestroyFuncs.forEach(destroyFunc => destroyFunc());
        this.columnStateUpdateListenerDestroyFuncs = [];
        const newRowGroupColumnStateWithoutIndex = {};
        const newPivotColumnStateWithoutIndex = {};
        Object.entries(this.columnStateUpdatesPendingInference).forEach(([colId, columnStateUpdates]) => {
            const column = this.columnModel.getGridColumn(colId);
            if (!column) {
                return;
            }
            const oldColDef = column.getColDef();
            if (!this.columnModel.resetColumnDefIntoColumn(column, 'cellDataTypeInferred')) {
                return;
            }
            const newColDef = column.getColDef();
            if (columnTypeOverridesExist && newColDef.type && newColDef.type !== oldColDef.type) {
                const updatedColumnState = this.getUpdatedColumnState(column, columnStateUpdates);
                if (updatedColumnState.rowGroup && updatedColumnState.rowGroupIndex == null) {
                    newRowGroupColumnStateWithoutIndex[colId] = updatedColumnState;
                }
                if (updatedColumnState.pivot && updatedColumnState.pivotIndex == null) {
                    newPivotColumnStateWithoutIndex[colId] = updatedColumnState;
                }
                state.push(updatedColumnState);
            }
        });
        if (columnTypeOverridesExist) {
            state.push(...this.columnModel.generateColumnStateForRowGroupAndPivotIndexes(newRowGroupColumnStateWithoutIndex, newPivotColumnStateWithoutIndex));
        }
        if (state.length) {
            this.columnModel.applyColumnState({ state }, 'cellDataTypeInferred');
        }
        this.initialData = null;
    }
    getUpdatedColumnState(column, columnStateUpdates) {
        const columnState = this.columnModel.getColumnStateFromColDef(column);
        columnStateUpdates.forEach(key => {
            // if the column state has been updated, don't update again
            delete columnState[key];
            if (key === 'rowGroup') {
                delete columnState.rowGroupIndex;
            }
            else if (key === 'pivot') {
                delete columnState.pivotIndex;
            }
        });
        return columnState;
    }
    checkObjectValueHandlers(defaultDataTypes) {
        const resolvedObjectDataTypeDefinition = this.dataTypeDefinitions.object;
        const defaultObjectDataTypeDefinition = defaultDataTypes.object;
        this.hasObjectValueParser = resolvedObjectDataTypeDefinition.valueParser !== defaultObjectDataTypeDefinition.valueParser;
        this.hasObjectValueFormatter = resolvedObjectDataTypeDefinition.valueFormatter !== defaultObjectDataTypeDefinition.valueFormatter;
    }
    convertColumnTypes(type) {
        let typeKeys = [];
        if (type instanceof Array) {
            const invalidArray = type.some((a) => typeof a !== 'string');
            if (invalidArray) {
                console.warn("if colDef.type is supplied an array it should be of type 'string[]'");
            }
            else {
                typeKeys = type;
            }
        }
        else if (typeof type === 'string') {
            typeKeys = type.split(',');
        }
        else {
            console.warn("colDef.type should be of type 'string' | 'string[]'");
        }
        return typeKeys;
    }
    getDateStringTypeDefinition() {
        return this.dataTypeDefinitions.dateString;
    }
    getDateParserFunction() {
        return this.getDateStringTypeDefinition().dateParser;
    }
    getDateFormatterFunction() {
        return this.getDateStringTypeDefinition().dateFormatter;
    }
    getDataTypeDefinition(column) {
        const colDef = column.getColDef();
        if (!colDef.cellDataType) {
            return undefined;
        }
        return this.dataTypeDefinitions[colDef.cellDataType];
    }
    getBaseDataType(column) {
        var _a;
        return (_a = this.getDataTypeDefinition(column)) === null || _a === void 0 ? void 0 : _a.baseDataType;
    }
    checkType(column, value) {
        var _a;
        if (value == null) {
            return true;
        }
        const dataTypeMatcher = (_a = this.getDataTypeDefinition(column)) === null || _a === void 0 ? void 0 : _a.dataTypeMatcher;
        if (!dataTypeMatcher) {
            return true;
        }
        return dataTypeMatcher(value);
    }
    validateColDef(colDef) {
        if (colDef.cellDataType === 'object') {
            if (colDef.valueFormatter === this.dataTypeDefinitions.object.groupSafeValueFormatter && !this.hasObjectValueFormatter) {
                (0, function_1.warnOnce)('Cell data type is "object" but no value formatter has been provided. Please either provide an object data type definition with a value formatter, or set "colDef.valueFormatter"');
            }
            if (colDef.editable && colDef.valueParser === this.dataTypeDefinitions.object.valueParser && !this.hasObjectValueParser) {
                (0, function_1.warnOnce)('Cell data type is "object" but no value parser has been provided. Please either provide an object data type definition with a value parser, or set "colDef.valueParser"');
            }
        }
    }
    setColDefPropertiesForBaseDataType(colDef, dataTypeDefinition, colId) {
        const formatValue = (column, node, value) => {
            let valueFormatter = column.getColDef().valueFormatter;
            if (valueFormatter === dataTypeDefinition.groupSafeValueFormatter) {
                valueFormatter = dataTypeDefinition.valueFormatter;
            }
            return this.valueFormatterService.formatValue(column, node, value, valueFormatter);
        };
        const usingSetFilter = moduleRegistry_1.ModuleRegistry.__isRegistered(moduleNames_1.ModuleNames.SetFilterModule, this.context.getGridId());
        const translate = this.localeService.getLocaleTextFunc();
        const mergeFilterParams = (params) => {
            const { filterParams } = colDef;
            colDef.filterParams = typeof filterParams === 'object' ? Object.assign(Object.assign({}, filterParams), params) : params;
        };
        switch (dataTypeDefinition.baseDataType) {
            case 'number': {
                colDef.cellEditor = 'agNumberCellEditor';
                if (usingSetFilter) {
                    mergeFilterParams({
                        comparator: (a, b) => {
                            const valA = a == null ? 0 : parseInt(a);
                            const valB = b == null ? 0 : parseInt(b);
                            if (valA === valB)
                                return 0;
                            return valA > valB ? 1 : -1;
                        },
                    });
                }
                break;
            }
            case 'boolean': {
                colDef.cellEditor = 'agCheckboxCellEditor';
                colDef.cellRenderer = 'agCheckboxCellRenderer';
                colDef.suppressKeyboardEvent = (params) => !!params.colDef.editable && params.event.key === keyCode_1.KeyCode.SPACE;
                if (usingSetFilter) {
                    mergeFilterParams({
                        valueFormatter: (params) => {
                            if (!(0, generic_1.exists)(params.value)) {
                                return translate('blanks', '(Blanks)');
                            }
                            return translate(String(params.value), params.value ? 'True' : 'False');
                        }
                    });
                }
                else {
                    mergeFilterParams({
                        maxNumConditions: 1,
                        filterOptions: [
                            'empty',
                            {
                                displayKey: 'true',
                                displayName: 'True',
                                predicate: (_filterValues, cellValue) => cellValue,
                                numberOfInputs: 0,
                            },
                            {
                                displayKey: 'false',
                                displayName: 'False',
                                predicate: (_filterValues, cellValue) => cellValue === false,
                                numberOfInputs: 0,
                            },
                        ]
                    });
                }
                break;
            }
            case 'date': {
                colDef.cellEditor = 'agDateCellEditor';
                colDef.keyCreator = (params) => formatValue(params.column, params.node, params.value);
                if (usingSetFilter) {
                    mergeFilterParams({
                        valueFormatter: (params) => {
                            const valueFormatted = formatValue(params.column, params.node, params.value);
                            return (0, generic_1.exists)(valueFormatted) ? valueFormatted : translate('blanks', '(Blanks)');
                        },
                        treeList: true,
                        treeListFormatter: (pathKey, level) => {
                            if (level === 1 && pathKey != null) {
                                const monthKey = MONTH_KEYS[Number(pathKey) - 1];
                                return translate(monthKey, MONTH_LOCALE_TEXT[monthKey]);
                            }
                            return pathKey !== null && pathKey !== void 0 ? pathKey : translate('blanks', '(Blanks)');
                        }
                    });
                }
                break;
            }
            case 'dateString': {
                colDef.cellEditor = 'agDateStringCellEditor';
                colDef.keyCreator = (params) => formatValue(params.column, params.node, params.value);
                const convertToDate = this.getDateParserFunction();
                if (usingSetFilter) {
                    mergeFilterParams({
                        valueFormatter: (params) => {
                            const valueFormatted = formatValue(params.column, params.node, params.value);
                            return (0, generic_1.exists)(valueFormatted) ? valueFormatted : translate('blanks', '(Blanks)');
                        },
                        treeList: true,
                        treeListPathGetter: (value) => {
                            const date = convertToDate(value !== null && value !== void 0 ? value : undefined);
                            return date ? [String(date.getFullYear()), String(date.getMonth() + 1), String(date.getDate())] : null;
                        },
                        treeListFormatter: (pathKey, level) => {
                            if (level === 1 && pathKey != null) {
                                const monthKey = MONTH_KEYS[Number(pathKey) - 1];
                                return translate(monthKey, MONTH_LOCALE_TEXT[monthKey]);
                            }
                            return pathKey !== null && pathKey !== void 0 ? pathKey : translate('blanks', '(Blanks)');
                        }
                    });
                }
                else {
                    mergeFilterParams({
                        comparator: (filterDate, cellValue) => {
                            const cellAsDate = convertToDate(cellValue);
                            if (cellValue == null || cellAsDate < filterDate) {
                                return -1;
                            }
                            if (cellAsDate > filterDate) {
                                return 1;
                            }
                            return 0;
                        }
                    });
                }
                break;
            }
            case 'object': {
                colDef.cellEditorParams = {
                    useFormatter: true,
                };
                colDef.comparator = (a, b) => {
                    const column = this.columnModel.getPrimaryColumn(colId);
                    const colDef = column === null || column === void 0 ? void 0 : column.getColDef();
                    if (!column || !colDef) {
                        return 0;
                    }
                    const valA = a == null ? '' : formatValue(column, null, a);
                    const valB = b == null ? '' : formatValue(column, null, b);
                    if (valA === valB)
                        return 0;
                    return valA > valB ? 1 : -1;
                };
                colDef.keyCreator = (params) => formatValue(params.column, params.node, params.value);
                if (usingSetFilter) {
                    mergeFilterParams({
                        valueFormatter: (params) => {
                            const valueFormatted = formatValue(params.column, params.node, params.value);
                            return (0, generic_1.exists)(valueFormatted) ? valueFormatted : translate('blanks', '(Blanks)');
                        }
                    });
                }
                else {
                    colDef.filterValueGetter = (params) => formatValue(params.column, params.node, this.valueService.getValue(params.column, params.node));
                }
                break;
            }
        }
    }
    getDefaultDataTypes() {
        const defaultDateFormatMatcher = (value) => !!value.match('^\\d{4}-\\d{2}-\\d{2}$');
        const translate = this.localeService.getLocaleTextFunc();
        return {
            number: {
                baseDataType: 'number',
                valueParser: (params) => params.newValue === '' ? null : Number(params.newValue),
                valueFormatter: (params) => {
                    if (params.value == null) {
                        return '';
                    }
                    if (typeof params.value !== 'number' || isNaN(params.value)) {
                        console.log('was', typeof params.value, params.value, params);
                        return translate('invalidNumber', 'Invalid Number');
                    }
                    return String(params.value);
                },
                dataTypeMatcher: (value) => typeof value === 'number',
            },
            text: {
                baseDataType: 'text',
                valueParser: (params) => params.newValue === '' ? null : (0, generic_1.toStringOrNull)(params.newValue),
                dataTypeMatcher: (value) => typeof value === 'string',
            },
            boolean: {
                baseDataType: 'boolean',
                valueParser: (params) => {
                    if (params.newValue == null) {
                        return params.newValue;
                    }
                    return params.newValue === '' ? null : String(params.newValue).toLowerCase() === 'true';
                },
                valueFormatter: (params) => params.value == null ? '' : String(params.value),
                dataTypeMatcher: (value) => typeof value === 'boolean',
            },
            date: {
                baseDataType: 'date',
                valueParser: (params) => (0, date_1.parseDateTimeFromString)(params.newValue == null ? null : String(params.newValue)),
                valueFormatter: (params) => {
                    var _a;
                    if (params.value == null) {
                        return '';
                    }
                    if (!(params.value instanceof Date) || isNaN(params.value.getTime())) {
                        return translate('invalidDate', 'Invalid Date');
                    }
                    return (_a = (0, date_1.serialiseDate)(params.value, false)) !== null && _a !== void 0 ? _a : '';
                },
                dataTypeMatcher: (value) => value instanceof Date,
            },
            dateString: {
                baseDataType: 'dateString',
                dateParser: (value) => { var _a; return (_a = (0, date_1.parseDateTimeFromString)(value)) !== null && _a !== void 0 ? _a : undefined; },
                dateFormatter: (value) => { var _a; return (_a = (0, date_1.serialiseDate)(value !== null && value !== void 0 ? value : null, false)) !== null && _a !== void 0 ? _a : undefined; },
                valueParser: (params) => defaultDateFormatMatcher(String(params.newValue)) ? params.newValue : null,
                valueFormatter: (params) => defaultDateFormatMatcher(String(params.value)) ? params.value : '',
                dataTypeMatcher: (value) => typeof value === 'string' && defaultDateFormatMatcher(value),
            },
            object: {
                baseDataType: 'object',
                valueParser: () => null,
                valueFormatter: (params) => { var _a; return (_a = (0, generic_1.toStringOrNull)(params.value)) !== null && _a !== void 0 ? _a : ''; },
            }
        };
    }
};
__decorate([
    (0, context_1.Autowired)('rowModel')
], DataTypeService.prototype, "rowModel", void 0);
__decorate([
    (0, context_1.Autowired)('columnModel')
], DataTypeService.prototype, "columnModel", void 0);
__decorate([
    (0, context_1.Autowired)('columnUtils')
], DataTypeService.prototype, "columnUtils", void 0);
__decorate([
    (0, context_1.Autowired)('valueService')
], DataTypeService.prototype, "valueService", void 0);
__decorate([
    (0, context_1.Autowired)('valueFormatterService')
], DataTypeService.prototype, "valueFormatterService", void 0);
__decorate([
    context_1.PostConstruct
], DataTypeService.prototype, "init", null);
DataTypeService = __decorate([
    (0, context_1.Bean)('dataTypeService')
], DataTypeService);
exports.DataTypeService = DataTypeService;
