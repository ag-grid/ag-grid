// to be renamed `Bean` once the annotation is removed
export interface BaseBean {
    postConstruct?(): void;

    destroy?(): void;
}
