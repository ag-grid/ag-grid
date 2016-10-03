// ag-grid-ng2 v6.1.0
import { AgComponentFactory } from './agComponentFactory';
import { Ng2FrameworkFactory } from './ng2FrameworkFactory';
export declare class AgGridModule {
    static forRoot(): {
        ngModule: typeof AgGridModule;
        providers: (any[] | typeof AgComponentFactory | typeof Ng2FrameworkFactory)[];
    };
}
