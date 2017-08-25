// ag-grid-react v13.0.0
import { BaseComponentWrapper, FrameworkComponentWrapper, WrapableInterface } from "ag-grid";
export declare class ReactFrameworkComponentWrapper extends BaseComponentWrapper<WrapableInterface> implements FrameworkComponentWrapper {
    createWrapper(ReactComponent: {
        new (): any;
    }): WrapableInterface;
}
