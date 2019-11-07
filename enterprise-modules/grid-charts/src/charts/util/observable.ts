export interface ObservableEvent<S> {
    type: string;
    source: S; // the Observable that fired the event
}

// Should be used when a component listens for a browser event using the native `addEventListener`.
export interface BrowserEvent<S> extends ObservableEvent<S> {
    event: Event; // Native DOM event, defined in 'lib.dom.d.ts'
}

export interface PropertyChangeEvent<S, V> extends ObservableEvent<S> {
    value: V;
    oldValue: V;
}

export type ObservableEventListener<S> = (event: ObservableEvent<S>) => any;
export type PropertyChangeEventListener<S, V> = (event: PropertyChangeEvent<S, V>) => any;

export class Observable {
    static readonly privateKeyPrefix = '_';

    private propertyListeners = new Map(); // property name => property change listeners
    private eventListeners = new Map();    // event type => event listeners

    addPropertyListener<K extends string & keyof this>(name: K, listener: PropertyChangeEventListener<this, this[K]>) {
        const propertyListeners = this.propertyListeners as Map<K, Set<PropertyChangeEventListener<this, this[K]>>>;
        let listeners = propertyListeners.get(name);

        if (!listeners) {
            listeners = new Set<PropertyChangeEventListener<this, this[K]>>();
            propertyListeners.set(name, listeners);
        }

        if (!listeners.has(listener)) {
            listeners.add(listener);
            return listener;
        } else {
            console.warn('Listener ', listener, ' already added to ', this);
        }
    }

    removePropertyListener<K extends string & keyof this>(name: K, listener?: PropertyChangeEventListener<this, this[K]>) {
        const propertyListeners = this.propertyListeners as Map<K, Set<PropertyChangeEventListener<this, this[K]>>>;
        let listeners = propertyListeners.get(name);

        if (listeners) {
            if (listener) {
                listeners.delete(listener);
            } else {
                listeners.clear();
            }
        }
    }

    protected notifyPropertyListeners<K extends string & keyof this>(name: K, oldValue: this[K], value: this[K]) {
        const nameListeners = this.propertyListeners as Map<K, Set<PropertyChangeEventListener<this, this[K]>>>;
        const listeners = nameListeners.get(name);

        if (listeners) {
            listeners.forEach(listener => {
                listener({
                    type: name,
                    source: this,
                    value,
                    oldValue
                });
            });
        }
    }

    addEventListener(type: string, listener: ObservableEventListener<this>) {
        const eventListeners = this.eventListeners as Map<string, Set<ObservableEventListener<this>>>;
        let listeners = eventListeners.get(type);

        if (!listeners) {
            listeners = new Set<ObservableEventListener<this>>();
            eventListeners.set(type, listeners);
        }

        if (!listeners.has(listener)) {
            listeners.add(listener);
            return listener;
        } else {
            console.warn('Category listener ', listener, ' already added to ', this);
        }
    }

    removeEventListener(type: string, listener?: ObservableEventListener<this>) {
        const eventListeners = this.eventListeners as Map<string, Set<ObservableEventListener<this>>>;
        let listeners = eventListeners.get(type);

        if (listeners) {
            if (listener) {
                listeners.delete(listener);
            } else {
                listeners.clear();
            }
        }
    }

    protected notifyEventListeners(types: string[]) {
        const eventListeners = this.eventListeners as Map<string, Set<ObservableEventListener<this>>>;

        types.forEach(type => {
            const listeners = eventListeners.get(type);
            if (listeners) {
                listeners.forEach(listener => listener({
                    type,
                    source: this
                }));
            }
        });
    }
}

export function reactive(events?: string[], property?: string) {
    return function (target: any, key: string) {
        // `target` is either a constructor (static member) or prototype (instance member)
        const privateKey = Observable.privateKeyPrefix + key;
        const backingProperty = property ? property.split('.') : undefined;
        const privateKeyEvents = privateKey + 'Events';

        if (!target[key]) {
            if (events) {
                target[privateKeyEvents] = events;
            }
            Object.defineProperty(target, key, {
                set: function (value: any) {
                    let oldValue: any;

                    if (backingProperty) {
                        oldValue = this;
                        backingProperty.forEach(key => {
                            oldValue = oldValue[key];
                        });
                    } else {
                        oldValue = this[privateKey];
                    }

                    if (oldValue !== value) {
                        if (backingProperty) {
                            let i = 0, last = backingProperty.length - 1, obj = this;
                            while (i < last) {
                                obj = obj[backingProperty[i++]];
                            }
                            obj[backingProperty[last]] = value;
                        } else {
                            this[privateKey] = value;
                        }
                        this.notifyPropertyListeners(key, oldValue, value);
                        const events = this[privateKeyEvents];
                        if (events) {
                            this.notifyEventListeners(events);
                        }
                    }
                },
                get: function (): any {
                    let value: any;
                    if (backingProperty) {
                        value = this;
                        backingProperty.forEach(key => {
                            value = value[key];
                        });
                    } else {
                        value = this[privateKey];
                    }
                    return value;
                },
                enumerable: true,
                configurable: true
            });
        }
    }
}
