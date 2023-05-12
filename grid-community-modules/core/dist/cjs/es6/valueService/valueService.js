/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v29.3.5
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValueService = void 0;
const context_1 = require("../context/context");
const events_1 = require("../events");
const beanStub_1 = require("../context/beanStub");
const object_1 = require("../utils/object");
const generic_1 = require("../utils/generic");
const function_1 = require("../utils/function");
let ValueService = class ValueService extends beanStub_1.BeanStub {
    constructor() {
        super(...arguments);
        this.initialised = false;
    }
    init() {
        this.cellExpressions = this.gridOptionsService.is('enableCellExpressions');
        this.isTreeData = this.gridOptionsService.is('treeData');
        this.initialised = true;
        // We listen to our own event and use it to call the columnSpecific callback,
        // this way the handler calls are correctly interleaved with other global events
        this.eventService.addEventListener(events_1.Events.EVENT_CELL_VALUE_CHANGED, (event) => this.callColumnCellValueChangedHandler(event), this.gridOptionsService.useAsyncEvents());
        this.addManagedPropertyListener('treeData', (propChange) => this.isTreeData = propChange.currentValue);
    }
    getValue(column, rowNode, forFilter = false, ignoreAggData = false) {
        // hack - the grid is getting refreshed before this bean gets initialised, race condition.
        // really should have a way so they get initialised in the right order???
        if (!this.initialised) {
            this.init();
        }
        if (!rowNode) {
            return;
        }
        // pull these out to make code below easier to read
        const colDef = column.getColDef();
        const field = colDef.field;
        const colId = column.getColId();
        const data = rowNode.data;
        let result;
        // if there is a value getter, this gets precedence over a field
        const groupDataExists = rowNode.groupData && rowNode.groupData[colId] !== undefined;
        const aggDataExists = !ignoreAggData && rowNode.aggData && rowNode.aggData[colId] !== undefined;
        if (forFilter && colDef.filterValueGetter) {
            result = this.executeFilterValueGetter(colDef.filterValueGetter, data, column, rowNode);
        }
        else if (this.isTreeData && aggDataExists) {
            result = rowNode.aggData[colId];
        }
        else if (this.isTreeData && colDef.valueGetter) {
            result = this.executeValueGetter(colDef.valueGetter, data, column, rowNode);
        }
        else if (this.isTreeData && (field && data)) {
            result = object_1.getValueUsingField(data, field, column.isFieldContainsDots());
        }
        else if (groupDataExists) {
            result = rowNode.groupData[colId];
        }
        else if (aggDataExists) {
            result = rowNode.aggData[colId];
        }
        else if (colDef.valueGetter) {
            result = this.executeValueGetter(colDef.valueGetter, data, column, rowNode);
        }
        else if (field && data) {
            result = object_1.getValueUsingField(data, field, column.isFieldContainsDots());
        }
        // the result could be an expression itself, if we are allowing cell values to be expressions
        if (this.cellExpressions && (typeof result === 'string') && result.indexOf('=') === 0) {
            const cellValueGetter = result.substring(1);
            result = this.executeValueGetter(cellValueGetter, data, column, rowNode);
        }
        if (result == null) {
            const openedGroup = this.getOpenedGroup(rowNode, column);
            if (openedGroup != null) {
                return openedGroup;
            }
        }
        return result;
    }
    getOpenedGroup(rowNode, column) {
        if (!this.gridOptionsService.is('showOpenedGroup')) {
            return;
        }
        const colDef = column.getColDef();
        if (!colDef.showRowGroup) {
            return;
        }
        const showRowGroup = column.getColDef().showRowGroup;
        let pointer = rowNode.parent;
        while (pointer != null) {
            if (pointer.rowGroupColumn && (showRowGroup === true || showRowGroup === pointer.rowGroupColumn.getColId())) {
                return pointer.key;
            }
            pointer = pointer.parent;
        }
        return undefined;
    }
    /**
     * Sets the value of a GridCell
     * @param rowNode The `RowNode` to be updated
     * @param colKey The `Column` to be updated
     * @param newValue The new value to be set
     * @param eventSource The event source
     * @returns `True` if the value has been updated, otherwise`False`.
     */
    setValue(rowNode, colKey, newValue, eventSource) {
        const column = this.columnModel.getPrimaryColumn(colKey);
        if (!rowNode || !column) {
            return false;
        }
        // this will only happen if user is trying to paste into a group row, which doesn't make sense
        // the user should not be trying to paste into group rows
        if (generic_1.missing(rowNode.data)) {
            rowNode.data = {};
        }
        const { field, valueSetter } = column.getColDef();
        if (generic_1.missing(field) && generic_1.missing(valueSetter)) {
            console.warn(`AG Grid: you need either field or valueSetter set on colDef for editing to work`);
            return false;
        }
        const params = {
            node: rowNode,
            data: rowNode.data,
            oldValue: this.getValue(column, rowNode),
            newValue: newValue,
            colDef: column.getColDef(),
            column: column,
            api: this.gridOptionsService.api,
            columnApi: this.gridOptionsService.columnApi,
            context: this.gridOptionsService.context
        };
        params.newValue = newValue;
        let valueWasDifferent;
        if (generic_1.exists(valueSetter)) {
            if (typeof valueSetter === 'function') {
                valueWasDifferent = valueSetter(params);
            }
            else {
                valueWasDifferent = this.expressionService.evaluate(valueSetter, params);
            }
        }
        else {
            valueWasDifferent = this.setValueUsingField(rowNode.data, field, newValue, column.isFieldContainsDots());
        }
        // in case user forgot to return something (possible if they are not using TypeScript
        // and just forgot we default the return value to true, so we always refresh.
        if (valueWasDifferent === undefined) {
            valueWasDifferent = true;
        }
        // if no change to the value, then no need to do the updating, or notifying via events.
        // otherwise the user could be tabbing around the grid, and cellValueChange would get called
        // all the time.
        if (!valueWasDifferent) {
            return false;
        }
        // reset quick filter on this row
        rowNode.resetQuickFilterAggregateText();
        this.valueCache.onDataChanged();
        params.newValue = this.getValue(column, rowNode);
        const event = {
            type: events_1.Events.EVENT_CELL_VALUE_CHANGED,
            event: null,
            rowIndex: rowNode.rowIndex,
            rowPinned: rowNode.rowPinned,
            column: params.column,
            api: params.api,
            columnApi: params.columnApi,
            colDef: params.colDef,
            context: params.context,
            data: rowNode.data,
            node: rowNode,
            oldValue: params.oldValue,
            newValue: params.newValue,
            value: params.newValue,
            source: eventSource
        };
        this.eventService.dispatchEvent(event);
        return true;
    }
    callColumnCellValueChangedHandler(event) {
        const onCellValueChanged = event.colDef.onCellValueChanged;
        if (typeof onCellValueChanged === 'function') {
            onCellValueChanged({
                node: event.node,
                data: event.data,
                oldValue: event.oldValue,
                newValue: event.newValue,
                colDef: event.colDef,
                column: event.column,
                api: event.api,
                columnApi: event.columnApi,
                context: event.context
            });
        }
    }
    setValueUsingField(data, field, newValue, isFieldContainsDots) {
        if (!field) {
            return false;
        }
        // if no '.', then it's not a deep value
        let valuesAreSame = false;
        if (!isFieldContainsDots) {
            // soft comparison to match strings and numbers
            valuesAreSame = data[field] == newValue;
            if (!valuesAreSame) {
                data[field] = newValue;
            }
        }
        else {
            // otherwise it is a deep value, so need to dig for it
            const fieldPieces = field.split('.');
            let currentObject = data;
            while (fieldPieces.length > 0 && currentObject) {
                const fieldPiece = fieldPieces.shift();
                if (fieldPieces.length === 0) {
                    // soft comparison to match strings and numbers
                    valuesAreSame = currentObject[fieldPiece] == newValue;
                    if (!valuesAreSame) {
                        currentObject[fieldPiece] = newValue;
                    }
                }
                else {
                    currentObject = currentObject[fieldPiece];
                }
            }
        }
        return !valuesAreSame;
    }
    executeFilterValueGetter(valueGetter, data, column, rowNode) {
        const params = {
            data: data,
            node: rowNode,
            column: column,
            colDef: column.getColDef(),
            api: this.gridOptionsService.api,
            columnApi: this.gridOptionsService.columnApi,
            context: this.gridOptionsService.context,
            getValue: this.getValueCallback.bind(this, rowNode)
        };
        if (typeof valueGetter === 'function') {
            return valueGetter(params);
        }
        return this.expressionService.evaluate(valueGetter, params);
    }
    executeValueGetter(valueGetter, data, column, rowNode) {
        const colId = column.getColId();
        // if inside the same turn, just return back the value we got last time
        const valueFromCache = this.valueCache.getValue(rowNode, colId);
        if (valueFromCache !== undefined) {
            return valueFromCache;
        }
        const params = {
            data: data,
            node: rowNode,
            column: column,
            colDef: column.getColDef(),
            api: this.gridOptionsService.api,
            columnApi: this.gridOptionsService.columnApi,
            context: this.gridOptionsService.context,
            getValue: this.getValueCallback.bind(this, rowNode)
        };
        let result;
        if (typeof valueGetter === 'function') {
            result = valueGetter(params);
        }
        else {
            result = this.expressionService.evaluate(valueGetter, params);
        }
        // if a turn is active, store the value in case the grid asks for it again
        this.valueCache.setValue(rowNode, colId, result);
        return result;
    }
    getValueCallback(node, field) {
        const otherColumn = this.columnModel.getPrimaryColumn(field);
        if (otherColumn) {
            return this.getValue(otherColumn, node);
        }
        return null;
    }
    // used by row grouping and pivot, to get key for a row. col can be a pivot col or a row grouping col
    getKeyForNode(col, rowNode) {
        const value = this.getValue(col, rowNode);
        const keyCreator = col.getColDef().keyCreator;
        let result = value;
        if (keyCreator) {
            const keyParams = {
                value: value,
                colDef: col.getColDef(),
                column: col,
                node: rowNode,
                data: rowNode.data,
                api: this.gridOptionsService.api,
                columnApi: this.gridOptionsService.columnApi,
                context: this.gridOptionsService.context
            };
            result = keyCreator(keyParams);
        }
        // if already a string, or missing, just return it
        if (typeof result === 'string' || result == null) {
            return result;
        }
        result = String(result);
        if (result === '[object Object]') {
            function_1.doOnce(() => {
                console.warn('AG Grid: a column you are grouping or pivoting by has objects as values. If you want to group by complex objects then either a) use a colDef.keyCreator (se AG Grid docs) or b) to toString() on the object to return a key');
            }, 'getKeyForNode - warn about [object,object]');
        }
        return result;
    }
};
__decorate([
    context_1.Autowired('expressionService')
], ValueService.prototype, "expressionService", void 0);
__decorate([
    context_1.Autowired('columnModel')
], ValueService.prototype, "columnModel", void 0);
__decorate([
    context_1.Autowired('valueCache')
], ValueService.prototype, "valueCache", void 0);
__decorate([
    context_1.PostConstruct
], ValueService.prototype, "init", null);
ValueService = __decorate([
    context_1.Bean('valueService')
], ValueService);
exports.ValueService = ValueService;
