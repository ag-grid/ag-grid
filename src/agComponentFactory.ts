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

@Injectable()
export class AgComponentFactory {
    private _cacheOfModules:any = {};

    constructor(private compiler:RuntimeCompiler) {
    }

    /**
     * Deprecated - please declare ng2 components in ColDefs
     */
    public createCellRendererFromComponent(componentType:{ new(...args:any[]): AgRendererComponent; },
                                           viewContainerRef:ViewContainerRef,
                                           childDependencies?:any[],
                                           moduleImports?:any[]):{new(): ICellRenderer} {
        console.log("Deprecated - please declare ng2 components in ColDef");
        return this.createRendererFromComponent(componentType, viewContainerRef, childDependencies, moduleImports)
    }

    /**
     * Deprecated - please declare ng2 components in ColDefs
     */
    public createCellRendererFromTemplate(template:string,
                                          viewContainerRef:ViewContainerRef):{new(): ICellRenderer} {
        console.log("Deprecated - please declare ng2 components in ColDef");
        return this.createRendererFromTemplate(template, viewContainerRef);
    }

    public createRendererFromTemplate(template:string,
                                      viewContainerRef:ViewContainerRef):{new(): ICellRenderer} {
        return this.adaptTemplate(viewContainerRef, this.compiler, template);
    }

    public createEditor(componentType:{ new(...args:any[]): AgEditorComponent; },
                        viewContainerRef:ViewContainerRef,
                        childDependencies?:any[],
                        moduleImports?:any[]):{new(): ICellEditor} {
        let componentAsFunction:any = componentType;
        return this.adaptComponentToEditor(componentType,
            viewContainerRef,
            this.compiler,
            componentAsFunction.name,
            (instance:any, params?:any) => {
                if (instance.agInit) {
                    instance.agInit(params);
                }
            },
            moduleImports ? moduleImports : [],
            childDependencies);
    }

    public createRendererFromComponent(componentType:{ new(...args:any[]): AgRendererComponent; },
                                       viewContainerRef:ViewContainerRef,
                                       childDependencies?:any[],
                                       moduleImports?:any[]):{new(): ICellRenderer} {
        let componentAsFunction:any = componentType;
        return this.adaptComponentToRenderer(componentType,
            viewContainerRef,
            this.compiler,
            componentAsFunction.name,
            (instance:any, params?:any) => {
                if (instance.agInit) {
                    instance.agInit(params);
                }
            },
            moduleImports ? moduleImports : [],
            childDependencies);
    }

    private adaptComponentToRenderer(componentType:{ new(...args:any[]): AgRendererComponent; },
                                     viewContainerRef:ViewContainerRef,
                                     compiler:RuntimeCompiler,
                                     name:string,
                                     initializer:(instance:AgRendererComponent, params?:any) => void,
                                     moduleImports:any[],
                                     childDependencies?:any[]):{new(): ICellRenderer} {

        let that = this;
        class CellRenderer implements ICellRenderer {
            private _params:any;
            private _componentRef:ComponentRef<AgRendererComponent>;

            init(params:any):void {
                this._params = params;
            }

            getGui():HTMLElement {
                let div = document.createElement('div');
                that.createComponent(componentType,
                    viewContainerRef,
                    compiler,
                    name,
                    moduleImports,
                    childDependencies)
                    .then(cr => {
                        this._componentRef = cr;
                        if (initializer) {
                            initializer(cr.instance, this._params);
                        }

                        div.appendChild(cr.location.nativeElement);
                    });
                return div;
            }

            destroy():void {
                if (this._componentRef) {
                    this._componentRef.destroy();
                }
            }

            refresh(params:any):void {
                this._params = params;

                let instance:any = this._componentRef.instance;
                if (instance.refresh) {
                    instance.refresh(params);
                } else {
                    throw new MethodNotImplementedException();
                }
            }
        }

        return CellRenderer;
    }

    private adaptComponentToEditor(componentType:{ new(...args:any[]): AgEditorComponent; },
                                   viewContainerRef:ViewContainerRef,
                                   compiler:RuntimeCompiler,
                                   name:string,
                                   initializer:(instance:AgEditorComponent, params?:any) => void,
                                   moduleImports:any[],
                                   childDependencies?:any[]):{new(): ICellEditor} {

        let that = this;
        class CellEditor implements ICellEditor {
            private _params:any;
            private _eGui:HTMLElement;
            private _componentRef:ComponentRef<AgEditorComponent>;
            private _editorAwareComponent:AgEditorComponent;

            constructor() {
                this._componentRef = that.createComponentSync(componentType,
                    viewContainerRef,
                    compiler,
                    name,
                    moduleImports,
                    childDependencies);
                this._editorAwareComponent = this._componentRef.instance;
                this._eGui = this._componentRef.location.nativeElement;
            }

            init(params:any):void {
                this._params = params;

                if (initializer) {
                    initializer(this._editorAwareComponent, this._params);
                }
            }

            getGui():HTMLElement {
                return this._eGui;
            }

            getValue():any {
                return this._editorAwareComponent.getValue();
            }

            isPopup():boolean {
                return this._editorAwareComponent.isPopup ?
                    this._editorAwareComponent.isPopup() : false;
            }

            destroy():void {
                if (this._componentRef) {
                    this._componentRef.destroy();
                }
            }

            isCancelBeforeStart():boolean {
                return this._editorAwareComponent.isCancelBeforeStart ?
                    this._editorAwareComponent.isCancelBeforeStart() : false;
            }

            isCancelAfterEnd():boolean {
                return this._editorAwareComponent.isCancelAfterEnd ?
                    this._editorAwareComponent.isCancelAfterEnd() : false;
            }

            refresh(params:any):void {
                this._params = params;

                let instance:any = this._componentRef.instance;
                if (instance.refresh) {
                    instance.refresh(params);
                }
            }
        }

        return CellEditor;
    }

    public createComponent<T>(componentType:{ new(...args:any[]): T; },
                              viewContainerRef:ViewContainerRef,
                              compiler:RuntimeCompiler,
                              name:string,
                              moduleImports:any[],
                              childDependencies?:any[]):Promise<ComponentRef<T>> {
        return new Promise<ComponentRef<T>>((resolve) => {
            let module:any = this._cacheOfModules[name];
            if (!module) {
                module = this.createComponentModule(componentType, moduleImports, childDependencies);
                this._cacheOfModules[name] = module;
            }
            compiler
                .compileModuleAndAllComponentsAsync(module)
                .then((moduleWithFactories:ModuleWithComponentFactories<T>) => {
                    let factory:ComponentFactory<T> = null;
                    for (let i = 0; i < moduleWithFactories.componentFactories.length && factory === null; i++) {
                        if (moduleWithFactories.componentFactories[i].componentType === componentType) {
                            factory = moduleWithFactories.componentFactories[i];
                        }
                    }

                    let componentRef = viewContainerRef.createComponent(factory);
                    resolve(componentRef);
                });
        });
    }

    public createComponentSync<T>(componentType:{ new(...args:any[]): T; },
                                  viewContainerRef:ViewContainerRef,
                                  compiler:RuntimeCompiler,
                                  name:string,
                                  moduleImports:any[],
                                  childDependencies?:any[]):ComponentRef<T> {
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


    private  createComponentModule(componentType:any, moduleImports:any[], childDependencies?:any[]) {
        let moduleDeclarations = [componentType];
        if (childDependencies) {
            moduleDeclarations.push(childDependencies)
        }

        @NgModule({
            imports: moduleImports,
            declarations: moduleDeclarations,
            exports: []
        })
        class RuntimeComponentModule {
        }
        // a module for just this Type
        return RuntimeComponentModule;
    }

    private adaptTemplate(viewContainerRef:ViewContainerRef,
                          compiler:RuntimeCompiler,
                          template:string):{new(): ICellRenderer} {
        let componentType:{ new(...args:any[]): AgRendererComponent; } = createDynamicComponentType('dynamic-component', template);
        return this.adaptComponentToRenderer(componentType,
            viewContainerRef,
            compiler,
            template,
            (i:AgRendererComponent, p:any) => i.agInit(p),
            []);
    }
}

function createDynamicComponentType(selector:string, template:string):any {
    @Component({selector: selector, template: template})
    class DynamicComponent implements AgRendererComponent {
        private params:any;

        agInit(params:any):void {
            this.params = params;
        }
    }
    return DynamicComponent;
}

