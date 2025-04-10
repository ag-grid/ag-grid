import type { ColumnModel } from '../columns/columnModel';
import type { ColumnNameService } from '../columns/columnNameService';
import type { AgColumn } from '../entities/agColumn';
import type { RowNode } from '../entities/rowNode';
import type { GridOptionsService } from '../gridOptionsService';
import { _addGridCommonParams, _isFullWidthGroupRow } from '../gridOptionsUtils';
import type {
    ProcessCellForExportParams,
    ProcessGroupHeaderForExportParams,
    ProcessHeaderForExportParams,
    ProcessRowGroupForExportParams,
} from '../interfaces/exportParams';
import type { IColsService } from '../interfaces/iColsService';
import type { ValueService } from '../valueService/valueService';
import type { RowAccumulator, RowSpanningAccumulator } from './iGridSerializer';
import type { GridSerializingParams, GridSerializingSession } from './iGridSerializer';

export abstract class BaseGridSerializingSession<T> implements GridSerializingSession<T> {
    public colModel: ColumnModel;
    private colNames: ColumnNameService;
    public rowGroupColsSvc?: IColsService;
    public valueSvc: ValueService;
    public gos: GridOptionsService;
    public processCellCallback?: (params: ProcessCellForExportParams) => string;
    public processHeaderCallback?: (params: ProcessHeaderForExportParams) => string;
    public processGroupHeaderCallback?: (params: ProcessGroupHeaderForExportParams) => string;
    public processRowGroupCallback?: (params: ProcessRowGroupForExportParams) => string;

    constructor(config: GridSerializingParams) {
        const {
            colModel,
            rowGroupColsSvc,
            colNames,
            valueSvc,
            gos,
            processCellCallback,
            processHeaderCallback,
            processGroupHeaderCallback,
            processRowGroupCallback,
        } = config;

        this.colModel = colModel;
        this.rowGroupColsSvc = rowGroupColsSvc;
        this.colNames = colNames;
        this.valueSvc = valueSvc;
        this.gos = gos;
        this.processCellCallback = processCellCallback;
        this.processHeaderCallback = processHeaderCallback;
        this.processGroupHeaderCallback = processGroupHeaderCallback;
        this.processRowGroupCallback = processRowGroupCallback;
    }

    abstract addCustomContent(customContent: T): void;
    abstract onNewHeaderGroupingRow(): RowSpanningAccumulator;
    abstract onNewHeaderRow(): RowAccumulator;
    abstract onNewBodyRow(node?: RowNode): RowAccumulator;
    abstract parse(): string;

    public prepare(_columnsToExport: AgColumn[]): void {}

    public extractHeaderValue(column: AgColumn): string {
        const value = this.getHeaderName(this.processHeaderCallback, column);
        return value ?? '';
    }

    public extractRowCellValue(
        column: AgColumn,
        currentColumnIndex: number,
        accumulatedRowIndex: number,
        type: string,
        node: RowNode
    ): { value: any; valueFormatted?: string | null } {
        if (
            this.processRowGroupCallback &&
            (this.gos.get('treeData') || node.group) &&
            (!node.rowGroupColumn || column.isRowGroupDisplayed(node.rowGroupColumn.getColId()))
        ) {
            return { value: this.processRowGroupCallback(_addGridCommonParams(this.gos, { column, node })) ?? '' };
        }

        if (this.processCellCallback) {
            return {
                value:
                    this.processCellCallback(
                        _addGridCommonParams(this.gos, {
                            accumulatedRowIndex,
                            column,
                            node,
                            value: this.valueSvc.getValueForDisplay(column, node).value,
                            type,
                            parseValue: (valueToParse: string) =>
                                this.valueSvc.parseValue(
                                    column,
                                    node,
                                    valueToParse,
                                    this.valueSvc.getValue(column, node)
                                ),
                            formatValue: (valueToFormat: any) =>
                                this.valueSvc.formatValue(column, node, valueToFormat) ?? valueToFormat,
                        })
                    ) ?? '',
            };
        }

        const isTreeData = this.gos.get('treeData');
        const valueService = this.valueSvc;

        const isGrandTotalRow = node.level === -1 && node.footer;
        const isFullWidthGroup =
            currentColumnIndex === 0 && _isFullWidthGroupRow(this.gos, node, this.colModel.isPivotMode());
        const isMultiAutoCol = column.colDef.showRowGroup === true && (node.group || isTreeData);
        // when using single auto group column or group row, create arrow separated string of group vals
        if (!isGrandTotalRow && (isFullWidthGroup || isMultiAutoCol)) {
            let concatenatedGroupValue: string = '';
            let pointer: RowNode | null = node;
            while (pointer && pointer.level !== -1) {
                const { value, valueFormatted } = valueService.getValueForDisplay(
                    isFullWidthGroup ? undefined : column, // full width group doesn't have a column
                    pointer,
                    true
                );
                concatenatedGroupValue = ` -> ${valueFormatted ?? value ?? ''}${concatenatedGroupValue}`;
                pointer = pointer.parent;
            }

            return {
                value: concatenatedGroupValue, // don't return the unformatted value; as if the grid detects number it'll not use the concatenated string
                valueFormatted: concatenatedGroupValue,
            };
        }

        const { value, valueFormatted } = valueService.getValueForDisplay(column, node, true);
        return {
            value: value ?? '',
            valueFormatted,
        };
    }

    private getHeaderName(
        callback: ((params: ProcessHeaderForExportParams) => string) | undefined,
        column: AgColumn
    ): string | null {
        if (callback) {
            return callback(_addGridCommonParams(this.gos, { column }));
        }

        return this.colNames.getDisplayNameForColumn(column, 'csv', true);
    }
}
