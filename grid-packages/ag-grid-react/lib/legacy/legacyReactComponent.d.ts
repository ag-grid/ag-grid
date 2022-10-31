// ag-grid-react v28.2.1
import { AgPromise, ComponentType } from 'ag-grid-community';
import { ReactComponent } from '../shared/reactComponent';
import { AgGridReactLegacy } from './agGridReactLegacy';
import { PortalManager } from '../shared/portalManager';
export declare class LegacyReactComponent extends ReactComponent {
    static SLOW_RENDERING_THRESHOLD: number;
    private staticMarkup;
    private staticRenderTime;
    private parentComponent;
    constructor(reactComponent: any, parentComponent: AgGridReactLegacy, portalManager: PortalManager, componentType: ComponentType);
    init(params: any): AgPromise<void>;
    private createReactComponent;
    protected fallbackMethodAvailable(name: string): boolean;
    protected fallbackMethod(name: string, params: any): void;
    private isSlowRenderer;
    isNullValue(): boolean;
    private renderStaticMarkup;
    private removeStaticMarkup;
    rendered(): boolean;
}
