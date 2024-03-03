import React, { useEffect, useState, useMemo } from 'react';
import algoliasearch from 'algoliasearch/lite';
import { InstantSearch, useHits, useInstantSearch, useSearchBox } from 'react-instantsearch';
import SearchBox from './SearchBox';
import Hits from './SearchHits';
import Controls from './SearchControls';
import styles from '@design-system/modules/SearchModal.module.scss';

const envPrefix = import.meta.env.PUBLIC_ALGOLIA_INDEX_PREFIX;
const algoliaClient = algoliasearch(import.meta.env.PUBLIC_ALGOLIA_APP_ID, import.meta.env.PUBLIC_ALGOLIA_SEARCH_KEY);

/**
 * We don't want to send a search request if the query is empty, so we override the search method to check for this.
 */
const searchClient = {
    ...algoliaClient,
    search(requests) {
        // don't search for an empty query
        if (requests.every(({ params }) => !params.query)) {
            return Promise.resolve({
                results: requests.map(() => ({
                    hits: [],
                    nbHits: 0,
                    nbPages: 0,
                    page: 0,
                    processingTimeMS: 0,
                    hitsPerPage: 0,
                    exhaustiveNbHits: false,
                    query: '',
                    params: '',
                })),
            });
        }

        return algoliaClient.search(requests);
    },
    future: {
        preserveSharedStateOnUnmount: true,
    }
};

const Modal = ({ isOpen, closeModal, children }) => {
    const [isMounted, setIsMounted] = useState(isOpen);

    /**
     * When the modal is open, we want to prevent scrolling on the rest of the page.
     */
    useEffect(() => {
        const htmlElement = document.getElementsByTagName('html')[0];

        if (isOpen) {
            setIsMounted(true);
            const scrollbarWidth = window.innerWidth - htmlElement.clientWidth;
            htmlElement.style.overflow = 'hidden';
            htmlElement.style.paddingRight = `${scrollbarWidth}px`;
            return;
        }
    
        htmlElement.style.overflow = '';
        htmlElement.style.paddingRight = '';
    }, [isOpen]);

    if (!isOpen && !isMounted) {
        return null;
    }

    const onAnimationEnd = (evt) => {
        setIsMounted(isOpen);
    };

    return (
        <div className={styles.backdrop + ' ' + (isOpen ? styles.backdropEnter : styles.backdropExit)} onClick={closeModal} role="button" tabIndex="0" onAnimationEnd={onAnimationEnd}>
            <div className={styles.container} onClick={evt => evt.stopPropagation()} role="button" tabIndex="0">
                {children}
            </div>
        </div>
    );
}

export default ({ currentFramework, closeModal, isOpen }) => {
    const index = `${envPrefix}_${currentFramework}`;

    return (
        <Modal isOpen={isOpen} closeModal={closeModal}>
            <InstantSearch searchClient={searchClient} indexName={index}>
                <SearchComponent closeModal={closeModal} />
            </InstantSearch>
        </Modal>
    );
}

const SearchComponent = ({ closeModal }) => {
    const { status } = useInstantSearch();
    /**
     * Note for whoever...
     * status === 'loading' means the search is loading
     * status === 'stalled' means the search is loading, but slower than expected
     * status === 'error'   means the search failed
     * status === 'idle'    means the search is done
     * 
     * currently none of this has been considered, and probably should be, so I have left it here.
     */
    const {
        query,
    } = useSearchBox();

    const { hits } = useHits();
    const structuredHits = useMemo(() => getAllCrumbs(hits), [hits]);
    const flattenedHits = useMemo(() => flattenStructure(structuredHits), [structuredHits]);

    useEffect(() => {
        // when hits change, also reset the selected hit
        setSelectedHit(0);
    }, [hits]);

    const [selectedHit, setSelectedHit] = useState(0);

    const onKeyDown = (evt) => {
        switch (evt.key) {
            case 'PageUp':
                const topIdx = 0;
                setSelectedHit(topIdx);
                document.querySelector(`[data-hit-index="${topIdx}"]`)?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                break;
            case 'PageDown':
                const bottomIdx = hits.length - 1;
                setSelectedHit(bottomIdx);
                document.querySelector(`[data-hit-index="${bottomIdx}"]`)?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                break;
            case 'ArrowUp':
                const belowIdx = selectedHit - 1 >= 0 ? selectedHit - 1 : hits.length - 1;
                setSelectedHit(belowIdx);
                // small hack, if index === 0, we force scroll to go a bit further by specifying end, allowing the breadcrumb to scroll in too
                document.querySelector(`[data-hit-index="${belowIdx}"]`)?.scrollIntoView({ behavior: 'smooth', block: belowIdx === 0 ? 'end' : 'nearest' });
                break;
            case 'ArrowDown':
                const aboveIdx = (selectedHit + 1) % hits.length;
                setSelectedHit(aboveIdx);
                // small hack, if index === 0, we force scroll to go a bit further by specifying end, allowing the breadcrumb to scroll in too
                document.querySelector(`[data-hit-index="${aboveIdx}"]`)?.scrollIntoView({ behavior: 'smooth', block: aboveIdx === 0 ? 'end' : 'nearest' });
                break;
            case 'Enter':
                window.location = (flattenedHits[selectedHit].path);
                // close modal, if link was same page we don't want to keep the modal open.
                closeModal();
        }
    }

    return (
        <div onKeyDown={onKeyDown}>
            <SearchBox />
            {
                status === 'idle' && !!query.length && <>
                    <Hits
                        structuredHits={structuredHits}
                        selectedHit={selectedHit}
                        setSelectedHit={setSelectedHit}
                        closeModal={closeModal}
                        query={query}
                    />
                    <Controls />
                </>
            }
        </div>
    );
}

const flattenStructure = (structuredHits) => {
    const result = [];
    structuredHits.forEach(({ children }) => {
        children.forEach(child => result.push(child));
    });
    return result;
}

/**
 * This function takes an array of crumbs and returns an array of crumbs which are the highest level shared crumbs.
 */
const getAllCrumbs = (crumbArray) => {
    const result = [];
    let allCrumbs = crumbArray.slice();
    while (allCrumbs.length) {
        const nextCrumb = getNextBreadCrumb(allCrumbs);
        result.push(nextCrumb);

        // remove all crumbs which share the same path
        allCrumbs = allCrumbs.filter(crumb => !crumb.breadcrumb.startsWith(nextCrumb.breadcrumb));
    }
    return result;
}

const getNextBreadCrumb = (crumbArray) => {
    const firstBreadCrumb = crumbArray[0].breadcrumb.split(' > ');
    const firstCrumb = firstBreadCrumb[0];

    const allSiblings = crumbArray.filter(crumb => crumb.breadcrumb.startsWith(firstCrumb));
    // only crumb, return it alone as a full breadcrumb
    if (allSiblings.length === 1) {
        return { breadcrumb: crumbArray[0].breadcrumb, children: allSiblings };
    }

    for (let i = 1; i < firstBreadCrumb.length; i++) {
        const breadcrumb = firstBreadCrumb.slice(0, i + 1).join(' > ');
        for (let b = 0; b < allSiblings.length; b++) {
            // find the first sibling which doesn't share the full path
            if (!allSiblings[b].breadcrumb.startsWith(breadcrumb)) {
                // return full crumb up to (and not including) this last unmatched chunk.
                return { breadcrumb: firstBreadCrumb.slice(0, i).join(' > '), children: allSiblings };
            }
        }
    }
    // all crumbs are the same, return the full crumb
    return { breadcrumb: crumbArray[0].breadcrumb, children: allSiblings };
}
