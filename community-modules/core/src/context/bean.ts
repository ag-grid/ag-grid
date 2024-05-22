import type { BeanCollection } from "./context";

// to be renamed `Bean` once the annotation is removed
export interface BaseBean {
    /** AG Grid internal - do not call */
    wireBeans?(beans: BeanCollection): void;

    /** AG Grid internal - do not call */
    postConstruct?(): void;

    /** AG Grid internal - do not call */
    destroy?(): void;
}
