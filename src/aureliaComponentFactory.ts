import {autoinject, ViewCompiler, Container, transient, View, ViewFactory} from 'aurelia-framework';

import {
    ICellRenderer,
    ICellEditor,
    // MethodNotImplementedException,
    // RowNode,
    // IDoesFilterPassParams,
    // IFilter,
    // IFilterParams,
    // IAfterFilterGuiAttachedParams
}   from 'ag-grid/main';


// import {AgFrameworkComponent} from "./agFrameworkComponent";
// import {AgFilterComponent} from "./agFilterComponent";
import {IAureliaEditorViewModel} from './editorViewModels';

@autoinject()
@transient()
export class AureliaComponentFactory {
    constructor(private _viewCompiler: ViewCompiler) {
    }

    public createRendererFromTemplate(container: Container, viewFactory: ViewFactory): {new(): ICellRenderer} {
        class CellRendererComponent implements ICellRenderer {
            private view: View;

            init(params: any) {
                let bindingContext = {params: params};
                this.view = viewFactory.create(container);
                this.view.bind(bindingContext);
            }

            getGui(): HTMLElement {
                return this.view.fragment as HTMLElement;
            }

            destroy() {
                this.view.returnToCache();
            }

        }

        return CellRendererComponent;
    }

    public createEditorFromTemplate(container: Container, viewFactory: ViewFactory): {new(): ICellEditor} {

        class CellEditor implements ICellEditor {

            private view: View;
            private editorVm: IAureliaEditorViewModel;


            init(params: any): void {
                let bindingContext = {params: params};
                this.view = viewFactory.create(container);
                this.view.bind(bindingContext);

                let controllers: any[] = (<any> this.view).controllers;

                //only one controller is allowed in editor template
                if (controllers &&
                    controllers.length == 1 &&
                    controllers[0].viewModel) {
                    this.editorVm = controllers[0].viewModel;
                    //this is a 'hack' because we don't have params.bind="" in the template
                    //must reset params or it will be nothing
                    this.editorVm.params = params;
                }
                else {
                    console.error('The editor template component is missing an IEditorViewModel or it contains more than one component');
                }
            }

            public afterGuiAttached() {
                this.view.attached();
            }

            public getGui(): HTMLElement {
                return this.view.fragment as HTMLElement;
            }

            destroy() {
                if (this.editorVm.destroy) {
                    this.editorVm.destroy();
                }
                this.view.returnToCache();
            }

            getValue(): any {
                return this.editorVm.getValue();
            }

            isPopup(): boolean {
                return this.editorVm.isPopup ?
                    this.editorVm.isPopup() : false;
            }

            isCancelBeforeStart(): boolean {
                return this.editorVm.isCancelBeforeStart ?
                    this.editorVm.isCancelBeforeStart() : false;
            }

            isCancelAfterEnd(): boolean {
                return this.editorVm.isCancelAfterEnd ?
                    this.editorVm.isCancelAfterEnd() : false;
            }

            focusIn(): void {
                if (this.editorVm.focusIn) {
                    this.editorVm.focusIn();
                }
            }

            focusOut(): void {
                if (this.editorVm.focusOut) {
                    this.editorVm.focusOut();
                }
            }

        }

        return CellEditor;

    }


    // private adaptComponentToFilter(componentType:{ new(...args:any[]): AgFilterComponent; },
    //                                viewContainerRef:Container,
    //                                compiler:ViewCompiler,
    //                                name:string,
    //                                moduleImports:any[],
    //                                childDependencies:any[]):{new(): IFilter} {
    //
    //     let that = this;
    //     class Filter extends BaseGuiComponent<IFilterParams, AgFilterComponent> implements IFilter {
    //         init(params:IFilterParams):void {
    //             super.init(params);
    //             this._componentRef.changeDetectorRef.detectChanges();
    //         }
    //
    //         isFilterActive():boolean {
    //             return this._agAwareComponent.isFilterActive();
    //         }
    //
    //         doesFilterPass(params:IDoesFilterPassParams):boolean {
    //             return this._agAwareComponent.doesFilterPass(params);
    //         }
    //
    //         getModel():any {
    //             return this._agAwareComponent.getModel();
    //         }
    //
    //         setModel(model:any):void {
    //             this._agAwareComponent.setModel(model);
    //         }
    //
    //         afterGuiAttached(params:IAfterFilterGuiAttachedParams):void {
    //             if (this._agAwareComponent.afterGuiAttached) {
    //                 this._agAwareComponent.afterGuiAttached(params);
    //             }
    //         }
    //
    //         getFrameworkComponentInstance():any {
    //             return this._frameworkComponentInstance;
    //         }
    //
    //         protected createComponent():ComponentRef<AgFilterComponent> {
    //             return that.createComponent(componentType,
    //                 viewContainerRef,
    //                 compiler,
    //                 name,
    //                 moduleImports,
    //                 childDependencies);
    //         }
    //
    //     }
    //
    //     return Filter;
    // }


    // public createComponent<T>(componentType:{ new(...args:any[]): T; },
    //                           viewContainerRef:Container,
    //                           compiler:ViewCompiler,
    //                           name:string,
    //                           moduleImports:any[],
    //                           childDependencies:any[]):ComponentRef<T> {
    //     let factory:ComponentFactory<any> = this._factoryCache[name];
    //     if (!factory) {
    //         let module = this.createComponentModule(componentType, moduleImports, childDependencies);
    //         let moduleWithFactories = compiler.compileModuleAndAllComponentsSync(module);
    //
    //         factory = moduleWithFactories.componentFactories.find((factory:ComponentFactory<T>) => factory.componentType === componentType);
    //         this._factoryCache[name] = factory;
    //     }
    //
    //     return viewContainerRef.createComponent(factory);
    // }


    // private  createComponentModule(componentType:any, moduleImports:any[], childDependencies:any[]):any {
    //     @NgModule({
    //         imports: moduleImports,
    //         declarations: [componentType, ...childDependencies],
    //         exports: []
    //     })
    //     class RuntimeComponentModule {
    //     }
    //     // a module for just this Type
    //     return RuntimeComponentModule;
    // }
    //
    // private createDynamicComponentType(selector:string, template:string):any {
    //     @Component({selector: selector, template: template})
    //     class DynamicComponent implements AgRendererComponent {
    //         private params:any;
    //
    //         agInit(params:any):void {
    //             this.params = params;
    //         }
    //
    //         // not applicable for template components
    //         getFrameworkComponentInstance():any {
    //             return undefined;
    //         }
    //
    //         // not applicable for template components
    //         refresh(params:any):void {
    //         }
    //     }
    //     return DynamicComponent;
    // }
}

// abstract class BaseGuiComponent<P, T extends AgFrameworkComponent<P>> {
//     protected _params:P;
//     protected _eGui:HTMLElement;
//     protected _componentRef:ComponentRef<T>;
//     protected _agAwareComponent:T;
//     protected _frameworkComponentInstance:any;  // the users component - for accessing methods they create
//
//     protected init(params:P):void {
//         this._params = params;
//
//         this._componentRef = this.createComponent();
//         this._agAwareComponent = this._componentRef.instance;
//         this._frameworkComponentInstance = this._componentRef.instance;
//         this._eGui = this._componentRef.location.nativeElement;
//
//         this._agAwareComponent.agInit(this._params);
//     }
//
//     public getGui():HTMLElement {
//         return this._eGui;
//     }
//
//     public destroy():void {
//         if (this._componentRef) {
//             this._componentRef.destroy();
//         }
//     }
//
//     public getFrameworkComponentInstance():any {
//         return this._frameworkComponentInstance;
//     }
//
//     protected abstract createComponent():ComponentRef<T>;
// }

