// ag-grid-react v11.0.0
import { IComponent, FrameworkComponentWrapper } from 'ag-grid';
export declare class ReactFrameworkComponentWrapper implements FrameworkComponentWrapper {
    wrap<A extends IComponent<any>>(ReactComponent: {
        new (): any;
    }, methodList: string[]): A;
}
