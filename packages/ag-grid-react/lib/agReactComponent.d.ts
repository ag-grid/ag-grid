// ag-grid-react v18.1.0
import { AgReactFrameworkComponent } from "./interfaces";
import { Promise } from 'ag-grid';
export declare class AgReactComponent implements AgReactFrameworkComponent<any> {
    private eParentElement;
    private componentRef;
    reactComponent: any;
    private parentComponent;
    constructor(reactComponent: any, parentComponent?: any);
    getFrameworkComponentInstance(): any;
    init(params: any): Promise<void>;
    getGui(): HTMLElement;
    destroy(): void;
}
