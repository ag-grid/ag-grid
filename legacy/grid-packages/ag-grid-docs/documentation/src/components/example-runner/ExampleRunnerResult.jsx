import React, { useEffect, useState, useRef, useMemo } from 'react';
import classnames from 'classnames';
import styles from '@design-system/modules/ExampleRunnerResult.module.scss';
import { getIndexHtmlUrl } from './helpers';
import { getIndexHtml } from './index-html-helper';
import isDevelopment from 'utils/is-development';
import exampleRuntimeInjectedStyles from './exampleRuntimeInjectedStyles'

/**
 * This executes the given example in an iframe.
 */
const ExampleRunnerResult = ({ isOnScreen = true, resultFrameIsVisible = true, exampleInfo, darkMode }) => {
    const { pageName, name, internalFramework, importType } = exampleInfo;
    const frameRef = useRef(null);

    // Set to true after the first time dark mode has been applied, to prevent flickering.
    const [loaded, setLoaded] = useState(false);

    // hide the iframe if dark mode hasn't been initialised
    const style = useMemo(() => ({
        visibility: loaded ? 'visible' : 'hidden'
    }), [loaded]);

    const className = useMemo(() => (
        classnames(styles.exampleRunnerResult, { [styles.hidden]: !resultFrameIsVisible })
    ), [resultFrameIsVisible]);

    // If locally developing, provide the srcDoc content, otherwise the prebuilt URL
    const content = useMemo(() => {
        if (isDevelopment()) {
            const { plunkerIndexHtml, codesandboxIndexHtml } = getIndexHtml(exampleInfo, true);
            const origin = window.origin;
            const wrapped = `
                <base href="${origin}" />
                ${plunkerIndexHtml}
            `;
            return { srcDoc: wrapped };
        }

        return { src: getIndexHtmlUrl(exampleInfo) };
    }, [exampleInfo]);

    // when dark mode is changed, applies it to the iframe.
    useEffect(() => {
        if (!frameRef.current) {
            return;
        }
        applyExampleDarkMode(frameRef.current.contentDocument, darkMode);
    }, [darkMode]);

    if (!isOnScreen && !frameRef.current) {
        return <div className={className} />;
    }

    return <iframe
        key={`${pageName}_${name}_${internalFramework}_${importType}`}
        ref={frameRef}
        title={name}
        className={className}
        style={style}
        onLoad={() => {
            applyExampleDarkMode(frameRef.current.contentDocument, darkMode);
            setLoaded(true);
        }}
        { ...content }
    />;
};

const themes = {
    "ag-theme-quartz": {dark: false, other: "ag-theme-quartz-dark"},
    "ag-theme-quartz-dark": {dark: true, other: "ag-theme-quartz"},
    "ag-theme-alpine": {dark: false, other: "ag-theme-alpine-dark"},
    "ag-theme-alpine-dark": {dark: true, other: "ag-theme-alpine"},
    "ag-theme-balham": {dark: false, other: "ag-theme-balham-dark"},
    "ag-theme-balham-dark": {dark: true, other: "ag-theme-balham"},
}

const applyExampleDarkMode = (document, darkMode) => {
    document.documentElement.dataset.colorScheme = darkMode ? 'dark' : 'light';
    document.documentElement.dataset.defaultTheme = darkMode ? 'ag-theme-quartz-dark' : 'ag-theme-quartz';
    injectStylesheet(document);

    for (const el of document.querySelectorAll("[class*='ag-theme-']")) {
        for (const className of Array.from(el.classList.values())) {
            const theme = themes[className];
            if (theme && theme.dark !== darkMode) {
                el.classList.remove(className);
                el.classList.add(theme.other);
            }
        }
    }

    // dispatch 'color-scheme-change' event for Integrated Charts to update dark mode theme
    document.dispatchEvent(new CustomEvent('color-scheme-change', { detail: { darkMode } }));
}

const injectStylesheet = (document) => {
    const id = 'example-runner-injected-styles';
    let style = document.body.querySelector(`#${id}`);
    if (!style) {
      style = document.createElement('style');
      style.setAttribute('id', id);
      document.body.insertBefore(style, document.body.firstChild);
    }
    style.textContent = exampleRuntimeInjectedStyles;
};

export default ExampleRunnerResult;