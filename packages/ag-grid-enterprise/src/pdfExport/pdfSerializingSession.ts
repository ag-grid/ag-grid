import type {
    AgColumn,
    AgColumnGroup,
    CellClassParams,
    CellStyle,
    GridSerializingParams,
    HeaderClassParams,
    HeaderStyle,
    HeaderStyleFunc,
    PdfCellStyle,
    PdfCustomContent,
    PdfExportParams,
    PdfStyleCallbackParams,
    RowAccumulator,
    RowNode,
    RowSpanningAccumulator,
} from 'ag-grid-community';
import { BaseGridSerializingSession, _addGridCommonParams, _isFullWidthGroupRow } from 'ag-grid-community';

import { createPdfDocument } from './pdfDocument';
import { resolvePdfCellStyleColors } from './utils/colors';
import { mapCssStylesToPdfStyle } from './utils/styleMapping';
import { mergePdfCellStyles } from './utils/styles';

export type PdfRowType = 'HEADER_GROUPING' | 'HEADER' | 'BODY' | 'CUSTOM';

interface PdfSerializingCell {
    value: string;
    mergeAcross?: number;
    style?: PdfCellStyle;
}

export interface PdfRow {
    type: PdfRowType;
    cells: PdfSerializingCell[];
    style?: PdfCellStyle;
}

type PdfGridSerializingParams = GridSerializingParams &
    PdfExportParams & {
        resolveColor?: (value?: string) => string | undefined;
    };

export class PdfSerializingSession extends BaseGridSerializingSession<PdfCustomContent> {
    private readonly rows: PdfRow[] = [];
    private columnsToExport: AgColumn[] = [];
    private rowIndex = 0;

    constructor(private readonly config: PdfGridSerializingParams) {
        super(config);
    }

    public override prepare(columnsToExport: AgColumn[]): void {
        super.prepare(columnsToExport);
        this.columnsToExport = [...columnsToExport];
    }

    public addCustomContent(content: PdfCustomContent): void {
        if (!content) {
            return;
        }

        if (typeof content === 'string') {
            const span = Math.max(this.columnsToExport.length - 1, 0);
            const lines = content.split(/\r?\n/);

            for (const line of lines) {
                const row = this.createRow('CUSTOM');
                row.cells.push({
                    value: line,
                    mergeAcross: span || undefined,
                });
            }

            return;
        }

        for (const rowCells of content) {
            const row = this.createRow('CUSTOM');
            for (const cell of rowCells) {
                row.cells.push({
                    value: String(cell?.data?.value ?? ''),
                    mergeAcross: cell?.mergeAcross,
                    style: resolvePdfCellStyleColors(cell?.style, this.config.resolveColor),
                });
            }
        }
    }

    public onNewHeaderGroupingRow(): RowSpanningAccumulator {
        const row = this.createRow('HEADER_GROUPING');

        return {
            onColumn: (columnGroup: AgColumnGroup, header: string, _index: number, span: number) => {
                const value = header ?? '';
                row.cells.push({
                    value,
                    mergeAcross: span || undefined,
                    style: mergePdfCellStyles(
                        this.resolveColumnGroupHeaderPdfStyle(columnGroup),
                        this.resolveCurrentElementPdfStyle({
                            type: 'groupheader',
                            accumulatedRowIndex: this.rowIndex,
                            value,
                            column: columnGroup,
                        })
                    ),
                });
            },
        };
    }

    public onNewHeaderRow(): RowAccumulator {
        const row = this.createRow('HEADER');

        return {
            onColumn: (column: AgColumn) => {
                const value = this.extractHeaderValue(column);
                row.cells.push({
                    value,
                    style: mergePdfCellStyles(
                        this.resolveColumnHeaderPdfStyle(column),
                        this.resolveCurrentElementPdfStyle({
                            type: 'header',
                            accumulatedRowIndex: this.rowIndex,
                            value,
                            column,
                        })
                    ),
                });
            },
        };
    }

    public onNewBodyRow(node?: RowNode): RowAccumulator {
        const row = this.createRow('BODY');
        const rowIndex = this.rowIndex;
        let skipCols = 0;
        let rowStyleResolved = false;

        return {
            onColumn: (column: AgColumn, index: number, currentNode?: RowNode) => {
                if (skipCols > 0) {
                    skipCols -= 1;
                    return;
                }

                const activeNode = currentNode ?? node;
                if (!activeNode) {
                    row.cells.push({ value: '' });
                    return;
                }
                if (!rowStyleResolved) {
                    row.style = mergePdfCellStyles(
                        this.resolveRowPdfStyle(activeNode, rowIndex),
                        this.resolveCurrentElementPdfStyle({
                            type: 'row',
                            accumulatedRowIndex: rowIndex,
                            value: activeNode.data,
                            node: activeNode,
                        })
                    );
                    rowStyleResolved = true;
                }

                const rowCellValue = this.extractRowCellValue({
                    column,
                    node: activeNode,
                    currentColumnIndex: index,
                    accumulatedRowIndex: rowIndex,
                    type: 'pdf',
                    useRawFormula: false,
                });

                const value = String(rowCellValue.valueFormatted ?? rowCellValue.value ?? '');
                const style = mergePdfCellStyles(
                    this.resolveCellPdfStyle(column, activeNode, rowIndex, rowCellValue.value),
                    this.resolveCurrentElementPdfStyle({
                        type: this.isRowGroupCell(column, activeNode, index) ? 'rowgroup' : 'cell',
                        accumulatedRowIndex: rowIndex,
                        value,
                        node: activeNode,
                        column,
                    })
                );
                const remainingColumns = Math.max(this.columnsToExport.length - index, 1);
                const colSpan = Math.min(column.getColSpan(activeNode), remainingColumns);
                const mergeAcross = colSpan > 1 ? colSpan - 1 : undefined;

                if (mergeAcross) {
                    skipCols = mergeAcross;
                }
                row.cells.push({ value, mergeAcross, style });
            },
        };
    }

    public parse(): string {
        return createPdfDocument(this.rows, this.columnsToExport, this.config);
    }

    private createRow(type: PdfRowType): PdfRow {
        this.rowIndex += 1;
        const row: PdfRow = {
            type,
            cells: [],
        };
        this.rows.push(row);
        return row;
    }

    private resolveRowPdfStyle(node: RowNode, accumulatedRowIndex: number): PdfCellStyle | undefined {
        if (this.shouldSkipStyleCallbacks()) {
            return undefined;
        }

        const rowStyle = this.gos.get('rowStyle');
        const getRowStyle = this.gos.getCallback('getRowStyle');
        const rowIndex = this.getNodeRowIndex(node, accumulatedRowIndex);
        const rowStyleResult = getRowStyle?.({
            data: node.data,
            node,
            rowIndex,
        });

        return mapCssStylesToPdfStyle([rowStyle, rowStyleResult], this.config.resolveColor);
    }

    private resolveCellPdfStyle(
        column: AgColumn,
        node: RowNode,
        accumulatedRowIndex: number,
        value: unknown
    ): PdfCellStyle | undefined {
        if (this.shouldSkipStyleCallbacks()) {
            return undefined;
        }

        const colDef = column.getColDef();
        const cellStyle = colDef.cellStyle;
        if (!cellStyle) {
            return undefined;
        }

        const rowIndex = this.getNodeRowIndex(node, accumulatedRowIndex);
        let resolvedCellStyle: CellStyle | null | undefined;
        if (typeof cellStyle === 'function') {
            const cellStyleParams: CellClassParams = _addGridCommonParams(this.gos, {
                data: node.data,
                node,
                rowIndex,
                value,
                column,
                colDef,
            });
            resolvedCellStyle = cellStyle(cellStyleParams);
        } else {
            resolvedCellStyle = cellStyle;
        }

        return mapCssStylesToPdfStyle([resolvedCellStyle], this.config.resolveColor);
    }

    private resolveColumnHeaderPdfStyle(column: AgColumn): PdfCellStyle | undefined {
        const colDef = column.getColDef();
        return this.resolveHeaderPdfStyle(colDef.headerStyle, {
            colDef,
            column,
            floatingFilter: false,
        });
    }

    private resolveColumnGroupHeaderPdfStyle(columnGroup: AgColumnGroup): PdfCellStyle | undefined {
        const colGroupDef = columnGroup.getColGroupDef();
        if (!colGroupDef) {
            return undefined;
        }

        return this.resolveHeaderPdfStyle(colGroupDef.headerStyle, {
            colDef: colGroupDef,
            columnGroup,
            floatingFilter: false,
        });
    }

    private resolveHeaderPdfStyle(
        headerStyle: HeaderStyle | HeaderStyleFunc | undefined,
        params: Pick<HeaderClassParams, 'colDef' | 'column' | 'columnGroup' | 'floatingFilter'>
    ): PdfCellStyle | undefined {
        if (!headerStyle || this.shouldSkipStyleCallbacks()) {
            return undefined;
        }

        const resolvedHeaderStyle: HeaderStyle | null | undefined =
            typeof headerStyle === 'function' ? headerStyle(_addGridCommonParams(this.gos, params)) : headerStyle;

        return mapCssStylesToPdfStyle([resolvedHeaderStyle], this.config.resolveColor);
    }

    private getNodeRowIndex(node: RowNode, accumulatedRowIndex: number): number {
        return node.rowIndex ?? Math.max(accumulatedRowIndex - 1, 0);
    }

    private resolveCurrentElementPdfStyle(
        params: Omit<PdfStyleCallbackParams, 'api' | 'context'>
    ): PdfCellStyle | undefined {
        const callback = this.config.currentElementStyleCallback;
        if (!callback) {
            return undefined;
        }

        const style = callback(_addGridCommonParams(this.gos, params));
        return resolvePdfCellStyleColors(style, this.config.resolveColor);
    }

    private isRowGroupCell(column: AgColumn, node: RowNode, currentColumnIndex: number): boolean {
        const isFullWidthGroup =
            currentColumnIndex === 0 && _isFullWidthGroupRow(this.gos, node, this.colModel.pivotMode);
        if (!(this.gos.get('treeData') || node.group)) {
            return false;
        }

        return column.isRowGroupDisplayed(node.rowGroupColumn?.getColId() ?? '') || isFullWidthGroup;
    }

    private shouldSkipStyleCallbacks(): boolean {
        return this.config.skipStyleCallbacks === true;
    }
}
