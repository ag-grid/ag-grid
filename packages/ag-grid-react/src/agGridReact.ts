import * as React from "react";
import {ReactPortal} from "react";
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
    IComponent,
    Promise,
    WrapableInterface
} from "ag-grid-community";

import {AgGridColumn} from "./agGridColumn";
import {AgReactComponent} from "./agReactComponent";
import {ChangeDetectionService, ChangeDetectionStrategyType} from "./changeDetectionService";

export interface AgGridReactProps extends GridOptions {
    gridOptions?: GridOptions;
    rowDataChangeDetectionStrategy?: ChangeDetectionStrategyType;
    componentWrappingElement?: string;
}

export class AgGridReact extends React.Component<AgGridReactProps, {}> {
    static propTypes: any;

    destroyed: boolean = false;

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

    waitForInstance(reactComponent: AgReactComponent, resolve: (value: any) => void, runningTime = 0) {
        if (reactComponent.getFrameworkComponentInstance()) {
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
    mountReactPortal(portal: ReactPortal, reactComponent: AgReactComponent, resolve: (value: any) => void) {
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
        let debugLogging = !!nextProps.debug;

        const changes = <any>{};
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


        AgGrid.ComponentUtil.processOnChange(changes, this.gridOptions, this.api!, this.columnApi);
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

    createWrapper(ReactComponent: { new(): any }): WrapableInterface {
        let _self = this;

        class DynamicAgReactComponent extends AgReactComponent implements IComponent<any>, WrapableInterface {
            constructor() {
                super(ReactComponent, _self.agGridReact);
            }

            public init(params: any): Promise<void> {
                return super.init(<any>params);
            }

            hasMethod(name: string): boolean {
                let frameworkComponentInstance = wrapper.getFrameworkComponentInstance();
                if (frameworkComponentInstance == null) {
                    return false;
                }
                return frameworkComponentInstance[name] != null;
            }

            callMethod(name: string, args: IArguments): void {
                let frameworkComponentInstance = this.getFrameworkComponentInstance();

                // this should never happen now that AgGridReact.waitForInstance is in use
                if (frameworkComponentInstance == null) {
                    window.setTimeout(() => this.callMethod(name, args), 100);
                } else {
                    let method = wrapper.getFrameworkComponentInstance()[name];
                    if (method == null) return;
                    return method.apply(frameworkComponentInstance, args);
                }
            }

            addMethod(name: string, callback: Function): void {
                (wrapper as any)[name] = callback;
            }
        }

        const wrapper: DynamicAgReactComponent = new DynamicAgReactComponent();
        return wrapper;
    }
}

AgGrid.Grid.setFrameworkBeans([ReactFrameworkComponentWrapper]);
