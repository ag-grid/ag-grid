import * as React from "react";
import {Component, ReactPortal} from "react";
import * as PropTypes from "prop-types";
import {
    _,
    BaseComponentWrapper,
    ColumnApi,
    ComponentType,
    ComponentUtil,
    FrameworkComponentWrapper,
    Grid,
    GridApi,
    GridOptions,
    Module,
    WrapableInterface
} from "ag-grid-community";
import {AgGridColumn} from "./agGridColumn";
import {ChangeDetectionService, ChangeDetectionStrategyType} from "./changeDetectionService";
import {ReactComponent} from "./reactComponent";
import {LegacyReactComponent} from "./legacyReactComponent";
import {NewReactComponent} from "./newReactComponent";

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

export class AgGridReact extends Component<AgGridReactProps, {}> {
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

    constructor(public props: any) {
        super(props);
    }

    render() {
        return React.createElement('div', {
            style: this.createStyleForDiv(),
            className: this.props.className,
            ref: (e: HTMLElement) => {
                this.eGridDiv = e;
            }
        }, this.portals);
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
            providedBeanInstances: {
                agGridReact: this,
                frameworkComponentWrapper: new ReactFrameworkComponentWrapper(this)
            },
            modules
        };

        const gridOptions = this.props.gridOptions || {};
        const {children} = this.props;

        if (AgGridColumn.hasChildColumns(children)) {
            gridOptions.columnDefs = AgGridColumn.mapChildColumnDefs(children);
        }

        this.gridOptions = ComponentUtil.copyAttributesToGridOptions(gridOptions, this.props);

        // don't need the return value
        new Grid(this.eGridDiv, this.gridOptions, gridParams);

        this.api = this.gridOptions.api!;
        this.columnApi = this.gridOptions.columnApi!;
    }

    waitForInstance(reactComponent: ReactComponent, resolve: (value: any) => void, startTime = Date.now()): void {
        // if the grid has been destroyed in the meantime just resolve
        if (this.destroyed) {
            resolve(null);
            return;
        }

        if (reactComponent.rendered()) {
            resolve(reactComponent);
        } else {
            if (Date.now() - startTime >= this.props.maxComponentCreationTimeMs && !this.hasPendingPortalUpdate) {
                // last check - we check if this is a null value being rendered - we do this last as using SSR to check the value
                // can mess up contexts
                if (reactComponent.isNullValue()) {
                    resolve(reactComponent);
                    return;
                }

                console.error(`AG Grid: React Component '${reactComponent.getReactComponentName()}' not created within ${AgGridReact.MAX_COMPONENT_CREATION_TIME_IN_MS}ms`);
                return;
            }

            window.setTimeout(() => {
                this.waitForInstance(reactComponent, resolve, startTime);
            });
        }
    }

    /**
     * Mounts a react portal for components registered under the componentFramework.
     * We do this because we want all portals to be in the same tree - in order to get
     * Context to work properly.
     */
    mountReactPortal(portal: ReactPortal, reactComponent: ReactComponent, resolve: (value: any) => void) {
        this.portals = [...this.portals, portal];
        this.waitForInstance(reactComponent, resolve);
        this.batchUpdate();
    }

    updateReactPortal(oldPortal: ReactPortal, newPortal: ReactPortal) {
        this.portals[this.portals.indexOf(oldPortal)] = newPortal;
        this.batchUpdate();
    }

    batchUpdate(): void {
        if (this.hasPendingPortalUpdate) {
            return;
        }

        setTimeout(() => {
            if (this.api) { // destroyed?
                this.forceUpdate(() => {
                    this.hasPendingPortalUpdate = false;
                });
            }
        });

        this.hasPendingPortalUpdate = true;
    }


    destroyPortal(portal: ReactPortal) {
        this.portals = this.portals.filter(curPortal => curPortal !== portal);
        this.batchUpdate();
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

    shouldComponentUpdate(nextProps: any) {
        this.processPropsChanges(this.props, nextProps);

        // we want full control of the dom, as AG Grid doesn't use React internally,
        // so for performance reasons we tell React we don't need render called after
        // property changes.
        return false;
    }

    componentDidUpdate(prevProps: any) {
        this.processPropsChanges(prevProps, this.props);
    }

    processPropsChanges(prevProps: any, nextProps: any) {
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

    componentWillUnmount() {
        if (this.api) {
            this.api.destroy();
            this.api = null;
        }

        this.destroyed = true;
    }

    public isDisableStaticMarkup(): boolean {
        return this.props.disableStaticMarkup;
    }

    public isLegacyComponentRendering(): boolean {
        return this.props.legacyComponentRendering;
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
}

AgGridReact.propTypes = {
    gridOptions: PropTypes.object
};

addProperties(ComponentUtil.getEventCallbacks(), PropTypes.func);
addProperties(ComponentUtil.BOOLEAN_PROPERTIES, PropTypes.bool);
addProperties(ComponentUtil.STRING_PROPERTIES, PropTypes.string);
addProperties(ComponentUtil.OBJECT_PROPERTIES, PropTypes.object);
addProperties(ComponentUtil.ARRAY_PROPERTIES, PropTypes.array);
addProperties(ComponentUtil.NUMBER_PROPERTIES, PropTypes.number);
addProperties(ComponentUtil.FUNCTION_PROPERTIES, PropTypes.func);

function addProperties(listOfProps: string[], propType: any) {
    listOfProps.forEach(propKey => {
        (AgGridReact as any)[propKey] = propType;
    });
}

class ReactFrameworkComponentWrapper extends BaseComponentWrapper<WrapableInterface> implements FrameworkComponentWrapper {
    private readonly agGridReact!: AgGridReact;

    constructor(agGridReact: AgGridReact) {
        super();
        this.agGridReact = agGridReact;
    }

    createWrapper(UserReactComponent: { new(): any; }, componentType: ComponentType): WrapableInterface {
        return this.agGridReact.isLegacyComponentRendering() ?
            new LegacyReactComponent(UserReactComponent, this.agGridReact, componentType) :
            new NewReactComponent(UserReactComponent, this.agGridReact, componentType);
    }
}
