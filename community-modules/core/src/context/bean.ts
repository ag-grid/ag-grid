// to be renamed `Bean` once the annotation is removed
export abstract class BaseBean {
    protected preConstruct(): void {
        // implemented by child classes
    }

    protected postConstruct(): void {
        // implemented by child classes
    }

    protected destroy(): void {
        // implemented by child classes
    }
}
