import type { AgCoreBean } from './iBean';

export interface IRegistry<TBeanCollection, TDynamicBeanName extends string> {
    createDynamicBean<T extends AgCoreBean<TBeanCollection>>(
        name: TDynamicBeanName,
        mandatory: boolean,
        ...args: any[]
    ): T | undefined;

    getIcon(name: string): string | undefined;
}
