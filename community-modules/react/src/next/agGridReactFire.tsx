import * as React from "react";
import { Component, ReactPortal, RefObject, useEffect } from "react";
import * as PropTypes from "prop-types";
import {
    _,
    BaseComponentWrapper,
    ColumnApi,
    ComponentType,
    ComponentUtil,
    FrameworkComponentWrapper,
    Grid,
    GridApi,GridCoreCreator,
    GridOptions,
    Module,Context,
    WrapableInterface
} from "@ag-grid-community/core";
import {AgGridColumn} from "../agGridColumn";
import {ChangeDetectionService, ChangeDetectionStrategyType} from "../changeDetectionService";
import {ReactComponent} from "../reactComponent";
import {LegacyReactComponent} from "../legacyReactComponent";
import {NewReactComponent} from "../newReactComponent";
import { GridComp } from "./gridComp";

export interface AgGridReactProps extends GridOptions {
    gridOptions?: GridOptions;
    modules?: Module[];
    rowDataChangeDetectionStrategy?: ChangeDetectionStrategyType;
    componentWrappingElement?: string;
    disableStaticMarkup?: boolean;  // only used when legacyComponentRendering is true
    maxComponentCreationTimeMs?: number,
    legacyComponentRendering?: boolean,
    containerStyle?: any;
}

export class AgGridReactFire extends Component<AgGridReactProps, {context: Context | undefined}> {

/*
    private static MAX_COMPONENT_CREATION_TIME_IN_MS: number = 1000; // a second should be more than enough to instantiate a component

    static propTypes: any;

    static defaultProps = {
        legacyComponentRendering: false,
        disableStaticMarkup: false,
        maxComponentCreationTimeMs: AgGridReact.MAX_COMPONENT_CREATION_TIME_IN_MS
    };

    gridOptions!: GridOptions;

    changeDetectionService = new ChangeDetectionService();

    api: GridApi | null = null;
    columnApi!: ColumnApi;
    portals: ReactPortal[] = [];
    hasPendingPortalUpdate = false;

    destroyed = false;

    protected eGridDiv!: HTMLElement;

    readonly SYNCHRONOUS_CHANGE_PROPERTIES = ['context']
*/

    private destroyFuncs: (()=>void)[] = [];
    private changeDetectionService = new ChangeDetectionService();
    // private eGridDiv!: RefObject<HTMLElement>;
    private eGui = React.createRef<HTMLDivElement>();

    constructor(public props: any) {
        super(props);
        this.state = {context: undefined};
    }

    public render() {
        return (
            <div style={this.createStyleForDiv()} className={this.props.className} ref={ this.eGui }>
                { this.state.context && <GridComp context={this.state.context}/> }
            </div>
        );

        // return React.createElement('div', {
        //     style: this.createStyleForDiv(),
        //     className: this.props.className,
        //     ref: (e: HTMLElement) => {
        //         this.eGridDiv = e;
        //     }
        // }, this.portals);
    }

    createStyleForDiv() {
        return {
            height: '100%',
            ...(this.props.containerStyle || {})
        };
    }

    componentDidMount() {

        const modules = this.props.modules || [];
        const gridParams = {
            // providedBeanInstances: {
            //     agGridReact: this,
            //     frameworkComponentWrapper: new ReactFrameworkComponentWrapper(this)
            // },
            modules
        };

        let gridOptions: GridOptions = {...this.props.gridOptions};
        const {children} = this.props;

        if (AgGridColumn.hasChildColumns(children)) {
            gridOptions.columnDefs = AgGridColumn.mapChildColumnDefs(children);
        }

        gridOptions = ComponentUtil.copyAttributesToGridOptions(gridOptions, this.props);

        // don't need the return value
        const gridCoreCreator = new GridCoreCreator();
        gridCoreCreator.create(this.eGui.current!, gridOptions, context => {
            this.setState({context: context} );
        }, gridParams);

        // new Grid(null!, gridOptions, gridParams);
        this.destroyFuncs.push( ()=>gridOptions.api!.destroy() );

        /*
        const modules = this.props.modules || [];
        const gridParams = {
            providedBeanInstances: {
                agGridReact: this,
                // frameworkComponentWrapper: new ReactFrameworkComponentWrapper(this)
            },
            modules
        };

        const gridOptions = this.props.gridOptions || {};
        const { children } = this.props;

        if (AgGridColumn.hasChildColumns(children)) {
            gridOptions.columnDefs = AgGridColumn.mapChildColumnDefs(children);
        }

        this.gridOptions = ComponentUtil.copyAttributesToGridOptions(gridOptions, this.props);

        // don't need the return value
        new Grid(this.eGridDiv, this.gridOptions, gridParams);

        this.api = this.gridOptions.api!;
        this.columnApi = this.gridOptions.columnApi!;*/
    }


    componentWillUnmount() {
        this.destroyFuncs.forEach( f => f() );
    }

}