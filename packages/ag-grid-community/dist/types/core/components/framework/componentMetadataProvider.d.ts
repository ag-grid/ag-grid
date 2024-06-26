import type { NamedBean } from '../../context/bean';
import { BeanStub } from '../../context/beanStub';
import type { BeanCollection } from '../../context/context';
import type { IComponent } from '../../interfaces/iComponent';
export interface ComponentMetadata {
    mandatoryMethodList: string[];
    optionalMethodList: string[];
    functionAdapter?: (callback: any) => {
        new (): IComponent<any>;
    };
}
export declare class ComponentMetadataProvider extends BeanStub implements NamedBean {
    beanName: "componentMetadataProvider";
    private componentMetaData;
    private agComponentUtils;
    wireBeans(beans: BeanCollection): void;
    postConstruct(): void;
    retrieve(name: string): ComponentMetadata;
}
