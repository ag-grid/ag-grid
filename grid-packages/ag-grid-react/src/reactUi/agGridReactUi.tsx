import { BaseComponentWrapper, CtrlsService, ColumnApi, ComponentType, ComponentUtil, Context, FrameworkComponentWrapper, GridApi, GridCoreCreator, GridOptions, GridParams, WrappableInterface, _ } from 'ag-grid-community';
import React, { Component } from 'react';
import { ChangeDetectionService, ChangeDetectionStrategyType } from '../shared/changeDetectionService';
import { AgReactUiProps } from '../shared/interfaces';
import { NewReactComponent } from '../shared/newReactComponent';
import { PortalManager } from '../shared/portalManager';
import GridComp from './gridComp';
import { ReactFrameworkOverrides } from '../shared/reactFrameworkOverrides';

function debug(msg: string, obj?: any) {
    // console.log(msg, obj);
}

export class AgGridReactUi<TData = any> extends Component<AgReactUiProps<TData>, { context: Context | undefined }> {

    public api!: GridApi<TData>;
    public columnApi!: ColumnApi;

    private gridOptions!: GridOptions<TData>;

    private destroyFuncs: (() => void)[] = [];
    private changeDetectionService = new ChangeDetectionService();
    private eGui = React.createRef<HTMLDivElement>();

    private portalManager: PortalManager;

    private whenReadyFuncs: (()=>void)[] = [];
    private ready = false;

    private renderedAfterMount = false;
    private mounted = false;

    // Would like props to be of type AgReactUiProps<TData> but currently breaks build
    constructor(public props: any) {
        super(props);
        debug('AgGridReactUi.constructor');
        this.state = {context: undefined};
        this.portalManager = new PortalManager(this, props.componentWrappingElement, props.maxComponentCreationTimeMs);
        this.destroyFuncs.push(() => this.portalManager.destroy());
    }

    public render() {
        debug('AgGridReactUi.render, context = ' + (this.state.context));
        if (this.state.context) {
            this.renderedAfterMount = true;
        }

        return (
            <div style={ this.createStyleForDiv() } className={ this.props.className } ref={ this.eGui }>
                { this.state.context && <GridComp context={ this.state.context }/> }
                { this.portalManager.getPortals() }
            </div>
        );
    }

    private createStyleForDiv() {
        return {
            height: '100%',
            ...(this.props.containerStyle || {})
        };
    }

    public componentDidMount() {

        if (this.mounted) {
            debug('AgGridReactUi.componentDidMount - skipping');
            return;
        }
        debug('AgGridReactUi.componentDidMount');
        this.mounted = true;

        const modules = this.props.modules || [];
        const gridParams: GridParams = {
            providedBeanInstances: {
                frameworkComponentWrapper: new ReactFrameworkComponentWrapper(this.portalManager)
            },
            modules,
            frameworkOverrides: new ReactFrameworkOverrides(true)
        };

        this.gridOptions = this.props.gridOptions || {};
        this.gridOptions = ComponentUtil.copyAttributesToGridOptions(this.gridOptions, this.props);

        const createUiCallback = (context: Context) => {
            this.setState({context: context});

            // because React is Async, we need to wait for the UI to be initialised before exposing the API's
            const ctrlsService = context.getBean(CtrlsService.NAME) as CtrlsService;
            ctrlsService.whenReady( ()=> {
                debug('AgGridReactUi.createUiCallback');

                this.api = this.gridOptions.api!;
                this.columnApi = this.gridOptions.columnApi!;
                this.props.setGridApi!(this.api, this.columnApi);
                this.destroyFuncs.push(() => this.api.destroy());
            });
        };

        // this callback adds to ctrlsService.whenReady(), just like above, however because whenReady() executes
        // funcs in the order they were received, we know adding items here will be AFTER the grid has set columns
        // and data. this is because GridCoreCreator sets these between calling createUiCallback and acceptChangesCallback
        const acceptChangesCallback = (context: Context)=> {
            const ctrlsService = context.getBean(CtrlsService.NAME) as CtrlsService;
            ctrlsService.whenReady( ()=> {
                debug('AgGridReactUi.acceptChangesCallback');
                this.whenReadyFuncs.forEach( f => f() );
                this.whenReadyFuncs.length = 0;
                this.ready = true;
            });
        }

        // don't need the return value
        const gridCoreCreator = new GridCoreCreator();
        gridCoreCreator.create(this.eGui.current!, this.gridOptions, createUiCallback, acceptChangesCallback, gridParams);
    }

    public componentWillUnmount() {
        if (this.renderedAfterMount) {
            debug('AgGridReactUi.componentWillUnmount - executing');
            this.destroyFuncs.forEach(f => f());
            this.destroyFuncs.length = 0;
        } else {
            debug('AgGridReactUi.componentWillUnmount - skipping');
        }
    }

    public componentDidUpdate(prevProps: any) {
        this.processPropsChanges(prevProps, this.props);
    }

    public processPropsChanges(prevProps: any, nextProps: any) {
        const changes = {};

        this.extractGridPropertyChanges(prevProps, nextProps, changes);

        this.processChanges(changes);
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
            if (prevProps[funcName] !== nextProps[funcName]) {
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

    private processChanges(changes: {}) {
        this.processWhenReady( ()=>
            ComponentUtil.processOnChange(changes, this.gridOptions, this.api, this.columnApi)
        );
    }

    private processWhenReady(func: ()=>void): void {
        if (this.ready) {
            debug('AgGridReactUi.processWhenReady sync');
            func();
        } else {
            debug('AgGridReactUi.processWhenReady async');
            this.whenReadyFuncs.push(func);
        }
    }

    private getStrategyTypeForProp(propKey: string) {
        if (propKey === 'rowData') {
            if (this.props.rowDataChangeDetectionStrategy) {
                return this.props.rowDataChangeDetectionStrategy;
            }
            if (this.isImmutableDataActive()) {
                return ChangeDetectionStrategyType.IdentityCheck;
            }
        }

        // all other cases will default to DeepValueCheck
        return ChangeDetectionStrategyType.DeepValueCheck;
    }

    private isImmutableDataActive() {
        return (this.props.immutableData || this.props.getRowId != null) ||
            (this.props.gridOptions && (
                this.props.gridOptions.immutableData
                || this.props.gridOptions.getRowId != null));
    }
}

class ReactFrameworkComponentWrapper extends BaseComponentWrapper<WrappableInterface> implements FrameworkComponentWrapper {

    private readonly parent: PortalManager;    

    constructor(parent: PortalManager) {
        super();
        this.parent = parent;
    }

    createWrapper(UserReactComponent: { new(): any; }, componentType: ComponentType): WrappableInterface {
        return new NewReactComponent(UserReactComponent, this.parent, componentType);
    }
}
