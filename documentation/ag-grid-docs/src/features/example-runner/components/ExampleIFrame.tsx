import styles from '@design-system/modules/ExampleIFrame.module.scss';
import { useIntersectionObserver } from '@utils/hooks/useIntersectionObserver';
import { useDarkmode } from '@utils/hooks/useDarkmode';
import classnames from 'classnames';
import { type FunctionComponent, useEffect, useRef, useState } from 'react';
import exampleRuntimeInjectedStyles from './exampleRuntimeInjectedStyles';

interface Props {
    isHidden?: boolean;
    url?: string;
    loadingIFrameId: string;
}

export const ExampleIFrame: FunctionComponent<Props> = ({ isHidden, url, loadingIFrameId }) => {
    const [isIntersecting, setIsIntersecting] = useState(false);
    const iFrameRef = useRef<HTMLIFrameElement>(null);
    const [darkMode] = useDarkmode();

    // Only show example iFrame if it is visible on the screen
    useIntersectionObserver({
        elementRef: iFrameRef,
        onChange: ({ isIntersecting: newIsIntersecting }) => {
            if (url != null && newIsIntersecting && iFrameRef.current && !iFrameRef.current.src) {
                iFrameRef.current.src = url;
            }
            setIsIntersecting(newIsIntersecting);
        },
    });

    useEffect(() => {
        const currentSrc = iFrameRef.current?.src && new URL(iFrameRef.current.src);
        if (!isIntersecting || !url || !iFrameRef.current || (currentSrc as URL)?.pathname === url) {
            return;
        }

        iFrameRef.current.src = url;
    }, [isIntersecting, url]);

        // when dark mode is changed, applies it to the iframe.
        useEffect(() => {
            if (!iFrameRef.current) {
                return;
            }
            applyExampleDarkMode(iFrameRef.current.contentDocument!, darkMode);
        }, [darkMode]);

    return (
        <div
            className={classnames(styles.container, {
                [styles.hidden]: isHidden,
            })}
        >
            {/*`exampleRunner` class is used by the dark mode toggle to post a message to this iFrame*/}
            <iframe
                id={loadingIFrameId}
                ref={iFrameRef}
                className={classnames('exampleRunner', styles.iframe)}
                style={{ visibility: 'hidden' }}
                onLoad={() => {
                    applyExampleDarkMode(iFrameRef.current.contentDocument, darkMode);
                }}
            />
        </div>
    );
};

const themes: Record<string,any> = {
    "ag-theme-quartz": {dark: false, other: "ag-theme-quartz-dark"},
    "ag-theme-quartz-dark": {dark: true, other: "ag-theme-quartz"},
    "ag-theme-alpine": {dark: false, other: "ag-theme-alpine-dark"},
    "ag-theme-alpine-dark": {dark: true, other: "ag-theme-alpine"},
    "ag-theme-balham": {dark: false, other: "ag-theme-balham-dark"},
    "ag-theme-balham-dark": {dark: true, other: "ag-theme-balham"},
}

const applyExampleDarkMode = (document: Document, darkMode: boolean) => {
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

const injectStylesheet = (document: Document) => {
    const id = 'example-runner-injected-styles';
    let style = document.body.querySelector(`#${id}`);
    if (!style) {
      style = document.createElement('style');
      style.setAttribute('id', id);
      document.body.insertBefore(style, document.body.firstChild);
    }
    style.textContent = exampleRuntimeInjectedStyles;
};