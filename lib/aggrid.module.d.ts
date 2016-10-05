// ag-grid-ng2 v6.1.2-beta
import { Ng2ComponentFactory } from './ng2ComponentFactory';
import { BaseComponentFactory } from "./baseComponentFactory";
export declare class AgGridModule {
    static forRoot(): {
        ngModule: typeof AgGridModule;
        providers: (any[] | typeof Ng2ComponentFactory | {
            provide: typeof BaseComponentFactory;
            useExisting: typeof Ng2ComponentFactory;
        })[];
    };
}
