import type { AgColumn, DragAndDropIcon, DraggingEvent, ITooltipParams, WithoutGridCommon } from 'ag-grid-community';
import { BaseDropZonePanel } from './baseDropZonePanel';
export declare class PivotDropZonePanel extends BaseDropZonePanel {
    constructor(horizontal: boolean);
    postConstruct(): void;
    protected getAriaLabel(): string;
    getTooltipParams(): WithoutGridCommon<ITooltipParams>;
    private refresh;
    private checkVisibility;
    protected isItemDroppable(column: AgColumn, draggingEvent: DraggingEvent): boolean;
    protected updateItems(columns: AgColumn[]): void;
    protected getIconName(): DragAndDropIcon;
    protected getExistingItems(): AgColumn[];
}
