import React, { useEffect, useState } from 'react';
import classnames from 'classnames';
import styles from './ExampleRunnerResult.module.scss';
import { getIndexHtmlUrl } from './helpers';
import { getIndexHtml } from './index-html-helper';
import isDevelopment from 'utils/is-development';

/**
 * This executes the given example in an iframe.
 */
const ExampleRunnerResult = ({ isOnScreen = true, resultFrameIsVisible = true, exampleInfo, darkMode }) => {
    const [isExecuting, setExecuting] = useState(isOnScreen && resultFrameIsVisible);
    const { pageName, name, internalFramework, importType } = exampleInfo;
    const [htmlVersion, setHtmlVersion] = useState(0);

    useEffect(() => {
        // trigger the example to execute when it is on screen and the result pane is visible
        if (isOnScreen && resultFrameIsVisible && !isExecuting) {
            setExecuting(true);
        }
    }, [isOnScreen, resultFrameIsVisible]); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        // if the example info changes (e.g. if modules and switched to packages) and the example is off screen,
        // stop it executing
        if (!isOnScreen && isExecuting) {
            setExecuting(false);
        }
    }, [exampleInfo]); // eslint-disable-line react-hooks/exhaustive-deps

    const iframeRef = React.createRef();

    useEffect(() => {
        const iframe = iframeRef.current;
        const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;

        if (isDevelopment()) {
            const { plunkerIndexHtml, codesandboxIndexHtml } = getIndexHtml(exampleInfo, true);

            // in development mode we generate the index HTML on the fly and inject it into the iframe
            iframeDoc.open();
            iframeDoc.write(isExecuting ? plunkerIndexHtml : '');
            iframeDoc.close();
        } else {
            iframe.src = isExecuting ? getIndexHtmlUrl(exampleInfo) : '';
        }
        setHtmlVersion((v) => v + 1);
    }, [isExecuting, exampleInfo]); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        if (darkMode == null) return;
        let handler;
        const innerDocument = iframeRef.current?.contentDocument;
        if (innerDocument) {
            if (innerDocument.readyState === "loading") {
                handler = () => {
                    applyExampleDarkMode(innerDocument, darkMode);
                    innerDocument.removeEventListener('DOMContentLoaded', handler);
                };
                innerDocument.addEventListener('DOMContentLoaded', handler);
            } else {
                applyExampleDarkMode(innerDocument, darkMode);
            }
        }
        if (handler) {
            return () => {
                innerDocument.removeEventListener('DOMContentLoaded', handler);
            }
        }
    }, [htmlVersion, darkMode]);

    return <iframe
        key={`${pageName}_${name}_${internalFramework}_${importType}`}
        ref={iframeRef}
        title={name}
        className={classnames(styles.exampleRunnerResult, { [styles.hidden]: !resultFrameIsVisible })} />;
};

export default ExampleRunnerResult;

const themes = {
    "ag-theme-alpine": {dark: false, other: "ag-theme-alpine-dark"},
    "ag-theme-alpine-dark": {dark: true, other: "ag-theme-alpine"},
    "ag-theme-balham": {dark: false, other: "ag-theme-balham-dark"},
    "ag-theme-balham-dark": {dark: true, other: "ag-theme-balham"},
}

const applyExampleDarkMode = (document, darkMode) => {
    for (const el of document.querySelectorAll("[class*='ag-theme-']") || []) {
        for (const className of Array.from(el.classList.values())) {
            const theme = themes[className];
            if (theme && theme.dark !== darkMode) {
                el.classList.remove(className);
                el.classList.add(theme.other);
            }
        }
    }
}