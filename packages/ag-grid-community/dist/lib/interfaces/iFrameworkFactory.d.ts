// Type definitions for ag-grid-community v19.1.4
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
export interface IFrameworkFactory {
    /** Because Angular 2+ uses Zones, you should not use setTimout(). So to get around this, we allow the framework
     * to specify how to execute setTimeout. The default is to just call the browser setTimeout(). */
    setTimeout(action: any, timeout?: any): void;
}
//# sourceMappingURL=iFrameworkFactory.d.ts.map