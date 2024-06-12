export interface GenericBean<TBeanName, TBeanCollection> {
    /** AG Grid internal - do not use */
    beanName?: TBeanName;

    // wireBeans is called before postConstruct across all beans
    // wireBeans is also called after destroy to automatically clean object references
    /** AG Grid internal - do not call */
    wireBeans?(beans: TBeanCollection): void;

    /** AG Grid internal - do not call */
    postConstruct?(): void;

    /** AG Grid internal - do not call */
    destroy?(): void;
}
