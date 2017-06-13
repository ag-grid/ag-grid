import {Autowired, Bean} from "./context/context";
import {ValueFormatterService} from "./rendering/valueFormatterService";
import {Column} from "./entities/column";
import {RowNode} from "./entities/rowNode";
import {_} from "./utils";
import {ColumnApi} from "./columnController/columnController";


export interface FormatGroupNameParams {
    rowGroupIndex:number,
    column:Column,
    node:RowNode
    scope:any
    rowIndex:number
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

    public mapGroupName(rowNodeKey:string, keyMap?:{[id:string]:string}): string {
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

    public formatGroupName (unformatted:string, formattedParams:FormatGroupNameParams):string{
        let columnOfGroupedCol = this.getGroupColumn(formattedParams.rowGroupIndex, formattedParams.column);

        return this.valueFormatterService.formatValue(
            columnOfGroupedCol,
            formattedParams.node,
            formattedParams.scope,
            formattedParams.rowIndex,
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

    public getGroupNameInfo (node:RowNode, formattedParams:FormatGroupNameParams, keyMap?:{[id:string]:string}):GroupNameInfo{
        let mappedGroupName: string = this.mapGroupName(node.key, keyMap);
        let valueFormatted: string = this.formatGroupName(mappedGroupName, formattedParams);
        let actualValue = _.exists(valueFormatted) ? valueFormatted : mappedGroupName;
        return {
            mappedGroupName:mappedGroupName,
            valueFormatted:valueFormatted,
            actualValue:actualValue
        }
    }
}