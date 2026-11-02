/**
 * The platform as tests and grid code expect it: constructors happy-dom implements but never puts on `window`,
 * recovered from live instances, and its wrong `ShadowRoot.activeElement` and `Event.composedPath` corrected.
 */
export function polyfillDomGlobals(): void {
    const global = globalThis as Record<string, unknown>;
    if (typeof global.DOMTokenList === 'undefined') {
        global.DOMTokenList = Object.getPrototypeOf(document.createElement('div').classList).constructor;
    }
    if (typeof global.Option === 'undefined') {
        // AG Charts parses every colour through `new Option().style.color`, so this is on the chart path,
        // not just forms. Returning the element overrides `this` for the `new` call.
        function Option(text?: string, value?: string, defaultSelected?: boolean, selected?: boolean) {
            const option = document.createElement('option') as HTMLOptionElement;
            if (text !== undefined) {
                option.text = text;
            }
            if (value !== undefined) {
                option.value = value;
            }
            option.defaultSelected = !!defaultSelected;
            option.selected = !!selected;
            return option;
        }
        Option.prototype = HTMLOptionElement.prototype;
        global.Option = Option;
    }
    patchShadowRootActiveElement();
    patchComposedPath();
}

/**
 * happy-dom's `ShadowRoot.activeElement` climbs past the document and throws when focus sits in another shadow
 * tree; a browser returns null. Focus is inside a shadow root only while its host is its outer root's active element.
 */
function patchShadowRootActiveElement(): void {
    const proto = ShadowRoot.prototype;
    const read = Object.getOwnPropertyDescriptor(proto, 'activeElement')?.get;
    if (!read) {
        return;
    }
    Object.defineProperty(proto, 'activeElement', {
        configurable: true,
        get(this: ShadowRoot): Element | null {
            const outer = this.host.getRootNode() as Document | ShadowRoot;
            return outer.activeElement === this.host ? read.call(this) : null;
        },
    });
}

/** happy-dom's `Event.composedPath` ignores closed shadow roots and `relatedTarget`, which a browser's path obeys. */
function patchComposedPath(): void {
    const proto = Event.prototype;
    const read = proto.composedPath;
    proto.composedPath = function (this: Event): EventTarget[] {
        const path = cutAtRelatedTarget(read.call(this), 'relatedTarget' in this ? this.relatedTarget : null);
        const current = this.currentTarget;
        // happy-dom's own dispatch reads the path before any listener runs, and dispatches along it
        if (!current) {
            return path;
        }
        const listener = current instanceof Node ? current : document;
        return path.filter((target) => !(target instanceof Node) || !isClosedShadowHidden(target, listener));
    };
}

/** The DOM spec's dispatch: leaving a shadow tree, the path ends at a host the `relatedTarget` retargets to. */
function cutAtRelatedTarget(path: EventTarget[], relatedTarget: unknown): EventTarget[] {
    let target = path[0];
    if (!(relatedTarget instanceof Node) || !(target instanceof Node)) {
        return path;
    }
    for (let i = 1, len = path.length; i < len; ++i) {
        const parent = path[i];
        if (!(parent instanceof Node) || isShadowIncludingInclusiveAncestor(target.getRootNode(), parent)) {
            continue;
        }
        if (retarget(relatedTarget, parent) === parent) {
            return path.slice(0, i);
        }
        target = parent;
    }
    return path;
}

/** The DOM spec's "retarget": `node` as `against` sees it, the host of each shadow tree `against` is outside of. */
function retarget(node: Node, against: Node): Node {
    let root = node.getRootNode();
    while (root instanceof ShadowRoot && !isShadowIncludingInclusiveAncestor(root, against)) {
        node = root.host;
        root = node.getRootNode();
    }
    return node;
}

/** The DOM spec's "closed-shadow-hidden": `node` sits in a closed shadow tree `from` is outside of. */
function isClosedShadowHidden(node: Node, from: Node): boolean {
    const root = node.getRootNode();
    if (!(root instanceof ShadowRoot) || isShadowIncludingInclusiveAncestor(root, from)) {
        return false;
    }
    return root.mode === 'closed' || isClosedShadowHidden(root.host, from);
}

function isShadowIncludingInclusiveAncestor(ancestor: Node, node: Node): boolean {
    let current: Node | null = node;
    while (current && current !== ancestor) {
        current = current instanceof ShadowRoot ? current.host : current.parentNode;
    }
    return current === ancestor;
}
