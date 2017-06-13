import {Autowired, Bean} from "./context/context";
import {ValueFormatterService} from "./rendering/valueFormatterService";
import {Column} from "./entities/column";
import {RowNode} from "./entities/rowNode";
import {_} from "./utils";
import {ColumnApi} from "./columnController/columnController";
import {GroupCellRendererParams} from "./rendering/cellRenderers/groupCellRenderer";


export interface GroupNameInfoParams {
    rowGroupIndex:number,
    column:Column,
    scope:any
    rowIndex:number
    keyMap:{[id:string]:string}
}


export interface GroupNameInfo {
    mappedGroupName:string,
    valueFormatted:string,
    actualValue:string
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

    private formatGroupName (unformatted:string, node:RowNode, formattedParams:GroupNameInfoParams):string{
        let columnOfGroupedCol = this.getGroupColumn(formattedParams.rowGroupIndex, formattedParams.column);

        return this.valueFormatterService.formatValue(
            columnOfGroupedCol,
            node,
            formattedParams.scope,
            formattedParams.rowIndex,
            unformatted
        );
    }

    getGroupColumn(rowGroupIndex: number, column:Column) {
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


    public getGroupNameInfo (node:RowNode, params: GroupNameInfoParams):GroupNameInfo {
        let mappedGroupName: string = this.mapGroupName(node.key, params.keyMap);
        let valueFormatted: string = this.formatGroupName(mappedGroupName, node, params);
        let actualValue = _.exists(valueFormatted) ? valueFormatted : mappedGroupName;
        return {
            mappedGroupName:mappedGroupName,
            valueFormatted:valueFormatted,
            actualValue:actualValue
        }
    }

    public assignToParams<T extends GroupCellRendererParams> (receiver:T, node:RowNode, params: GroupNameInfoParams): T{
        let groupNameInfo = this.getGroupNameInfo(node, params);
        receiver.value = groupNameInfo.mappedGroupName;
        receiver.valueFormatted  = groupNameInfo.valueFormatted;
        receiver.actualValue  = groupNameInfo.actualValue;

        return receiver;
    }


    // public getGroupNameInfoByNodeAndColumn ():GroupNameInfo{
    //
    // }
}