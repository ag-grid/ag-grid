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
import type { IRowGroupColsService } from '../interfaces/iColsService';
import type { CellValueResolveFrom } from '../interfaces/iEditService';
import type { LogService } from '../validation/logService';
import type { ValueService } from '../valueService/valueService';
import type {
    GridSerializingParams,
    GridSerializingSession,
    RowAccumulator,
    RowSpanningAccumulator,
} from './iGridSerializer';

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export abstract class BaseGridSerializingSession<T> implements GridSerializingSession<T> {
    public colModel: ColumnModel;
    private readonly colNames: ColumnNameService;
    public rowGroupColsSvc?: IRowGroupColsService;
    public valueSvc: ValueService;
    public gos: GridOptionsService;
    public readonly log: LogService;
    public processCellCallback?: (params: ProcessCellForExportParams) => string;
    public processHeaderCallback?: (params: ProcessHeaderForExportParams) => string;
    public processGroupHeaderCallback?: (params: ProcessGroupHeaderForExportParams) => string;
    public processRowGroupCallback?: (params: ProcessRowGroupForExportParams) => string;
    public valueFrom: CellValueResolveFrom;
    /** Apply the Show Values As transform on top of the `valueFrom` base. */
    public transformValues: boolean;

    constructor(config: GridSerializingParams) {
        const {
            colModel,
            rowGroupColsSvc,
            colNames,
            valueSvc,
            gos,
            log,
            processCellCallback,
            processHeaderCallback,
            processGroupHeaderCallback,
            processRowGroupCallback,
            valueFrom,
            transformValues,
        } = config;

        this.colModel = colModel;
        this.rowGroupColsSvc = rowGroupColsSvc;
        this.colNames = colNames;
        this.valueSvc = valueSvc;
        this.gos = gos;
        this.log = log;
        this.processCellCallback = processCellCallback;
        this.processHeaderCallback = processHeaderCallback;
        this.processGroupHeaderCallback = processGroupHeaderCallback;
        this.processRowGroupCallback = processRowGroupCallback;
        this.valueFrom = valueFrom || 'data';
        // Exports default to the displayed (Show Values As transformed) value.
        this.transformValues = transformValues ?? true;
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

    public extractRowCellValue(params: {
        column: AgColumn;
        node: RowNode;
        currentColumnIndex: number;
        accumulatedRowIndex: number;
        type: string;
        useRawFormula: boolean;
    }): { value: any; valueFormatted?: string | null } {
        const { column, node, currentColumnIndex, accumulatedRowIndex, type, useRawFormula } = params;
        const isFullWidthGroup =
            currentColumnIndex === 0 && _isFullWidthGroupRow(this.gos, node, this.colModel.pivotMode);
        if (
            this.processRowGroupCallback &&
            (this.gos.get('treeData') || node.group) &&
            (column.isRowGroupDisplayed(node.rowGroupColumn?.colId ?? '') || isFullWidthGroup)
        ) {
            return { value: this.processRowGroupCallback(_addGridCommonParams(this.gos, { column, node })) ?? '' };
        }

        const valueSvc = this.valueSvc;
        if (this.processCellCallback) {
            const valueFrom = this.valueFrom;
            return {
                value:
                    this.processCellCallback(
                        _addGridCommonParams(this.gos, {
                            accumulatedRowIndex,
                            column,
                            node,
                            value: valueSvc.getDisplayValue(column, node, valueFrom, this.transformValues),
                            type,
                            parseValue: (valueToParse: string) =>
                                valueSvc.parseValue(
                                    column,
                                    node,
                                    valueToParse,
                                    valueSvc.getValue(column, node, valueFrom)
                                ),
                            formatValue: (valueToFormat: any) =>
                                (this.transformValues
                                    ? valueSvc.formatTransformedValue(column, node, valueToFormat)
                                    : undefined) ??
                                valueSvc.formatValue(column, node, valueToFormat) ??
                                valueToFormat,
                        })
                    ) ?? '',
            };
        }

        const isTreeData = this.gos.get('treeData');

        const isGrandTotalRow = node.level === -1 && node.footer;
        const isMultiAutoCol = column.showRowGroup === true && (node.group || isTreeData);
        // when using single auto group column or group row, create arrow separated string of group vals
        if (!isGrandTotalRow && (isFullWidthGroup || isMultiAutoCol)) {
            let concatenatedGroupValue: string = '';
            let pointer: RowNode | null = node;
            while (pointer && pointer.level !== -1) {
                const { value, valueFormatted } = valueSvc.getValueForDisplay({
                    column: isFullWidthGroup ? undefined : column, // full width group doesn't have a column
                    node: pointer,
                    includeValueFormatted: true,
                    exporting: true,
                    from: this.valueFrom,
                    transformValues: this.transformValues,
                });
                concatenatedGroupValue = ` -> ${valueFormatted ?? value ?? ''}${concatenatedGroupValue}`;
                pointer = pointer.parent;
            }

            return {
                value: concatenatedGroupValue, // don't return the unformatted value; as if the grid detects number it'll not use the concatenated string
                valueFormatted: concatenatedGroupValue,
            };
        }

        const { value, valueFormatted } = valueSvc.getValueForDisplay({
            column,
            node,
            includeValueFormatted: true,
            exporting: true,
            useRawFormula,
            from: this.valueFrom,
            transformValues: this.transformValues,
        });
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
