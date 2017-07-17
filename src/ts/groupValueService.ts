import {Autowired, Bean} from "./context/context";
import {ValueFormatterService} from "./rendering/valueFormatterService";
import {Column} from "./entities/column";
import {RowNode} from "./entities/rowNode";
import {_} from "./utils";
import {ColumnApi} from "./columnController/columnController";
import {GroupCellRendererParams} from "./rendering/cellRenderers/groupCellRenderer";
import {AutoGroupColService} from "./columnController/autoGroupColService";


export interface GroupNameInfoParams {
    rowGroupIndex:number,
    column:Column,
    scope:any
    rowIndex:number
    keyMap:{[id:string]:string}
}

export interface GroupNameValues {
    mappedGroupName:string,
    valueFormatted:string,
    actualValue:string
}

export interface GroupNameInfo extends GroupNameValues{
    column:Column
}

@Bean('groupValueService')
export class GroupValueService {
    @Autowired('valueFormatterService') private valueFormatterService: ValueFormatterService;
    @Autowired('columnApi') private columnApi: ColumnApi;

    private mapGroupName(rowNodeKey:string, keyMap?:{[id:string]:string}): string {
        if (keyMap && typeof keyMap === 'object') {
            let valueFromMap = keyMap[rowNodeKey];
            if (valueFromMap) {
                return valueFromMap;
            } else {
                return rowNodeKey;
            }
        } else {
            return rowNodeKey;
        }
    }

    private formatGroupName (unformatted:string, formattedParams:GroupNameInfoParams, node: RowNode):string{
        let columnOfGroupedCol = this.getGroupColumn(formattedParams.rowGroupIndex, formattedParams.column);

        return this.valueFormatterService.formatValue(
            columnOfGroupedCol,
            node,
            formattedParams.scope,
            unformatted
        );
    }

    public getGroupColumn(rowGroupIndex: number, column:Column) {
        // pull out the column that the grouping is on
        let rowGroupColumns = this.columnApi.getRowGroupColumns();

        // if we are using in memory grid grouping, then we try to look up the column that
        // we did the grouping on. however if it is not possible (happens when user provides
        // the data already grouped) then we just the current col, ie use cellRenderer of current col
        let columnOfGroupedCol = rowGroupColumns[rowGroupIndex];
        if (_.missing(columnOfGroupedCol)) {
            columnOfGroupedCol = column;
        }
        return columnOfGroupedCol;
    }


    public getGroupNameValuesByRawValue (rawValue:string, params: GroupNameInfoParams):GroupNameValues {
        return this.getGroupNameValues(rawValue, params, null);
    }

    public getGroupNameValuesByNode (params: GroupNameInfoParams, node:RowNode):GroupNameValues {
        return this.getGroupNameValues(node.key, params, node);
    }

    private getGroupNameValues (rawValue:string, params: GroupNameInfoParams, node?:RowNode):GroupNameValues {
        let mappedGroupName: string = this.mapGroupName(rawValue, params.keyMap);
        let valueFormatted: string = null;
        if (node){
            valueFormatted = this.formatGroupName(mappedGroupName, params, node);
        }
        let actualValue = _.exists(valueFormatted) ? valueFormatted : mappedGroupName;
        return {
            mappedGroupName:mappedGroupName,
            valueFormatted:valueFormatted,
            actualValue:actualValue
        }
    }

    public assignToParams<T extends GroupCellRendererParams> (receiver:T, params: GroupNameInfoParams, node:RowNode): T{
        let groupNameInfo = this.getGroupNameValuesByNode(params, node);
        receiver.value = groupNameInfo.mappedGroupName;
        receiver.valueFormatted  = groupNameInfo.valueFormatted;
        receiver.actualValue  = groupNameInfo.actualValue;

        return receiver;
    }


    public getGroupNameInfo (column: Column, rowGroupIndex: number, rowIndex: number, rawValue:string):GroupNameInfo{
        let params: GroupNameInfoParams = {
            rowGroupIndex: rowGroupIndex,
            column: column,
            rowIndex: rowIndex,
            scope: null,
            keyMap: {}
        };

        let groupColumn:Column = this.getGroupColumn(params.rowGroupIndex, column);
        if (groupColumn.getColId() === column.getColId()){
            return this.extractInfo(rawValue, params, column);
        } else if (column.getColId() === AutoGroupColService.GROUP_AUTO_COLUMN_BUNDLE_ID){
            return this.extractInfo(rawValue, params, column);
        } else if (column.getColId() === AutoGroupColService.GROUP_AUTO_COLUMN_ID + '_' + column.getColId()){
            return this.extractInfo(rawValue, params, column);
        }
        return null;
    }

    private extractInfo(rawValue:string, params: GroupNameInfoParams, column: Column):GroupNameInfo {
        return this.enrich(this.getGroupNameValuesByRawValue(rawValue, params), column);
    }

    public enrich (values:GroupNameValues, column: Column): GroupNameInfo {
        return {
            actualValue: values.actualValue,
            column: column,
            valueFormatted: values.valueFormatted,
            mappedGroupName: values.mappedGroupName
        }
    }
}