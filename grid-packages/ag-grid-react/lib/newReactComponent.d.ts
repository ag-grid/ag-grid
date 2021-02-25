// ag-grid-react v25.1.0
import { ComponentType, AgPromise } from 'ag-grid-community';
import { AgGridReact } from "./agGridReact";
import { ReactComponent } from './reactComponent';
export declare class NewReactComponent extends ReactComponent {
    private key;
    private portalKey;
    private oldPortal;
    private reactElement;
    private params;
    constructor(reactComponent: any, parentComponent: AgGridReact, componentType: ComponentType);
    init(params: any): AgPromise<void>;
    private createOrUpdatePortal;
    private createReactComponent;
    isNullValue(): boolean;
    rendered(): boolean;
    private valueRenderedIsNull;
    protected refreshComponent(args: any): void;
    protected fallbackMethod(name: string, params: any): any;
    protected fallbackMethodAvailable(name: string): boolean;
}
