import {Bean, IComponent, FrameworkComponentWrapper}  from 'ag-grid';
import {AgReactComponent} from './agReactComponent';

@Bean ('frameworkComponentWrapper')
export class ReactFrameworkComponentWrapper implements  FrameworkComponentWrapper {
    wrap <A extends IComponent<any>>(ReactComponent: { new (): any}, methodList: string[]): A{
        class DynamicAgReactComponent extends AgReactComponent implements IComponent<any> {

            constructor() {
                super(ReactComponent);
            }

            public init(params: any) {
                super.init(<any>params);
            }

        }

        const wrapper : DynamicAgReactComponent= new DynamicAgReactComponent ();
        methodList.forEach((methodName=>{
            const methodProxy: Function = function (){
                if (wrapper.reactComponent.prototype[methodName]) {
                    const componentRef = this.getFrameworkComponentInstance();
                    return wrapper.reactComponent.prototype[methodName].apply (componentRef, arguments)
                } else {
                    console.warn('ag-Grid: React component is missing the method ' + methodName + '()');
                    return null;
                }
            };

            wrapper[methodName] = methodProxy

        }));


        return <A><any>wrapper;
    }
}