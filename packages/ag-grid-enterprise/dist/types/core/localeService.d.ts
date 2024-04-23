import { BeanStub } from "./context/beanStub";
export declare class LocaleService extends BeanStub {
    getLocaleTextFunc(): (key: string, defaultValue: string, variableValues?: string[]) => string;
}
