/**
 * The platform as tests and grid code expect it: constructors happy-dom implements but never puts on `window`,
 * recovered from live instances, and its wrong `ShadowRoot.activeElement` corrected.
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
