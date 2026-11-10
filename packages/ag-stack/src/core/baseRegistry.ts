import type { AgBeanCollection } from '../interfaces/agBeanCollection';
import type { BaseEvents } from '../interfaces/baseEvents';
import type { BaseProperties } from '../interfaces/baseProperties';
import type { ClassImp } from '../interfaces/iContext';
import type { IPropertiesService } from '../interfaces/iProperties';
import type { IRegistry } from '../interfaces/iRegistry';
import { AgAbstractBean } from './agAbstractBean';

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export abstract class BaseRegistry<
    TBeanCollection extends AgBeanCollection<TProperties, TGlobalEvents, TCommon, TPropertiesService>,
    TProperties extends BaseProperties,
    TGlobalEvents extends BaseEvents,
    TCommon,
    TPropertiesService extends IPropertiesService<TProperties>,
    TDynamicBeanName extends string,
>
    extends AgAbstractBean<TBeanCollection, TProperties, TGlobalEvents, TPropertiesService>
    implements IRegistry<TBeanCollection, TDynamicBeanName>
{
    beanName = 'registry' as const;

    #dynamicBeans: { [K in TDynamicBeanName]?: new (args?: any[]) => object };

    protected registerDynamicBeans(dynamicBeans?: Partial<Record<TDynamicBeanName, ClassImp>>): void {
        if (dynamicBeans) {
            // initialise the dynamic beans registry on first use
            this.#dynamicBeans ??= {};
            for (const name of Object.keys(dynamicBeans) as TDynamicBeanName[]) {
                this.#dynamicBeans[name] = dynamicBeans[name];
            }
        }
    }

    public createDynamicBean<T>(name: TDynamicBeanName, mandatory: boolean, ...args: any[]): T | undefined {
        if (!this.#dynamicBeans) {
            // this happens when a module tries to init a dynamic bean during module initialization lifecycle
            throw this.createDynamicError(name, true);
        }

        const BeanClass = this.#dynamicBeans[name];

        if (BeanClass == null) {
            if (mandatory) {
                throw this.createDynamicError(name, false);
            }
            return undefined;
        }

        return new BeanClass(...args) as any;
    }

    protected abstract createDynamicError(name: TDynamicBeanName, init: boolean): Error;
}
