import {GridOptionsWrapper} from "./gridOptionsWrapper";
import {ExpressionService} from "./expressionService";
import {ColumnController} from "./columnController/columnController";
import {ColDef} from "./entities/colDef";
import {Autowired, Bean, PostConstruct} from "./context/context";
import {RowNode} from "./entities/rowNode";
import {Column} from "./entities/column";
import {Utils as _} from "./utils";
import {Events} from "./events";
import {EventService} from "./eventService";
import {GroupValueService} from "./groupValueService";

@Bean('valueService')
export class ValueService {

    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;
    @Autowired('expressionService') private expressionService: ExpressionService;
    @Autowired('columnController') private columnController: ColumnController;
    @Autowired('eventService') private eventService: EventService;
    @Autowired('groupValueService') private groupValueService: GroupValueService;

    private cellExpressions: boolean;
    private userProvidedTheGroups: boolean;
    private suppressUseColIdForGroups: boolean;

    private initialised = false;

    @PostConstruct
    public init(): void {
        this.cellExpressions = this.gridOptionsWrapper.isEnableCellExpressions();
        this.userProvidedTheGroups = _.exists(this.gridOptionsWrapper.getNodeChildDetailsFunc());
        this.suppressUseColIdForGroups = this.gridOptionsWrapper.isSuppressUseColIdForGroups();
        this.initialised = true;
    }

    public getValue(column: Column, node: RowNode): any {
        return this.getValueUsingSpecificData(column, node.data, node);
    }

    public getValueUsingSpecificData(column: Column, data: any, node: RowNode): any {
/*
        if (node.group){
            // If we are getting the value for a column that is displaying a group this
            // node is grouping by
            if (node.groupData){
                let groupData = node.groupData [column.getColId()];
                if (_.exists(groupData)){
                    return groupData;
                }
            }

            // Otherwise unless there is an aggregation on this column, which will be populated
            // in the data property, we return null for groups
            return node.data ? node.data[column.getId()] : null;
        }
*/

        // hack - the grid is getting refreshed before this bean gets initialised, race condition.
        // really should have a way so they get initialised in the right order???
        if (!this.initialised) { this.init(); }

        let colDef = column.getColDef();
        let field = colDef.field;
        let colId = column.getId();

        let result: any;

        // if there is a value getter, this gets precedence over a field
        // - need to revisit this, we check 'data' as this is the way for the grid to
        //   not render when on the footer row
        if (node.groupData && node.groupData[colId] !== undefined ) {
            result = node.groupData[colId];
        } else if (colDef.valueGetter) {
            result = this.executeValueGetter(colDef.valueGetter, data, column, node);
        } else if (field && data) {
            result = _.getValueUsingField(data, field, column.isFieldContainsDots());
        } else {
            result = undefined;
        }

        // the result could be an expression itself, if we are allowing cell values to be expressions
        if (this.cellExpressions && (typeof result === 'string') && result.indexOf('=') === 0) {
            let cellValueGetter = result.substring(1);
            result = this.executeValueGetter(cellValueGetter, data, column, node);
        }

        return result;
    }

/*    private setupForGroupHideOpenParents(originalParams: any): void {
        let rowGroupColumn = this.getRowGroupColumn(originalParams);
        let nodeToSwapIn = this.isFirstChildOfFirstChild(originalParams.node, rowGroupColumn);
        this.nodeWasSwapped = _.exists(nodeToSwapIn);
        if (this.nodeWasSwapped) {
            let newParams = <any> {};
            _.assign(newParams, originalParams);
            newParams.node = nodeToSwapIn;
            this.params = newParams;
        } else {
            this.params = originalParams;
        }
    }*/

    public setValue(rowNode: RowNode, colKey: string|ColDef|Column, newValue: any): void {
        let column = this.columnController.getPrimaryColumn(colKey);

        if (!rowNode || !column) {
            return;
        }
        // this will only happen if user is trying to paste into a group row, which doesn't make sense
        // the user should not be trying to paste into group rows
        let data = rowNode.data;
        if (_.missing(data)) {
            rowNode.data = {};
        }

        let field = column.getColDef().field;
        let newValueHandler = column.getColDef().newValueHandler;

        // need either a field or a newValueHandler for this to work
        if (_.missing(field) && _.missing(newValueHandler)) {
            console.warn(`ag-Grid: you need either field or newValueHandler set on colDef for editing to work`);
            return;
        }

        let paramsForCallbacks = {
            node: rowNode,
            data: rowNode.data,
            oldValue: this.getValue(column, rowNode),
            newValue: newValue,
            colDef: column.getColDef(),
            api: this.gridOptionsWrapper.getApi(),
            context: this.gridOptionsWrapper.getContext()
        };

        let valueWasDifferent: boolean;
        if (newValueHandler) {
            valueWasDifferent = newValueHandler(paramsForCallbacks);
            // in case use is implementing an old version, we default
            // the return value to true, so we always refresh.
            if (valueWasDifferent === undefined) {
                valueWasDifferent = true;
            }
        } else {
            valueWasDifferent = this.setValueUsingField(data, field, newValue, column.isFieldContainsDots());
        }

        // if no change to the value, then no need to do the updating, or notifying via events.
        // otherwise the user could be tabbing around the grid, and cellValueChange would get called
        // all the time.
        if (!valueWasDifferent) { return; }

        // reset quick filter on this row
        rowNode.resetQuickFilterAggregateText();

        paramsForCallbacks.newValue = this.getValue(column, rowNode);

        if (typeof column.getColDef().onCellValueChanged === 'function') {
            column.getColDef().onCellValueChanged(paramsForCallbacks);
        }
        this.eventService.dispatchEvent(Events.EVENT_CELL_VALUE_CHANGED, paramsForCallbacks);
    }

    private setValueUsingField(data: any, field: string, newValue: any, isFieldContainsDots: boolean): boolean {
        // if no '.', then it's not a deep value
        let valuesAreSame: boolean;
        if (!isFieldContainsDots) {
            valuesAreSame = _.valuesSimpleAndSame(data[field], newValue);
            if (!valuesAreSame) {
                data[field] = newValue;
            }
        } else {
            // otherwise it is a deep value, so need to dig for it
            let fieldPieces = field.split('.');
            let currentObject = data;
            while (fieldPieces.length > 0 && currentObject) {
                let fieldPiece = fieldPieces.shift();
                if (fieldPieces.length === 0) {
                    valuesAreSame = _.valuesSimpleAndSame(currentObject[fieldPiece], newValue);
                    if (!valuesAreSame) {
                        currentObject[fieldPiece] = newValue;
                    }
                } else {
                    currentObject = currentObject[fieldPiece];
                }
            }
        }
        return !valuesAreSame;
    }

    private executeValueGetter(valueGetter: any, data: any, column: Column, node: RowNode): any {

        let context = this.gridOptionsWrapper.getContext();
        let api = this.gridOptionsWrapper.getApi();

        let params = {
            data: data,
            node: node,
            colDef: column.getColDef(),
            api: api,
            context: context,
            getValue: this.getValueCallback.bind(this, data, node)
        };

        if (typeof valueGetter === 'function') {
            // valueGetter is a function, so just call it
            return valueGetter(params);
        } else if (typeof valueGetter === 'string') {
            // valueGetter is an expression, so execute the expression
            return this.expressionService.evaluate(valueGetter, params);
        }
    }

    private getValueCallback(data: any, node: RowNode, field: string): any {
        let otherColumn = this.columnController.getPrimaryColumn(field);
        if (otherColumn) {
            return this.getValueUsingSpecificData(otherColumn, data, node);
        } else {
            return null;
        }
    }
}
