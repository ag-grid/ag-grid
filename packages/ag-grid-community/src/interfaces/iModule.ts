import type { GridApi } from '../api/gridApi';
import type { ApiFunction, ApiFunctionName } from '../api/iApiFunction';
import type { ComponentMeta, ControllerMeta, SingletonBean } from '../context/context';
import { VERSION } from '../version';
import type { RowModelType } from './iRowModel';

export type ModuleValidationValidResult = {
    isValid: true;
};

export type ModuleValidationInvalidResult = {
    isValid: false;
    message: string;
};

export type ModuleValidationResult = ModuleValidationValidResult | ModuleValidationInvalidResult;

/** A Module contains all the code related to this feature to enable tree shaking when this module is not used. */
export interface Module {
    moduleName: ModuleName;
    version: string;
    enterprise?: boolean;
    /**
     * Validation run when registering the module
     *
     * @return Whether the module is valid or not. If not, a message explaining why it is not valid
     */
    validate?: () => ModuleValidationResult;
    beans?: SingletonBean[];
    controllers?: ControllerMeta[];
    userComponents?: ComponentMeta[];
    rowModels?: RowModelType[];
    dependsOn?: Module[];
}

/** Used to define a module that contains api functions. */
export type _ModuleWithApi<TGridApi extends Readonly<Partial<GridApi>>> = Module & {
    apiFunctions?: { [K in ApiFunctionName & keyof TGridApi]: ApiFunction<K> };
};
/** Used to define a module that does not contain api functions. */
export type _ModuleWithoutApi = Module & {
    apiFunctions?: never;
};
export function baseCommunityModule(moduleName: ModuleName): Readonly<Module> {
    return { moduleName, version: VERSION };
}

type CommunityModuleName =
    | 'AlignedGridsModule'
    | 'AllCommunityEditorsModule'
    | 'AnimateShowChangeCellRendererModule'
    | 'AnimateSlideCellRendererModule'
    | 'AnimationFrameModule'
    | 'AutoWidthModule'
    | 'CellApiModule'
    | 'CellRendererFunctionModule'
    | 'CellStyleModule'
    | 'ChangeDetectionModule'
    | 'CheckboxCellRendererModule'
    | 'ClientSideRowModelApiModule'
    | 'ClientSideRowModelCoreModule'
    | 'ClientSideRowModelFilterModule'
    | 'ClientSideRowModelModule'
    | 'ClientSideRowModelSortModule'
    | 'ColumnAnimationModule'
    | 'ColumnApiModule'
    | 'ColumnAutosizeApiModule'
    | 'ColumnAutosizeCoreModule'
    | 'ColumnAutosizeModule'
    | 'ColumnFilterApiModule'
    | 'ColumnFilterMenuModule'
    | 'ColumnFilterModule'
    | 'ColumnFlexModule'
    | 'ColumnGroupHeaderModule'
    | 'ColumnHeaderModule'
    | 'ColumnHoverModule'
    | 'ColumnMoveApiModule'
    | 'ColumnMoveCoreModule'
    | 'ColumnMoveModule'
    | 'ColumnResizeApiModule'
    | 'ColumnResizeCoreModule'
    | 'ColumnResizeModule'
    | 'CommunityCoreModule'
    | 'CommunityFeaturesModule'
    | 'CommunityMenuApiModule'
    | 'ControlsColumnModule'
    | 'CoreApiModule'
    | 'CsrmSsrmSharedApiModule'
    | 'CsvExportApiModule'
    | 'CsvExportCoreModule'
    | 'CsvExportModule'
    | 'DataTypeEditorsModule'
    | 'DataTypeModule'
    | 'DefaultEditorModule'
    | 'DragAndDropModule'
    | 'DragModule'
    | 'EditApiModule'
    | 'EditCoreModule'
    | 'EditModule'
    | 'EventApiModule'
    | 'ExpressionModule'
    | 'FilterApiModule'
    | 'FilterCoreModule'
    | 'FilterModule'
    | 'FilterValueModule'
    | 'FloatingFilterCoreModule'
    | 'FloatingFilterModule'
    | 'FullRowEditModule'
    | 'GetColumnDefsApiModule'
    | 'HorizontalResizeModule'
    | 'InfiniteRowModelApiModule'
    | 'InfiniteRowModelCoreModule'
    | 'InfiniteRowModelModule'
    | 'KeyboardNavigationApiModule'
    | 'KeyboardNavigationCoreModule'
    | 'KeyboardNavigationModule'
    | 'LargeTextEditorModule'
    | 'LoadingOverlayModule'
    | 'NoRowsOverlayModule'
    | 'OverlayApiModule'
    | 'OverlayCoreModule'
    | 'OverlayModule'
    | 'PaginationApiModule'
    | 'PaginationCoreModule'
    | 'PaginationModule'
    | 'PinnedRowApiModule'
    | 'PinnedRowCoreModule'
    | 'PinnedRowModule'
    | 'PopupModule'
    | 'QuickFilterApiModule'
    | 'QuickFilterCoreModule'
    | 'QuickFilterModule'
    | 'ReadOnlyFloatingFilterModule'
    | 'RenderApiModule'
    | 'RowApiModule'
    | 'RowDragApiModule'
    | 'RowDragCoreModule'
    | 'RowDragModule'
    | 'RowNodeBlockModule'
    | 'RowSelectionApiModule'
    | 'RowSelectionCoreModule'
    | 'RowSelectionModule'
    | 'RowStyleModule'
    | 'ScrollApiModule'
    | 'SelectEditorModule'
    | 'SharedMenuModule'
    | 'SimpleFilterModule'
    | 'SimpleFloatingFilterModule'
    | 'SortApiModule'
    | 'SortCoreModule'
    | 'SortIndicatorCompModule'
    | 'SortModule'
    | 'SsrmInfiniteSharedApiModule'
    | 'StateApiModule'
    | 'StateCoreModule'
    | 'StateModule'
    | 'StickyRowModule'
    | 'UndoRedoEditModule'
    | 'ValidationModule'
    | 'ValueCacheModule';

export type EnterpriseModuleName =
    | 'AdvancedFilterApiModule'
    | 'AdvancedFilterCoreModule'
    | 'AdvancedFilterModule'
    | 'AggregationModule'
    | 'ClientSideRowModelExpansionModule'
    | 'ClipboardApiModule'
    | 'ClipboardCoreModule'
    | 'ClipboardModule'
    | 'ColumnChooserModule'
    | 'ColumnMenuModule'
    | 'ColumnsToolPanelModule'
    | 'ContextMenuModule'
    | 'EnterpriseCoreModule'
    | 'ExcelExportApiModule'
    | 'ExcelExportCoreModule'
    | 'ExcelExportModule'
    | 'FiltersToolPanelModule'
    | 'GridChartsApiModule'
    | 'GridChartsCoreModule'
    | 'GridChartsModule'
    | 'GroupFilterModule'
    | 'GroupFloatingFilterModule'
    | 'LoadingCellRendererModule'
    | 'MasterDetailApiModule'
    | 'MasterDetailCoreModule'
    | 'MasterDetailModule'
    | 'MenuApiModule'
    | 'MenuCoreModule'
    | 'MenuModule'
    | 'MultiFilterCoreModule'
    | 'MultiFilterModule'
    | 'MultiFloatingFilterModule'
    | 'PivotModule'
    | 'RangeSelectionApiModule'
    | 'RangeSelectionCoreModule'
    | 'RangeSelectionModule'
    | 'RichSelectModule'
    | 'RowGroupingApiModule'
    | 'RowGroupingCoreModule'
    | 'RowGroupingModule'
    | 'ServerSideRowModelApiModule'
    | 'ServerSideRowModelCoreModule'
    | 'ServerSideRowModelModule'
    | 'ServerSideRowModelRowGroupingModule'
    | 'ServerSideRowModelRowSelectionModule'
    | 'ServerSideRowModelSortModule'
    | 'SetFilterCoreModule'
    | 'SetFilterModule'
    | 'SetFloatingFilterModule'
    | 'SideBarApiModule'
    | 'SideBarCoreModule'
    | 'SideBarModule'
    | 'SkeletonCellRendererModule'
    | 'SparklinesModule'
    | 'StatusBarApiModule'
    | 'StatusBarCoreModule'
    | 'StatusBarModule'
    | 'StatusBarSelectionModule'
    | 'ViewportRowModelCoreModule'
    | 'ViewportRowModelModule';

export type ModuleName = CommunityModuleName | EnterpriseModuleName;
