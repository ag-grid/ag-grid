import { BeanStub, Column, ColumnChooserParams, IColumnChooserFactory, ShowColumnChooserParams } from "ag-grid-community";
import { PrimaryColsPanel } from "ag-grid-charts-enterprise";
export declare class ColumnChooserFactory extends BeanStub implements IColumnChooserFactory {
    private readonly focusService;
    private readonly menuUtils;
    private readonly columnModel;
    private activeColumnChooser;
    private activeColumnChooserDialog;
    createColumnSelectPanel(parent: BeanStub, column?: Column | null, draggable?: boolean, params?: ColumnChooserParams): PrimaryColsPanel;
    showColumnChooser({ column, chooserParams, eventSource }: ShowColumnChooserParams): void;
    hideActiveColumnChooser(): void;
    private dispatchVisibleChangedEvent;
}
