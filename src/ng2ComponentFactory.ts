import {ViewContainerRef, ComponentRef, Injectable, ComponentFactoryResolver} from "@angular/core";
import {
    ICellRenderer,
    ICellEditor,
    MethodNotImplementedException,
    IDoesFilterPassParams,
    IFilter,
    IFilterParams,
    IAfterFilterGuiAttachedParams
} from "ag-grid/main";
import {AgRendererComponent} from "./agRendererComponent";
import {AgEditorComponent} from "./agEditorComponent";
import {AgFrameworkComponent} from "./agFrameworkComponent";
import {AgFilterComponent} from "./agFilterComponent";
import {BaseComponentFactory} from "./baseComponentFactory";

@Injectable()
export class Ng2ComponentFactory extends BaseComponentFactory {

    constructor(private _componentFactoryResolver: ComponentFactoryResolver) {
        super();
    }

    public createRendererFromComponent(componentType: { new(...args: any[]): AgRendererComponent; },
                                       viewContainerRef: ViewContainerRef): {new(): ICellRenderer} {
        return this.adaptComponentToRenderer(componentType,
            viewContainerRef);
    }

    public createEditorFromComponent(componentType: { new(...args: any[]): AgEditorComponent; },
                                     viewContainerRef: ViewContainerRef): {new(): ICellEditor} {
        return this.adaptComponentToEditor(componentType,
            viewContainerRef);
    }

    public createFilterFromComponent(componentType: { new(...args: any[]): AgFilterComponent; },
                                     viewContainerRef: ViewContainerRef) {
        return this.adaptComponentToFilter(componentType,
            viewContainerRef);
    }


    private adaptComponentToRenderer(componentType: { new(...args: any[]): AgRendererComponent; },
                                     viewContainerRef: ViewContainerRef): {new(): ICellRenderer} {

        let that = this;
        class CellRenderer extends BaseGuiComponent<any, AgRendererComponent> implements ICellRenderer {
            init(params: any): void {
                super.init(params);
                this._componentRef.changeDetectorRef.detectChanges();
            }

            refresh(params: any): void {
                this._params = params;

                if (this._agAwareComponent.refresh) {
                    this._agAwareComponent.refresh(params);
                } else {
                    throw new MethodNotImplementedException();
                }
            }

            protected createComponent(): ComponentRef<AgRendererComponent> {
                return that.createComponent(componentType,
                    viewContainerRef);
            }

        }

        return CellRenderer;
    }

    private adaptComponentToEditor(componentType: { new(...args: any[]): AgEditorComponent; },
                                   viewContainerRef: ViewContainerRef): {new(): ICellEditor} {

        let that = this;
        class CellEditor extends BaseGuiComponent<any, AgEditorComponent> implements ICellEditor {

            init(params: any): void {
                super.init(params);
            }

            getValue(): any {
                return this._agAwareComponent.getValue();
            }

            isPopup(): boolean {
                return this._agAwareComponent.isPopup ?
                    this._agAwareComponent.isPopup() : false;
            }

            isCancelBeforeStart(): boolean {
                return this._agAwareComponent.isCancelBeforeStart ?
                    this._agAwareComponent.isCancelBeforeStart() : false;
            }

            isCancelAfterEnd(): boolean {
                return this._agAwareComponent.isCancelAfterEnd ?
                    this._agAwareComponent.isCancelAfterEnd() : false;
            }

            focusIn(): void {
                if (this._agAwareComponent.focusIn) {
                    this._agAwareComponent.focusIn();
                }
            }

            focusOut(): void {
                if (this._agAwareComponent.focusOut) {
                    this._agAwareComponent.focusOut();
                }
            }


            protected createComponent(): ComponentRef<AgEditorComponent> {
                return that.createComponent(componentType,
                    viewContainerRef);
            }
        }

        return CellEditor;
    }

    private adaptComponentToFilter(componentType: { new(...args: any[]): AgFilterComponent; },
                                   viewContainerRef: ViewContainerRef): {new(): IFilter} {

        let that = this;
        class Filter extends BaseGuiComponent<IFilterParams, AgFilterComponent> implements IFilter {
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

            afterGuiAttached(params: IAfterFilterGuiAttachedParams): void {
                if (this._agAwareComponent.afterGuiAttached) {
                    this._agAwareComponent.afterGuiAttached(params);
                }
            }

            getFrameworkComponentInstance(): any {
                return this._frameworkComponentInstance;
            }

            protected createComponent(): ComponentRef<AgFilterComponent> {
                return that.createComponent(componentType,
                    viewContainerRef);
            }

        }

        return Filter;
    }


    public createComponent<T>(componentType: { new(...args: any[]): T; },
                              viewContainerRef: ViewContainerRef): ComponentRef<T> {
        // used to cache the factory, but this a) caused issues when used with either weback/angularcli with --prod
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

