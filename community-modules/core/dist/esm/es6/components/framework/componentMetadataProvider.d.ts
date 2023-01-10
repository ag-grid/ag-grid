// Type definitions for @ag-grid-community/core v29.0.0
// Project: https://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { IComponent } from "../../interfaces/iComponent";
import { BeanStub } from "../../context/beanStub";
export interface ComponentMetadata {
    mandatoryMethodList: string[];
    optionalMethodList: string[];
    functionAdapter?: (callback: any) => {
        new (): IComponent<any>;
    };
}
export declare class ComponentMetadataProvider extends BeanStub {
    private componentMetaData;
    private agComponentUtils;
    postConstruct(): void;
    retrieve(name: string): ComponentMetadata;
}
