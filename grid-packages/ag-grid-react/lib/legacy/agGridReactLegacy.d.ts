// ag-grid-react v29.3.5
import { ColumnApi, GridApi, GridOptions } from 'ag-grid-community';
import React, { Component } from 'react';
import { AgGridReactProps } from '../shared/interfaces';
import { PortalManager } from '../shared/portalManager';
export declare class AgGridReactLegacy<TData = any> extends Component<AgGridReactProps<TData>, {}> {
    props: AgGridReactProps<TData>;
    private static MAX_COMPONENT_CREATION_TIME_IN_MS;
    static propTypes: any;
    static defaultProps: {
        legacyComponentRendering: boolean;
        disableStaticMarkup: boolean;
        maxComponentCreationTimeMs: number;
    };
    gridOptions: GridOptions<TData>;
    api: GridApi<TData> | null;
    columnApi: ColumnApi;
    portalManager: PortalManager;
    destroyed: boolean;
    protected eGridDiv: HTMLElement;
    readonly SYNCHRONOUS_CHANGE_PROPERTIES: string[];
    constructor(props: AgGridReactProps<TData>);
    render(): React.DetailedReactHTMLElement<{
        style: any;
        className: string;
        ref: (e: HTMLElement) => void;
    }, HTMLElement>;
    createStyleForDiv(): any;
    componentDidMount(): void;
    private checkForDeprecations;
    shouldComponentUpdate(nextProps: any): boolean;
    componentDidUpdate(prevProps: any): void;
    processPropsChanges(prevProps: any, nextProps: any): void;
    private extractGridPropertyChanges;
    componentWillUnmount(): void;
    isDisableStaticMarkup(): boolean;
    isLegacyComponentRendering(): boolean;
    private processSynchronousChanges;
    private processAsynchronousChanges;
}
