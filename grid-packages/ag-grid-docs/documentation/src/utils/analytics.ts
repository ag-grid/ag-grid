const trackingCache = {};

const EVENT_NAME = {
    rowGrouping: 'Homepage Example Row Grouping',
    integratedCharts: 'Homepage Example Integrated Charts',
    exampleRunner: 'Example Runner',
    apiDocumentation: 'API Documentation',
};

const trackPlausible = ({ eventName, props }: { eventName: string; props?: object }) => {
    const searchParams = new URLSearchParams(window?.location?.search);

    // Enable debug with either `?debug=true` query parameter or
    // `plausibleDebug` set to `true in localstorage
    const enableDebug = Boolean(searchParams.get('debug')) || localStorage.getItem('plausibleDebug') === 'true';

    if (enableDebug) {
        console.log('Plausible:', eventName, props);
    }

    if (globalThis.plausible) {
        globalThis.plausible(eventName, {
            props,
        });
    }
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

export const trackOnceHomepageExampleRowGrouping = (props: object) => {
    const cacheKey = `${EVENT_NAME.rowGrouping}.${JSON.stringify(props)}`;

    if (!trackingCache[cacheKey]) {
        trackHomepageExampleRowGrouping(props);
        trackingCache[cacheKey] = true;
    }
};

export const trackHomepageExampleIntegratedCharts = (props: object) => {
    trackHomepageExample({
        name: EVENT_NAME.integratedCharts,
        props,
    });
};

export const trackOnceHomepageExampleIntegratedCharts = (props: object) => {
    const cacheKey = `${EVENT_NAME.integratedCharts}.${JSON.stringify(props)}`;

    if (!trackingCache[cacheKey]) {
        trackHomepageExampleIntegratedCharts(props);
        trackingCache[cacheKey] = true;
    }
};

export const trackExampleRunner = (props: object) => {
    trackPlausible({
        eventName: EVENT_NAME.exampleRunner,
        props,
    });
};

export const trackOnceExampleRunner = (props: object) => {
    const cacheKey = `${EVENT_NAME.exampleRunner}.${JSON.stringify(props)}`;

    if (!trackingCache[cacheKey]) {
        trackExampleRunner(props);
        trackingCache[cacheKey] = true;
    }
};

export const trackApiDocumentation = (props: object) => {
    trackPlausible({
        eventName: EVENT_NAME.apiDocumentation,
        props,
    });
};
