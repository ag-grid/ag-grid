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

    portals: ReactPortal[] = [];
    hasPendingPortalUpdate = false;

    destroyed = false;

    protected eGridDiv!: HTMLElement;
*/

    private readonly SYNCHRONOUS_CHANGE_PROPERTIES = ['context']

    public api!: GridApi;
    public columnApi!: ColumnApi;

    private gridOptions!: GridOptions;

    private destroyFuncs: (()=>void)[] = [];
    private changeDetectionService = new ChangeDetectionService();
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

    private createStyleForDiv() {
        return {
            height: '100%',
            ...(this.props.containerStyle || {})
        };
    }

    public componentDidMount() {

        const modules = this.props.modules || [];
        const gridParams = {
            // providedBeanInstances: {
            //     agGridReact: this,
            //     frameworkComponentWrapper: new ReactFrameworkComponentWrapper(this)
            // },
            modules
        };

        this.gridOptions = {...this.props.gridOptions};
        const {children} = this.props;

        if (AgGridColumn.hasChildColumns(children)) {
            this.gridOptions.columnDefs = AgGridColumn.mapChildColumnDefs(children);
        }

        this.gridOptions = ComponentUtil.copyAttributesToGridOptions(this.gridOptions, this.props);

        // don't need the return value
        const gridCoreCreator = new GridCoreCreator();
        gridCoreCreator.create(this.eGui.current!, this.gridOptions, context => {
            this.setState({context: context} );
        }, gridParams);

        this.destroyFuncs.push( ()=>this.gridOptions.api!.destroy() );

        this.api = this.gridOptions.api!;
        this.columnApi = this.gridOptions.columnApi!;
    }

    public componentWillUnmount() {
        this.destroyFuncs.forEach( f => f() );
    }

    public componentDidUpdate(prevProps: any) {
        this.processPropsChanges(prevProps, this.props);
    }

    public processPropsChanges(prevProps: any, nextProps: any) {
        const changes = {};

        this.extractGridPropertyChanges(prevProps, nextProps, changes);
        this.extractDeclarativeColDefChanges(nextProps, changes);

        this.processSynchronousChanges(changes);
        this.processAsynchronousChanges(changes);
    }

    private extractDeclarativeColDefChanges(nextProps: any, changes: any) {
        // if columnDefs are provided on gridOptions we use those - you can't combine both
        // we also skip if columnDefs are provided as a prop directly on AgGridReact
        if ((this.props.gridOptions && this.props.gridOptions.columnDefs) || this.props.columnDefs) {
            return;
        }

        const debugLogging = !!nextProps.debug;
        const propKey = 'columnDefs';
        const currentColDefs = this.gridOptions.columnDefs;

        if (AgGridColumn.hasChildColumns(nextProps.children)) {
            const detectionStrategy = this.changeDetectionService.getStrategy(this.getStrategyTypeForProp(propKey));
            const newColDefs = AgGridColumn.mapChildColumnDefs(nextProps.children);

            if (!detectionStrategy.areEqual(currentColDefs, newColDefs)) {
                if (debugLogging) {
                    console.log(`agGridReact: colDefs definitions changed`);
                }

                changes[propKey] =
                    {
                        previousValue: currentColDefs,
                        currentValue: newColDefs
                    };
            }
        } else if (currentColDefs && currentColDefs.length > 0) {
            changes[propKey] =
                {
                    previousValue: currentColDefs,
                    currentValue: []
                };
        }
    }

    private extractGridPropertyChanges(prevProps: any, nextProps: any, changes: any) {
        const debugLogging = !!nextProps.debug;

        Object.keys(nextProps).forEach(propKey => {
            if (_.includes(ComponentUtil.ALL_PROPERTIES, propKey)) {
                const changeDetectionStrategy = this.changeDetectionService.getStrategy(this.getStrategyTypeForProp(propKey));

                if (!changeDetectionStrategy.areEqual(prevProps[propKey], nextProps[propKey])) {
                    if (debugLogging) {
                        console.log(`agGridReact: [${propKey}] property changed`);
                    }

                    changes[propKey] = {
                        previousValue: prevProps[propKey],
                        currentValue: nextProps[propKey]
                    };
                }
            }
        });

        ComponentUtil.getEventCallbacks().forEach(funcName => {
            if (this.props[funcName] !== nextProps[funcName]) {
                if (debugLogging) {
                    console.log(`agGridReact: [${funcName}] event callback changed`);
                }

                changes[funcName] = {
                    previousValue: prevProps[funcName],
                    currentValue: nextProps[funcName]
                };
            }
        });
    }

    private processSynchronousChanges(changes: any): {} {
        const asyncChanges = {...changes};
        if (Object.keys(asyncChanges).length > 0) {
            const synchronousChanges: { [key: string]: any } = {};
            this.SYNCHRONOUS_CHANGE_PROPERTIES.forEach((synchronousChangeProperty: string) => {
                if (asyncChanges[synchronousChangeProperty]) {
                    synchronousChanges[synchronousChangeProperty] = asyncChanges[synchronousChangeProperty];
                    delete asyncChanges.context;
                }
            })

            if(Object.keys(synchronousChanges).length > 0 && !!this.api) {
                ComponentUtil.processOnChange(synchronousChanges, this.gridOptions, this.api, this.columnApi)
            }
        }
        return asyncChanges;
    }

    private processAsynchronousChanges(changes: {}) {
        if (Object.keys(changes).length > 0) {
            window.setTimeout(() => {
                // destroyed?
                if (this.api) {
                    ComponentUtil.processOnChange(changes, this.gridOptions, this.api, this.columnApi)
                }
            });
        }
    }

    private getStrategyTypeForProp(propKey: string) {
        if (propKey === 'rowData') {
            if (this.props.rowDataChangeDetectionStrategy) {
                return this.props.rowDataChangeDetectionStrategy;
            } else if (this.isImmutableDataActive()) {
                return ChangeDetectionStrategyType.IdentityCheck;
            }
        }

        // all other cases will default to DeepValueCheck
        return ChangeDetectionStrategyType.DeepValueCheck;
    }

    private isImmutableDataActive() {
        return (this.props.deltaRowDataMode || this.props.immutableData) ||
            (this.props.gridOptions && (this.props.gridOptions.deltaRowDataMode || this.props.gridOptions.immutableData));
    }
}