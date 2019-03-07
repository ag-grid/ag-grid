import * as React from 'react';
import {ReactPortal} from 'react';
import * as ReactDOM from 'react-dom';
import * as AgGrid from 'ag-grid-community';
import {Promise} from 'ag-grid-community';
import {AgGridReact} from "./agGridReact";

export class AgReactComponent {

    private eParentElement!: HTMLElement | DocumentFragment;
    private componentInstance: any;

    private reactComponent: any;
    private parentComponent: AgGridReact;
    private portal: ReactPortal | null = null;
    private componentWrappingElement: string = 'div';

    constructor(reactComponent: any, parentComponent: AgGridReact) {
        this.reactComponent = reactComponent;
        this.parentComponent = parentComponent;
    }

    public getFrameworkComponentInstance(): any {
        return this.componentInstance;
    }

    public getReactComponentName(): string {
        return this.reactComponent.name;
    }

    public init(params: any): Promise<void> {
        return new Promise<void>(resolve => {
            this.componentWrappingElement = this.parentComponent.props.componentWrappingElement || this.componentWrappingElement;
            this.eParentElement = this.createParentElement(this.componentWrappingElement);

            // so user can have access to the react container,
            // to add css class or style
            params.reactContainer = this.eParentElement;

            // at some point soon unstable_renderSubtreeIntoContainer is going to be dropped (and in a minor release at that)
            // this uses the existing mechanism as long as possible, but switches over to using Portals when
            // unstable_renderSubtreeIntoContainer is no longer an option
            const reactLegacy = this.useLegacyReact();
            if (reactLegacy) {
                this.createReactComponentLegacy(params, resolve);
            } else {
                this.createReactComponent(params, resolve);
            }
        });
    }

    private useLegacyReact() {
        // force use of react next (ie portals) if unstable_renderSubtreeIntoContainer is no longer present
        // or if the user elects to try it
        return (typeof ReactDOM.unstable_renderSubtreeIntoContainer !== "function")
            || (this.parentComponent && this.parentComponent.gridOptions && !this.parentComponent.gridOptions.reactNext);
    }

    public getGui(): HTMLElement {
        return this.eParentElement as any;
    }

    public destroy(): void {
        if (!this.useLegacyReact()) {
            return this.parentComponent.destroyPortal(this.portal as ReactPortal);
        }

        // only attempt to unmount if not using a doc fragment
        ReactDOM.unmountComponentAtNode(this.eParentElement as any);
    }

    private createReactComponentLegacy(params: any, resolve: (value: any) => void) {
        const self = this;
        const ReactComponent = React.createElement(this.reactComponent, params);
        if (!this.parentComponent) {
            // MUST be a function, not an arrow function
            ReactDOM.render(ReactComponent as any, this.eParentElement as any, function () {
                self.componentInstance = this;
                resolve(null);
            });
        } else {
            // MUST be a function, not an arrow function
            ReactDOM.unstable_renderSubtreeIntoContainer(this.parentComponent, ReactComponent, this.eParentElement as any, function () {
                self.componentInstance = this;
                resolve(null);
            });
        }
    }

    private createReactComponent(params: any, resolve: (value: any) => void) {
        // grab hold of the actual instance created - we use a react ref for this as there is no other mechanism to
        // retrieve the created instance from either createPortal or render
        params.ref = (element: any) => {
            this.componentInstance = element;
        };

        const ReactComponent = React.createElement(this.reactComponent, params);
        const portal: ReactPortal = ReactDOM.createPortal(
            ReactComponent,
            this.eParentElement as any
        );
        this.portal = portal;
        this.parentComponent.mountReactPortal(portal!, this, resolve);
    }

    private createParentElement(wrappingElement: string) {
        const eParentElement = document.createElement(this.parentComponent.props.componentWrappingElement);
        AgGrid.Utils.addCssClass(eParentElement as HTMLElement, 'ag-react-container');
        return eParentElement;
    }
}
