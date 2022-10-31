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
