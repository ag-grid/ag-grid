import { BaseComponentWrapper, ComponentType, FrameworkComponentWrapper, WrappableInterface } from 'ag-grid-community';
import { ComponentRef, Injectable, ViewContainerRef } from "@angular/core";
import { AngularFrameworkOverrides } from "./angularFrameworkOverrides";
import { AgFrameworkComponent } from "./interfaces";

@Injectable()
export class AngularFrameworkComponentWrapper extends BaseComponentWrapper<WrappableInterface> implements FrameworkComponentWrapper {
    private viewContainerRef: ViewContainerRef;
    private angularFrameworkOverrides: AngularFrameworkOverrides;

    public setViewContainerRef(viewContainerRef: ViewContainerRef, angularFrameworkOverrides: AngularFrameworkOverrides) {
        this.viewContainerRef = viewContainerRef;
        this.angularFrameworkOverrides = angularFrameworkOverrides;
    }

    createWrapper(OriginalConstructor: { new(): any }, compType: ComponentType): WrappableInterface {
        let angularFrameworkOverrides = this.angularFrameworkOverrides;
        let that = this;
        class DynamicAgNg2Component extends BaseGuiComponent<any, AgFrameworkComponent<any>> implements WrappableInterface {
            init(params: any): void {

                if(compType.propertyName == 'cellRenderer'){
                    // Batch changes for cell renderers
                    super.init(params);
                    angularFrameworkOverrides.addDetectChanges(this._componentRef.changeDetectorRef);
                }else{
                    angularFrameworkOverrides.runInsideAngular(() => super.init(params));
                    //this._componentRef.changeDetectorRef.detectChanges();
                }
            }

            protected createComponent(): ComponentRef<AgFrameworkComponent<any>> {
                return that.createComponent(OriginalConstructor);
            }

            hasMethod(name: string): boolean {
                return wrapper.getFrameworkComponentInstance()[name] != null;
            }

            callMethod(name: string, args: IArguments): void {
                const componentRef = this.getFrameworkComponentInstance();
                return angularFrameworkOverrides.runInsideAngular(() => wrapper.getFrameworkComponentInstance()[name].apply(componentRef, args));
            }

            addMethod(name: string, callback: Function): void {
                (wrapper as any)[name] = callback
            }
        }
        let wrapper = new DynamicAgNg2Component();
        return wrapper;
    }

    public createComponent<T>(componentType: { new(...args: any[]): T; }): ComponentRef<T> {
        return this.viewContainerRef.createComponent(componentType);
    }
}

abstract class BaseGuiComponent<P, T extends AgFrameworkComponent<P>> {
    protected _params: P;
    protected _eGui: HTMLElement;
    protected _componentRef: ComponentRef<T>;
    protected _frameworkComponentInstance: any;  // the users component - for accessing methods they create

    protected init(params: P): void {
        this._params = params;

        this._componentRef = this.createComponent();
        this._frameworkComponentInstance = this._componentRef.instance;
        this._eGui = this._componentRef.location.nativeElement;

        this._frameworkComponentInstance.agInit(this._params);
    }

    public getGui(): HTMLElement {
        return this._eGui;
    }

    public destroy(): void {
        if (this._frameworkComponentInstance && typeof this._frameworkComponentInstance.destroy === 'function') {
            this._frameworkComponentInstance.destroy();
        }
        if (this._componentRef) {
            this._componentRef.destroy();
        }
    }

    public getFrameworkComponentInstance(): any {
        return this._frameworkComponentInstance;
    }

    protected abstract createComponent(): ComponentRef<T>;
}
