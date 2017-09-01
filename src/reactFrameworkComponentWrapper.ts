import {Autowired, BaseComponentWrapper, Bean, FrameworkComponentWrapper, IComponent, WrapableInterface, IAfterGuiAttachedParams} from "ag-grid";
import {AgReactComponent} from "./agReactComponent";
import {AgGridReact} from "./agGridReact";

@Bean('frameworkComponentWrapper')
export class ReactFrameworkComponentWrapper extends BaseComponentWrapper<WrapableInterface> implements FrameworkComponentWrapper {
    @Autowired('agGridReact')
    private agGridReact:AgGridReact;

    createWrapper(ReactComponent: { new (): any }): WrapableInterface {
        let _self = this;
        class DynamicAgReactComponent extends AgReactComponent implements IComponent<any, IAfterGuiAttachedParams>, WrapableInterface {

            constructor() {
                super(ReactComponent, _self.agGridReact);
            }

            public init(params: any) {
                super.init(<any>params);
            }

            hasMethod(name: string): boolean {
                return wrapper.getFrameworkComponentInstance()[name] != null;
            }

            callMethod(name: string, args: IArguments): void {
                var componentRef = this.getFrameworkComponentInstance();
                return wrapper.getFrameworkComponentInstance()[name].apply(componentRef, args)

            }

            addMethod(name: string, callback: Function): void {
                wrapper[name] = callback
            }
        }

        const wrapper: DynamicAgReactComponent = new DynamicAgReactComponent();
        return wrapper;
    }

}