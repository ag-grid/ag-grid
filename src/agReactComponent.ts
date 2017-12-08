import {AgReactFrameworkComponent} from "./interfaces";
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as AgGrid from 'ag-grid';
import {Promise} from 'ag-grid';

export class AgReactComponent implements AgReactFrameworkComponent<any> {

    private eParentElement: HTMLElement;
    private componentRef: any;

    reactComponent: any;
    private parentComponent: any;

    constructor(reactComponent: any, parentComponent?: any) {
        this.reactComponent = reactComponent;
        this.parentComponent = parentComponent;
    }

    public getFrameworkComponentInstance(): any {
        return this.componentRef;
    }

    public init(params: any): Promise<void> {
        return new Promise<void>(resolve => {
            this.eParentElement = document.createElement('div');
            AgGrid.Utils.addCssClass(this.eParentElement, 'ag-react-container');

            // so user can have access to the react container,
            // to add css class or style
            params.reactContainer = this.eParentElement;

            let self = this;
            const ReactComponent = React.createElement(this.reactComponent, params);
            if (!this.parentComponent) {

                // MUST be a function, not an arrow function
                ReactDOM.render(ReactComponent, this.eParentElement, function () {
                    self.componentRef = this;
                    resolve(null);
                });
            } else {

                // MUST be a function, not an arrow function
                ReactDOM.unstable_renderSubtreeIntoContainer(this.parentComponent, ReactComponent, this.eParentElement, function () {
                    self.componentRef = this;
                    resolve(null);
                });
            }
        });
    }

    public getGui(): HTMLElement {
        return this.eParentElement;
    }

    public destroy(): void {
        ReactDOM.unmountComponentAtNode(this.eParentElement);
    }
}