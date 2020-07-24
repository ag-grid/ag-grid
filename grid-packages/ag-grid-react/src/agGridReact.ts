import * as React from "react";
import {Component, ReactPortal} from "react";
import * as PropTypes from "prop-types";
import {
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
import {ReactComponent} from "./reactComponent";
import {ChangeDetectionService, ChangeDetectionStrategyType} from "./changeDetectionService";

export interface AgGridReactProps extends GridOptions {
    gridOptions?: GridOptions;
    modules?: Module[];
    rowDataChangeDetectionStrategy?: ChangeDetectionStrategyType;
    columnDefsChangeDetectionStrategy?: ChangeDetectionStrategyType;
    componentWrappingElement?: string;
    disableStaticMarkup?: boolean;
}

export class AgGridReact extends Component<AgGridReactProps, {}> {
    static propTypes: any;

    gridOptions!: GridOptions;

    changeDetectionService = new ChangeDetectionService();

    api: GridApi | null = null;
    columnApi!: ColumnApi;
    portals: ReactPortal[] = [];
    hasPendingPortalUpdate = false;

    destroyed = false;

    protected eGridDiv!: HTMLElement;

    private static MAX_COMPONENT_CREATION_TIME: number = 1000; // a second should be more than enough to instantiate a component

    constructor(public props: any, public state: any) {
        super(props, state);
    }

    render() {
        return React.createElement<any>("div", {
            style: this.createStyleForDiv(),
            ref: (e: HTMLElement) => {
                this.eGridDiv = e;
            }
        }, this.portals);
    }

    createStyleForDiv() {
        const style: any = {height: "100%"};
        // allow user to override styles
        const containerStyle = this.props.containerStyle;
        if (containerStyle) {
            Object.keys(containerStyle).forEach(key => {
                style[key] = containerStyle[key];
            });
        }
        return style;
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

        let gridOptions = this.props.gridOptions || {};
        if (AgGridColumn.hasChildColumns(this.props)) {
            gridOptions.columnDefs = AgGridColumn.mapChildColumnDefs(this.props);
        }

        this.gridOptions = ComponentUtil.copyAttributesToGridOptions(gridOptions, this.props);

        // don't need the return value
        new Grid(this.eGridDiv, this.gridOptions, gridParams);

        this.api = this.gridOptions.api!;
        this.columnApi = this.gridOptions.columnApi!;
    }

    waitForInstance(reactComponent: ReactComponent, resolve: (value: any) => void, runningTime = 0) {
        // if the grid has been destroyed in the meantime just resolve
        if (this.destroyed) {
            resolve(null);
            return;
        }

        if (reactComponent.rendered()) {
            resolve(null);
        } else {
            if (runningTime >= AgGridReact.MAX_COMPONENT_CREATION_TIME) {
                console.error(`ag-Grid: React Component '${reactComponent.getReactComponentName()}' not created within ${AgGridReact.MAX_COMPONENT_CREATION_TIME}ms`);
                return;
            }
            window.setTimeout(() => this.waitForInstance(reactComponent, resolve, runningTime + 5), 5);
        }
    }

    /**
     * Mounts a react portal for components registered under the componentFramework.
     * We do this because we want all portals to be in the same tree - in order to get
     * Context to work properly.
     */
    mountReactPortal(portal: ReactPortal, reactComponent: ReactComponent, resolve: (value: any) => void) {
        this.portals = [...this.portals, portal];
        this.batchUpdate(this.waitForInstance(reactComponent, resolve));
    }

    batchUpdate(callback?: any) {
        if (this.hasPendingPortalUpdate) {
            return callback && callback();
        }
        setTimeout(() => {
            if (this.api) { // destroyed?
                this.forceUpdate(() => {
                    callback && callback();
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
        switch (propKey) {
            case 'rowData': {
                // for row data we either return the supplied strategy, or:
                // if deltaRowDataMode/immutableData we default to IdentityChecks,
                // if not we default to DeepValueChecks (with the rest of the properties)
                if (!!this.props.rowDataChangeDetectionStrategy) {
                    return this.props.rowDataChangeDetectionStrategy;
                } else if (this.props['deltaRowDataMode'] || this.props['immutableData']) {
                    return ChangeDetectionStrategyType.IdentityCheck;
                }

                return ChangeDetectionStrategyType.DeepValueCheck;
            }
            // case 'columnDefs': {
            //     // we let the grid do any checking/updates now by default, but still allow the user to override this
            //     // to maintain backward compatibility
            //     if (!!this.props.columnDefsChangeDetectionStrategy) {
            //         return this.props.columnDefsChangeDetectionStrategy;
            //     }
            //     return ChangeDetectionStrategyType.NoCheck;
            // }
            default: {
                // all other data properties will default to DeepValueCheck
                return ChangeDetectionStrategyType.DeepValueCheck;
            }
        }
    }

    shouldComponentUpdate(nextProps: any) {
        this.processPropsChanges(this.props, nextProps);

        // we want full control of the dom, as ag-Grid doesn't use React internally,
        // so for performance reasons we tell React we don't need render called after
        // property changes.
        return false;
    }

    componentDidUpdate(prevProps: any) {
        this.processPropsChanges(prevProps, this.props);
    }

    processPropsChanges(prevProps: any, nextProps: any) {
        const changes = <any>{};

        this.extractGridPropertyChanges(prevProps, nextProps, changes);
        this.extractDeclarativeColDefChanges(nextProps, changes);

        if (Object.keys(changes).length > 0) {
            ComponentUtil.processOnChange(changes, this.gridOptions, this.api!, this.columnApi);
        }
    }

    private extractDeclarativeColDefChanges(nextProps: any, changes: any) {
        // if columnDefs are provided on gridOptions we use those - you can't combine both
        // we also skip if columnDefs are provided as a prop directly on AgGridReact
        if((this.props.gridOptions && this.props.gridOptions.columnDefs) ||  this.props.columnDefs) {
            return;
        }

        let debugLogging = !!nextProps.debug;

        if (AgGridColumn.hasChildColumns(nextProps)) {
            const detectionStrategy = this.changeDetectionService.getStrategy(this.getStrategyTypeForProp('columnDefs'));

            const currentColDefs = this.gridOptions.columnDefs;
            const newColDefs = AgGridColumn.mapChildColumnDefs(nextProps);
            if (!detectionStrategy.areEqual(currentColDefs, newColDefs)) {
                if (debugLogging) {
                    console.log(`agGridReact: colDefs definitions changed`);
                }

                changes['columnDefs'] =
                    {
                        previousValue: this.gridOptions.columnDefs,
                        currentValue: AgGridColumn.mapChildColumnDefs(nextProps)
                    }
            }
        } else if (this.gridOptions.columnDefs && this.gridOptions.columnDefs.length > 0) {
            changes['columnDefs'] =
                {
                    previousValue: this.gridOptions.columnDefs,
                    currentValue: []
                }
        }
    }

    private extractGridPropertyChanges(prevProps: any, nextProps: any, changes: any) {
        let debugLogging = !!nextProps.debug;

        const changedKeys = Object.keys(nextProps);
        changedKeys.forEach((propKey) => {
            if (ComponentUtil.ALL_PROPERTIES.indexOf(propKey) !== -1) {
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
        ComponentUtil.getEventCallbacks().forEach((funcName: string) => {
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
        return !!this.props.disableStaticMarkup;
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
    listOfProps.forEach((propKey: string) => {
        (AgGridReact as any)[propKey] = propType;
    });
}

class ReactFrameworkComponentWrapper extends BaseComponentWrapper<WrapableInterface> implements FrameworkComponentWrapper {

    private readonly agGridReact!: AgGridReact;

    constructor(agGridReact: AgGridReact) {
        super();
        this.agGridReact = agGridReact;
    }

    createWrapper(UserReactComponent: { new(): any }, componentType: ComponentType): WrapableInterface {
        return new ReactComponent(UserReactComponent, this.agGridReact, componentType);
    }
}
