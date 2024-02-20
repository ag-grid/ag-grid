import classNames from 'classnames';
import React, { useEffect } from 'react';
import { useGlobalContext } from '../GlobalContext';
import { Icon } from '../Icon';
import headerStyles from '@design-system/modules/SiteHeader.module.scss';

const IS_SSR = typeof window === 'undefined';

function DarkModeToggleSSR() {
    return <li className={classNames(headerStyles.navItem, headerStyles.buttonItem)}>
        <button
            className={classNames(headerStyles.navLink, 'button-style-none')}
            aria-label="Toggle Dark Mode"
        >
            <Icon name="sun" />
        </button>
    </li>
}

function DarkModeToggleClientSide() {
    const { darkMode, set } = useGlobalContext();

    useEffect(() => {
        const htmlEl = document.querySelector('html');
    
        // Using .no-transitions class so that there are no animations between light/dark modes
        htmlEl.classList.add('no-transitions');
        htmlEl.dataset.darkMode = darkMode ? 'true' : 'false';
        htmlEl.offsetHeight; // Trigger a reflow, flushing the CSS changes
        htmlEl.classList.remove('no-transitions');
    }, [darkMode])

    return (
        <li className={classNames(headerStyles.navItem, headerStyles.buttonItem)}>
            <button
                className={classNames(headerStyles.navLink, 'button-style-none')}
                aria-label="Toggle Dark Mode"
                onClick={() => {
                    set({ darkMode: !darkMode });
                }}
            >
                {darkMode ? <Icon name="sun" /> : <Icon name="moon" />}
                <span>Toggle Darkmode</span>
            </button>
        </li>
    );
}

export const DarkModeToggle = () => {
    return IS_SSR ? (
        <DarkModeToggleSSR />
    ) : (
        <DarkModeToggleClientSide />
    );
};
