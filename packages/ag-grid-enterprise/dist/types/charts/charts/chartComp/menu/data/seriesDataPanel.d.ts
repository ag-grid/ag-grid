import { AutoScrollService } from "ag-grid-community";
import { ChartController } from "../../chartController";
import { ColState } from "../../model/chartDataModel";
import { ChartOptionsService } from "../../services/chartOptionsService";
import { DragDataPanel } from "./dragDataPanel";
export declare class SeriesDataPanel extends DragDataPanel {
    private readonly chartOptionsService;
    private readonly title;
    private valueCols;
    private isOpen?;
    private static TEMPLATE;
    private readonly chartMenuService;
    constructor(chartController: ChartController, autoScrollService: AutoScrollService, chartOptionsService: ChartOptionsService, title: string, allowMultipleSelect: boolean, maxSelection: number | undefined, valueCols: ColState[], isOpen?: boolean | undefined);
    private init;
    refresh(valueCols: ColState[]): void;
    private recreate;
    private createSeriesGroup;
    private createLegacySeriesGroup;
    private generateGetSeriesLabel;
    protected destroy(): void;
}
