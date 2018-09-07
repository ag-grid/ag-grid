import * as React from 'react';
import {ReactPortal} from 'react';
import * as ReactDOM from 'react-dom';
import * as AgGrid from 'ag-grid-community';
import {Promise} from 'ag-grid-community';
import {AgGridReact} from "./agGridReact";

export class AgReactComponent {

    private eParentElement: HTMLElement;
    private componentInstance: any;

    private reactComponent: any;
    private parentComponent: AgGridReact;

    constructor(reactComponent: any, parentComponent?: AgGridReact) {
        this.reactComponent = reactComponent;
        this.parentComponent = parentComponent;
    }

    public getFrameworkComponentInstance(): any {
        return this.componentInstance;
    }

    public init(params: any): Promise<void> {
        return new Promise<void>(resolve => {
            this.eParentElement = document.createElement('div');
            AgGrid.Utils.addCssClass(this.eParentElement, 'ag-react-container');

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
        return this.eParentElement;
    }

    public destroy(): void {
        ReactDOM.unmountComponentAtNode(this.eParentElement);
    }

    private createReactComponentLegacy(params: any, resolve: (value: any) => void) {
        const self = this;
        const ReactComponent = React.createElement(this.reactComponent, params);
        if (!this.parentComponent) {

            // MUST be a function, not an arrow function
            ReactDOM.render(ReactComponent, this.eParentElement, function () {
                self.componentInstance = this;
                resolve(null);
            });
        } else {

            // MUST be a function, not an arrow function
            ReactDOM.unstable_renderSubtreeIntoContainer(this.parentComponent, ReactComponent, this.eParentElement, function () {
                self.componentInstance = this;
                resolve(null);
            });
        }
    }

    private createReactComponent(params: any, resolve: (value: any) => void) {
        // when using portals & redux with HOCs you need to manually add the store to the props
        // wrapping the component with connect isn't sufficient
        const {reduxStore} = params.agGridReact.props;
        if (reduxStore) {
            params.store = reduxStore;
        }

        // grab hold of the actual instance created - we use a react ref for this as there is no other mechanism to
        // retrieve the created instance from either createPortal or render
        params.ref = element => {
            this.componentInstance = element;
        };

        const ReactComponent = React.createElement(this.reactComponent, params);
        const portal: ReactPortal = ReactDOM.createPortal(
            ReactComponent,
            this.eParentElement
        );

        // MUST be a function, not an arrow function
        ReactDOM.render(<any>portal, this.eParentElement, function () {
            resolve(null);
        });
    }
}