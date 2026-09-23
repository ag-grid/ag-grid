import type {
    AgColumn,
    AgColumnGroup,
    CellClassParams,
    CellStyle,
    GridHeaderCell,
    GridSerializingParams,
    HeaderClassParams,
    HeaderRowAccumulator,
    HeaderStyle,
    HeaderStyleFunc,
    PdfCellHyperlinkCallbackParams,
    PdfCellImageCallbackParams,
    PdfCellImageResult,
    PdfCellStyle,
    PdfCustomContent,
    PdfExportParams,
    PdfImage,
    PdfStyleCallbackParams,
    RowAccumulator,
    RowNode,
    RowPinnedType,
} from 'ag-grid-community';
import { BaseGridSerializingSession, _addGridCommonParams, _isFullWidthGroupRow } from 'ag-grid-community';

import { createPdfDocument } from './pdfDocument';
import { resolvePdfCellStyleColors } from './utils/colors';
import { normaliseHyperlink } from './utils/hyperlinks';
import { mapCssStylesToPdfStyle } from './utils/styleMapping';
import { mergePdfCellStyles } from './utils/styles';

export type PdfRowType = 'HEADER_GROUPING' | 'HEADER' | 'BODY' | 'CUSTOM';

type PdfElementType = 'cell' | 'row' | 'rowgroup' | 'header' | 'groupheader' | 'custom';

interface PdfSerializingCell {
    value: string;
    hyperlink?: string;
    image?: PdfImage;
    mergeAcross?: number;
    mergeDown?: number;
    covered?: boolean;
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

// distributes Omit over the params union so the discriminated members are preserved.
type OmitGridCommon<T> = T extends unknown ? Omit<T, 'api' | 'context'> : never;
type PdfStyleCallbackParamsInput = OmitGridCommon<PdfStyleCallbackParams>;

export class PdfSerializingSession extends BaseGridSerializingSession<PdfCustomContent> {
    public override readonly useGridHeaderLayout: boolean = true;
    private readonly rows: PdfRow[] = [];
    private columnsToExport: AgColumn[] = [];
    private rowIndex = 0;
    private bodyRowIndex = -1;

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
                    hyperlink: normaliseHyperlink(cell?.data?.hyperlink),
                    image: cell?.data?.image,
                    mergeAcross: mergeAcross || undefined,
                    style: resolvePdfCellStyleColors(cell?.style, this.config.resolveColor),
                    elementType: 'custom',
                });
                columnIndex += mergeAcross + 1;
            }
        }
    }

    public onNewHeaderGroupingRow(): HeaderRowAccumulator {
        const row = this.createRow('HEADER_GROUPING');
        return { onCell: this.createHeaderCellAccumulator(row) };
    }

    public onNewHeaderRow(): HeaderRowAccumulator {
        const row = this.createRow('HEADER');
        return { onCell: this.createHeaderCellAccumulator(row) };
    }

    private createHeaderCellAccumulator(row: PdfRow): (cell: GridHeaderCell) => void {
        return (cell) => {
            if (cell.type === 'covered') {
                row.cells.push({ value: '', covered: true });
                return;
            }

            if (cell.type === 'column') {
                const column = cell.column;
                const value = this.extractHeaderValue(column);
                row.cells.push({
                    value,
                    mergeDown: cell.rowSpan > 1 ? cell.rowSpan - 1 : undefined,
                    elementType: 'header',
                    sourceColumn: column,
                    style: mergePdfCellStyles(
                        this.resolveColumnHeaderPdfStyle(column),
                        this.resolveCallbackPdfStyle({
                            type: 'header',
                            accumulatedRowIndex: this.rowIndex,
                            value,
                            column,
                        })
                    ),
                });
                return;
            }

            const columnGroup = cell.column;
            const value = columnGroup ? this.extractGroupHeaderValue(columnGroup) : '';
            row.cells.push({
                value,
                mergeAcross: cell.columnSpan > 1 ? cell.columnSpan - 1 : undefined,
                elementType: 'groupheader',
                sourceColumn: columnGroup,
                style: columnGroup
                    ? mergePdfCellStyles(
                          this.resolveColumnGroupHeaderPdfStyle(columnGroup),
                          this.resolveCallbackPdfStyle({
                              type: 'groupheader',
                              accumulatedRowIndex: this.rowIndex,
                              value,
                              column: columnGroup,
                          })
                      )
                    : undefined,
            });
        };
    }

    public onNewBodyRow(node?: RowNode): RowAccumulator {
        const row = this.createRow('BODY', node);
        const rowIndex = this.rowIndex;
        const exportedColumnCount = this.columnsToExport.length;
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
                const groupLevel = Math.max(activeNode.uiLevel ?? activeNode.level ?? 0, 0);
                const isFullWidthGroup = this.isFullWidthGroupCell(activeNode, index);
                const isRowGroupCell = this.isRowGroupCell(column, activeNode, isFullWidthGroup);
                if (!row.sourceNode) {
                    row.sourceNode = activeNode;
                    row.rowPinned = activeNode.rowPinned;
                    row.groupLevel = groupLevel;
                }
                if (!rowStyleResolved) {
                    row.style = mergePdfCellStyles(
                        this.resolveRowPdfStyle(activeNode),
                        this.resolveCallbackPdfStyle({
                            type: 'row',
                            accumulatedRowIndex: rowIndex,
                            value: activeNode.data,
                            node: activeNode,
                        })
                    );
                    rowStyleResolved = true;
                }

                const automaticCellStyle = this.resolveCellPdfStyle(column, activeNode);

                const rowCellValue = this.extractPdfRowCellValue(
                    column,
                    activeNode,
                    index,
                    rowIndex,
                    isRowGroupCell,
                    isFullWidthGroup
                );

                const processedValue = String(rowCellValue.valueFormatted ?? rowCellValue.value ?? '');
                const imageResult = this.resolveCellImage(processedValue, column, activeNode, rowIndex);
                const value = imageResult ? String(imageResult.value ?? '') : processedValue;
                const style = mergePdfCellStyles(
                    automaticCellStyle,
                    this.resolveCallbackPdfStyle({
                        type: isRowGroupCell ? 'rowgroup' : 'cell',
                        accumulatedRowIndex: rowIndex,
                        value,
                        node: activeNode,
                        column,
                    })
                );
                const remainingColumns = Math.max(exportedColumnCount - index, 1);
                const colSpan = Math.min(column.getColSpan(activeNode), remainingColumns);
                const mergeAcross = colSpan > 1 ? colSpan - 1 : undefined;

                if (mergeAcross) {
                    skipCols = mergeAcross;
                }
                row.cells.push({
                    value,
                    hyperlink: this.resolveCellHyperlink(value, column, activeNode, rowIndex),
                    image: imageResult?.image,
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
        if (this.config.direction !== 'rtl') {
            return createPdfDocument(this.rows, this.columnsToExport, this.config);
        }

        const rows = this.rows.map((row) => ({ ...row, cells: [...row.cells].reverse() }));
        const columnsToExport = [...this.columnsToExport].reverse();

        return createPdfDocument(rows, columnsToExport, this.config);
    }

    private createRow(type: PdfRowType, sourceNode?: RowNode): PdfRow {
        this.rowIndex += 1;
        if (type === 'BODY') {
            this.bodyRowIndex += 1;
        }
        const row: PdfRow = {
            type,
            cells: [],
            sourceNode,
            rowPinned: sourceNode?.rowPinned,
            groupLevel: sourceNode ? Math.max(sourceNode.uiLevel ?? sourceNode.level ?? 0, 0) : undefined,
        };
        this.rows.push(row);
        return row;
    }

    private resolveRowPdfStyle(node: RowNode): PdfCellStyle | undefined {
        if (this.shouldSkipGridStyles()) {
            return undefined;
        }

        const rowStyle = this.gos.get('rowStyle');
        const getRowStyle = this.gos.getCallback('getRowStyle');
        const rowIndex = this.getNodeRowIndex(node);
        const rowStyleResult = getRowStyle?.({
            data: node.data,
            node,
            rowIndex,
        });

        return mapCssStylesToPdfStyle([rowStyle, rowStyleResult], this.config.resolveColor);
    }

    private extractPdfRowCellValue(
        column: AgColumn,
        node: RowNode,
        currentColumnIndex: number,
        accumulatedRowIndex: number,
        isRowGroupCell: boolean,
        isFullWidthGroup: boolean
    ): { value: unknown; valueFormatted?: string | null } {
        if (isRowGroupCell && !this.processCellCallback && !this.processRowGroupCallback) {
            const { value, valueFormatted } = this.valueSvc.getValueForDisplay({
                column: isFullWidthGroup ? undefined : column,
                node,
                includeValueFormatted: true,
                exporting: true,
                from: this.valueFrom,
                transformValues: this.transformValues,
            });
            return { value: value ?? '', valueFormatted };
        }

        return this.extractRowCellValue({
            column,
            node,
            currentColumnIndex,
            accumulatedRowIndex,
            type: 'pdf',
            useRawFormula: false,
        });
    }

    private resolveCellPdfStyle(column: AgColumn, node: RowNode): PdfCellStyle | undefined {
        if (this.shouldSkipGridStyles()) {
            return undefined;
        }

        const colDef = column.getColDef();
        const cellStyle = colDef.cellStyle;
        if (!cellStyle && colDef.wrapText == null) {
            return undefined;
        }

        const rowIndex = this.getNodeRowIndex(node);
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
        return mergePdfCellStyles(wrapStyle, mapCssStylesToPdfStyle([resolvedCellStyle], this.config.resolveColor));
    }

    private resolveColumnHeaderPdfStyle(column: AgColumn): PdfCellStyle | undefined {
        const colDef = column.getColDef();
        return mergePdfCellStyles(
            this.resolveHeaderPdfStyle(colDef.headerStyle, {
                colDef,
                column,
                floatingFilter: false,
            }),
            this.shouldSkipGridStyles() || colDef.wrapHeaderText == null
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
            this.shouldSkipGridStyles() || colGroupDef.wrapHeaderText == null
                ? undefined
                : { wrapText: colGroupDef.wrapHeaderText }
        );
    }

    private resolveHeaderPdfStyle(
        headerStyle: HeaderStyle | HeaderStyleFunc | undefined,
        params: Pick<HeaderClassParams, 'colDef' | 'column' | 'columnGroup' | 'floatingFilter'>
    ): PdfCellStyle | undefined {
        if (!headerStyle || this.shouldSkipGridStyles()) {
            return undefined;
        }

        const resolvedHeaderStyle: HeaderStyle | null | undefined =
            typeof headerStyle === 'function' ? headerStyle(_addGridCommonParams(this.gos, params)) : headerStyle;

        return mapCssStylesToPdfStyle([resolvedHeaderStyle], this.config.resolveColor);
    }

    private getNodeRowIndex(node: RowNode): number {
        // the accumulated row index counts header/custom rows too, so fall back to the body-only counter.
        return node.rowIndex ?? Math.max(this.bodyRowIndex, 0);
    }

    private resolveCallbackPdfStyle(params: PdfStyleCallbackParamsInput): PdfCellStyle | undefined {
        const callback = this.config.processStyleCallback;
        if (!callback) {
            return undefined;
        }

        const style = callback(_addGridCommonParams(this.gos, params) as PdfStyleCallbackParams);
        return resolvePdfCellStyleColors(style, this.config.resolveColor);
    }

    private resolveCellHyperlink(
        value: string,
        column: AgColumn,
        node: RowNode,
        accumulatedRowIndex: number
    ): string | undefined {
        const callback = this.config.processCellHyperlinkCallback;
        if (!callback) {
            return undefined;
        }

        const params: Omit<PdfCellHyperlinkCallbackParams, 'api' | 'context'> = {
            value,
            accumulatedRowIndex,
            node,
            column,
        };
        return normaliseHyperlink(callback(_addGridCommonParams(this.gos, params) as PdfCellHyperlinkCallbackParams));
    }

    private resolveCellImage(
        value: string,
        column: AgColumn,
        node: RowNode,
        accumulatedRowIndex: number
    ): PdfCellImageResult | undefined {
        const callback = this.config.addImageToCell;
        if (!callback) {
            return undefined;
        }

        const params: Omit<PdfCellImageCallbackParams, 'api' | 'context'> = {
            value,
            accumulatedRowIndex,
            node,
            column,
        };
        return callback(_addGridCommonParams(this.gos, params) as PdfCellImageCallbackParams) ?? undefined;
    }

    private isRowGroupCell(column: AgColumn, node: RowNode, isFullWidthGroup: boolean): boolean {
        if (!(this.gos.get('treeData') || node.group)) {
            return false;
        }

        return column.isRowGroupDisplayed(node.rowGroupColumn?.getColId() ?? '') || isFullWidthGroup;
    }

    private isFullWidthGroupCell(node: RowNode, currentColumnIndex: number): boolean {
        return currentColumnIndex === 0 && _isFullWidthGroupRow(this.gos, node, this.colModel.pivotMode);
    }

    private shouldSkipGridStyles(): boolean {
        return this.config.skipGridStyles === true;
    }
}
