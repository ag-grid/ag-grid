import {Component,
    ComponentFactory,
    ViewContainerRef,
    ComponentRef,
    Injectable,
    NgModule,
    ModuleWithComponentFactories} from '@angular/core';
import {RuntimeCompiler } from "@angular/compiler";

import {ICellRenderer,
    ICellEditor,
    MethodNotImplementedException,
    RowNode,
    IDoesFilterPassParams,
    IFilter,
    IFilterParams,
    IAfterFilterGuiAttachedParams}   from 'ag-grid/main';

import {AgRendererComponent} from "./agRendererComponent";
import {AgEditorComponent} from "./agEditorComponent";
import {AgFrameworkComponent} from "./agFrameworkComponent";
import {AgFilterComponent} from "./agFilterComponent";
import {BaseComponentFactory} from "./baseComponentFactory";

@Injectable()
export class Ng2ComponentFactory extends BaseComponentFactory {
    private _factoryCache:{[key: string]: ComponentFactory<any>} = {};

    constructor(private _runtimeCompiler:RuntimeCompiler) {
        super();
    }

    /**
     * Deprecated - please declare ng2 components in ColDefs via colDef.cellRendererFramework.component
     */
    public createCellRendererFromComponent(componentType:{ new(...args:any[]): AgRendererComponent; },
                                           viewContainerRef:ViewContainerRef,
                                           childDependencies?:any[],
                                           moduleImports?:any[]):{new(): ICellRenderer} {
        console.log("createCellRendererFromComponent Deprecated - please declare ng2 components in ColDefs via colDef.cellRendererFramework.component");
        return this.createRendererFromComponent(componentType, viewContainerRef, childDependencies, moduleImports)
    }

    /**
     * Deprecated - please declare ng2 components in ColDefs via colDef.cellRendererFramework.template
     */
    public createCellRendererFromTemplate(template:string,
                                          viewContainerRef:ViewContainerRef):{new(): ICellRenderer} {
        console.log("createCellRendererFromTemplate Deprecated - please declare ng2 components in ColDefs via colDef.cellRendererFramework.template");
        return this.createRendererFromTemplate(template, viewContainerRef);
    }

    public createRendererFromComponent(componentType:{ new(...args:any[]): AgRendererComponent; },
                                       viewContainerRef:ViewContainerRef,
                                       childDependencies:any[] = [],
                                       moduleImports:any[] = []):{new(): ICellRenderer} {
        return this.adaptComponentToRenderer(componentType,
            viewContainerRef,
            this._runtimeCompiler,
            (<any>componentType).name,
            moduleImports,
            childDependencies);
    }

    public createRendererFromTemplate(template:string,
                                      viewContainerRef:ViewContainerRef,
                                      moduleImports:any[] = []):{new(): ICellRenderer} {
        let componentType:{ new(...args:any[]): AgRendererComponent; } = this.createDynamicComponentType('dynamic-component', template);
        return this.adaptComponentToRenderer(componentType,
            viewContainerRef,
            this._runtimeCompiler,
            template,
            moduleImports,
            []);
    }

    public createEditorFromComponent(componentType:{ new(...args:any[]): AgEditorComponent; },
                                     viewContainerRef:ViewContainerRef,
                                     childDependencies:any[] = [],
                                     moduleImports:any[] = []):{new(): ICellEditor} {
        return this.adaptComponentToEditor(componentType,
            viewContainerRef,
            this._runtimeCompiler,
            (<any>componentType).name,
            moduleImports,
            childDependencies);
    }

    public createFilterFromComponent(componentType:{ new(...args:any[]): AgFilterComponent; },
                                     viewContainerRef:ViewContainerRef,
                                     childDependencies:any[] = [],
                                     moduleImports:any[] = []):{new(): IFilter} {
        return this.adaptComponentToFilter(componentType,
            viewContainerRef,
            this._runtimeCompiler,
            (<any>componentType).name,
            moduleImports,
            childDependencies);
    }


    private adaptComponentToRenderer(componentType:{ new(...args:any[]): AgRendererComponent; },
                                     viewContainerRef:ViewContainerRef,
                                     compiler:RuntimeCompiler,
                                     name:string,
                                     moduleImports:any[],
                                     childDependencies:any[]):{new(): ICellRenderer} {

        let that = this;
        class CellRenderer extends BaseGuiComponent<any, AgRendererComponent> implements ICellRenderer {
            init(params:any):void {
                super.init(params);
                this._componentRef.changeDetectorRef.detectChanges();
            }

            refresh(params:any):void {
                this._params = params;

                if (this._agAwareComponent.refresh) {
                    this._agAwareComponent.refresh(params);
                } else {
                    throw new MethodNotImplementedException();
                }
            }

            protected createComponent():ComponentRef<AgRendererComponent> {
                return that.createComponent(componentType,
                    viewContainerRef,
                    compiler,
                    name,
                    moduleImports,
                    childDependencies);
            }

        }

        return CellRenderer;
    }

    private adaptComponentToEditor(componentType:{ new(...args:any[]): AgEditorComponent; },
                                   viewContainerRef:ViewContainerRef,
                                   compiler:RuntimeCompiler,
                                   name:string,
                                   moduleImports:any[],
                                   childDependencies:any[]):{new(): ICellEditor} {

        let that = this;
        class CellEditor extends BaseGuiComponent<any, AgEditorComponent> implements ICellEditor {

            init(params:any):void {
                super.init(params);
            }

            getValue():any {
                return this._agAwareComponent.getValue();
            }

            isPopup():boolean {
                return this._agAwareComponent.isPopup ?
                    this._agAwareComponent.isPopup() : false;
            }

            isCancelBeforeStart():boolean {
                return this._agAwareComponent.isCancelBeforeStart ?
                    this._agAwareComponent.isCancelBeforeStart() : false;
            }

            isCancelAfterEnd():boolean {
                return this._agAwareComponent.isCancelAfterEnd ?
                    this._agAwareComponent.isCancelAfterEnd() : false;
            }

            focusIn():void {
                if (this._agAwareComponent.focusIn) {
                    this._agAwareComponent.focusIn();
                }
            }

            focusOut():void {
                if (this._agAwareComponent.focusOut) {
                    this._agAwareComponent.focusOut();
                }
            }


            protected createComponent():ComponentRef<AgEditorComponent> {
                return that.createComponent(componentType,
                    viewContainerRef,
                    compiler,
                    name,
                    moduleImports,
                    childDependencies);
            }
        }

        return CellEditor;
    }

    private adaptComponentToFilter(componentType:{ new(...args:any[]): AgFilterComponent; },
                                   viewContainerRef:ViewContainerRef,
                                   compiler:RuntimeCompiler,
                                   name:string,
                                   moduleImports:any[],
                                   childDependencies:any[]):{new(): IFilter} {

        let that = this;
        class Filter extends BaseGuiComponent<IFilterParams, AgFilterComponent> implements IFilter {
            init(params:IFilterParams):void {
                super.init(params);
                this._componentRef.changeDetectorRef.detectChanges();
            }

            isFilterActive():boolean {
                return this._agAwareComponent.isFilterActive();
            }

            doesFilterPass(params:IDoesFilterPassParams):boolean {
                return this._agAwareComponent.doesFilterPass(params);
            }

            getModel():any {
                return this._agAwareComponent.getModel();
            }

            setModel(model:any):void {
                this._agAwareComponent.setModel(model);
            }

            afterGuiAttached(params:IAfterFilterGuiAttachedParams):void {
                if (this._agAwareComponent.afterGuiAttached) {
                    this._agAwareComponent.afterGuiAttached(params);
                }
            }

            getFrameworkComponentInstance():any {
                return this._frameworkComponentInstance;
            }

            protected createComponent():ComponentRef<AgFilterComponent> {
                return that.createComponent(componentType,
                    viewContainerRef,
                    compiler,
                    name,
                    moduleImports,
                    childDependencies);
            }

        }

        return Filter;
    }


    public createComponent<T>(componentType:{ new(...args:any[]): T; },
                              viewContainerRef:ViewContainerRef,
                              compiler:RuntimeCompiler,
                              name:string,
                              moduleImports:any[],
                              childDependencies:any[]):ComponentRef<T> {
        let factory:ComponentFactory<any> = this._factoryCache[name];
        if (!factory) {
            let module = this.createComponentModule(componentType, moduleImports, childDependencies);
            let moduleWithFactories = compiler.compileModuleAndAllComponentsSync(module);

            factory = moduleWithFactories.componentFactories.find((factory:ComponentFactory<T>) => factory.componentType === componentType);
            this._factoryCache[name] = factory;
        }

        return viewContainerRef.createComponent(factory);
    }


    private  createComponentModule(componentType:any, moduleImports:any[], childDependencies:any[]):any {
        @NgModule({
            imports: moduleImports,
            declarations: [componentType, ...childDependencies],
            exports: []
        })
        class RuntimeComponentModule {
        }
        // a module for just this Type
        return RuntimeComponentModule;
    }

    private createDynamicComponentType(selector:string, template:string):any {
        @Component({selector: selector, template: template})
        class DynamicComponent implements AgRendererComponent {
            private params:any;

            agInit(params:any):void {
                this.params = params;
            }

            // not applicable for template components
            getFrameworkComponentInstance():any {
                return undefined;
            }

            // not applicable for template components
            refresh(params:any):void {
            }
        }
        return DynamicComponent;
    }
}

abstract class BaseGuiComponent<P, T extends AgFrameworkComponent<P>> {
    protected _params:P;
    protected _eGui:HTMLElement;
    protected _componentRef:ComponentRef<T>;
    protected _agAwareComponent:T;
    protected _frameworkComponentInstance:any;  // the users component - for accessing methods they create

    protected init(params:P):void {
        this._params = params;

        this._componentRef = this.createComponent();
        this._agAwareComponent = this._componentRef.instance;
        this._frameworkComponentInstance = this._componentRef.instance;
        this._eGui = this._componentRef.location.nativeElement;

        this._agAwareComponent.agInit(this._params);
    }

    public getGui():HTMLElement {
        return this._eGui;
    }

    public destroy():void {
        if (this._componentRef) {
            this._componentRef.destroy();
        }
    }

    public getFrameworkComponentInstance():any {
        return this._frameworkComponentInstance;
    }

    protected abstract createComponent():ComponentRef<T>;
}

