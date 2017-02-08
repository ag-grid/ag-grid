import {ComponentRef, ViewContainerRef, Injectable, ComponentFactoryResolver} from "@angular/core";
import {Bean}  from 'ag-grid';
import {IComponent, IFilterParams}  from "ag-grid/main";
import {FrameworkComponentWrapper}  from 'ag-grid';
import {AgFrameworkComponent} from "./agFrameworkComponent";
import {AgFilterComponent} from "./agFilterComponent";

@Injectable()
@Bean ("frameworkComponentWrapper")
export class Ng2FrameworkComponentWrapper implements  FrameworkComponentWrapper {
    public static _viewContainerRef: ViewContainerRef;
    public static _componentFactoryResolver: ComponentFactoryResolver;

    wrap <A extends IComponent<any>>(Ng2Component: { new (): any}, methodList: string[]): A{
        let that = this;
        class DynamicAgNg2Component extends BaseGuiComponent<any, AgFrameworkComponent<any>> {
            init(params: IFilterParams): void {
                super.init(params);
                this._componentRef.changeDetectorRef.detectChanges();
            }

            protected createComponent(): ComponentRef<AgFrameworkComponent<any>> {
                return that.createComponent(Ng2Component,
                    Ng2FrameworkComponentWrapper._viewContainerRef);
            }

        }

        let wrapper : DynamicAgNg2Component= new DynamicAgNg2Component ();
        methodList.forEach((methodName=>{
            let methodProxy: Function = function (){
                if (wrapper.getFrameworkComponentInstance()[methodName]) {
                    var componentRef = this.getFrameworkComponentInstance();
                    return wrapper.getFrameworkComponentInstance()[methodName].apply (componentRef, arguments)
                } else {
                    console.warn('ag-Grid: Angular dateComponent is missing the method ' + methodName + '()');
                    return null;
                }
            };

            wrapper[methodName] = methodProxy

        }));


        return <A><any>wrapper;

    }

    public createComponent<T>(componentType: { new(...args: any[]): T; },
                              viewContainerRef: ViewContainerRef): ComponentRef<T> {
        // used to cache the factory, but this a) caused issues when used with either webpack/angularcli with --prod
        // but more significantly, the underlying implementation of resolveComponentFactory uses a map too, so us
        // caching the factory here yields no performance benefits
        let factory = Ng2FrameworkComponentWrapper._componentFactoryResolver.resolveComponentFactory(componentType);
        return viewContainerRef.createComponent(factory);
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
