// ag-grid-react v30.2.1
import { AgPromise, ComponentType } from 'ag-grid-community';
import { ReactComponent } from '../shared/reactComponent';
import { AgGridReactLegacy } from './agGridReactLegacy';
import { LegacyPortalManager } from '../shared/portalManager';
export declare class LegacyReactComponent extends ReactComponent {
    static SLOW_RENDERING_THRESHOLD: number;
    private staticMarkup;
    private staticRenderTime;
    private parentComponent;
    constructor(reactComponent: any, parentComponent: AgGridReactLegacy, portalManager: LegacyPortalManager, componentType: ComponentType);
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
