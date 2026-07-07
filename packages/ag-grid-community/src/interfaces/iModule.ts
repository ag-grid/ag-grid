import type { ClassImp, IconValue } from 'ag-stack';

import type { GridApi } from '../api/gridApi';
import type { ApiFunction, ApiFunctionName } from '../api/iApiFunction';
import type { ComponentMeta, DynamicBeanName, SingletonBean, UserComponentName } from '../context/context';
import type { IconName } from '../utils/icon';
import type { ComponentSelector } from '../widgets/component';
import type { RowModelType } from './iRowModel';

type ModuleValidationValidResult = {
    isValid: true;
};

type ModuleValidationInvalidResult = {
    isValid: false;
    message: string;
};

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export type ModuleValidationResult = ModuleValidationValidResult | ModuleValidationInvalidResult;

/** A Module contains all the code related to this feature to enable tree shaking when this module is not used. */
export interface Module {
    moduleName: ModuleName;
    version: string;
    enterprise?: boolean;
    /**
     * Validation run when registering the module
     *
     * @returns Whether the module is valid or not. If not, a message explaining why it is not valid
     */
    validate?: () => ModuleValidationResult;
    /**
     * Side effect run when the module is registered, before any grid is created, for module-level setup
     * that must happen at registration time rather than at grid/bean initialisation. Fires on every
     * registration call for the module (it is not deduplicated), so the implementation must be idempotent.
     */
    onRegister?: () => void;
    /** singleton beans which are created once on grid init */
    beans?: SingletonBean[];
    /** beans which can have many instances, and can be created/destroyed at any time */
    dynamicBeans?: Partial<Record<DynamicBeanName, ClassImp>>;
    /** components which can be overridden by the user (e.g. cell renderers). These are the default grid provided versions */
    userComponents?: Partial<Record<UserComponentName, ComponentMeta>>;
    /** selectors for grid components that can be defined in templates and created by AG stack */
    selectors?: ComponentSelector[];
    /**
     * icon mappings
     * *** IMPORTANT NOTE! ***
     * If you change the icons, copy/paste the new content into the docs page custom-icons
     */
    icons?: Partial<Record<IconName, IconValue>>;
    rowModels?: RowModelType[];
    dependsOn?: Module[];
    css?: string[];
}

/**
 * Used to define a module that contains api functions.
 * @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time.
 */
export type _ModuleWithApi<TGridApi extends Readonly<Partial<GridApi>>> = Omit<Module, 'rowModels'> & {
    apiFunctions?: { [K in ApiFunctionName & keyof TGridApi]: ApiFunction<K> };
};
/**
 * Used to define a module that does not contain api functions.
 * @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time.
 */
export type _ModuleWithoutApi = Module & {
    apiFunctions?: never;
};

/**
 * Used by React to set the license key via React context if an enterprise module has been provided.
 * @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time.
 */
export type _ModuleWithLicenseManager = {
    setLicenseKey: (licenseKey: string) => void;
};

type InternalModuleName =
    | 'Aggregation'
    | 'AnimationFrame'
    | 'Aria'
    | 'AutoWidth'
    | 'CellRendererFunction'
    | 'ChangedPath'
    | 'ChangeDetection'
    | 'CheckboxCellRenderer'
    | 'CsrmFilter'
    | 'CsrmHierarchy'
    | 'CsrmGroupStages'
    | 'ColumnDelayRender'
    | 'ColumnFilter'
    | 'ColumnFlex'
    | 'ColumnGroupHeaderComp'
    | 'ColumnGroup'
    | 'ColumnHeaderComp'
    | 'ColumnMove'
    | 'ColumnResize'
    | 'CommunityCore'
    | 'CsrmSsrmSharedApi'
    | 'RowModelSharedApi'
    | 'DataType'
    | 'Drag'
    | 'EditCore'
    | 'EnterpriseCore'
    | 'Expression'
    | 'FilterCore'
    | 'FilterValue'
    | 'FindCore'
    | 'GroupEdit'
    | 'GroupCellRenderer'
    | 'GroupColumn'
    | 'GroupHierarchy'
    | 'HorizontalResize'
    | 'InfiniteRowModelCore'
    | 'KeyboardNavigation'
    | 'LoadingCellRenderer'
    | 'MenuCore'
    | 'MenuItem'
    | 'Overlay'
    | 'PinnedColumn'
    | 'Popup'
    | 'QuickFilterCore'
    | 'SharedAggregation'
    | 'SharedColumnStateUpdateStrategy'
    | 'SharedDragAndDrop'
    | 'SharedExport'
    | 'SharedMasterDetail'
    | 'SharedMenu'
    | 'SharedPivot'
    | 'SharedRowGrouping'
    | 'SharedRowSelection'
    | 'SharedTreeData'
    | 'SideBarShared'
    | 'SkeletonCellRenderer'
    | 'Sort'
    | 'SsrmInfiniteSharedApi'
    | 'StickyRow'
    | 'Touch'
    | 'Testing';

export type CommunityModuleName =
    | 'AlignedGrids'
    | 'AllCommunity'
    | 'AutoGenerateColumns'
    | 'CellApi'
    | 'CellStyle'
    | 'CheckboxEditor'
    | 'ClientSideRowModelApi'
    | 'ClientSideRowModel'
    | 'ColumnApi'
    | 'ColumnAutoSize'
    | 'ColumnHover'
    | 'CsvExport'
    | 'CustomEditor'
    | 'CustomFilter'
    | 'DateEditor'
    | 'DateFilter'
    | 'DragAndDrop'
    | 'EventApi'
    | 'ExternalFilter'
    | 'FileInputOverlay'
    | 'GridState'
    | 'HighlightChanges'
    | 'InfiniteRowModel'
    | 'LargeTextEditor'
    | 'Locale'
    | 'NumberEditor'
    | 'NumberFilter'
    | 'BigIntFilter'
    | 'Pagination'
    | 'PaginationPageNumbers'
    | 'PinnedRow'
    | 'QuickFilter'
    | 'RenderApi'
    | 'RowApi'
    | 'RowAutoHeight'
    | 'RowDrag'
    | 'RowSelection'
    | 'RowStyle'
    | 'ScrollApi'
    | 'SelectEditor'
    | 'TextEditor'
    | 'TextFilter'
    | 'Tooltip'
    | 'UndoRedoEdit'
    | 'Validation'
    | 'ValueCache'
    | 'CellSpan';

export type EnterpriseModuleName =
    | 'AdvancedFilter'
    | 'AiToolkit'
    | 'AllEnterprise'
    | 'BatchEdit'
    | 'CalculatedColumns'
    | 'CellSelection'
    | 'Clipboard'
    | 'ColumnMenu'
    | 'ColumnsToolPanel'
    | 'ContextMenu'
    | 'ExcelExport'
    | 'FiltersToolPanel'
    | 'Find'
    | 'GridCharts'
    | 'IntegratedCharts'
    | 'GroupFilter'
    | 'MasterDetail'
    | 'Menu'
    | 'MultiFilter'
    | 'NewFiltersToolPanel'
    | 'PdfExport'
    | 'Pivot'
    | 'RangeSelection'
    | 'RichSelect'
    | 'RowNumbers'
    | 'RowGrouping'
    | 'RowGroupingPanel'
    | 'ServerSideRowModelApi'
    | 'ServerSideRowModel'
    | 'SetFilter'
    | 'ShowValuesAs'
    | 'SideBar'
    | 'Sparklines'
    | 'StatusBar'
    | 'Toolbar'
    | 'TreeData'
    | 'ViewportRowModel'
    | 'Formula'
    | 'Notes'
    | 'RowGroupingEdit';

/** The names of all publicly available AG Grid modules */
export type AgModuleName =
    | 'AiToolkitModule'
    | 'AlignedGridsModule'
    | 'AllCommunityModule'
    | 'AutoGenerateColumnsModule'
    | 'CellApiModule'
    | 'CellStyleModule'
    | 'CheckboxEditorModule'
    | 'ClientSideRowModelApiModule'
    | 'ClientSideRowModelModule'
    | 'ColumnApiModule'
    | 'ColumnAutoSizeModule'
    | 'ColumnHoverModule'
    | 'CsvExportModule'
    | 'CustomEditorModule'
    | 'CustomFilterModule'
    | 'DateEditorModule'
    | 'DateFilterModule'
    | 'DragAndDropModule'
    | 'EventApiModule'
    | 'ExternalFilterModule'
    | 'FileInputOverlayModule'
    | 'GridStateModule'
    | 'RowGroupingEditModule'
    | 'HighlightChangesModule'
    | 'InfiniteRowModelModule'
    | 'LargeTextEditorModule'
    | 'LocaleModule'
    | 'NumberEditorModule'
    | 'NumberFilterModule'
    | 'BigIntFilterModule'
    | 'PaginationModule'
    | 'PaginationPageNumbersModule'
    | 'PinnedRowModule'
    | 'QuickFilterModule'
    | 'RenderApiModule'
    | 'RowApiModule'
    | 'RowAutoHeightModule'
    | 'RowDragModule'
    | 'RowSelectionModule'
    | 'RowStyleModule'
    | 'ScrollApiModule'
    | 'SelectEditorModule'
    | 'TextEditorModule'
    | 'TextFilterModule'
    | 'TooltipModule'
    | 'UndoRedoEditModule'
    | 'ValidationModule'
    | 'ValueCacheModule'
    | 'CellSpanModule'
    // Enterprise
    | 'AdvancedFilterModule'
    | 'AllEnterpriseModule'
    | 'BatchEditModule'
    | 'CalculatedColumnsModule'
    | 'CellSelectionModule'
    | 'ClipboardModule'
    | 'ColumnMenuModule'
    | 'ColumnsToolPanelModule'
    | 'ContextMenuModule'
    | 'ExcelExportModule'
    | 'FiltersToolPanelModule'
    | 'FindModule'
    | 'GridChartsModule'
    | 'IntegratedChartsModule'
    | 'GroupFilterModule'
    | 'MasterDetailModule'
    | 'MenuModule'
    | 'MultiFilterModule'
    | 'NewFiltersToolPanelModule'
    | 'PdfExportModule'
    | 'PivotModule'
    | 'RangeSelectionModule'
    | 'RichSelectModule'
    | 'RowNumbersModule'
    | 'RowGroupingModule'
    | 'RowGroupingPanelModule'
    | 'ServerSideRowModelApiModule'
    | 'ServerSideRowModelModule'
    | 'SetFilterModule'
    | 'ShowValuesAsModule'
    | 'SideBarModule'
    | 'SparklinesModule'
    | 'StatusBarModule'
    | 'ToolbarModule'
    | 'TreeDataModule'
    | 'ViewportRowModelModule'
    | 'FormulaModule'
    | 'NotesModule';

// Types to ensure that our AgModuleName type with Module suffix is equivalent to the internal module names based on Community and Enterprise module names
type AgModuleNameInternal = `${CommunityModuleName | EnterpriseModuleName}Module`;
type ValidateTheSame = Exclude<AgModuleName, AgModuleNameInternal>;
type ValidateTheSame2 = Exclude<AgModuleNameInternal, AgModuleName>;
type ModuleTypesEquivalent = ValidateTheSame | ValidateTheSame2 extends never ? true : false;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const validateTheSame: ModuleTypesEquivalent = true;

/**
 * INTERNAL: All public and internal module names
 * @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time.
 */
export type ModuleName = InternalModuleName | CommunityModuleName | EnterpriseModuleName;

/** These are the internal modules that we have mappings for to convert into exported modules */
export type ResolvableModuleName = Extract<
    InternalModuleName,
    | 'EditCore'
    | 'MenuCore'
    | 'EnterpriseCore'
    | 'ColumnHeaderComp'
    | 'ColumnFilter'
    | 'ColumnGroupHeaderComp'
    | 'SharedDragAndDrop'
    | 'GroupCellRenderer'
    | 'MenuItem'
    | 'CommunityCore'
    | 'LoadingCellRenderer'
    | 'Sort'
    | 'SharedRowSelection'
    | 'KeyboardNavigation'
    | 'SharedMenu'
    | 'ColumnMove'
    | 'ColumnResize'
    | 'FilterCore'
    | 'CsrmSsrmSharedApi'
    | 'RowModelSharedApi'
    | 'SsrmInfiniteSharedApi'
    | 'SharedMasterDetail'
    | 'SharedRowGrouping'
    | 'SharedAggregation'
    | 'SharedPivot'
    | 'ColumnGroup'
    | 'Overlay'
    | 'PinnedColumn'
    | 'CsrmHierarchy'
    | 'CsrmGroupStages'
    | 'SkeletonCellRenderer'
    | 'CheckboxCellRenderer'
    | 'SharedTreeData'
>;

/**
 * These are the types that we can display validations for
 * @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time.
 */
export type ValidationModuleName = CommunityModuleName | EnterpriseModuleName | ResolvableModuleName;
