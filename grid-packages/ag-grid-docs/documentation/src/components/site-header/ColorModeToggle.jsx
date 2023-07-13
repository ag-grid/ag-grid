import classNames from 'classnames';
import React from 'react';
import LocalStorage from '../../utils/local-storage';
import GlobalContextConsumer from '../GlobalContext';
import { Icon } from '../Icon';
import styles from './ColorModeToggle.module.scss';

// Get starting color mode
// If localstorage color is set use that, otherwise check for browser default.
const startingColorMode = () => {
    if (LocalStorage.get('colorMode')) {
        return LocalStorage.get('colorMode');
    } else {
        return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
};

export const ColorModeToggle = () => {
    return (
        <GlobalContextConsumer>
            {({ colorMode, set }) => {
                // [REVIEW] Don't think this is the right place for this global stuff, but it works
                const htmlEl = document.querySelector('html');

                // Using .no-transitions class so that there are no animations between light/dark modes
                htmlEl.classList.add('no-transitions');
                htmlEl.dataset.colorMode = colorMode;
                htmlEl.offsetHeight; // Trigger a reflow, flushing the CSS changes
                htmlEl.classList.remove('no-transitions');

                return (
                    <li>
                        <button
                            className={classNames(
                                styles.toggle,
                                colorMode === 'light' ? styles.light : styles.dark,
                                'button-style-none'
                            )}
                            onClick={() => {
                                set({ colorMode: colorMode === 'light' ? 'dark' : 'light' });
                            }}
                        >
                            {colorMode === 'dark' ? <Icon name="sun" /> : <Icon name="moon" />}
                        </button>
                    </li>
                );
            }}
        </GlobalContextConsumer>
    );
};
