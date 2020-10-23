// ag-grid-react v24.1.1
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
    containerStyle?: any;
}
export declare class AgGridReact extends Component<AgGridReactProps, {}> {
    props: any;
    static propTypes: any;
    gridOptions: GridOptions;
    changeDetectionService: ChangeDetectionService;
    api: GridApi | null;
    columnApi: ColumnApi;
    portals: ReactPortal[];
    hasPendingPortalUpdate: boolean;
    destroyed: boolean;
    protected eGridDiv: HTMLElement;
    private static MAX_COMPONENT_CREATION_TIME_IN_MS;
    constructor(props: any);
    render(): React.DetailedReactHTMLElement<{
        style: any;
        className: any;
        ref: (e: HTMLElement) => void;
    }, HTMLElement>;
    createStyleForDiv(): any;
    componentDidMount(): void;
    waitForInstance(reactComponent: ReactComponent, resolve: (value: any) => void, startTime?: number): void;
    /**
     * Mounts a react portal for components registered under the componentFramework.
     * We do this because we want all portals to be in the same tree - in order to get
     * Context to work properly.
     */
    mountReactPortal(portal: ReactPortal, reactComponent: ReactComponent, resolve: (value: any) => void): void;
    batchUpdate(callback?: () => void): void;
    destroyPortal(portal: ReactPortal): void;
    private getStrategyTypeForProp;
    private isImmutableDataActive;
    shouldComponentUpdate(nextProps: any): boolean;
    componentDidUpdate(prevProps: any): void;
    processPropsChanges(prevProps: any, nextProps: any): void;
    private extractDeclarativeColDefChanges;
    private extractGridPropertyChanges;
    componentWillUnmount(): void;
    isDisableStaticMarkup(): boolean;
}
