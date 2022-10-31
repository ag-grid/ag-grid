// ag-grid-react v28.2.1
import { ColumnApi, GridApi, GridOptions } from 'ag-grid-community';
import React, { Component } from 'react';
import { ChangeDetectionService } from '../shared/changeDetectionService';
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
    changeDetectionService: ChangeDetectionService;
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
