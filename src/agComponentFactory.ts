import {Component,
    ComponentFactory,
    ViewContainerRef,
    ComponentRef,
    Injectable,
    NgModule,
    ModuleWithComponentFactories} from '@angular/core';
import {RuntimeCompiler } from "@angular/compiler";

import {ICellRenderer, ICellEditor, MethodNotImplementedException}   from 'ag-grid/main';

import {AgRendererComponent} from "./agRendererComponent";
import {AgEditorComponent} from "./agEditorComponent";
import {AgInitable} from "./agInitable";

@Injectable()
export class AgComponentFactory {
    private _cacheOfModules:any = {};

    constructor(private _runtimeCompiler:RuntimeCompiler) {
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

    private adaptComponentToRenderer(componentType:{ new(...args:any[]): AgRendererComponent; },
                                     viewContainerRef:ViewContainerRef,
                                     compiler:RuntimeCompiler,
                                     name:string,
                                     moduleImports:any[],
                                     childDependencies:any[]):{new(): ICellRenderer} {

        let that = this;
        class CellRenderer extends BaseGuiComponent<AgRendererComponent> implements ICellRenderer {
            init(params:any):void {
                super.init(params);
                this._componentRef.changeDetectorRef.detectChanges();
            }

            getGui():HTMLElement {
                return this._eGui;
            }

            destroy():void {
                if (this._componentRef) {
                    this._componentRef.destroy();
                }
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
        class CellEditor extends BaseGuiComponent<AgEditorComponent> implements ICellEditor {

            init(params:any):void {
                super.init(params);
            }

            getGui():HTMLElement {
                return this._eGui;
            }

            getValue():any {
                return this._agAwareComponent.getValue();
            }

            isPopup():boolean {
                return this._agAwareComponent.isPopup ?
                    this._agAwareComponent.isPopup() : false;
            }

            destroy():void {
                if (this._componentRef) {
                    this._componentRef.destroy();
                }
            }

            isCancelBeforeStart():boolean {
                return this._agAwareComponent.isCancelBeforeStart ?
                    this._agAwareComponent.isCancelBeforeStart() : false;
            }

            isCancelAfterEnd():boolean {
                return this._agAwareComponent.isCancelAfterEnd ?
                    this._agAwareComponent.isCancelAfterEnd() : false;
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

    public createComponent<T>(componentType:{ new(...args:any[]): T; },
                              viewContainerRef:ViewContainerRef,
                              compiler:RuntimeCompiler,
                              name:string,
                              moduleImports:any[],
                              childDependencies:any[]):ComponentRef<T> {
        let module:any = this._cacheOfModules[name];
        if (!module) {
            module = this.createComponentModule(componentType, moduleImports, childDependencies);
            this._cacheOfModules[name] = module;
        }

        var moduleWithFactories = compiler.compileModuleAndAllComponentsSync(module);
        let factory:ComponentFactory<T> = null;
        for (let i = 0; i < moduleWithFactories.componentFactories.length && factory === null; i++) {
            if (moduleWithFactories.componentFactories[i].componentType === componentType) {
                factory = moduleWithFactories.componentFactories[i];
            }
        }

        return viewContainerRef.createComponent(factory);
    }


    private  createComponentModule(componentType:any, moduleImports:any[], childDependencies:any[]) {
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
        }
        return DynamicComponent;
    }
}

abstract class BaseGuiComponent<T extends AgInitable> {
    protected _params:any;
    protected _eGui:HTMLElement;
    protected _componentRef:ComponentRef<T>;
    protected _agAwareComponent:T;

    init(params:any):void {
        this._params = params;

        this._componentRef = this.createComponent();
        this._agAwareComponent = this._componentRef.instance;
        this._eGui = this._componentRef.location.nativeElement;

        this._agAwareComponent.agInit(this._params);
    }

    protected abstract createComponent():ComponentRef<T>;

}

