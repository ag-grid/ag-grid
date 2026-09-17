import { Comment, Fragment, Text, createVNode, defineComponent, h, render } from 'vue';

import { _errorForGrid, _errorWithoutAttribution } from 'ag-grid-community';

// Slots are read-only presentational content, so only a rendering role may resolve to one — an
// editor/filter/etc. doing so would misbehave instead of erroring on a genuinely missing component.
const SLOT_ELIGIBLE_PROPERTY_NAMES = new Set(['cellRenderer']);

export class VueComponentFactory {
    // WeakMap avoids repeat component tree traversals and allows GC of parent components
    private static componentCache = new WeakMap<any, Map<string, any>>();
    // Separate from componentCache: a name can resolve to a slot on one lookup and, if that slot
    // is later removed, to a registered component on the next — the two must not collide.
    private static slotComponentCache = new WeakMap<any, Map<string, any>>();

    // hasOwnProperty guards against the internal slots object's prototype (e.g. `toString`,
    // `constructor`) being mistaken for a real slot.
    public static hasSlot(parent: any, name: string): boolean {
        return !!parent.slots && Object.prototype.hasOwnProperty.call(parent.slots, name);
    }

    private static getOrCreateCache(cache: WeakMap<any, Map<string, any>>, parent: any): Map<string, any> {
        let parentCache = cache.get(parent);
        if (!parentCache) {
            parentCache = new Map();
            cache.set(parent, parentCache);
        }
        return parentCache;
    }

    private static getComponentDefinition(
        component: any,
        parent: any,
        gridId: string | undefined,
        propertyName: string | undefined
    ) {
        let componentDefinition: any;

        // when referencing components by name - ie: cellRenderer: 'MyComponent'
        if (typeof component === 'string') {
            // A named slot on this AgGridVue instance takes precedence over a registered component.
            componentDefinition =
                propertyName != null &&
                SLOT_ELIGIBLE_PROPERTY_NAMES.has(propertyName) &&
                this.hasSlot(parent, component)
                    ? this.getSlotComponentDefinition(parent, component)
                    : this.searchForComponentInstance(parent, component, 10, false, gridId);
        } else {
            componentDefinition = { extends: defineComponent({ ...component }) };
        }
        if (!componentDefinition) {
            if (gridId) {
                _errorForGrid(gridId, 114, { component });
            } else {
                _errorWithoutAttribution(114, { component });
            }
        }

        if (componentDefinition.extends) {
            if (componentDefinition.extends.setup) {
                componentDefinition.setup = componentDefinition.extends.setup;
            }

            componentDefinition.extends.props = this.addParamsToProps(componentDefinition.extends.props);
        } else {
            componentDefinition.props = this.addParamsToProps(componentDefinition.props);
        }

        return componentDefinition;
    }

    private static getSlotComponentDefinition(parent: any, slotName: string) {
        const parentCache = this.getOrCreateCache(this.slotComponentCache, parent);
        let componentDefinition = parentCache.get(slotName);
        if (!componentDefinition) {
            componentDefinition = defineComponent({
                props: { params: { type: Object, required: true } },
                setup(props: any) {
                    // parent.slots read fresh on every call (not captured here) so this always
                    // reflects the slot's current content.
                    return () => {
                        const rendered = parent.slots[slotName]?.(props.params);
                        const nodes = Array.isArray(rendered) ? rendered : rendered != null ? [rendered] : [];
                        const [only] = nodes;
                        // A single real root is used unwrapped like any other cellRenderer's own
                        // root (AG-14151); anything else needs a host element, since the mounting
                        // pipeline otherwise only keeps the fragment's firstElementChild.
                        const isSingleRealNode =
                            nodes.length === 1 && only.type !== Text && only.type !== Comment && only.type !== Fragment;
                        return isSingleRealNode ? only : h('span', nodes);
                    };
                },
            });
            parentCache.set(slotName, componentDefinition);
        }
        return componentDefinition;
    }

    private static addParamsToProps(props: any) {
        if (!props || (Array.isArray(props) && props.indexOf('params') === -1)) {
            props = ['params', ...(props ? props : [])];
        } else if (typeof props === 'object' && !props.params) {
            /* tslint:disable:no-string-literal */
            props['params'] = {
                type: Object,
            };
        }

        return props;
    }

    public static createAndMountComponent(
        component: any,
        params: any,
        parent: any,
        provides: any,
        gridId: string | undefined,
        propertyName?: string
    ) {
        const componentDefinition = VueComponentFactory.getComponentDefinition(component, parent, gridId, propertyName);
        if (!componentDefinition) {
            return;
        }

        const { vNode, destroy, el } = this.mount(
            componentDefinition,
            { params: Object.freeze(params) },
            parent,
            provides || {}
        );

        // note that the component creation is synchronous so that componentInstance is set by this point
        return {
            componentInstance: vNode.component.proxy,
            element: el,
            destroy,
        };
    }

    public static mount(component: any, props: any, parent: any, provides: any) {
        let vNode: any = createVNode(component, props);

        vNode.appContext = { ...parent.appContext, provides };

        let el: any = document.createDocumentFragment();
        render(vNode, el);

        const destroy = () => {
            if (el) {
                render(null, el);
            }

            el = null;
            vNode = null;
        };

        return { vNode, destroy, el };
    }

    public static searchForComponentInstance(
        parent: any,
        component: any,
        maxDepth = 10,
        suppressError = false,
        gridId?: string
    ) {
        // Check cache first
        const parentCache = this.componentCache.get(parent);
        if (parentCache) {
            const cached = parentCache.get(component);
            if (cached !== undefined) {
                return cached;
            }
        }

        let componentInstance: any = null;

        // options first
        let depth = 0;
        let currentParent = parent.parent;
        while (!componentInstance && currentParent && currentParent.components && ++depth < maxDepth) {
            if (currentParent.components && currentParent.components![component as any]) {
                componentInstance = currentParent.components![component as any];
            }
            currentParent = currentParent.parent;
        }

        depth = 0;
        currentParent = parent.parent;
        while (!componentInstance && currentParent && currentParent.$options && ++depth < maxDepth) {
            const currentParentAsThis = currentParent as any;
            if (
                currentParentAsThis.$options &&
                currentParentAsThis.$options.components &&
                currentParentAsThis.$options.components![component as any]
            ) {
                componentInstance = currentParentAsThis.$options.components![component as any];
            } else if (currentParentAsThis[component]) {
                componentInstance = currentParentAsThis[component];
            }
            currentParent = currentParent.parent;
        }

        // composition next
        depth = 0;
        currentParent = parent.parent;
        while (!componentInstance && currentParent && ++depth < maxDepth) {
            if (currentParent.exposed) {
                const currentParentAsThis = currentParent as any;
                if (currentParentAsThis.exposed && currentParentAsThis.exposed[component as any]) {
                    componentInstance = currentParentAsThis.exposed![component as any];
                } else if (currentParentAsThis[component]) {
                    componentInstance = currentParentAsThis[component];
                }
            }
            currentParent = currentParent.parent;
        }

        // then search in globally registered components of app
        if (!componentInstance) {
            const components = parent.appContext.components;
            if (components && components[component]) {
                componentInstance = components[component];
            }
        }

        if (!componentInstance && !suppressError) {
            if (gridId) {
                _errorForGrid(gridId, 114, { component });
            } else {
                _errorWithoutAttribution(114, { component });
            }
            return null;
        }

        // Cache the result
        if (componentInstance) {
            this.getOrCreateCache(this.componentCache, parent).set(component, componentInstance);
        }

        return componentInstance;
    }
}
