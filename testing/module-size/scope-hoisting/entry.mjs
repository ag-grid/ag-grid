/**
 * Entry point for the scope-hoisting check. Gives webpack a realistic module graph
 * to tree shake, and is then executed in jsdom so the same bundle proves the grid
 * still starts — size alone cannot show that a module went missing or that
 * initialisation ran in the wrong order.
 *
 * Registers a representative subset of modules and deliberately registers
 * nothing from the chart, sparkline, advanced-filter, formula or
 * calculated-column subsystems, so all of those should be eliminated.
 */
import {
    CellStyleModule,
    ClientSideRowModelApiModule,
    ClientSideRowModelModule,
    ColumnApiModule,
    ColumnAutoSizeModule,
    CsvExportModule,
    CustomEditorModule,
    DateFilterModule,
    ExternalFilterModule,
    GridStateModule,
    HighlightChangesModule,
    ModuleRegistry,
    NumberEditorModule,
    NumberFilterModule,
    PinnedRowModule,
    RenderApiModule,
    RowApiModule,
    RowAutoHeightModule,
    RowDragModule,
    RowSelectionModule,
    RowStyleModule,
    ScrollApiModule,
    TextEditorModule,
    TextFilterModule,
    UndoRedoEditModule,
    createGrid,
    themeQuartz,
} from 'ag-grid-community';
import {
    CellSelectionModule,
    ClipboardModule,
    ColumnMenuModule,
    ColumnsToolPanelModule,
    ContextMenuModule,
    ExcelExportModule,
    RowGroupingModule,
    ServerSideRowModelModule,
    SetFilterModule,
    TreeDataModule,
} from 'ag-grid-enterprise';

ModuleRegistry.registerModules([
    CellSelectionModule,
    CellStyleModule,
    ClientSideRowModelApiModule,
    ClientSideRowModelModule,
    ClipboardModule,
    ColumnApiModule,
    ColumnAutoSizeModule,
    ColumnMenuModule,
    ColumnsToolPanelModule,
    ContextMenuModule,
    CsvExportModule,
    CustomEditorModule,
    DateFilterModule,
    ExcelExportModule,
    ExternalFilterModule,
    GridStateModule,
    HighlightChangesModule,
    NumberEditorModule,
    NumberFilterModule,
    PinnedRowModule,
    RenderApiModule,
    RowApiModule,
    RowAutoHeightModule,
    RowDragModule,
    RowGroupingModule,
    RowSelectionModule,
    RowStyleModule,
    ScrollApiModule,
    ServerSideRowModelModule,
    SetFilterModule,
    TextEditorModule,
    TextFilterModule,
    TreeDataModule,
    UndoRedoEditModule,
]);

// Published on globalThis so the harness can assert through the API rather than the
// DOM: jsdom has no layout, so row virtualisation would report nothing meaningful.
const container = document.createElement('div');
document.body.appendChild(container);

globalThis.__agScopeHoistingApi = createGrid(container, {
    theme: themeQuartz,
    columnDefs: [{ field: 'make', filter: 'agSetColumnFilter' }, { field: 'price' }],
    rowData: [
        { make: 'Tesla', price: 64950 },
        { make: 'Ford', price: 33850 },
        { make: 'Toyota', price: 29600 },
    ],
});
