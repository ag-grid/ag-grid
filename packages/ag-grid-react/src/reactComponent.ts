import * as React from 'react';
import {ReactPortal} from 'react';
import * as ReactDOM from 'react-dom';
import * as AgGrid from 'ag-grid-community';
import {Promise} from 'ag-grid-community';
import {AgGridReact} from "./agGridReact";
import {BaseReactComponent} from "./baseReactComponent";

export class ReactComponent extends BaseReactComponent {

    private eParentElement!: HTMLElement;
    private componentInstance: any;

    private reactComponent: any;
    private parentComponent: AgGridReact;
    private portal: ReactPortal | null = null;
    private componentWrappingElement: string = 'div';
    private statelessComponent: boolean;

    constructor(reactComponent: any, parentComponent: AgGridReact) {
        super();

        this.reactComponent = reactComponent;
        this.parentComponent = parentComponent;

        this.statelessComponent = ReactComponent.isStateless(this.reactComponent);
    }

    public getFrameworkComponentInstance(): any {
        return this.componentInstance;
    }

    public isStatelesComponent(): boolean {
        return this.statelessComponent;
    }

    public getReactComponentName(): string {
        return this.reactComponent.name;
    }

    public init(params: any): Promise<void> {
        return new Promise<void>(resolve => {
            this.eParentElement = this.createParentElement(params);
            this.createReactComponent(params, resolve);
        });
    }

    public getGui(): HTMLElement {

        return this.eParentElement;
    }

    public destroy(): void {
        return this.parentComponent.destroyPortal(this.portal as ReactPortal);
    }

    private createReactComponent(params: any, resolve: (value: any) => void) {
        if (!this.statelessComponent) {
            // grab hold of the actual instance created - we use a react ref for this as there is no other mechanism to
            // retrieve the created instance from either createPortal or render
            params.ref = (element: any) => {
                this.componentInstance = element;
            };
        }

        const ReactComponent = React.createElement(this.reactComponent, params);
        const portal: ReactPortal = ReactDOM.createPortal(
            ReactComponent,
            this.eParentElement as any
        );
        this.portal = portal;
        this.parentComponent.mountReactPortal(portal!, this, resolve);
    }

    private createParentElement(params: any) {
        const eParentElement = document.createElement(this.parentComponent.props.componentWrappingElement || 'div');
        AgGrid.Utils.addCssClass(eParentElement as HTMLElement, 'ag-react-container');

        // so user can have access to the react container,
        // to add css class or style
        params.reactContainer = this.eParentElement;
        return eParentElement;
    }

    private static isStateless(Component: any) {
        return (
            typeof Component === 'function' &&
            !(Component.prototype  && Component.prototype.isReactComponent)
        );
    }
}
