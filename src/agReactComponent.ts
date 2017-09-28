import {AgReactFrameworkComponent} from "./interfaces";
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as AgGrid from 'ag-grid/main';

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

    public init(params: any): void {
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
                console.debug('in a different thread');
                self.componentRef = this;
            });
        } else {

            // MUST be a function, not an arrow function
            ReactDOM.unstable_renderSubtreeIntoContainer(this.parentComponent, ReactComponent, this.eParentElement, function () {
                console.debug('in the same thread?');
                self.componentRef = this;
            });
        }
    }

    public getGui(): HTMLElement {
        return this.eParentElement;
    }

    public destroy(): void {
        ReactDOM.unmountComponentAtNode(this.eParentElement);
    }
}