// Type definitions for ag-grid v11.0.0
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ceolter/>
import { Column } from "./entities/column";
import { RowNode } from "./entities/rowNode";
import { GroupCellRendererParams } from "./rendering/cellRenderers/groupCellRenderer";
export interface GroupNameInfoParams {
    rowGroupIndex: number;
    column: Column;
    scope: any;
    rowIndex: number;
    keyMap: {
        [id: string]: string;
    };
}
export interface GroupNameValues {
    mappedGroupName: string;
    valueFormatted: string;
    actualValue: string;
}
export interface GroupNameInfo extends GroupNameValues {
    column: Column;
}
export declare class GroupValueService {
    private valueFormatterService;
    private columnApi;
    private mapGroupName(rowNodeKey, keyMap?);
    private formatGroupName(unformatted, formattedParams, node);
    getGroupColumn(rowGroupIndex: number, column: Column): Column;
    getGroupNameValuesByRawValue(rawValue: string, params: GroupNameInfoParams): GroupNameValues;
    getGroupNameValuesByNode(params: GroupNameInfoParams, node: RowNode): GroupNameValues;
    private getGroupNameValues(rawValue, params, node?);
    assignToParams<T extends GroupCellRendererParams>(receiver: T, params: GroupNameInfoParams, node: RowNode): T;
    getGroupNameInfo(column: Column, rowGroupIndex: number, rowIndex: number, rawValue: string): GroupNameInfo;
    private extractInfo(rawValue, params, column);
    enrich(values: GroupNameValues, column: Column): GroupNameInfo;
}
