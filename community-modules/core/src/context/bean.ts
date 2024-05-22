// to be renamed `Bean` once the annotation is removed
export interface BaseBean {
    preConstruct?(): void;

    postConstruct?(): void;

    destroy?(): void;
}
