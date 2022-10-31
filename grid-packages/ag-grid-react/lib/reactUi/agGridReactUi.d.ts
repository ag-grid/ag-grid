// ag-grid-react v28.2.1
import { ColumnApi, Context, GridApi } from 'ag-grid-community';
import { Component } from 'react';
import { AgReactUiProps } from '../shared/interfaces';
export declare class AgGridReactUi<TData = any> extends Component<AgReactUiProps<TData>, {
    context: Context | undefined;
}> {
    props: any;
    api: GridApi<TData>;
    columnApi: ColumnApi;
    private gridOptions;
    private destroyFuncs;
    private changeDetectionService;
    private eGui;
    private portalManager;
    private whenReadyFuncs;
    private ready;
    private renderedAfterMount;
    private mounted;
    constructor(props: any);
    render(): JSX.Element;
    private createStyleForDiv;
    componentDidMount(): void;
    componentWillUnmount(): void;
    componentDidUpdate(prevProps: any): void;
    processPropsChanges(prevProps: any, nextProps: any): void;
    private extractDeclarativeColDefChanges;
    private extractGridPropertyChanges;
    private processChanges;
    private processWhenReady;
    private getStrategyTypeForProp;
    private isImmutableDataActive;
}
