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

    protected getComponentRef(): any {
        return this.componentRef;
    }

    public init(params: any): void {
        this.eParentElement = params.eParentOfValue;

        var ReactComponent = React.createElement(this.reactComponent, { params: params });
        if (!this.parentComponent) {
            this.componentRef = ReactDOM.render(ReactComponent, this.eParentElement);
        } else {
            this.componentRef = ReactDOM.unstable_renderSubtreeIntoContainer(this.parentComponent, ReactComponent, this.eParentElement);
        }
    }

    public getGui(): HTMLElement {
        // return null to the grid, as we don't want it responsible for rendering
        return null;
    }

    public destroy(): void {
        ReactDOM.unmountComponentAtNode(this.eParentElement);
    }
}