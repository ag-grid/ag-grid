import type { ExportFileNameGetter, ExportParams } from './exportParams';
import type { Column, ColumnGroup } from './iColumn';
import type { AgGridCommon } from './iCommon';
import type { IRowNode } from './iRowNode';

export type PdfPageOrientation = 'portrait' | 'landscape';

export type PdfFontFamily = 'Helvetica' | 'Helvetica-Bold' | 'Times-Roman' | 'Times-Bold' | 'Courier' | 'Courier-Bold';

export type PdfPageSize =
    | 'A4'
    | 'Letter'
    | {
          /** Page width in points. */
          width: number;
          /** Page height in points. */
          height: number;
      };

export interface PdfMargin {
    /** Top margin in points. */
    top?: number;
    /** Right margin in points. */
    right?: number;
    /** Bottom margin in points. */
    bottom?: number;
    /** Left margin in points. */
    left?: number;
}

export type PdfTextAlignment = 'left' | 'center' | 'right';

export type PdfFontWeight = 'normal' | 'bold';

export type PdfTextOverflow = 'clip' | 'ellipsis';

export type PdfColumnWidth = number | 'auto' | 'grid';

export interface PdfColumnWidthCallbackParams {
    /** Column being exported, or `null` for columns created by custom content. */
    column: Column | null;
    /** Zero-based exported column index. */
    index: number;
}

export type PdfColumnWidthCallback = (params: PdfColumnWidthCallbackParams) => PdfColumnWidth | null | undefined;

export interface PdfCellStyle {
    /**
     * Font size in points.
     */
    fontSize?: number;
    /**
     * Font family.
     */
    fontFamily?: PdfFontFamily;
    /**
     * Font weight. When omitted, the weight from the resolved font family is preserved.
     */
    fontWeight?: PdfFontWeight;
    /**
     * Text colour.
     */
    color?: string;
    /**
     * Background colour.
     */
    backgroundColor?: string;
    /**
     * Border colour.
     */
    borderColor?: string;
    /**
     * Border width in points.
     * Defaults to 1 when `borderColor` is set, otherwise 0.
     */
    borderWidth?: number;
    /**
     * Padding inside the cell in points. A number applies to all sides.
     */
    padding?: number | PdfMargin;
    /**
     * Margin around the cell in points. A number applies to all sides.
     * Only applies to the document title.
     */
    margin?: number | PdfMargin;
    /**
     * Horizontal alignment for the cell text.
     */
    alignment?: PdfTextAlignment;
    /**
     * Whether text should wrap onto multiple lines. Wrapped content increases the row height as required.
     */
    wrapText?: boolean;
    /**
     * Whether explicit line breaks should be preserved.
     * @default true when wrapText is true, otherwise false
     */
    preserveLineBreaks?: boolean;
    /**
     * Whether repeated, leading and trailing spaces should be preserved when text wraps.
     * @default false
     */
    preserveSpaces?: boolean;
    /**
     * Distance between text baselines in points.
     * @default fontSize
     */
    lineHeight?: number;
    /**
     * Maximum number of rendered text lines.
     */
    maxLines?: number;
    /**
     * How text exceeding the available width, height or line limit is indicated.
     * @default 'ellipsis'
     */
    overflow?: PdfTextOverflow;
}

export interface PdfCellData {
    /** The value of the cell. */
    value: string | null;
}

export interface PdfCell {
    /** The data that will be added to the cell. */
    data: PdfCellData;
    /**
     * The number of cells to span across (1 means span 2 columns).
     * @default 0
     */
    mergeAcross?: number;
    /**
     * Optional styling for the cell.
     */
    style?: PdfCellStyle;
}

export type PdfCustomContent = PdfCell[][] | string;

export type PdfStyleCallbackType = 'cell' | 'row' | 'rowgroup' | 'header' | 'groupheader';

export interface PdfStyleCallbackParams<TData = any, TContext = any> extends AgGridCommon<TData, TContext> {
    /**
     * The exported element type currently being styled.
     */
    type: PdfStyleCallbackType;
    /**
     * 1-based index of the current exported row.
     */
    accumulatedRowIndex: number;
    /**
     * The current value for the exported element.
     */
    value: any;
    /**
     * The row node for row and body cell elements.
     */
    node?: IRowNode<TData> | null;
    /**
     * The current column or column group for header/cell elements.
     */
    column?: Column | ColumnGroup;
}

export interface PdfExportStyles {
    /** CSS colour strings that map to theme colour keys. */
    /**
     * Background colour for the PDF page.
     * Defaults to the theme `backgroundColor`.
     */
    backgroundColor?: string;
    /**
     * Background colour for body rows.
     * Defaults to the theme `dataBackgroundColor`.
     */
    dataBackgroundColor?: string;
    /**
     * Alternate background colour for odd body rows.
     * Defaults to the theme `oddRowBackgroundColor`.
     */
    oddRowBackgroundColor?: string;
    /**
     * Text colour for body rows.
     * Defaults to the theme `foregroundColor`.
     */
    foregroundColor?: string;
    /**
     * Background colour for header rows.
     * Defaults to the theme `headerBackgroundColor`.
     */
    headerBackgroundColor?: string;
    /**
     * Text colour for header rows.
     * Defaults to the theme `headerTextColor`.
     */
    headerTextColor?: string;
    /**
     * Border colour for cell outlines.
     * Defaults to the theme `borderColor`.
     */
    borderColor?: string;
}

interface PdfFileParams {
    /**
     * String to use as the file name or a function that returns a string.
     * @default 'export.pdf'
     */
    fileName?: string | ExportFileNameGetter;
    /**
     * The mimeType of the PDF file.
     * @default 'application/pdf'
     */
    mimeType?: string;
}

export interface PdfExportParams extends ExportParams<PdfCustomContent>, PdfFileParams {
    /**
     * The document title stored in the PDF metadata.
     * When set, a visible title is rendered above the exported table.
     * Provide a `PdfCell` to style the title using `PdfCell.style`.
     */
    documentTitle?: string | PdfCell;
    /**
     * Override PDF colours. Any missing values fall back to the current theme.
     */
    pdfStyles?: PdfExportStyles;
    /**
     * Set to `true` to skip evaluating grid style callbacks and style definitions
     * (`rowStyle`, `getRowStyle`, `colDef.cellStyle`, `colDef.headerStyle`).
     * Use this when you want to rely only on `pdfStyles` and theme defaults.
     * @default false
     */
    skipStyleCallbacks?: boolean;
    /**
     * Callback that allows overriding styles for rows, cells, row groups,
     * headers and group headers during PDF export.
     * Returned styles are merged after resolved grid styles and take precedence.
     */
    currentElementStyleCallback?(params: PdfStyleCallbackParams): PdfCellStyle | undefined;
    /**
     * The size of the PDF page. Defaults to A4.
     * @default 'A4'
     */
    pageSize?: PdfPageSize;
    /**
     * Page orientation.
     * @default 'landscape'
     */
    pageOrientation?: PdfPageOrientation;
    /**
     * Page margins in points. A number applies to all sides.
     * @default 36
     */
    margin?: number | PdfMargin;
    /**
     * Base font size for body rows in points.
     * @default 10
     */
    fontSize?: number;
    /**
     * Base font size for header rows in points.
     * @default 11
     */
    headerFontSize?: number;
    /**
     * Base font family for body rows.
     * @default 'Helvetica'
     */
    fontFamily?: PdfFontFamily;
    /**
     * Font family for header rows.
     * @default derived bold variant of `fontFamily`
     */
    headerFontFamily?: PdfFontFamily;
    /**
     * Padding inside each cell in points.
     * @default 4
     */
    cellPadding?: number;
    /**
     * Controls exported column widths. Use `auto` to size from exported content, `grid` to use the
     * current grid width, a number for a width in points, or a callback for per-column control.
     * Widths are proportionally reduced when their total exceeds the printable page width.
     * By default, current grid widths are used except for the Row Numbers column, which is sized
     * from its exported content.
     */
    columnWidth?: PdfColumnWidth | PdfColumnWidthCallback;
    /**
     * Whether table cell text should wrap onto multiple lines. This can be overridden for individual
     * rows or cells with `PdfCellStyle.wrapText`.
     * @default false
     */
    wrapText?: boolean;
    /**
     * Default distance between text baselines in points.
     * @default fontSize
     */
    lineHeight?: number;
    /**
     * Default maximum number of rendered text lines.
     */
    maxLines?: number;
    /**
     * Default policy for text exceeding width, height or line limits.
     * @default 'ellipsis'
     */
    overflow?: PdfTextOverflow;
    /**
     * Horizontal indentation in points for each row-group level.
     * @default 12
     */
    rowGroupIndentSize?: number;
    /**
     * Height of body rows in points. If omitted, calculated from font size and padding.
     */
    rowHeight?: number;
    /**
     * Height of header rows in points. If omitted, calculated from header font size and padding.
     */
    headerRowHeight?: number;
    /**
     * Set to `false` to avoid repeating header rows on each page.
     * @default true
     */
    repeatHeader?: boolean;
    /**
     * Set to `false` to skip drawing cell borders.
     * @default true
     */
    drawCellBorders?: boolean;
}

export interface IPdfCreator {
    getDataAsPdf(params?: PdfExportParams): Blob | undefined;
    exportDataAsPdf(params?: PdfExportParams): void;
}
