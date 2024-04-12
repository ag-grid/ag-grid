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
    const [isMac, setMac] = useState<boolean>();

    // done inside effect as window won't be available for SSR.
    useEffect(() => {
        const isMacLike =
            typeof window !== 'undefined' &&
            typeof window.navigator !== 'undefined' &&
            (/(Mac|iPhone|iPod|iPad)/i.test(navigator.platform) ||
                /(Mac|iPhone|iPod|iPad)/i.test(navigator.userAgentData?.platform));
        setMac(isMacLike);
    }, []);

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
                aria-label={`Open search with Enter or Space, or use the shortcut ${isMac ? `⌘ K` : `Ctrl K`} while anywhere else in the page.`}
            >
                <Icon name="search" svgClasses={styles.searchIcon} />
                <span className={styles.placeholder}>Search</span>
                {isMac !== undefined && <span className={styles.kbdShortcut}>{isMac ? `⌘ K` : `Ctrl K`}</span>}
            </div>

            <SearchModal isOpen={isOpen} currentFramework={framework} closeModal={setModalOpenFnc(false)} />
        </>
    );
};

export default Search;
