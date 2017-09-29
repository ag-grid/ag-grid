import {ViewContainerRef, ComponentRef, Injectable, ComponentFactoryResolver} from "@angular/core";
import {
    ICellRendererComp,
    ICellEditorComp,
    IDoesFilterPassParams,
    IFilterComp,
    IFilterParams,
    IAfterGuiAttachedParams
} from "ag-grid/main";
import {BaseComponentFactory} from "./baseComponentFactory";
import {ICellRendererAngularComp, ICellEditorAngularComp, IFilterAngularComp, AgFrameworkComponent} from "./interfaces";

@Injectable()
export class Ng2ComponentFactory extends BaseComponentFactory {

    constructor(private _componentFactoryResolver: ComponentFactoryResolver) {
        super();
    }


    public createFilterFromComponent(componentType: { new(...args: any[]): IFilterAngularComp; },
                                     viewContainerRef: ViewContainerRef) {
        return this.adaptComponentToFilter(componentType,
            viewContainerRef);
    }


    private adaptComponentToFilter(componentType: { new(...args: any[]): IFilterAngularComp; },
                                   viewContainerRef: ViewContainerRef): {new(): IFilterComp} {

        let that = this;
        class Filter extends BaseGuiComponent<IFilterParams, IFilterAngularComp> implements IFilterComp {
            init(params: IFilterParams): void {
                super.init(params);
                this._componentRef.changeDetectorRef.detectChanges();
            }

            isFilterActive(): boolean {
                return this._agAwareComponent.isFilterActive();
            }

            doesFilterPass(params: IDoesFilterPassParams): boolean {
                return this._agAwareComponent.doesFilterPass(params);
            }

            getModel(): any {
                return this._agAwareComponent.getModel();
            }

            setModel(model: any): void {
                this._agAwareComponent.setModel(model);
            }

            afterGuiAttached(params: IAfterGuiAttachedParams): void {
                if (this._agAwareComponent.afterGuiAttached) {
                    this._agAwareComponent.afterGuiAttached(params);
                }
            }

            onNewRowsLoaded(): void {
                if (this._agAwareComponent.onNewRowsLoaded) {
                    this._agAwareComponent.onNewRowsLoaded();
                }
            }

            getModelAsString(model: any): string {
                let agAwareComponent = <any>this._agAwareComponent;
                if (agAwareComponent.getModelAsString) {
                    return agAwareComponent.getModelAsString(model);
                }
                return null;
            }

            getFrameworkComponentInstance(): any {
                return this._frameworkComponentInstance;
            }

            protected createComponent(): ComponentRef<IFilterAngularComp> {
                return that.createComponent(componentType,
                    viewContainerRef);
            }

        }

        return Filter;
    }


    public createComponent<T>(componentType: { new(...args: any[]): T; },
                              viewContainerRef: ViewContainerRef): ComponentRef<T> {
        // used to cache the factory, but this a) caused issues when used with either webpack/angularcli with --prod
        // but more significantly, the underlying implementation of resolveComponentFactory uses a map too, so us
        // caching the factory here yields no performance benefits
        let factory = this._componentFactoryResolver.resolveComponentFactory(componentType);
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

