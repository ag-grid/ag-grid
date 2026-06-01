/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export interface AgBaseBean<TBeanCollection> {
    /** AG Grid internal - do not call */
    preWireBeans?(beans: TBeanCollection): void;

    /** AG Grid internal - do not call */
    wireBeans?(beans: TBeanCollection): void;

    /** AG Grid internal - do not call */
    preConstruct?(): void;

    /** AG Grid internal - do not call */
    postConstruct?(): void;

    /** AG Grid internal - do not call */
    destroy?(): void;
}
