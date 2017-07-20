import {Bean, IComponent, FrameworkComponentWrapper, BaseComponentWrapper, WrapableInterface}  from 'ag-grid';
import {AgReactComponent} from './agReactComponent';

@Bean ('frameworkComponentWrapper')
export class ReactFrameworkComponentWrapper extends BaseComponentWrapper<WrapableInterface> implements  FrameworkComponentWrapper {
    createWrapper (ReactComponent: { new (): any}): WrapableInterface{
        class DynamicAgReactComponent extends AgReactComponent implements IComponent<any>, WrapableInterface {

            constructor() {
                super(ReactComponent);
            }

            public init(params: any) {
                super.init(<any>params);
            }

            hasMethod(name: string): boolean{
                return wrapper.getFrameworkComponentInstance()[name] != null;
            }

            callMethod(name: string, args: IArguments): void{
                var componentRef = this.getFrameworkComponentInstance();
                return wrapper.getFrameworkComponentInstance()[name].apply(componentRef, args)

            }
            addMethod(name:string, callback:Function): void {
                wrapper[name] = callback
            }
        }

        const wrapper : DynamicAgReactComponent= new DynamicAgReactComponent ();
        return wrapper;
    }
}