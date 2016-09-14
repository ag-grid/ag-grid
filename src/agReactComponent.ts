var React = require('react');
var ReactDOM = require('react-dom');

export class AgReactComponent {

    private eParentElement: HTMLElement;
    private componentRef: any;

    private reactComponent: any;
    private parentComponent: any;

    constructor(reactComponent: any, parentComponent?: any) {
        this.reactComponent = reactComponent;
        this.parentComponent = parentComponent;
    }

    public getComponentRef(): any {
        return this.componentRef;
    }

    public init(params: any): void {
        this.eParentElement = document.createElement('div');

        var ReactComponent = React.createElement(this.reactComponent, params);
        if (!this.parentComponent) {
            this.componentRef = ReactDOM.render(ReactComponent, this.eParentElement);
        } else {
            this.componentRef = ReactDOM.unstable_renderSubtreeIntoContainer(this.parentComponent, ReactComponent, this.eParentElement);
        }
    }

    public getGui(): HTMLElement {
        return this.eParentElement;
    }

    public destroy(): void {
        ReactDOM.unmountComponentAtNode(this.eParentElement);
    }
}