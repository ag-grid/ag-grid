export class FilterListenerManager<F extends (...args: any[]) => any> {
    private readonly listeners: F[] = [];

    public addListener(cb: F): void {
        this.listeners.push(cb);
    }

    public removeListener(cb: F): void {
        this.listeners.splice(this.listeners.indexOf(cb), 1);
    }

    public notify(...args: Parameters<F>): void {
        this.listeners.forEach(l => l(...args));
    }
}
