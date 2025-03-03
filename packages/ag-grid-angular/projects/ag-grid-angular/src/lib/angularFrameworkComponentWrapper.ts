import type { ComponentRef } from '@angular/core';
import { Component, Injectable, ViewContainerRef, inject } from '@angular/core';

import type {
    ComponentType,
    FrameworkComponentWrapper,
    ICellRendererParams,
    WrappableInterface,
} from 'ag-grid-community';
import { BaseComponentWrapper, _removeFromParent } from 'ag-grid-community';

import type { AngularFrameworkOverrides } from './angularFrameworkOverrides';
import type { AgFrameworkComponent } from './interfaces';

// Angular component with its own ViewContainerRef
// To speed up removal of cell components as removing a single component calls a function within Angular
// called removeFromArray. This is a lot faster if the array is smaller. This really makes a difference
// in the use case of many / all columns with cellRenderers.
@Component({
    selector: 'ag-cell-container',
    template: '',
})
export class AgComponentShard {
    public vcr = inject(ViewContainerRef);
}

const getShardId = (params: ICellRendererParams) => params.column?.getColId() ?? 'SHARED'; //
const useShards = (compType: ComponentType) => compType.name === 'cellRenderer' && !!compType.cellRenderer;

@Injectable()
export class AngularFrameworkComponentWrapper
    extends BaseComponentWrapper<WrappableInterface>
    implements FrameworkComponentWrapper
{
    private viewContainerRef: ViewContainerRef;
    private angularFrameworkOverrides: AngularFrameworkOverrides;
    private compShards: { [key: string]: ComponentRef<AgComponentShard> } = {};

    public setViewContainerRef(
        viewContainerRef: ViewContainerRef,
        angularFrameworkOverrides: AngularFrameworkOverrides
    ) {
        this.viewContainerRef = viewContainerRef;
        this.angularFrameworkOverrides = angularFrameworkOverrides;
    }

    protected createWrapper(OriginalConstructor: { new (): any }, componentType: ComponentType): WrappableInterface {
        const angularFrameworkOverrides = this.angularFrameworkOverrides;
        const that = this;
        const shardComponents = useShards(componentType);
        class DynamicAgNg2Component
            extends BaseGuiComponent<any, AgFrameworkComponent<any>>
            implements WrappableInterface
        {
            private _shardId: string | undefined;

            override init(params: any): void {
                angularFrameworkOverrides.runInsideAngular(() => {
                    super.init(params);
                    this._componentRef.changeDetectorRef.detectChanges();
                });
            }

            protected createComponent(): ComponentRef<AgFrameworkComponent<any>> {
                if (shardComponents) {
                    this._shardId = getShardId(this._params);
                }
                return that.createComponent(OriginalConstructor, this._shardId);
            }
            protected override removeComponent(comp: ComponentRef<AgFrameworkComponent<any>>): void {
                that.removeComponent(comp, this._shardId);
            }

            hasMethod(name: string): boolean {
                return wrapper.getFrameworkComponentInstance()[name] != null;
            }

            callMethod(name: string, args: IArguments): void {
                const componentRef = this.getFrameworkComponentInstance();
                const methodCall = componentRef[name];
                // Special case for `doesFilterPass` as it's called very often and current implementation has
                // this filter logic as part of the component when really it is just part of the filter model.
                if (name === 'doesFilterPass') {
                    return methodCall.apply(componentRef, args);
                }
                return angularFrameworkOverrides.runInsideAngular(() => methodCall.apply(componentRef, args));
            }

            addMethod(name: string, callback: (...args: any[]) => any): void {
                (wrapper as any)[name] = callback;
            }
        }
        const wrapper = new DynamicAgNg2Component();
        return wrapper;
    }

    public createComponent<T>(
        componentType: { new (...args: any[]): T },
        shardId: string | undefined
    ): ComponentRef<T> {
        if (!shardId) {
            return this.viewContainerRef.createComponent(componentType);
        }

        let shardComp = this.compShards[shardId];
        if (!shardComp) {
            this.compShards[shardId] = shardComp = this.viewContainerRef.createComponent(AgComponentShard);
            _removeFromParent(shardComp.location.nativeElement);
        }
        return shardComp.instance.vcr.createComponent(componentType);
    }
    public removeComponent(comp: ComponentRef<AgFrameworkComponent<any>>, shardId: string | undefined): void {
        comp.destroy();
        if (shardId) {
            // Clean up the shard if it's now empty
            const shardComp = this.compShards[shardId];
            if (shardComp?.instance.vcr.length === 0) {
                shardComp.destroy();
                delete this.compShards[shardId];
            }
        }
    }
}

abstract class BaseGuiComponent<P, T extends AgFrameworkComponent<P>> {
    protected _params: P;
    protected _eGui: HTMLElement;
    protected _componentRef: ComponentRef<T>;
    protected _agAwareComponent: T;
    protected _frameworkComponentInstance: any; // the users component - for accessing methods they create

    protected init(params: P): void {
        this._params = params;

        this._componentRef = this.createComponent();
        this._agAwareComponent = this._componentRef.instance;
        this._frameworkComponentInstance = this._componentRef.instance;
        this._eGui = this._componentRef.location.nativeElement;
        // Angular appends the component to the DOM, so remove it
        _removeFromParent(this._eGui);

        this._agAwareComponent.agInit(this._params);
    }

    public getGui(): HTMLElement {
        return this._eGui;
    }

    /** `getGui()` returns the `ng-component` element. This returns the actual root element. */
    public getRootElement(): HTMLElement {
        const firstChild = this._eGui.firstChild;
        return firstChild as HTMLElement;
    }

    public destroy(): void {
        if (this._frameworkComponentInstance && typeof this._frameworkComponentInstance.destroy === 'function') {
            this._frameworkComponentInstance.destroy();
        }
        this.removeComponent(this._componentRef);
    }

    public getFrameworkComponentInstance(): any {
        return this._frameworkComponentInstance;
    }

    protected abstract createComponent(): ComponentRef<T>;
    protected abstract removeComponent(comp: ComponentRef<T>): void;
}
