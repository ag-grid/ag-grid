// ag-grid-react v7.2.0
export declare class AgReactComponent {
    private eParentElement;
    private componentRef;
    private reactComponent;
    private parentComponent;
    constructor(reactComponent: any, parentComponent?: any);
    getFrameworkComponentInstance(): any;
    init(params: any): void;
    getGui(): HTMLElement;
    destroy(): void;
}
