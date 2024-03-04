import React, { useEffect, useState, useMemo } from 'react';
import SearchModal from './SearchModal';
import { Icon } from '../icon/Icon';
import { useStore } from '@nanostores/react';
import { $internalFramework } from '@stores/frameworkStore';
import { getFrameworkFromInternalFramework } from '@utils/framework';

import styles from '@design-system/modules/Search.module.scss';

/**
 * grid-packages/ag-grid-docs/documentation
 * The website uses Algolia to power its search functionality. This component builds on components provided by Algolia
 * to render the search box and results.
 */
const Search = () => {
    const internalFramework = useStore($internalFramework);
    const currentFramework = useMemo(() => getFrameworkFromInternalFramework(internalFramework), [internalFramework]);
    const [isOpen, setOpen] = useState(false);
    const [isMac, setMac] = useState(false);
    
    // done inside effect as window won't be available for SSR.
    useEffect(() => {
        const isMacLike = typeof window !== 'undefined' && typeof window.navigator !== 'undefined' && (
            /(Mac|iPhone|iPod|iPad)/i.test(navigator.platform) ||
            /(Mac|iPhone|iPod|iPad)/i.test(navigator.userAgentData?.platform)
        );
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

    return <>
        <div className={styles.headerSearchBox} onClick={() => setOpen(true)}>
            <Icon name="search" svgClasses={styles.searchIcon}/>
            <span className={styles.placeholder}>Search...</span>
            <span className={styles.kbdShortcut}>{ isMac ? `⌘ K` : `Ctrl K` }</span>
        </div>
        
        <SearchModal isOpen={isOpen} currentFramework={currentFramework} closeModal={() => setOpen(false)} />
    </>;
}

export default Search;
