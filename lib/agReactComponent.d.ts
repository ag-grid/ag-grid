// ag-grid-react v13.3.0
import { AgReactFrameworkComponent } from "./interfaces";
export declare class AgReactComponent implements AgReactFrameworkComponent<any> {
    private eParentElement;
    private componentRef;
    reactComponent: any;
    private parentComponent;
    constructor(reactComponent: any, parentComponent?: any);
    getFrameworkComponentInstance(): any;
    init(params: any): void;
    getGui(): HTMLElement;
    destroy(): void;
}
