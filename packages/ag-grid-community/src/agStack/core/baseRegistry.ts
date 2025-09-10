import type { AgCoreBeanCollection } from '../interfaces/agCoreBeanCollection';
import type { BaseEvents } from '../interfaces/baseEvents';
import type { BaseProperties } from '../interfaces/baseProperties';
import type { ClassImp } from '../interfaces/iContext';
import type { IPropertiesService } from '../interfaces/iProperties';
import type { IRegistry } from '../interfaces/iRegistry';
import { AgBeanStub } from './agBeanStub';

export abstract class BaseRegistry<
        TBeanCollection extends AgCoreBeanCollection<TProperties, TGlobalEvents, TCommon, TPropertiesService>,
        TProperties extends BaseProperties,
        TGlobalEvents extends BaseEvents,
        TCommon,
        TPropertiesService extends IPropertiesService<TProperties, TCommon>,
        TDynamicBeanName extends string,
    >
    extends AgBeanStub<TBeanCollection, TProperties, TGlobalEvents, TCommon, TPropertiesService>
    implements IRegistry<TBeanCollection, TDynamicBeanName>
{
    beanName = 'registry' as const;

    private dynamicBeans: { [K in TDynamicBeanName]?: new (args?: any[]) => object };

    protected registerDynamicBeans(dynamicBeans?: Partial<Record<TDynamicBeanName, ClassImp>>): void {
        if (dynamicBeans) {
            // initialise the dynamic beans registry on first use
            this.dynamicBeans ??= {};
            for (const name of Object.keys(dynamicBeans) as TDynamicBeanName[]) {
                this.dynamicBeans[name] = dynamicBeans[name];
            }
        }
    }

    public createDynamicBean<T>(name: TDynamicBeanName, mandatory: boolean, ...args: any[]): T | undefined {
        if (!this.dynamicBeans) {
            // this happens when a module tries to init a dynamic bean during module initialization lifecycle
            throw new Error(this.getDynamicError(name, true));
        }

        const BeanClass = this.dynamicBeans[name];

        if (BeanClass == null) {
            if (mandatory) {
                throw new Error(this.getDynamicError(name, false));
            }
            return undefined;
        }

        return new BeanClass(...args) as any;
    }

    protected abstract getDynamicError(name: TDynamicBeanName, init: boolean): string;
}
