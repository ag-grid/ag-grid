import {ComponentRef, Injectable, ViewContainerRef} from "@angular/core";
import {BaseComponentWrapper, FrameworkComponentWrapper, WrappableInterface} from 'ag-grid-community';
import {AgFrameworkComponent} from "./interfaces";

@Injectable()
export class AngularFrameworkComponentWrapper extends BaseComponentWrapper<WrappableInterface> implements FrameworkComponentWrapper {
    private viewContainerRef: ViewContainerRef;

    public setViewContainerRef(viewContainerRef: ViewContainerRef) {
        this.viewContainerRef = viewContainerRef;
    }

    createWrapper(OriginalConstructor: { new(): any }): WrappableInterface {
        let that = this;

        class DynamicAgNg2Component extends BaseGuiComponent<any, AgFrameworkComponent<any>> implements WrappableInterface {
            init(params: any): void {
                super.init(params);
                this._componentRef.changeDetectorRef.detectChanges();
            }

            protected createComponent(): ComponentRef<AgFrameworkComponent<any>> {
                return that.createComponent(OriginalConstructor);
            }

            hasMethod(name: string): boolean {
                return wrapper.getFrameworkComponentInstance()[name] != null;
            }

            callMethod(name: string, args: IArguments): void {
                const componentRef = this.getFrameworkComponentInstance();
                return wrapper.getFrameworkComponentInstance()[name].apply(componentRef, args)

            }

            addMethod(name: string, callback: Function): void {
                (wrapper as any)[name] = callback
            }
        }

        let wrapper: DynamicAgNg2Component = new DynamicAgNg2Component();
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
    protected _agAwareComponent: T;
    protected _frameworkComponentInstance: any;  // the users component - for accessing methods they create

    protected init(params: P): void {
        this._params = params;

        this._componentRef = this.createComponent();
        this._agAwareComponent = this._componentRef.instance;
        this._frameworkComponentInstance = this._componentRef.instance;
        this._eGui = this._componentRef.location.nativeElement;

        this._agAwareComponent.agInit(this._params);
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
