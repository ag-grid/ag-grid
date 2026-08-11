import { Icon } from '@ag-website-shared/components/icon/Icon';
import { useFrameworkFromStore } from '@utils/hooks/useFrameworkFromStore';
import { useEffect, useState } from 'react';

import styles from './Search.module.scss';
import SearchModal from './SearchModal';

/**
 * grid-packages/ag-grid-docs/documentation
 * The website uses Algolia to power its search functionality. This component builds on components provided by Algolia
 * to render the search box and results.
 */
const Search = () => {
    const framework = useFrameworkFromStore();
    const [isOpen, setOpen] = useState(false);

    /**
     * When search is mounted, add global listeners to open/close the search
     */
    useEffect(() => {
        const onKeyDownAnywhere = (e) => {
            const isMetaK = e.key === 'k' && (e.metaKey || e.ctrlKey);

            if (isMetaK) {
                // use the callback so we don't need to update the func ref,
                // and start removing/adding the callback, which would be messy
                setOpen((open) => !open);

                // prevent default to avoid browser address bar capture
                e.preventDefault();
                return;
            }

            const isEsc = e.key === 'Escape';
            if (isEsc) {
                setOpen(false);
            }
        };

        document.addEventListener('keydown', onKeyDownAnywhere);
        return () => document.removeEventListener('keydown', onKeyDownAnywhere);
    }, []);

    const onPseudoInputKeyDown = (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            setOpen(true);
        }
    };

    const setModalOpenFnc = (open) => () => {
        setOpen(open);
    };
    return (
        <>
            <div
                role="button"
                tabIndex={0}
                className={styles.headerSearchBox}
                onClick={setModalOpenFnc(true)}
                onKeyPress={onPseudoInputKeyDown}
                aria-label="Open search with Enter or Space, or use the Command K (Control K on Windows and Linux) shortcut while anywhere else in the page."
            >
                <Icon name="search" svgClasses={styles.searchIcon} />
                <span className={styles.placeholder}>Search</span>
                {/* Both labels render at build time; CSS picks one off html[data-os]. Detecting
                    the platform in an effect instead would leave the hint missing until after
                    hydration — visibly popping in on every page the search bar mounts on. */}
                <span className={styles.kbdShortcut}>
                    <span className={styles.kbdShortcutMac}>⌘ K</span>
                    <span className={styles.kbdShortcutDefault}>Ctrl K</span>
                </span>
            </div>

            <SearchModal isOpen={isOpen} currentFramework={framework} closeModal={setModalOpenFnc(false)} />
        </>
    );
};

export default Search;
