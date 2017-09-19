import {autoinject, Container, TaskQueue, transient, View, ViewCompiler, ViewResources} from "aurelia-framework";
import {BaseComponentWrapper, Bean, FrameworkComponentWrapper, WrapableInterface} from 'ag-grid';

@autoinject()
@transient()
@Bean("frameworkComponentWrapper")
export class AureliaFrameworkComponentWrapper extends BaseComponentWrapper<WrapableInterface> implements FrameworkComponentWrapper {
    private _container: Container;
    private _viewResources: ViewResources;

    constructor(private taskQueue: TaskQueue, private _viewCompiler: ViewCompiler) {
        super();
    }

    createWrapper(template: any): WrapableInterface {
        let that = this;

        class DynamicComponent extends BaseGuiComponent implements WrapableInterface {
            constructor() {
                super(that.taskQueue, that._viewCompiler);
            }

            init(params: any): void {
                super.init(params, template.template, that._viewResources, that._container);
            }

            hasMethod(name: string): boolean {
                return wrapper.getFrameworkComponentInstance()[name] != null;
            }

            callMethod(name: string, args: IArguments): void {
                const componentRef = this.getFrameworkComponentInstance();
                return wrapper.getFrameworkComponentInstance()[name].apply(componentRef, args)

            }

            addMethod(name: string, callback: Function): void {
                (<any>wrapper)[name] = callback
            }
        }

        let wrapper: DynamicComponent = new DynamicComponent();
        return wrapper;
    }

    public setContainer(container: Container): void {
        this._container = container;
    }

    public setViewResources(viewResources: ViewResources): void {
        this._viewResources = viewResources;
    }
}

abstract class BaseGuiComponent {
    private _taskQueue: TaskQueue;
    private _viewCompiler: ViewCompiler;

    protected _params: any;
    protected _frameworkComponentInstance: any;  // the users component - for accessing methods they create
    protected _view: View;

    constructor(taskQueue: TaskQueue, viewCompiler: ViewCompiler) {
        this._taskQueue = taskQueue;
        this._viewCompiler = viewCompiler;
    }

    init(params: any, template: any, viewResources: ViewResources, container: Container) {
        this._params = params;

        let bindingContext = {params: params};

        let viewFactory = this._viewCompiler.compile(template, viewResources);
        this._view = viewFactory.create(container);
        let controllers: any[] = (<any> this._view).controllers;
        //initialize each controller
        if (controllers && controllers.length) {
            controllers.forEach((c) => {
                c.viewModel.params = params;
            });
            this._view.bind(bindingContext);
            //ICellRenderer doesn't have a guiAttached method so
            //we call attach on the queue;
            this._taskQueue.queueMicroTask(() => this._view.attached());
        }
        else {
            this._view.bind(bindingContext);
        }
    }

    getGui(): HTMLElement {
        return this._view.fragment as HTMLElement;
    }


    destroy() {
        this._view.returnToCache();
    }

    refresh(params: any): boolean {
        return false;
    }

    public getFrameworkComponentInstance(): any {
        return this._frameworkComponentInstance;
    }

}
