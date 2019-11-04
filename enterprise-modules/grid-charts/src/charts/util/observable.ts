type Listener<O, V> = (instance: O, oldValue: V, value: V) => any;
type CategoryListener<O> = (instance: O) => any;

export class Observable {
    private nameListeners = new Map();
    private categoryListeners = new Map();

    addListener<K extends string & keyof this>(name: K, listener: Listener<this, this[K]>) {
        const { nameListeners } = this;
        let listeners = nameListeners.get(name);

        if (!listeners) {
            listeners = new Set<Listener<this, this[K]>>();
            nameListeners.set(name, listeners);
        }

        if (!listeners.has(listener)) {
            listeners.add(listener);
        } else {
            console.warn('Listener ', listener, ' already added to ', this);
        }
    }

    removeListener<K extends string & keyof this>(name: K, listener: Listener<this, this[K]>) {
        const { nameListeners } = this;
        let listeners = nameListeners.get(name);

        if (listeners) {
            listeners.delete(listener);
        }
    }

    protected notifyListeners<K extends string & keyof this>(name: K, oldValue: this[K], value: this[K]) {
        const nameListeners = this.nameListeners as Map<K, Set<Listener<this, this[K]>>>;
        const listeners = nameListeners.get(name);

        if (listeners) {
            listeners.forEach(listener => listener(this, oldValue, value));
        }
    };

    addCategoryListener(category: string, listener: (instance: this) => any) {
        const { categoryListeners } = this;
        let listeners = categoryListeners.get(category);

        if (!listeners) {
            listeners = new Set<CategoryListener<this>>();
            categoryListeners.set(category, listeners);
        }

        if (!listeners.has(listener)) {
            listeners.add(listener);
        } else {
            console.warn('Category listener ', listener, ' already added to ', this);
        }
    }

    removeCategoryListener(category: string, listener: (instance: this) => any) {
        const { categoryListeners } = this;
        let listeners = categoryListeners.get(category);

        if (listeners) {
            listeners.delete(listener);
        }
    }

    protected notifyCategoryListeners(categories: string[]) {
        const categoryListeners = this.categoryListeners as Map<string, Set<CategoryListener<this>>>;

        categories.forEach(category => {
            const listeners = categoryListeners.get(category);
            if (listeners) {
                listeners.forEach(listener => listener(this));
            }
        });
    };
}

export function reactive(tags?: string[]) {
    return function (target: any, key: string) {
        // `target` is either a constructor (static member) or prototype (instance member)
        const privateKey = '__' + key;
        const privateKeyCategories = privateKey + 'Tags';

        if (!target[key]) {
            if (tags) {
                target[privateKeyCategories] = tags;
            }
            Object.defineProperty(target, key, {
                set: function (value: any) {
                    const oldValue = this[privateKey];

                    if (oldValue !== value) {
                        this[privateKey] = value;
                        this.notifyListeners(key, oldValue, value);
                        const categories = this[privateKeyCategories];
                        if (categories) {
                            this.notifyCategoryListeners(categories);
                        }
                    }
                },
                get: function (): any {
                    return this[privateKey];
                },
                enumerable: true,
                configurable: true
            });
        }
    }
}