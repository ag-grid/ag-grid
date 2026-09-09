/**
 * Standard globals the DOM environment omits, recovered from a live instance so tests and grid code can
 * be written against the real platform. happy-dom implements these interfaces but never exposes the
 * constructors on `window`.
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
}
