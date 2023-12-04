import {
    BaseCellEditor,
    BaseDate,
    BaseDateParams,
    BaseFilter,
    BaseFilterParams,
    BaseFloatingFilter,
    ICellEditorParams,
    IFilter,
    IFloatingFilterParams,
    IFloatingFilterParent
} from "ag-grid-community";
import { useContext } from "react";
import { CustomContext } from "./customContext";

function useGridCustomComponent<M>(methods: M): void {
    const { setMethods } = useContext(CustomContext);
    setMethods(methods);
}

export function useGridCellEditor(methods: CellEditorMethods): void {
    useGridCustomComponent(methods);
}

export interface CustomCellEditorParams<TData = any, TValue = any, TContext = any> extends ICellEditorParams<TData, TValue, TContext> {
    initialValue: TValue | null | undefined;
    onValueChange: (value: TValue | null | undefined) => void;
}

export interface CellEditorMethods extends BaseCellEditor {}

export function useGridDate(methods: DateMethods): void {
    return useGridCustomComponent(methods);
}

export interface DateMethods extends BaseDate {}

export interface CustomDateParams<TData = any, TContext = any> extends BaseDateParams<TData, TContext> {
    date: Date | null,
    onDateChange: (date: Date | null) => void,
}

export function useGridFilter(methods: FilterMethods): void {
    return useGridCustomComponent(methods);
}

export interface FilterMethods extends BaseFilter {}

export interface CustomFilterParams<TData = any, TContext = any, TModel = any> extends BaseFilterParams<TData, TContext> {
    model: TModel | null,
    onModelChange: (model: TModel | null) => void,
    onUiChange: () => void,
}

export function useGridFloatingFilter(methods: FloatingFilterMethods): void {
    useGridCustomComponent(methods);
}

export interface CustomFloatingFilterParams<P = IFloatingFilterParent & IFilter, TData = any, TContext = any, TModel = any> extends IFloatingFilterParams<P, TData, TContext> {
    model: TModel | null;
    onModelChange: (model: TModel | null) => void;
}

export interface FloatingFilterMethods extends BaseFloatingFilter {}
