import type { AgSingletonBean } from './interfaces/iBean';

type BeanComparator<TBeanName extends string, TBeanCollection extends { [key in TBeanName]?: any }> = (
    bean1: AgSingletonBean<TBeanName, TBeanCollection>,
    bean2: AgSingletonBean<TBeanName, TBeanCollection>
) => number;

export interface AgContextParams<TBeanName extends string, TBeanCollection extends { [key in TBeanName]?: any }> {
    providedBeanInstances: Partial<{ [key in TBeanName]: AgSingletonBean<TBeanName, TBeanCollection> }>;
    beanClasses: AgSingletonBeanClass<TBeanName, TBeanCollection>[];
    derivedBeans?: ((context: AgContext<TBeanName, TBeanCollection>) => {
        beanName: TBeanName;
        bean: TBeanCollection[TBeanName];
    })[];
    beanInitComparator?: BeanComparator<TBeanName, TBeanCollection>;
    beanDestroyComparator?: BeanComparator<TBeanName, TBeanCollection>;
}

export interface AgSingletonBeanClass<TBeanName extends string, TBeanCollection extends { [key in TBeanName]?: any }> {
    new (): AgSingletonBean<TBeanName, TBeanCollection>;
}

export class AgContext<TBeanName extends string, TBeanCollection extends { [key in TBeanName]?: any }> {
    protected beans: TBeanCollection = {} as TBeanCollection;
    private createdBeans: AgSingletonBean<TBeanName, TBeanCollection>[] = [];
    private beanDestroyComparator?: BeanComparator<TBeanName, TBeanCollection>;

    private destroyed = false;

    constructor(params: AgContextParams<TBeanName, TBeanCollection>) {
        if (!params || !params.beanClasses) {
            return;
        }

        this.beanDestroyComparator = params.beanDestroyComparator;

        this.init(params);
    }

    protected init(params: AgContextParams<TBeanName, TBeanCollection>): void {
        for (const beanName of Object.keys(params.providedBeanInstances) as TBeanName[]) {
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

    private getBeanInstances(): AgSingletonBean<TBeanName, TBeanCollection>[] {
        return Object.values(this.beans);
    }

    public createBean<T extends AgSingletonBean<TBeanName, TBeanCollection>>(
        bean: T,
        afterPreCreateCallback?: (bean: AgSingletonBean<TBeanName, TBeanCollection>) => void
    ): T {
        this.initBeans([bean], afterPreCreateCallback);
        return bean;
    }

    private initBeans(
        beanInstances: AgSingletonBean<TBeanName, TBeanCollection>[],
        afterPreCreateCallback?: (bean: AgSingletonBean<TBeanName, TBeanCollection>) => void
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

    public getBean<T extends TBeanName>(name: T): TBeanCollection[T] {
        return this.beans[name];
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
    }

    /**
     * Destroys a bean and returns undefined to support destruction and clean up in a single line.
     * this.dateComp = this.context.destroyBean(this.dateComp);
     */
    public destroyBean(bean: AgSingletonBean<TBeanName, TBeanCollection> | null | undefined): undefined {
        bean?.destroy?.();
    }

    /**
     * Destroys an array of beans and returns an empty array to support destruction and clean up in a single line.
     * this.dateComps = this.context.destroyBeans(this.dateComps);
     */
    public destroyBeans(beans: (AgSingletonBean<TBeanName, TBeanCollection> | null | undefined)[]): [] {
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
