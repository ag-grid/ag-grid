// ag-grid-ng2 v5.2.3
import { ViewContainerRef, ComponentResolver } from '@angular/core';
import { ICellRenderer } from 'ag-grid/main';
export declare class AgComponentFactory {
    private _viewContainerRef;
    private _componentResolver;
    constructor(_viewContainerRef: ViewContainerRef, _componentResolver: ComponentResolver);
    createCellRendererFromComponent<T extends Object>(componentType: {
        new (...args: any[]): T;
    }): {
        new (): ICellRenderer;
    };
    createCellRendererFromTemplate(template: string): {
        new (): ICellRenderer;
    };
}
