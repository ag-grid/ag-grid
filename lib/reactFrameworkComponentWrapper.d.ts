// ag-grid-react v14.2.0
import { BaseComponentWrapper, FrameworkComponentWrapper, WrapableInterface } from "ag-grid";
export declare class ReactFrameworkComponentWrapper extends BaseComponentWrapper<WrapableInterface> implements FrameworkComponentWrapper {
    private agGridReact;
    createWrapper(ReactComponent: {
        new (): any;
    }): WrapableInterface;
}
