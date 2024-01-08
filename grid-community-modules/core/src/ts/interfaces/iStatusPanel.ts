import { IComponent } from "./iComponent";
import { AgGridCommon } from "./iCommon";

export interface StatusPanelDef {
    statusPanel?: any;
    align?: string;
    key?: string;
    statusPanelParams?: any;
}

export interface IStatusPanelParams<TData = any, TContext = any> extends AgGridCommon<TData, TContext> { }

export type AggregationStatusPanelAggFunc = 'count' | 'sum' | 'min' | 'max' | 'avg';

export interface IAggregationStatusPanelParams {
    aggFuncs: AggregationStatusPanelAggFunc[];
}

export interface AggregationStatusPanelParams<TData = any, TContext = any> extends IAggregationStatusPanelParams, IStatusPanelParams<TData, TContext> {
    aggFuncs: AggregationStatusPanelAggFunc[];
}

export interface IStatusPanel<TData = any, TContext = any> {
    refresh?(params: IStatusPanelParams<TData, TContext>): boolean;
}

export interface IStatusPanelComp<TData = any, TContext = any> extends IStatusPanel<TData, TContext>, IComponent<IStatusPanelParams<TData, TContext>> { }
