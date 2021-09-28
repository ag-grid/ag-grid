// ag-grid-react v26.1.0
import React, { Component, ReactPortal } from 'react';
import { ColumnApi, GridApi, GridOptions } from 'ag-grid-community';
import { ChangeDetectionService } from './changeDetectionService';
import { ReactComponent } from './reactComponent';
import { AgGridReactProps } from './interfaces';
export declare class AgGridReactLegacy extends Component<AgGridReactProps, {}> {
    props: AgGridReactProps;
    private static MAX_COMPONENT_CREATION_TIME_IN_MS;
    static propTypes: any;
    static defaultProps: {
        legacyComponentRendering: boolean;
        disableStaticMarkup: boolean;
        maxComponentCreationTimeMs: number;
    };
    gridOptions: GridOptions;
    changeDetectionService: ChangeDetectionService;
    api: GridApi | null;
    columnApi: ColumnApi;
    portals: ReactPortal[];
    hasPendingPortalUpdate: boolean;
    destroyed: boolean;
    protected eGridDiv: HTMLElement;
    readonly SYNCHRONOUS_CHANGE_PROPERTIES: string[];
    constructor(props: AgGridReactProps);
    render(): React.DetailedReactHTMLElement<{
        style: any;
        className: string;
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
    updateReactPortal(oldPortal: ReactPortal, newPortal: ReactPortal): void;
    batchUpdate(): void;
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
    isLegacyComponentRendering(): boolean;
    private processSynchronousChanges;
    private processAsynchronousChanges;
}
