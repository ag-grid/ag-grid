// ag-grid-react v26.1.0
import { Component } from 'react';
import { ColumnApi, Context, GridApi } from 'ag-grid-community';
import { AgReactUiProps } from '../interfaces';
export declare class AgGridReactFire extends Component<AgReactUiProps, {
    context: Context | undefined;
}> {
    props: any;
    api: GridApi;
    columnApi: ColumnApi;
    private gridOptions;
    private destroyFuncs;
    private changeDetectionService;
    private eGui;
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
