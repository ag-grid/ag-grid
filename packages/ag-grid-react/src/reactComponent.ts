import * as React from 'react';
import {ReactPortal} from 'react';
import * as ReactDOM from 'react-dom';
import * as AgGrid from 'ag-grid-community';
import {Promise} from 'ag-grid-community';
import {AgGridReact} from "./agGridReact";
import {BaseReactComponent} from "./baseReactComponent";
import {assignProperties} from "./utils";

export class ReactComponent extends BaseReactComponent {

    private eParentElement!: HTMLElement;
    private componentInstance: any;

    private reactComponent: any;
    private parentComponent: AgGridReact;
    private portal: ReactPortal | null = null;
    private componentWrappingElement: string = 'div';
    private statelessComponent: boolean;
    private orphans: any[];
    private unwrapComponent: boolean = true;

    constructor(reactComponent: any, parentComponent: AgGridReact) {
        super();

        this.reactComponent = reactComponent;
        this.parentComponent = parentComponent;

        this.orphans = [];

        this.statelessComponent = ReactComponent.isStateless(this.reactComponent);
    }

    public getFrameworkComponentInstance(): any {
        return this.componentInstance;
    }

    public isStatelessComponent(): boolean {
        return this.statelessComponent;
    }

    public getReactComponentName(): string {
        return this.reactComponent.name;
    }

    public init(params: any): Promise<void> {
        return new Promise<void>(resolve => {
            this.unwrapComponent = false;
            this.eParentElement = this.createParentElement(params);
            this.createReactComponent(params, resolve);
        });
    }

    public getGui(): HTMLElement {
        if (this.unwrapComponent) {
            const fragment = document.createDocumentFragment();

            if (this.orphans.length > 0) {
                for (const orphan of this.orphans) {
                    fragment.appendChild(orphan)
                }
            } else {
                while (this.eParentElement.firstChild) {
                    this.orphans.push(this.eParentElement.firstChild);
                    fragment.appendChild(this.eParentElement.firstChild)
                }
            }
            return fragment as any;
        } else {
            return this.eParentElement;
        }
    }

    public destroy(): void {
        if (this.unwrapComponent) {
            for (const orphan of this.orphans) {
                this.eParentElement.appendChild(orphan);
            }
        }

        return this.parentComponent.destroyPortal(this.portal as ReactPortal);
    }

    private createReactComponent(params: any, resolve: (value: any) => void) {
        if (!this.statelessComponent) {
            // grab hold of the actual instance created - we use a react ref for this as there is no other mechanism to
            // retrieve the created instance from either createPortal or render
            params.ref = (element: any) => {
                this.componentInstance = element;

                this.addParentContainerStyleAndClasses();
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

    private addParentContainerStyleAndClasses() {
        if(!this.componentInstance) {
            return;
        }

        if (this.componentInstance.getReactContainerStyle && this.componentInstance.getReactContainerStyle()) {
            assignProperties(this.eParentElement.style, this.componentInstance.getReactContainerStyle())
        }
        if (this.componentInstance.getReactContainerClasses && this.componentInstance.getReactContainerClasses()) {
            const parentContainerClasses: string[] = this.componentInstance.getReactContainerClasses();
            parentContainerClasses.forEach(className => AgGrid.Utils.addCssClass(this.eParentElement as HTMLElement, className));
        }
    }

    private createParentElement(params: any) {
        let eParentElement = document.createElement(this.parentComponent.props.componentWrappingElement || 'div');

        if (!this.unwrapComponent) {
            AgGrid.Utils.addCssClass(eParentElement as HTMLElement, 'ag-react-container');

            // so user can have access to the react container, to add css class or style
            params.reactContainer = eParentElement;
        }
        return eParentElement;
    }

    public statelessComponentRendered(): boolean {
        return this.eParentElement.childElementCount > 0;
    }

    private static isStateless(Component: any) {
        return (
            typeof Component === 'function' &&
            !(Component.prototype && Component.prototype.isReactComponent)
        );
    }
}
