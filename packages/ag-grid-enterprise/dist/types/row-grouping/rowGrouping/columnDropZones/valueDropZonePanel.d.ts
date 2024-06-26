import type { AgColumn, DragAndDropIcon, DraggingEvent, ITooltipParams, WithoutGridCommon } from 'ag-grid-community';
import { BaseDropZonePanel } from './baseDropZonePanel';
export declare class ValuesDropZonePanel extends BaseDropZonePanel {
    constructor(horizontal: boolean);
    postConstruct(): void;
    protected getAriaLabel(): string;
    getTooltipParams(): WithoutGridCommon<ITooltipParams>;
    protected getIconName(): DragAndDropIcon;
    protected isItemDroppable(column: AgColumn, draggingEvent: DraggingEvent): boolean;
    protected updateItems(columns: AgColumn[]): void;
    protected getExistingItems(): AgColumn[];
}
