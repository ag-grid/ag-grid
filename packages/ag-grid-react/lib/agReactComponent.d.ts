// ag-grid-react v20.0.0
import { Promise } from 'ag-grid-community';
import { AgGridReact } from "./agGridReact";
export declare class AgReactComponent {
    private eParentElement;
    private componentInstance;
    private reactComponent;
    private parentComponent;
    private portal;
    constructor(reactComponent: any, parentComponent?: AgGridReact);
    getFrameworkComponentInstance(): any;
    init(params: any): Promise<void>;
    private useLegacyReact;
    getGui(): HTMLElement;
    destroy(): void;
    private createReactComponentLegacy;
    private createReactComponent;
}
