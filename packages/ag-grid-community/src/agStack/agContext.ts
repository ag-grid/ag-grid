import type { AgSingletonBean } from './interfaces/iBean';

type BeanComparator<TBeanCollection> = (
    bean1: AgSingletonBean<TBeanCollection>,
    bean2: AgSingletonBean<TBeanCollection>
) => number;

interface DerivedBean<TBeanCollection, K extends keyof TBeanCollection> {
    beanName: K;
    bean: TBeanCollection[K] & AgSingletonBean<TBeanCollection>;
}

export interface AgContextParams<TBeanCollection> {
    providedBeanInstances: Partial<TBeanCollection>;
    beanClasses: AgSingletonBeanClass<TBeanCollection>[];
    derivedBeans?: ((context: AgContext<TBeanCollection>) => DerivedBean<TBeanCollection, keyof TBeanCollection>)[];
    beanInitComparator?: BeanComparator<TBeanCollection>;
    beanDestroyComparator?: BeanComparator<TBeanCollection>;
    id: string;
    destroyCallback?: () => void;
}

export interface AgSingletonBeanClass<TBeanCollection> {
    new (): AgSingletonBean<TBeanCollection>;
}

export class AgContext<TBeanCollection> {
    protected beans: TBeanCollection = {} as TBeanCollection;
    private createdBeans: AgSingletonBean<TBeanCollection>[] = [];
    private beanDestroyComparator?: BeanComparator<TBeanCollection>;
    private id: string;
    private destroyCallback?: () => void;

    private destroyed = false;

    constructor(params: AgContextParams<TBeanCollection>) {
        if (!params || !params.beanClasses) {
            return;
        }

        this.beanDestroyComparator = params.beanDestroyComparator;

        this.init(params);
    }

    protected init(params: AgContextParams<TBeanCollection>): void {
        this.id = params.id;
        (this.beans as any).context = this; // TODO - can we type TBeanCollection to extend CoreBeanCollection easily here?
        this.destroyCallback = params.destroyCallback;

        for (const beanName of Object.keys(params.providedBeanInstances) as (keyof TBeanCollection)[]) {
            this.beans[beanName] = params.providedBeanInstances[beanName] as any;
        }

        params.beanClasses.forEach((BeanClass) => {
            const instance = new BeanClass();
            if (instance.beanName) {
                this.beans[instance.beanName] = instance as any;
            } else {
                // eslint-disable-next-line no-console
                console.error(`Bean ${BeanClass.name} is missing beanName`);
            }
            this.createdBeans.push(instance);
        });

        params.derivedBeans?.forEach((beanFunc) => {
            const { beanName, bean } = beanFunc(this);
            this.beans[beanName] = bean;
            this.createdBeans.push(bean);
        });

        if (params.beanInitComparator) {
            // sort the beans so that they are in a consistent order
            this.createdBeans.sort(params.beanInitComparator);
        }

        this.initBeans(this.createdBeans);
    }

    private getBeanInstances(): AgSingletonBean<TBeanCollection>[] {
        return Object.values(this.beans as Record<string, AgSingletonBean<TBeanCollection>>);
    }

    public createBean<T extends AgSingletonBean<TBeanCollection>>(
        bean: T,
        afterPreCreateCallback?: (bean: AgSingletonBean<TBeanCollection>) => void
    ): T {
        this.initBeans([bean], afterPreCreateCallback);
        return bean;
    }

    private initBeans(
        beanInstances: AgSingletonBean<TBeanCollection>[],
        afterPreCreateCallback?: (bean: AgSingletonBean<TBeanCollection>) => void
    ): void {
        const beans = this.beans;
        beanInstances.forEach((instance) => {
            // used to avoid the need for calling super.wireBeans() in every subclasses
            instance.preWireBeans?.(beans);
            instance.wireBeans?.(beans);
        });

        // used by the component class
        beanInstances.forEach((instance) => instance.preConstruct?.());
        if (afterPreCreateCallback) {
            beanInstances.forEach(afterPreCreateCallback);
        }
        beanInstances.forEach((instance) => instance.postConstruct?.());
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
    public destroyBean(bean: AgSingletonBean<TBeanCollection> | null | undefined): undefined {
        bean?.destroy?.();
    }

    /**
     * Destroys an array of beans and returns an empty array to support destruction and clean up in a single line.
     * this.dateComps = this.context.destroyBeans(this.dateComps);
     */
    public destroyBeans(beans: (AgSingletonBean<TBeanCollection> | null | undefined)[]): [] {
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
