import { Column, ITooltipParams, WithoutGridCommon } from "@ag-grid-community/core";
import { BaseDropZonePanel } from "./baseDropZonePanel";
export declare class RowGroupDropZonePanel extends BaseDropZonePanel {
    private columnModel;
    private loggerFactory;
    private dragAndDropService;
    constructor(horizontal: boolean);
    private passBeansUp;
    protected getAriaLabel(): string;
    getTooltipParams(): WithoutGridCommon<ITooltipParams>;
    protected isColumnDroppable(column: Column): boolean;
    protected updateColumns(columns: Column[]): void;
    protected getIconName(): string;
    protected getExistingColumns(): Column[];
}
