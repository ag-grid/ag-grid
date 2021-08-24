import { ICellRendererParams } from "../rendering/cellRenderers/iCellRenderer";

interface SparklineFormatter {
}

interface HighlightStyle {
}

interface SparklineOptions {
    type? : string,
    strokeWidth?: number,
    paddingInner?: number,
    paddingOuter?: number,
    formatter?: SparklineFormatter,
    highlightStyle?: HighlightStyle,
}

export interface ISparklineCellRendererParams extends ICellRendererParams {
    sparklineOptions?: SparklineOptions
}
