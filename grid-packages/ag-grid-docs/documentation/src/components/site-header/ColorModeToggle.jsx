import classNames from 'classnames';
import React, { useEffect, useState } from 'react';
import LocalStorage from '../../utils/local-storage';
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
    const [colorMode, setColorMode] = useState(startingColorMode());

    const toggleColorMode = () => {
        setColorMode(colorMode === 'light' ? 'dark' : 'light');
    };

    useEffect(() => {
        const htmlEl = document.querySelector('html');

        LocalStorage.set('colorMode', colorMode);

        // Using .no-transitions class so that there are no animations between light/dark modes
        htmlEl.classList.add('no-transitions');
        htmlEl.dataset.colorMode = colorMode;
        htmlEl.offsetHeight; // Trigger a reflow, flushing the CSS changes
        htmlEl.classList.remove('no-transitions');
    }, [colorMode]);

    return (
        <li>
            <button
                className={classNames(
                    styles.toggle,
                    colorMode === 'light' ? styles.light : styles.dark,
                    'button-style-none'
                )}
                onClick={toggleColorMode}
            >
                {colorMode === 'dark' ? <Icon name="sun" /> : <Icon name="moon" />}
            </button>
        </li>
    );
};
