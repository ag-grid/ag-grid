import { PreDestroy } from "./context";

export class Destroyable {

    protected destroyFunctions: (() => void)[] = [];
    private destroyed = false;

    @PreDestroy
    protected destroy(): void {

        for (let i = 0; i < this.destroyFunctions.length; i++) {
            this.destroyFunctions[i]();
        }
        this.destroyFunctions.length = 0;
        this.destroyed = true;
    }

    public isAlive = (): boolean => !this.destroyed;

    public addDestroyFunc(func: () => void): void {
        // if we are already destroyed, we execute the func now
        if (this.destroyed) {
            func();
        } else {
            this.destroyFunctions.push(func);
        }
    }
}