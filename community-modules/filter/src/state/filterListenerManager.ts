// TODO(AG-6000): Consider replacing with EventService?
export class FilterListenerManager<F extends (...args: any[]) => any> {
    private readonly listeners: [any, F][] = [];

    public addListener(source: any, cb: F): () => void {
        this.listeners.push([source, cb]);

        return () => this.removeListener(cb);
    }

    public removeListener(cb: F): void {
        this.listeners.splice(this.listeners.findIndex(([_, c]) => c === cb), 1);
    }

    public notify(source: any, ...args: Parameters<F>): void {
        this.listeners.forEach(([s, l]) => {
            if (s === source) { return; }
            l(...args);
        });
    }
}
