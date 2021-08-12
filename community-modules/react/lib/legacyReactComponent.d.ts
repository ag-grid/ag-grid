// @ag-grid-community/react v26.0.0
import { AgPromise } from '@ag-grid-community/core';
import { ReactComponent } from './reactComponent';
export declare class LegacyReactComponent extends ReactComponent {
    static SLOW_RENDERING_THRESHOLD: number;
    private staticMarkup;
    private staticRenderTime;
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
