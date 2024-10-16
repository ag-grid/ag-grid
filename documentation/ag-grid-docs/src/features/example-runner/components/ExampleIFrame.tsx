import { useDarkmode } from '@utils/hooks/useDarkmode';
import { useIntersectionObserver } from '@utils/hooks/useIntersectionObserver';
import classnames from 'classnames';
import { type FunctionComponent, useCallback, useEffect, useRef, useState } from 'react';

import styles from './ExampleIFrame.module.scss';
import exampleRuntimeInjectedStyles from './exampleRuntimeInjectedStyles';

interface Props {
    title: string;
    isHidden?: boolean;
    url?: string;
    loadingIFrameId: string;
    suppressDarkMode?: boolean;
}

export const ExampleIFrame: FunctionComponent<Props> = ({
    title,
    isHidden,
    url,
    loadingIFrameId,
    suppressDarkMode,
}) => {
    const [isIntersecting, setIsIntersecting] = useState(false);
    const iFrameRef = useRef<HTMLIFrameElement>(null);
    const [darkMode] = useDarkmode();
    const [isScrolling, setIsScrolling] = useState(false);

    useEffect(() => {
        const scrollListener = () => {
            setIsScrolling(true);
            // Ensure a slow user scroll still loads the example
            // Main idea is to prevent loading examples during smooth scroll behavior of right menu links
            setTimeout(() => {
                setIsScrolling(false);
            }, 500);
        };
        const scrollEndListener = () => setIsScrolling(false);

        addEventListener('scrollend', scrollEndListener);
        addEventListener('scroll', scrollListener);

        return () => {
            removeEventListener('scroll', scrollListener);
            removeEventListener('scrollend', scrollEndListener);
        };
    }, []);

    // Only show example iFrame if it is visible on the screen
    useIntersectionObserver({
        elementRef: iFrameRef,
        onChange: ({ isIntersecting: newIsIntersecting }) => {
            setIsIntersecting(newIsIntersecting);
        },
    });

    useEffect(() => {
        const currentSrc = iFrameRef.current?.src && new URL(iFrameRef.current.src);
        if (!isIntersecting || !url || !iFrameRef.current || (currentSrc as URL)?.pathname === url || isScrolling) {
            return;
        }
        iFrameRef.current.src = url;
    }, [isIntersecting, url, isScrolling]);

    // when dark mode is changed, applies it to the iframe.
    useEffect(() => {
        if (!iFrameRef.current) {
            return;
        }
        if (!suppressDarkMode) {
            applyExampleDarkMode(iFrameRef.current.contentDocument!, darkMode);
        }
    }, [darkMode]);

    const handleOnLoad = useCallback(() => {
        if (!suppressDarkMode) {
            applyExampleDarkMode(iFrameRef.current.contentDocument, darkMode);
        }
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
                title={title}
                ref={iFrameRef}
                className={classnames('exampleRunner', styles.iframe)}
                style={{ visibility: 'hidden' }}
                onLoad={handleOnLoad}
            />
        </div>
    );
};

const themes: Record<string, any> = {
    'ag-theme-quartz': { dark: false, other: 'ag-theme-quartz-dark' },
    'ag-theme-quartz-dark': { dark: true, other: 'ag-theme-quartz' },
    'ag-theme-alpine': { dark: false, other: 'ag-theme-alpine-dark' },
    'ag-theme-alpine-dark': { dark: true, other: 'ag-theme-alpine' },
    'ag-theme-balham': { dark: false, other: 'ag-theme-balham-dark' },
    'ag-theme-balham-dark': { dark: true, other: 'ag-theme-balham' },
};

const applyExampleDarkMode = (document: Document, darkMode: boolean) => {
    document.documentElement.dataset.colorScheme = darkMode ? 'dark' : 'light';
    document.documentElement.dataset.agThemeMode = darkMode ? 'dark-blue' : 'light';
    document.documentElement.dataset.defaultTheme = darkMode ? 'ag-theme-quartz-dark' : 'ag-theme-quartz';
    // injectStylesheet(document);

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
};

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
