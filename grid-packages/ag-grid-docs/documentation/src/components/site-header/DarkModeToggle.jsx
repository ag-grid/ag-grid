import classNames from 'classnames';
import React from 'react';
import GlobalContextConsumer from '../GlobalContext';
import { Icon } from '../Icon';
import headerStyles from './SiteHeader.module.scss';

const IS_SSR = typeof window === 'undefined';

export const DarkModeToggle = () => {
    return IS_SSR ? (
        <li className={classNames(headerStyles.navItem, headerStyles.buttonItem)}>
            <button
                className={classNames(headerStyles.navLink, 'button-style-none')}
                aria-label="Toggle Dark Mode"
            >
                <Icon name="sun" />
            </button>
        </li>
    ) : (
        <GlobalContextConsumer>
            {({ darkMode, set }) => {
                const htmlEl = document.querySelector('html');

                // Using .no-transitions class so that there are no animations between light/dark modes
                htmlEl.classList.add('no-transitions');
                htmlEl.dataset.darkMode = darkMode ? 'true' : 'false';
                htmlEl.offsetHeight; // Trigger a reflow, flushing the CSS changes
                htmlEl.classList.remove('no-transitions');

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
            }}
        </GlobalContextConsumer>
    );
};
