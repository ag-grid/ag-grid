// ag-grid-react v12.0.0
import { FrameworkComponentWrapper, BaseComponentWrapper, WrapableInterface } from 'ag-grid';
export declare class ReactFrameworkComponentWrapper extends BaseComponentWrapper<WrapableInterface> implements FrameworkComponentWrapper {
    createWrapper(ReactComponent: {
        new (): any;
    }): WrapableInterface;
}
