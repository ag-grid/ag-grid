import { Component, ComponentFactory, ViewContainerRef, ComponentFactoryResolver, ComponentRef, Type, Injectable } from '@angular/core';
import { NgModule }        from '@angular/core';
import { RuntimeCompiler } from "@angular/compiler";

import { ICellRenderer, ICellEditor }   from 'ag-grid/main';
import {AgAware} from "./agAware";
import {AgEditorAware} from "./agEditorAware";

@Injectable()
export class AgComponentFactory {
    private _cacheOfModules:any = {};

    constructor(private compiler:RuntimeCompiler) {
    }

    public createCellRendererFromComponent<T extends Object>(componentType:{ new(...args:any[]): T; },
                                                             viewContainerRef:ViewContainerRef,
                                                             childDependencies?:any[],
                                                             moduleImports?:any[]):{new(): ICellRenderer} {
        let componentAsFunction:any = componentType;
        return this.adaptComponentToRenderer(componentType, viewContainerRef, this.compiler, componentAsFunction.name, (instance:any, params?:any) => {
                if (instance.agInit) {
                    instance.agInit(params);
                }
            },
            moduleImports ? moduleImports : [],
            childDependencies);
    }

    public createCellEditorFromComponent(componentType:{ new(...args:any[]): AgEditorAware; },
                                         viewContainerRef:ViewContainerRef,
                                         childDependencies?:any[],
                                         moduleImports?:any[]):{new(): ICellRenderer} {
        let componentAsFunction:any = componentType;
        return this.adaptComponentToEditor(componentType, viewContainerRef, this.compiler, componentAsFunction.name, (instance:any, params?:any) => {
                if (instance.agInit) {
                    instance.agInit(params);
                }
            },
            moduleImports ? moduleImports : [],
            childDependencies);
    }

    public createCellRendererFromTemplate(template:string,
                                          viewContainerRef:ViewContainerRef):{new(): ICellRenderer} {
        return this.adaptTemplate(viewContainerRef, this.compiler, template);
    }

    private adaptComponentToRenderer<T>(componentType:{ new(...args:any[]): T; },
                                        viewContainerRef:ViewContainerRef,
                                        compiler:RuntimeCompiler,
                                        name:string,
                                        initializer:(instance:T, params?:any) => void,
                                        moduleImports:any[],
                                        childDependencies?:any[]):{new(): ICellRenderer} {

        let that = this;
        class CellRenderer implements ICellRenderer {
            private _params:any;
            private _componentRef:ComponentRef<T>;

            init(params:any):void {
                this._params = params;
            }

            getGui():HTMLElement {
                let div = document.createElement('div');
                that.createComponent(componentType, viewContainerRef, compiler, name, moduleImports, childDependencies).then(cr => {
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
                }
            }
        }

        return CellRenderer;
    }

    private adaptComponentToEditor(componentType:{ new(...args:any[]): AgEditorAware; },
                                   viewContainerRef:ViewContainerRef,
                                   compiler:RuntimeCompiler,
                                   name:string,
                                   initializer:(instance:AgEditorAware, params?:any) => void,
                                   moduleImports:any[],
                                   childDependencies?:any[]):{new(): ICellEditor} {

        let that = this;
        class CellEditor implements ICellEditor {
            private _params:any;
            private eGui:HTMLElement;
            private _componentRef:ComponentRef<AgEditorAware>;
            private _editorAwareComponent:AgEditorAware;

            constructor() {
                this.eGui = document.createElement('div');
                this._componentRef = that.createComponentSync(componentType, viewContainerRef, compiler, name, moduleImports, childDependencies);
                this._editorAwareComponent = this._componentRef.instance;
                this.eGui.appendChild(this._componentRef.location.nativeElement);
            }

            init(params:any):void {
                this._params = params;

                if (initializer) {
                    initializer(this._editorAwareComponent, this._params);
                }
            }

            getGui():HTMLElement {
                return this.eGui;
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
                .then((moduleWithFactories) => {
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

    private adaptTemplate<T>(viewContainerRef:ViewContainerRef,
                             compiler:RuntimeCompiler,
                             template:string):{new(): ICellRenderer} {
        let componentType:{ new(...args:any[]): any; } = createDynamicComponentType('dynamic-component', template);
        return this.adaptComponentToRenderer(componentType, viewContainerRef, compiler, template, (i:DynamicComponent, p:any) => i.params = p, []);
    }
}


/**
 From Template
 */
class DynamicComponent {
    public params:any = null;
}

function createDynamicComponentType(selector:string, template:string):any {
    @Component({selector: selector, template: template})
    class Fake extends DynamicComponent {
    }
    return Fake;
}

