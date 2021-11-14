// ag-grid-react v26.2.0
import { ColumnApi, Context, GridApi } from 'ag-grid-community';
import { Component } from 'react';
import { AgReactUiProps } from '../shared/interfaces';
export declare class AgGridReactUi extends Component<AgReactUiProps, {
    context: Context | undefined;
}> {
    props: any;
    api: GridApi;
    columnApi: ColumnApi;
    private gridOptions;
    private destroyFuncs;
    private changeDetectionService;
    private eGui;
    private portalManager;
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
    private getStrategyTypeForProp;
    private isImmutableDataActive;
}
