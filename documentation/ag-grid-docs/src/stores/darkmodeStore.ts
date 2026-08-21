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

    // No `message` CustomEvent on `window` here. A CustomEvent has no `origin`, so a third-party
    // `message` listener that expects a real postMessage throws on it: reCAPTCHA's api.js parses
    // `event.origin` as a URL, which breaks the captcha on any page carrying the contact form.
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
