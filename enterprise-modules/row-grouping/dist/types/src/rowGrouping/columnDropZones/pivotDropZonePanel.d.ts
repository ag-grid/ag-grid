import { Column, DraggingEvent, ITooltipParams, WithoutGridCommon } from "@ag-grid-community/core";
import { BaseDropZonePanel } from "./baseDropZonePanel";
export declare class PivotDropZonePanel extends BaseDropZonePanel {
    constructor(horizontal: boolean);
    private passBeansUp;
    protected getAriaLabel(): string;
    getTooltipParams(): WithoutGridCommon<ITooltipParams>;
    private refresh;
    private checkVisibility;
    protected isItemDroppable(column: Column, draggingEvent: DraggingEvent): boolean;
    protected updateItems(columns: Column[]): void;
    protected getIconName(): string;
    protected getExistingItems(): Column[];
}
