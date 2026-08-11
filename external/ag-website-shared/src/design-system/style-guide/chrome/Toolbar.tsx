import { Icon } from '@ag-website-shared/components/icon/Icon';
import { useDarkmode } from '@utils/hooks/useDarkmode';
import type { FunctionComponent } from 'react';

import styles from '../StyleGuide.module.scss';
import { useStyleGuide } from '../StyleGuideContext';

/**
 * Sticky controls for the guide: token search and a theme switch.
 *
 * The theme switch flips the real page theme rather than a preview scope, so live specimens are
 * genuinely rendered in the theme being inspected. Token *values* do not need it - those are shown
 * for both themes side by side - but a button's hover state or a shadow on a real surface does.
 */
export const Toolbar: FunctionComponent = () => {
    const { filter, setFilter, tokens, ready } = useStyleGuide();
    const [darkmode, setDarkmode] = useDarkmode();

    return (
        <div className={styles.toolbar}>
            <div className={styles.toolbarSearch}>
                <Icon name="search" />
                <input
                    type="search"
                    value={filter}
                    onChange={(event) => setFilter(event.target.value)}
                    placeholder="Filter tokens, classes and icons"
                    aria-label="Filter tokens, classes and icons"
                />
                {filter !== '' && (
                    <button
                        type="button"
                        className="button-style-none"
                        onClick={() => setFilter('')}
                        aria-label="Clear filter"
                    >
                        <Icon name="cross" />
                    </button>
                )}
            </div>

            <p className={styles.toolbarCount}>{ready ? `${tokens.length} tokens` : 'Reading stylesheet…'}</p>

            <button
                type="button"
                className="button-secondary"
                onClick={() => setDarkmode(!darkmode)}
                aria-pressed={darkmode === true}
            >
                <span suppressHydrationWarning>{darkmode ? 'Light theme' : 'Dark theme'}</span>
                <Icon name={darkmode ? 'sun' : 'moon'} />
            </button>
        </div>
    );
};
