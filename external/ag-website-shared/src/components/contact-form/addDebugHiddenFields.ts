interface Params {
    form: HTMLFormElement;
    insert?: boolean;
}

export function addDebugHiddenFields({ form, insert }: Params) {
    const searchParams = window.location.search;
    const isDebug = insert || new URLSearchParams(searchParams).get('debug') === 'true';

    if (isDebug) {
        const debugInput = document.createElement('input');
        debugInput.type = 'hidden';
        debugInput.name = 'debug';
        debugInput.value = '1';

        const debugEmailInput = document.createElement('input');
        debugEmailInput.type = 'hidden';
        debugEmailInput.name = 'debugEmail';
        debugEmailInput.value = 'owner@ag-grid.com';

        form.appendChild(debugInput);
        form.appendChild(debugEmailInput);
    }
}
