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
    PdfStyleCallbackType,
    RowAccumulator,
    RowNode,
    RowPinnedType,
    RowSpanningAccumulator,
} from 'ag-grid-community';
import { BaseGridSerializingSession, _addGridCommonParams, _isFullWidthGroupRow } from 'ag-grid-community';

import { createPdfDocument } from './pdfDocument';
import { resolvePdfCellStyleColors } from './utils/colors';
import { mapCssStylesToPdfStyle } from './utils/styleMapping';
import { mergePdfCellStyles } from './utils/styles';

export type PdfRowType = 'HEADER_GROUPING' | 'HEADER' | 'BODY' | 'CUSTOM';

type PdfElementType = PdfStyleCallbackType | 'custom';

interface PdfSerializingCell {
    value: string;
    mergeAcross?: number;
    style?: PdfCellStyle;
    elementType?: PdfElementType;
    sourceColumn?: AgColumn | AgColumnGroup;
    sourceNode?: RowNode;
    groupLevel?: number;
}

export interface PdfRow {
    type: PdfRowType;
    cells: PdfSerializingCell[];
    style?: PdfCellStyle;
    sourceNode?: RowNode;
    rowPinned?: RowPinnedType;
    groupLevel?: number;
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
                    elementType: 'custom',
                });
            }

            return;
        }

        for (const rowCells of content) {
            const row = this.createRow('CUSTOM');
            const columnCount = Math.max(this.columnsToExport.length, 1);
            let columnIndex = 0;
            for (const cell of rowCells) {
                if (columnIndex >= columnCount) {
                    break;
                }

                const rawMergeAcross = cell?.mergeAcross;
                const requestedSpan =
                    typeof rawMergeAcross === 'number' && Number.isFinite(rawMergeAcross)
                        ? Math.max(Math.floor(rawMergeAcross), 0)
                        : 0;
                const mergeAcross = Math.min(requestedSpan, columnCount - columnIndex - 1);
                row.cells.push({
                    value: String(cell?.data?.value ?? ''),
                    mergeAcross: mergeAcross || undefined,
                    style: resolvePdfCellStyleColors(cell?.style, this.config.resolveColor),
                    elementType: 'custom',
                });
                columnIndex += mergeAcross + 1;
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
                    elementType: 'groupheader',
                    sourceColumn: columnGroup,
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
                    elementType: 'header',
                    sourceColumn: column,
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
        const row = this.createRow('BODY', node);
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
                    row.cells.push({ value: '', elementType: 'cell', sourceColumn: column });
                    return;
                }
                const groupLevel = Math.max(activeNode.level ?? 0, 0);
                const isRowGroupCell = this.isRowGroupCell(column, activeNode, index);
                if (!row.sourceNode) {
                    row.sourceNode = activeNode;
                    row.rowPinned = activeNode.rowPinned;
                    row.groupLevel = groupLevel;
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

                const automaticCellStyle = this.resolveCellPdfStyle(column, activeNode, rowIndex);

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
                    automaticCellStyle,
                    this.resolveCurrentElementPdfStyle({
                        type: isRowGroupCell ? 'rowgroup' : 'cell',
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
                row.cells.push({
                    value,
                    mergeAcross,
                    style,
                    elementType: isRowGroupCell ? 'rowgroup' : 'cell',
                    sourceColumn: column,
                    sourceNode: activeNode,
                    groupLevel,
                });
            },
        };
    }

    public parse(): string {
        return createPdfDocument(this.rows, this.columnsToExport, this.config);
    }

    private createRow(type: PdfRowType, sourceNode?: RowNode): PdfRow {
        this.rowIndex += 1;
        const row: PdfRow = {
            type,
            cells: [],
            sourceNode,
            rowPinned: sourceNode?.rowPinned,
            groupLevel: sourceNode ? Math.max(sourceNode.level ?? 0, 0) : undefined,
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
        accumulatedRowIndex: number
    ): PdfCellStyle | undefined {
        if (this.shouldSkipStyleCallbacks()) {
            return undefined;
        }

        const colDef = column.getColDef();
        const cellStyle = colDef.cellStyle;
        if (!cellStyle && colDef.wrapText == null) {
            return undefined;
        }

        const rowIndex = this.getNodeRowIndex(node, accumulatedRowIndex);
        let resolvedCellStyle: CellStyle | null | undefined;
        if (typeof cellStyle === 'function') {
            const value = this.valueSvc.getDisplayValue(column, node, this.valueFrom, this.transformValues);
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

        const wrapStyle = colDef.wrapText == null ? undefined : { wrapText: colDef.wrapText };
        return mergePdfCellStyles(mapCssStylesToPdfStyle([resolvedCellStyle], this.config.resolveColor), wrapStyle);
    }

    private resolveColumnHeaderPdfStyle(column: AgColumn): PdfCellStyle | undefined {
        const colDef = column.getColDef();
        return mergePdfCellStyles(
            this.resolveHeaderPdfStyle(colDef.headerStyle, {
                colDef,
                column,
                floatingFilter: false,
            }),
            this.shouldSkipStyleCallbacks() || colDef.wrapHeaderText == null
                ? undefined
                : { wrapText: colDef.wrapHeaderText }
        );
    }

    private resolveColumnGroupHeaderPdfStyle(columnGroup: AgColumnGroup): PdfCellStyle | undefined {
        const colGroupDef = columnGroup.getColGroupDef();
        if (!colGroupDef) {
            return undefined;
        }

        return mergePdfCellStyles(
            this.resolveHeaderPdfStyle(colGroupDef.headerStyle, {
                colDef: colGroupDef,
                columnGroup,
                floatingFilter: false,
            }),
            this.shouldSkipStyleCallbacks() || colGroupDef.wrapHeaderText == null
                ? undefined
                : { wrapText: colGroupDef.wrapHeaderText }
        );
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
