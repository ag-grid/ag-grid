import type { ComponentRef } from '@angular/core';
import { ViewContainerRef } from '@angular/core';
import { Component, Injectable, inject } from '@angular/core';

import type { FrameworkComponentWrapper, IFilter, WrappableInterface } from 'ag-grid-community';
import { BaseComponentWrapper, _removeFromParent } from 'ag-grid-community';

import type { AngularFrameworkOverrides } from './angularFrameworkOverrides';
import type { AgFrameworkComponent } from './interfaces';

// To speed up the removal of custom components we create a number of shards to contain them.
// Removing a single component calls a function within Angular called removeFromArray.
// This is a lot faster if the array is smaller.
@Component({
    selector: 'ag-component-container',
    template: '',
})
export class AgComponentContainer {
    public vcr = inject(ViewContainerRef);
}
const NUM_SHARDS = 16;
let shardIdx = 0;

function createComponentContainers(vcr: ViewContainerRef): Map<number, ComponentRef<AgComponentContainer>> {
    const containerMap = new Map<number, ComponentRef<AgComponentContainer>>();
    for (let i = 0; i < NUM_SHARDS; i++) {
        const container = vcr.createComponent(AgComponentContainer);
        containerMap.set(i, container);
        _removeFromParent(container.location.nativeElement);
    }
    return containerMap;
}

/**
 * These methods are called on a hot path for every row so we do not want to enter / exit NgZone each time.
 * Also these methods should not be used to update the UI, so we don't need to run them inside Angular.
 */
const runOutsideMethods = new Set<keyof IFilter>(['doesFilterPass', 'isFilterActive']);

@Injectable()
export class AngularFrameworkComponentWrapper
    extends BaseComponentWrapper<WrappableInterface>
    implements FrameworkComponentWrapper
{
    private viewContainerRef: ViewContainerRef;
    private angularFrameworkOverrides: AngularFrameworkOverrides;
    private compShards: Map<number, ComponentRef<AgComponentContainer>>;

    public setViewContainerRef(
        viewContainerRef: ViewContainerRef,
        angularFrameworkOverrides: AngularFrameworkOverrides
    ) {
        this.viewContainerRef = viewContainerRef;
        this.angularFrameworkOverrides = angularFrameworkOverrides;
    }

    protected createWrapper(OriginalConstructor: { new (): any }): WrappableInterface {
        const angularFrameworkOverrides = this.angularFrameworkOverrides;
        const that = this;
        that.compShards ??= createComponentContainers(this.viewContainerRef);

        class DynamicAgNg2Component
            extends BaseGuiComponent<any, AgFrameworkComponent<any>>
            implements WrappableInterface
        {
            override init(params: any): void {
                angularFrameworkOverrides.runInsideAngular(() => {
                    super.init(params);
                    this._componentRef.changeDetectorRef.detectChanges();
                });
            }

            protected createComponent(): ComponentRef<AgFrameworkComponent<any>> {
                return that.createComponent(OriginalConstructor);
            }

            hasMethod(name: string): boolean {
                return wrapper.getFrameworkComponentInstance()[name] != null;
            }

            callMethod(name: string, args: IArguments): void {
                const componentRef = this.getFrameworkComponentInstance();
                const methodCall = componentRef[name];

                if (runOutsideMethods.has(name as any)) {
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

    public createComponent<T>(componentType: { new (...args: any[]): T }): ComponentRef<T> {
        shardIdx = (shardIdx + 1) % NUM_SHARDS;
        const container = this.compShards.get(shardIdx)!;
        return container.instance.vcr.createComponent(componentType);
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
        this._componentRef?.destroy();
    }

    public getFrameworkComponentInstance(): any {
        return this._frameworkComponentInstance;
    }

    protected abstract createComponent(): ComponentRef<T>;
}
