import { Column, ITooltipParams } from "@ag-grid-community/core";
import { BaseDropZonePanel } from "./baseDropZonePanel";
export declare class PivotDropZonePanel extends BaseDropZonePanel {
    private columnModel;
    private loggerFactory;
    private dragAndDropService;
    private columnApi;
    private gridApi;
    constructor(horizontal: boolean);
    private passBeansUp;
    protected getAriaLabel(): string;
    getTooltipParams(): ITooltipParams;
    private refresh;
    private checkVisibility;
    protected isColumnDroppable(column: Column): boolean;
    protected updateColumns(columns: Column[]): void;
    protected getIconName(): string;
    protected getExistingColumns(): Column[];
}
