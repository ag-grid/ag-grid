import { BaseCellEditor, BaseDate, BaseDateParams, BaseFilter, BaseFilterParams, BaseFloatingFilter, BaseMenuItem, BaseMenuItemParams, BaseToolPanelParams, ICellEditorParams, ICellRendererParams, IDetailCellRendererParams, IFilter, IFloatingFilterParams, IGroupCellRendererParams, IHeaderGroupParams, IHeaderParams, ILoadingCellRendererParams, ILoadingOverlayParams, INoRowsOverlayParams, IStatusPanelParams, ITooltipParams } from "ag-grid-community";
/** Props provided to custom cell editor components */
export interface CustomCellEditorProps<TData = any, TValue = any, TContext = any> extends ICellEditorParams<TData, TValue, TContext> {
    /** The value in the cell when editing started. */
    initialValue: TValue | null | undefined;
    /** The current value for the editor. */
    value: TValue | null | undefined;
    /** Callback that should be called every time the value in the editor changes. */
    onValueChange: (value: TValue | null | undefined) => void;
}
/** Props provided to custom date components */
export interface CustomDateProps<TData = any, TContext = any> extends BaseDateParams<TData, TContext> {
    /** The current date for the component. */
    date: Date | null;
    /** Callback that should be called every time the date in the component changes. */
    onDateChange: (date: Date | null) => void;
}
/** Props provided to custom filter components */
export interface CustomFilterProps<TData = any, TContext = any, TModel = any> extends BaseFilterParams<TData, TContext> {
    /** The current filter model for the component. */
    model: TModel | null;
    /** Callback that should be called every time the model in the component changes. */
    onModelChange: (model: TModel | null) => void;
    /**
     * Callback that can be optionally called every time the filter UI changes.
     * The grid will respond with emitting a FilterModifiedEvent.
     * Apart from emitting the event, the grid takes no further action.
     */
    onUiChange: () => void;
}
/** Props provided to custom floating filter components */
export interface CustomFloatingFilterProps<P = IFilter, TData = any, TContext = any, TModel = any> extends IFloatingFilterParams<P, TData, TContext> {
    /** The current filter model for the component. */
    model: TModel | null;
    /** Callback that should be called every time the model in the component changes. */
    onModelChange: (model: TModel | null) => void;
}
/** Props provided to custom tool panel components */
export interface CustomToolPanelProps<TData = any, TContext = any, TState = any> extends BaseToolPanelParams<TData, TContext, TState> {
    /**
     * The current state for the component (used in grid state).
     * Initially set to the same value as `initialState`
     */
    state: TState | undefined;
    /**
     * If using grid state, callback that should be called every time the state in the component changes.
     * If not using grid state, not required.
     */
    onStateChange: (model: TState | undefined) => void;
}
/** Props provided to custom menu item components */
export interface CustomMenuItemProps<TData = any, TContext = any> extends BaseMenuItemParams<TData, TContext> {
    /** The active status of the item (is it currently hovered with the mouse, or navigated to via the keyboard). */
    active: boolean;
    /** If the item is a sub menu, whether it is currently opened or closed. */
    expanded: boolean;
    /** Callback that should be called every time the active status is updated (if providing custom behaviour). */
    onActiveChange: (active: boolean) => void;
}
/** Props provided to custom loading overlay component */
export interface CustomLoadingOverlayProps<TData = any, TContext = any> extends ILoadingOverlayParams<TData, TContext> {
}
/** Props provided to custom no rows overlay component */
export interface CustomNoRowsOverlayProps<TData = any, TContext = any> extends INoRowsOverlayParams<TData, TContext> {
}
/** Props provided to custom status panel components */
export interface CustomStatusPanelProps<TData = any, TContext = any> extends IStatusPanelParams<TData, TContext> {
}
/** Props provided to custom cell renderer components */
export interface CustomCellRendererProps<TData = any, TValue = any, TContext = any> extends ICellRendererParams<TData, TValue, TContext> {
}
/** Props provided to custom detail cell renderer components */
export interface CustomDetailCellRendererProps<TData = any, TDetail = any> extends IDetailCellRendererParams<TData, TDetail> {
}
/** Props provided to custom group cell renderer components */
export interface CustomGroupCellRendererProps<TData = any, TValue = any> extends IGroupCellRendererParams<TData, TValue> {
}
/** Props provided to custom header components */
export interface CustomHeaderProps<TData = any, TContext = any> extends IHeaderParams<TData, TContext> {
}
/** Props provided to custom header group components */
export interface CustomHeaderGroupProps<TData = any, TContext = any> extends IHeaderGroupParams<TData, TContext> {
}
/** Props provided to custom loading cell renderer components */
export interface CustomLoadingCellRendererProps<TData = any, TContext = any> extends ILoadingCellRendererParams<TData, TContext> {
}
/** Props provided to custom tooltip components */
export interface CustomTooltipProps<TData = any, TValue = any, TContext = any> extends ITooltipParams<TData, TValue, TContext> {
}
/** Callbacks for custom cell editor components */
export interface CustomCellEditorCallbacks extends BaseCellEditor {
    /** @deprecated v27 Use `colDef.cellEditorPopup` instead. */
    isPopup?(): boolean;
    /** @deprecated v27 Use `colDef.cellEditorPopupPosition` instead. */
    getPopupPosition?(): 'over' | 'under' | undefined;
}
/** Callbacks for custom date components */
export interface CustomDateCallbacks extends BaseDate {
}
/** Callbacks for custom filter components */
export interface CustomFilterCallbacks extends BaseFilter {
}
/** Callbacks for custom floating filter components */
export interface CustomFloatingFilterCallbacks extends BaseFloatingFilter {
}
/** Callbacks for custom menu item components */
export interface CustomMenuItemCallbacks extends BaseMenuItem {
}
/** Hook to allow custom cell editor component callbacks to be provided to the grid */
export declare function useGridCellEditor(callbacks: CustomCellEditorCallbacks): void;
/** Hook to allow custom date component callbacks to be provided to the grid */
export declare function useGridDate(callbacks: CustomDateCallbacks): void;
/** Hook to allow custom filter component callbacks to be provided to the grid */
export declare function useGridFilter(callbacks: CustomFilterCallbacks): void;
/** Hook to allow custom floating filter component callbacks to be provided to the grid */
export declare function useGridFloatingFilter(callbacks: CustomFloatingFilterCallbacks): void;
/** Hook to allow custom menu item component callbacks to be provided to the grid */
export declare function useGridMenuItem(callbacks: CustomMenuItemCallbacks): void;
