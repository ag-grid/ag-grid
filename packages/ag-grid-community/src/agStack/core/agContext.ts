import type { AgBaseBean } from '../interfaces/agBaseBean';
import type { AgSingletonBean } from '../interfaces/agCoreBean';
import type { AgCoreBeanCollection } from '../interfaces/agCoreBeanCollection';
import type { BaseEvents } from '../interfaces/baseEvents';
import type { BaseProperties } from '../interfaces/baseProperties';
import type { IContext } from '../interfaces/iContext';
import type { IPropertiesService } from '../interfaces/iProperties';

type BeanComparator<TBeanCollection> = (
    bean1: AgSingletonBean<TBeanCollection>,
    bean2: AgSingletonBean<TBeanCollection>
) => number;

export interface AgContextParams<
    TBeanCollection extends AgCoreBeanCollection<TProperties, TGlobalEvents, TCommon, TPropertiesService>,
    TProperties extends BaseProperties,
    TGlobalEvents extends BaseEvents,
    TCommon,
    TPropertiesService extends IPropertiesService<TProperties, TCommon>,
> {
    providedBeanInstances: Partial<TBeanCollection>;
    beanClasses: AgSingletonBeanClass<TBeanCollection>[];
    derivedBeans?: ((
        context: AgContext<TBeanCollection, TProperties, TGlobalEvents, TCommon, TPropertiesService>
    ) => DerivedBean<TBeanCollection, keyof TBeanCollection>)[];
    beanInitComparator?: BeanComparator<TBeanCollection>;
    beanDestroyComparator?: BeanComparator<TBeanCollection>;
    id: string;
    destroyCallback?: () => void;
}

export interface AgSingletonBeanClass<TBeanCollection> {
    new (): AgSingletonBean<TBeanCollection>;
}

interface DerivedBean<TBeanCollection, K extends keyof TBeanCollection> {
    beanName: K;
    bean: TBeanCollection[K] & AgSingletonBean<TBeanCollection>;
}

/** Instance Id used by React to reset the state of a component tree when the context changes. */
let contextId = 1;

export class AgContext<
    TBeanCollection extends AgCoreBeanCollection<TProperties, TGlobalEvents, TCommon, TPropertiesService>,
    TProperties extends BaseProperties,
    TGlobalEvents extends BaseEvents,
    TCommon,
    TPropertiesService extends IPropertiesService<TProperties, TCommon>,
> implements IContext<TBeanCollection>
{
    protected beans: TBeanCollection = {} as TBeanCollection;
    private createdBeans: AgSingletonBean<TBeanCollection>[] = [];
    private readonly beanDestroyComparator?: BeanComparator<TBeanCollection>;
    private id: string;
    private destroyCallback?: () => void;

    private destroyed = false;

    public readonly instanceId: number = contextId++;

    constructor(params: AgContextParams<TBeanCollection, TProperties, TGlobalEvents, TCommon, TPropertiesService>) {
        if (!params?.beanClasses) {
            return;
        }

        this.beanDestroyComparator = params.beanDestroyComparator;

        this.init(params);
    }

    protected init(
        params: AgContextParams<TBeanCollection, TProperties, TGlobalEvents, TCommon, TPropertiesService>
    ): void {
        this.id = params.id;
        this.beans.context = this;
        this.destroyCallback = params.destroyCallback;

        for (const beanName of Object.keys(params.providedBeanInstances) as (keyof TBeanCollection)[]) {
            this.beans[beanName] = params.providedBeanInstances[beanName] as any;
        }

        for (const BeanClass of params.beanClasses) {
            const instance = new BeanClass();
            if (instance.beanName) {
                this.beans[instance.beanName] = instance as any;
            } else {
                // eslint-disable-next-line no-console
                console.error(`Bean ${BeanClass.name} is missing beanName`);
            }
            this.createdBeans.push(instance);
        }

        for (const beanFunc of params.derivedBeans ?? []) {
            const { beanName, bean } = beanFunc(this);
            this.beans[beanName] = bean;
            this.createdBeans.push(bean);
        }

        if (params.beanInitComparator) {
            // sort the beans so that they are in a consistent order
            this.createdBeans.sort(params.beanInitComparator);
        }

        this.initBeans(this.createdBeans);
    }

    private getBeanInstances(): AgSingletonBean<TBeanCollection>[] {
        return Object.values(this.beans);
    }

    public createBean<T extends AgBaseBean<TBeanCollection>>(
        bean: T,
        afterPreCreateCallback?: (bean: AgBaseBean<TBeanCollection>) => void
    ): T {
        this.initBeans([bean], afterPreCreateCallback);
        return bean;
    }

    private initBeans(
        beanInstances: AgBaseBean<TBeanCollection>[],
        afterPreCreateCallback?: (bean: AgBaseBean<TBeanCollection>) => void
    ): void {
        const beans = this.beans;
        for (const instance of beanInstances) {
            // used to avoid the need for calling super.wireBeans() in every subclasses
            instance.preWireBeans?.(beans);
            instance.wireBeans?.(beans);
        }

        // used by the component class
        for (const instance of beanInstances) {
            instance.preConstruct?.();
        }
        if (afterPreCreateCallback) {
            beanInstances.forEach(afterPreCreateCallback);
        }
        for (const instance of beanInstances) {
            instance.postConstruct?.();
        }
    }

    public getBeans(): TBeanCollection {
        return this.beans;
    }

    public getBean<T extends keyof TBeanCollection>(name: T): TBeanCollection[T] {
        return this.beans[name];
    }

    public getId(): string {
        return this.id;
    }

    public destroy(): void {
        if (this.destroyed) {
            return;
        }

        // Set before doing the destroy, so if context.destroy() gets called via another bean
        // we are marked as destroyed already to prevent running destroy() twice
        this.destroyed = true;

        const beanInstances = this.getBeanInstances();
        if (this.beanDestroyComparator) {
            beanInstances.sort(this.beanDestroyComparator);
        }
        this.destroyBeans(beanInstances);

        this.beans = {} as TBeanCollection;
        this.createdBeans = [];

        this.destroyCallback?.();
    }

    /**
     * Destroys a bean and returns undefined to support destruction and clean up in a single line.
     * this.dateComp = this.context.destroyBean(this.dateComp);
     */
    public destroyBean(bean: AgBaseBean<TBeanCollection> | null | undefined): undefined {
        bean?.destroy?.();
    }

    /**
     * Destroys an array of beans and returns an empty array to support destruction and clean up in a single line.
     * this.dateComps = this.context.destroyBeans(this.dateComps);
     */
    public destroyBeans<T extends AgBaseBean<TBeanCollection>>(beans: (T | null | undefined)[]): T[] {
        if (beans) {
            for (let i = 0; i < beans.length; i++) {
                this.destroyBean(beans[i]);
            }
        }
        return [];
    }

    public isDestroyed(): boolean {
        return this.destroyed;
    }
}
