import { ComponentFactoryResolver, ComponentRef, Injectable, ViewContainerRef } from "@angular/core";
import { BaseComponentWrapper, Bean, FrameworkComponentWrapper, WrapableInterface } from 'ag-grid-community';
import { AgFrameworkComponent } from "./interfaces";

@Injectable()
@Bean("frameworkComponentWrapper")
export class AngularFrameworkComponentWrapper extends BaseComponentWrapper<WrapableInterface> implements FrameworkComponentWrapper {
    private viewContainerRef: ViewContainerRef;
    private componentFactoryResolver: ComponentFactoryResolver;

    public setViewContainerRef(viewContainerRef: ViewContainerRef) {
        this.viewContainerRef = viewContainerRef;
    }

    public setComponentFactoryResolver(componentFactoryResolver: ComponentFactoryResolver) {
        this.componentFactoryResolver = componentFactoryResolver;
    }

    createWrapper(OriginalConstructor: { new(): any }): WrapableInterface {
        let that = this;

        class DynamicAgNg2Component extends BaseGuiComponent<any, AgFrameworkComponent<any>> implements WrapableInterface {
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
                wrapper[name] = callback
            }
        }

        let wrapper: DynamicAgNg2Component = new DynamicAgNg2Component();
        return wrapper;
    }

    public createComponent<T>(componentType: { new(...args: any[]): T; }): ComponentRef<T> {
        // used to cache the factory, but this a) caused issues when used with either webpack/angularcli with --prod
        // but more significantly, the underlying implementation of resolveComponentFactory uses a map too, so us
        // caching the factory here yields no performance benefits
        let factory = this.componentFactoryResolver.resolveComponentFactory(componentType);
        return this.viewContainerRef.createComponent(factory);
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
        if (this._componentRef) {
            this._componentRef.destroy();
        }
    }

    public getFrameworkComponentInstance(): any {
        return this._frameworkComponentInstance;
    }

    protected abstract createComponent(): ComponentRef<T>;
}
