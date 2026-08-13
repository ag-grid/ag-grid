import { persistentAtom } from '@nanostores/persistent';

const LOCALSTORAGE_PREFIX = 'documentation';

export const $darkmode = persistentAtom<boolean | undefined>(
    `${LOCALSTORAGE_PREFIX}:darkmode`,
    globalThis.window?.matchMedia('(prefers-color-scheme: dark)')?.matches,
    {
        listen: false,
        encode: (value) => (value ? 'true' : 'false'),
        decode: (value) => value === 'true',
    }
);

const updateHtml = (darkmode: boolean | undefined) => {
    if (typeof document === 'undefined') {
        return;
    }

    const htmlEl = document.documentElement;

    // Using .no-transitions class so that there are no animations between light/dark modes
    htmlEl.classList.add('no-transitions');
    htmlEl.dataset.darkMode = darkmode === true ? 'true' : 'false';
    htmlEl.dataset.agThemeMode = htmlEl.dataset.darkMode === 'true' ? 'dark-blue' : 'light';
    void htmlEl.offsetHeight; // Trigger a reflow, flushing the CSS changes
    htmlEl.classList.remove('no-transitions');

    const darkModeEvent = { type: 'color-scheme-change', darkmode };

    // post message for example runner to listen for user initiated color scheme changes
    const iframes = document.querySelectorAll<HTMLIFrameElement>('.exampleRunner');
    iframes?.forEach((iframe) => {
        iframe.contentWindow?.postMessage(darkModeEvent);
    });

    // Send on event on page for charts that are embeded on the page
    window.dispatchEvent(new CustomEvent('message', { detail: darkModeEvent }));
};

$darkmode.listen(updateHtml);

if (globalThis.window) {
    // A swap restores <html> to its server-rendered attributes, and $darkmode's listener
    // only fires on change, so the theme needs re-applying explicitly.
    document.addEventListener('astro:after-swap', () => {
        updateHtml($darkmode.get());
    });
    updateHtml($darkmode.get() ?? window?.matchMedia('(prefers-color-scheme: dark)')?.matches);
}

export const setDarkmode = (darkmode: boolean) => {
    if ('startViewTransition' in document) {
        document.startViewTransition(() => {
            $darkmode.set(darkmode);
        });
    } else {
        $darkmode.set(darkmode);
    }
};

export const getDarkmode = (): boolean | undefined => {
    return $darkmode.get();
};
