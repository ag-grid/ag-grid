import type { NamedBean } from './context/bean';
import { BeanStub } from './context/beanStub';
export declare class LocaleService extends BeanStub implements NamedBean {
    beanName: "localeService";
    getLocaleTextFunc(): (key: string, defaultValue: string, variableValues?: string[]) => string;
}
