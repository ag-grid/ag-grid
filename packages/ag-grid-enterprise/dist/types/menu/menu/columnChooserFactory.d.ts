import type { AgColumn, BeanCollection, ColumnChooserParams, IColumnChooserFactory, NamedBean, ShowColumnChooserParams } from 'ag-grid-community';
import { BeanStub } from 'ag-grid-community';
import { AgPrimaryCols } from 'ag-grid-enterprise';
export declare class ColumnChooserFactory extends BeanStub implements NamedBean, IColumnChooserFactory {
    beanName: "columnChooserFactory";
    private focusService;
    private menuUtils;
    private visibleColsService;
    wireBeans(beans: BeanCollection): void;
    private activeColumnChooser;
    private activeColumnChooserDialog;
    createColumnSelectPanel(parent: BeanStub<any>, column?: AgColumn | null, draggable?: boolean, params?: ColumnChooserParams): AgPrimaryCols;
    showColumnChooser({ column, chooserParams, eventSource }: ShowColumnChooserParams): void;
    hideActiveColumnChooser(): void;
    private dispatchVisibleChangedEvent;
}
