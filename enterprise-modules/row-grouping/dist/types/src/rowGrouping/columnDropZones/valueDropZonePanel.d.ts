import { Column, DraggingEvent, ITooltipParams, WithoutGridCommon } from "@ag-grid-community/core";
import { BaseDropZonePanel } from "./baseDropZonePanel";
export declare class ValuesDropZonePanel extends BaseDropZonePanel {
    constructor(horizontal: boolean);
    private passBeansUp;
    protected getAriaLabel(): string;
    getTooltipParams(): WithoutGridCommon<ITooltipParams>;
    protected getIconName(): string;
    protected isItemDroppable(column: Column, draggingEvent: DraggingEvent): boolean;
    protected updateItems(columns: Column[]): void;
    protected getExistingItems(): Column[];
}
