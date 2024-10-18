declare let global: any;
/**
 * @deprecated v33 AG Grid does not support server side rendering and so should not be rendered on the server.
 * AG Grid does not support server side rendering and so should not be rendered on the server.
 * In previous versions of AG Grid an unsafe server side patch was include by default to avoid compilation errors on the server.
 * However, these patches are not safe and can cause issues in some server side rendering environments.
 * If you are using AG Grid in a server side rendering environment you should use the framework specific features to only render AG Grid on the client. i.e `use client`
 */
export function unsafeServerSidePatching() {
    // to satisfy server side compilation
    const globalObj = typeof global === 'undefined' ? {} : global;
    globalObj.HTMLElement = typeof HTMLElement === 'undefined' ? {} : HTMLElement;
    globalObj.HTMLButtonElement = typeof HTMLButtonElement === 'undefined' ? {} : HTMLButtonElement;
    globalObj.HTMLSelectElement = typeof HTMLSelectElement === 'undefined' ? {} : HTMLSelectElement;
    globalObj.HTMLInputElement = typeof HTMLInputElement === 'undefined' ? {} : HTMLInputElement;
    globalObj.Node = typeof Node === 'undefined' ? {} : Node;
    globalObj.MouseEvent = typeof MouseEvent === 'undefined' ? {} : MouseEvent;
}
