import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as AgGrid from 'ag-grid-community';
import {Promise} from 'ag-grid-community';
import {AgGridReact} from "./agGridReact";
import {BaseReactComponent} from "./baseReactComponent";
import {assignProperties} from "./utils";

export class LegacyReactComponent extends BaseReactComponent {
    private eParentElement!: HTMLElement;
    private componentInstance: any;

    private reactComponent: any;
    private parentComponent: AgGridReact;

    constructor(reactComponent: any, parentComponent: AgGridReact) {
        super();

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
            this.eParentElement = document.createElement(this.parentComponent.props.componentWrappingElement || 'div');
            AgGrid.Utils.addCssClass(this.eParentElement as HTMLElement, 'ag-react-container');

            // so user can have access to the react container,
            // to add css class or style
            params.reactContainer = this.eParentElement;

            this.createReactComponentLegacy(params, resolve);
        });
    }

    public getGui(): HTMLElement {
        return this.eParentElement;
    }

    public destroy(): void {
        // only attempt to unmount if not using a doc fragment
        ReactDOM.unmountComponentAtNode(this.eParentElement as any);
    }

    private createReactComponentLegacy(params: any, resolve: (value: any) => void) {
        const self = this;
        const ReactComponent = React.createElement(this.reactComponent, params);
        if (!this.parentComponent) {
            // MUST be a function, not an arrow function
            ReactDOM.render(ReactComponent as any, this.eParentElement as any, function () {
                // @ts-ignore
                self.componentInstance = this;

                self.addParentContainerStyleAndClasses();

                resolve(null);
            });
        } else {
            // MUST be a function, not an arrow function
            ReactDOM.unstable_renderSubtreeIntoContainer(this.parentComponent, ReactComponent, this.eParentElement as any, function () {
                // @ts-ignore
                self.componentInstance = this;

                self.addParentContainerStyleAndClasses();

                resolve(null);
            });
        }
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
}
