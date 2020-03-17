import { IComponent } from "../../interfaces/iComponent";
import { AgGridComponentFunctionInput } from "./userComponentRegistry";
export interface ComponentMetadata {
    mandatoryMethodList: string[];
    optionalMethodList: string[];
    functionAdapter?: (callback: AgGridComponentFunctionInput) => {
        new (): IComponent<any>;
    };
}
export declare class ComponentMetadataProvider {
    private componentMetaData;
    private agComponentUtils;
    postConstruct(): void;
    retrieve(name: string): ComponentMetadata;
}
