import { ICellRendererParams } from "../rendering/cellRenderers/iCellRenderer";

export interface ISparklineCellRendererParams extends ICellRendererParams {
    sparklineType: string;
}
