import {Bean}  from 'ag-grid';
import {IComponent}  from 'ag-grid';
import {FrameworkComponentWrapper}  from 'ag-grid';

@Bean ("frameworkComponentWrapper")
export class Ng2FrameworkComponentWrapper implements  FrameworkComponentWrapper {
    wrap <A extends IComponent<any>>(Ng2Component: { new (): any}, methodList: string[]): A{
        throw Error ("Needs to be implemented");
        // class DynamicAgNg2Component extends AgNg2Component implements IComponent<any> {
        //
        //     constructor() {
        //         super(Ng2Component);
        //     }
        //
        //     public init(params: any) {
        //         super.init(<any>params);
        //     }
        //
        // }
        //
        // let wrapper : DynamicAgNg2Component= new DynamicAgNg2Component ();
        // methodList.forEach((methodName=>{
        //     let methodProxy: Function = function (){
        //         if (wrapper.Ng2Component.prototype[methodName]) {
        //             var componentRef = this.getFrameworkComponentInstance();
        //             return wrapper.Ng2Component.prototype[methodName].apply (componentRef, arguments)
        //         } else {
        //             console.warn('ag-Grid: React dateComponent is missing the method ' + methodName + '()');
        //             return null;
        //         }
        //     };
        //
        //     wrapper[methodName] = methodProxy
        //
        // }));
        //
        //
        // return <A><any>wrapper;
    }
}