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
                let frameworkComponentInstance = wrapper.getFrameworkComponentInstance();
                if (frameworkComponentInstance == null){
                    console.debug(`ag grid: ${name} It seems like you are using react fiber (>v16.0.0). Ag-grid has experimental support for it, please if there is any issue that you find let us know`);
                    return true;
                }
                return frameworkComponentInstance[name] != null;
            }

            callMethod(name: string, args: IArguments): void {
                let frameworkComponentInstance = this.getFrameworkComponentInstance();

                if (frameworkComponentInstance == null){
                    setTimeout(()=>this.callMethod(name, args), 100);
                }else{
                    let method = wrapper.getFrameworkComponentInstance()[name];
                    if (method == null) return null;
                    return method.apply(frameworkComponentInstance, args)
                }

            }

            addMethod(name: string, callback: Function): void {
                wrapper[name] = callback
            }
        }

        const wrapper: DynamicAgReactComponent = new DynamicAgReactComponent();
        return wrapper;
    }

}