// ag-grid-react v10.1.0
import { IComponent } from 'ag-grid';
import { FrameworkComponentWrapper } from 'ag-grid';
export declare class ReactFrameworkComponentWrapper implements FrameworkComponentWrapper {
    wrap<A extends IComponent<any>>(ReactComponent: {
        new (): any;
    }, methodList: string[]): A;
}
