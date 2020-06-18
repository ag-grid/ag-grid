// ag-grid-react v23.2.1
import * as React from "react";
import { Component, ReactPortal } from "react";
import { ColumnApi, GridApi, GridOptions, Module } from "ag-grid-community";
import { ReactComponent } from "./reactComponent";
import { ChangeDetectionService, ChangeDetectionStrategyType } from "./changeDetectionService";
export interface AgGridReactProps extends GridOptions {
    gridOptions?: GridOptions;
    modules?: Module[];
    rowDataChangeDetectionStrategy?: ChangeDetectionStrategyType;
    componentWrappingElement?: string;
    disableStaticMarkup?: boolean;
}
export declare class AgGridReact extends Component<AgGridReactProps, {}> {
    props: any;
    state: any;
    static propTypes: any;
    gridOptions: GridOptions;
    changeDetectionService: ChangeDetectionService;
    api: GridApi | null;
    columnApi: ColumnApi;
    portals: ReactPortal[];
    hasPendingPortalUpdate: boolean;
    destroyed: boolean;
    protected eGridDiv: HTMLElement;
    private static MAX_COMPONENT_CREATION_TIME;
    constructor(props: any, state: any);
    render(): React.ReactElement<any, string | ((props: any) => React.ReactElement<any, string | any | (new (props: any) => React.Component<any, any, any>)>) | (new (props: any) => React.Component<any, any, any>)>;
    createStyleForDiv(): any;
    componentDidMount(): void;
    waitForInstance(reactComponent: ReactComponent, resolve: (value: any) => void, runningTime?: number): void;
    /**
     * Mounts a react portal for components registered under the componentFramework.
     * We do this because we want all portals to be in the same tree - in order to get
     * Context to work properly.
     */
    mountReactPortal(portal: ReactPortal, reactComponent: ReactComponent, resolve: (value: any) => void): void;
    batchUpdate(callback?: any): any;
    destroyPortal(portal: ReactPortal): void;
    private getStrategyTypeForProp;
    shouldComponentUpdate(nextProps: any): boolean;
    componentDidUpdate(prevProps: any): void;
    processPropsChanges(prevProps: any, nextProps: any): void;
    private extractDeclarativeColDefChanges;
    private extractGridPropertyChanges;
    componentWillUnmount(): void;
    isDisableStaticMarkup(): boolean;
}
