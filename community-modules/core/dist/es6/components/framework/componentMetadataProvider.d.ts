// Type definitions for @ag-grid-community/core v25.3.0
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { IComponent } from "../../interfaces/iComponent";
import { AgGridComponentFunctionInput } from "./userComponentRegistry";
import { BeanStub } from "../../context/beanStub";
export interface ComponentMetadata {
    mandatoryMethodList: string[];
    optionalMethodList: string[];
    functionAdapter?: (callback: AgGridComponentFunctionInput) => {
        new (): IComponent<any>;
    };
}
export declare class ComponentMetadataProvider extends BeanStub {
    private componentMetaData;
    private agComponentUtils;
    postConstruct(): void;
    retrieve(name: string): ComponentMetadata;
}
