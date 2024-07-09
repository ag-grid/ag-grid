const trackingCache: Record<string, boolean> = {};

const EVENT_NAME = {
    rowGrouping: 'Homepage Example Row Grouping',
    integratedCharts: 'Homepage Example Integrated Charts',
    exampleRunner: 'Example Runner',
    apiDocumentation: 'API Documentation',
    demoToolbar: 'Demo Toolbar',
    infoEmail: 'Info Email',
    buyButton: 'Buy Button',
    downloadDS: 'Download Figma Design System',
    page404: '404',
};

const trackPlausible = ({ eventName, props }: { eventName: string; props?: object }) => {
    const searchParams = new URLSearchParams(window?.location?.search);

    // Enable debug with either `?debug=true` query parameter or
    // `plausibleDebug` set to `true in localstorage
    const enableDebug = Boolean(searchParams.get('debug')) || localStorage.getItem('plausibleDebug') === 'true';

    if (enableDebug) {
        // eslint-disable-next-line no-console
        console.log('Plausible:', eventName, props);
    }

    if (globalThis.plausible) {
        globalThis.plausible(eventName, {
            props,
        });
    }
};

/**
 * Track plausible event once using an object cache
 */
const createTrackPlausibleOnce = (key: string, trackingFn: (props: object) => void) => (props: object) => {
    const cacheKey = `${key}.${JSON.stringify(props)}`;

    if (!trackingCache[cacheKey]) {
        trackingFn(props);
        trackingCache[cacheKey] = true;
    }
};

export const track404 = (props: object) => {
    trackPlausible({
        eventName: EVENT_NAME.page404,
        props,
    });
};

const trackHomepageExample = ({ name, props }: { name: string; props: object }) => {
    trackPlausible({
        eventName: name,
        props,
    });
};

export const trackHomepageExampleRowGrouping = (props: object) => {
    trackHomepageExample({
        name: EVENT_NAME.rowGrouping,
        props,
    });
};

export const trackOnceHomepageExampleRowGrouping = createTrackPlausibleOnce(
    EVENT_NAME.rowGrouping,
    trackHomepageExampleRowGrouping
);

export const trackHomepageExampleIntegratedCharts = (props: object) => {
    trackHomepageExample({
        name: EVENT_NAME.integratedCharts,
        props,
    });
};

export const trackOnceHomepageExampleIntegratedCharts = createTrackPlausibleOnce(
    EVENT_NAME.integratedCharts,
    trackHomepageExampleIntegratedCharts
);

export const trackExampleRunner = (props: object) => {
    trackPlausible({
        eventName: EVENT_NAME.exampleRunner,
        props,
    });
};

export const trackOnceExampleRunner = createTrackPlausibleOnce(EVENT_NAME.exampleRunner, trackExampleRunner);

export const trackApiDocumentation = (props: object) => {
    trackPlausible({
        eventName: EVENT_NAME.apiDocumentation,
        props,
    });
};

export const trackDemoToolbar = (props: object) => {
    trackPlausible({
        eventName: EVENT_NAME.demoToolbar,
        props,
    });
};

export const trackOnceDemoToolbar = createTrackPlausibleOnce(EVENT_NAME.demoToolbar, trackDemoToolbar);

export const trackInfoEmail = (props: object) => {
    trackPlausible({
        eventName: EVENT_NAME.infoEmail,
        props,
    });
};

export const trackOnceInfoEmail = createTrackPlausibleOnce(EVENT_NAME.infoEmail, trackInfoEmail);

export const trackBuyButton = (props: object) => {
    trackPlausible({
        eventName: EVENT_NAME.buyButton,
        props,
    });
};

const trackDownloadDS = (props: object) => {
    trackPlausible({
        eventName: EVENT_NAME.downloadDS,
        props,
    });
};

export const trackOnceDownloadDS = createTrackPlausibleOnce(EVENT_NAME.downloadDS, trackDownloadDS);
