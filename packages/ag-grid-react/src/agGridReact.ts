import * as React from "react";
import {ReactPortal} from "react";
import * as ReactDOM from "react-dom";
import * as PropTypes from "prop-types";
import * as AgGrid from "ag-grid-community";
import {
    Autowired,
    BaseComponentWrapper,
    Bean,
    ColumnApi,
    FrameworkComponentWrapper,
    GridApi,
    GridOptions,
    WrapableInterface
} from "ag-grid-community";
import {AgGridColumn} from "./agGridColumn";
import {ReactComponent} from "./reactComponent";
import {ChangeDetectionService, ChangeDetectionStrategyType} from "./changeDetectionService";
import {LegacyReactComponent} from "./legacyReactComponent";

export interface AgGridReactProps extends GridOptions {
    gridOptions?: GridOptions;
    rowDataChangeDetectionStrategy?: ChangeDetectionStrategyType;
    componentWrappingElement?: string;
}

export class AgGridReact extends React.Component<AgGridReactProps, {}> {
    static propTypes: any;

    gridOptions!: AgGrid.GridOptions;

    changeDetectionService = new ChangeDetectionService();

    api: GridApi | null = null;
    columnApi!: ColumnApi;
    portals: ReactPortal[] = [];
    hasPendingPortalUpdate = false;

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
        const gridParams = {
            seedBeanInstances: {
                agGridReact: this
            }
        };

        let gridOptions = this.props.gridOptions || {};
        if (AgGridColumn.hasChildColumns(this.props)) {
            gridOptions.columnDefs = AgGridColumn.mapChildColumnDefs(this.props);
        }

        this.gridOptions = AgGrid.ComponentUtil.copyAttributesToGridOptions(gridOptions, this.props);

        // don't need the return value
        new AgGrid.Grid(this.eGridDiv, this.gridOptions, gridParams);

        this.api = this.gridOptions.api!;
        this.columnApi = this.gridOptions.columnApi!;
    }

    shouldComponentUpdate() {
        // we want full control of the dom, as ag-Grid doesn't use React internally,
        // so for performance reasons we tell React we don't need render called after
        // property changes.
        return false;
    }

    waitForInstance(reactComponent: ReactComponent, resolve: (value: any) => void, runningTime = 0) {
        // if the grid has been destroyed in the meantime just resolve
        if(!this.api) {
            resolve(null);
            return;
        }

        if (reactComponent.isStatelessComponent() && reactComponent.statelessComponentRendered()) {
            resolve(null);
        } else if (!reactComponent.isStatelessComponent() && reactComponent.getFrameworkComponentInstance()) {
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
        if (propKey === 'rowData') {
            // for row data we either return the supplied strategy, or:
            // if deltaRowDataMode we default to IdentityChecks,
            // if not we default to DeepValueChecks (with the rest of the properties)
            if (!!this.props.rowDataChangeDetectionStrategy) {
                return this.props.rowDataChangeDetectionStrategy;
            } else if (this.props['deltaRowDataMode']) {
                return ChangeDetectionStrategyType.IdentityCheck;
            }
        }

        // all non row data properties will default to DeepValueCheck
        return ChangeDetectionStrategyType.DeepValueCheck;
    }

    componentWillReceiveProps(nextProps: any) {
        const changes = <any>{};

        this.extractGridPropertyChanges(nextProps, changes);
        this.extractDeclarativeColDefChanges(nextProps, changes);

        AgGrid.ComponentUtil.processOnChange(changes, this.gridOptions, this.api!, this.columnApi);
    }

    private extractDeclarativeColDefChanges(nextProps: any, changes: any) {
        let debugLogging = !!nextProps.debug;

        if (AgGridColumn.hasChildColumns(nextProps)) {
            const detectionStrategy = this.changeDetectionService.getStrategy(ChangeDetectionStrategyType.DeepValueCheck);

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
        }
    }

    private extractGridPropertyChanges(nextProps: any, changes: any) {
        let debugLogging = !!nextProps.debug;

        const changedKeys = Object.keys(nextProps);
        changedKeys.forEach((propKey) => {
            if (AgGrid.ComponentUtil.ALL_PROPERTIES.indexOf(propKey) !== -1) {
                const changeDetectionStrategy = this.changeDetectionService.getStrategy(this.getStrategyTypeForProp(propKey));
                if (!changeDetectionStrategy.areEqual(this.props[propKey], nextProps[propKey])) {
                    if (debugLogging) {
                        console.log(`agGridReact: [${propKey}] property changed`);
                    }

                    changes[propKey] = {
                        previousValue: this.props[propKey],
                        currentValue: nextProps[propKey]
                    };
                }
            }
        });
        AgGrid.ComponentUtil.getEventCallbacks().forEach((funcName: string) => {
            if (this.props[funcName] !== nextProps[funcName]) {
                if (debugLogging) {
                    console.log(`agGridReact: [${funcName}] event callback changed`);
                }
                changes[funcName] = {
                    previousValue: this.props[funcName],
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
    }
}

AgGridReact.propTypes = {
    gridOptions: PropTypes.object
};

addProperties(AgGrid.ComponentUtil.getEventCallbacks(), PropTypes.func);
addProperties(AgGrid.ComponentUtil.BOOLEAN_PROPERTIES, PropTypes.bool);
addProperties(AgGrid.ComponentUtil.STRING_PROPERTIES, PropTypes.string);
addProperties(AgGrid.ComponentUtil.OBJECT_PROPERTIES, PropTypes.object);
addProperties(AgGrid.ComponentUtil.ARRAY_PROPERTIES, PropTypes.array);
addProperties(AgGrid.ComponentUtil.NUMBER_PROPERTIES, PropTypes.number);
addProperties(AgGrid.ComponentUtil.FUNCTION_PROPERTIES, PropTypes.func);

function addProperties(listOfProps: string[], propType: any) {
    listOfProps.forEach((propKey: string) => {
        (AgGridReact as any)[propKey] = propType;
    });
}

@Bean("frameworkComponentWrapper")
class ReactFrameworkComponentWrapper extends BaseComponentWrapper<WrapableInterface> implements FrameworkComponentWrapper {
    @Autowired("agGridReact") private agGridReact!: AgGridReact;

    createWrapper(UserReactComponent: { new(): any }): WrapableInterface {
        // at some point soon unstable_renderSubtreeIntoContainer is going to be dropped (and in a minor release at that)
        // this uses the existing mechanism as long as possible, but switches over to using Portals when
        // unstable_renderSubtreeIntoContainer is no longer an option
        return this.useLegacyReact() ?
            new LegacyReactComponent(UserReactComponent, this.agGridReact) :
            new ReactComponent(UserReactComponent, this.agGridReact);
    }

    private useLegacyReact() {
        // force use of react next (ie portals) if unstable_renderSubtreeIntoContainer is no longer present
        // or if the user elects to try it
        return (typeof ReactDOM.unstable_renderSubtreeIntoContainer !== "function")
            || (this.agGridReact && this.agGridReact.gridOptions && !this.agGridReact.gridOptions.reactNext);
    }
}

AgGrid.Grid.setFrameworkBeans([ReactFrameworkComponentWrapper]);
