import { Listeners } from '../../util/listeners';
export class BaseManager {
    constructor() {
        this.listeners = new Listeners();
    }
    addListener(type, cb) {
        return this.listeners.addListener(type, cb);
    }
    removeListener(listenerSymbol) {
        this.listeners.removeListener(listenerSymbol);
    }
}
