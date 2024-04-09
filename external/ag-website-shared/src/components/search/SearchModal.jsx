import algoliasearch from 'algoliasearch/lite';
import React, { useEffect, useMemo, useState } from 'react';
import { InstantSearch, useHits, useInstantSearch, useSearchBox } from 'react-instantsearch';

import SearchBox from './SearchBox';
import Controls from './SearchControls';
import Hits from './SearchHits';
import styles from './SearchModal.module.scss';

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
    },
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
        <div
            className={`${styles.backdrop} ${isOpen ? styles.backdropEnter : styles.backdropExit}`}
            onAnimationEnd={onAnimationEnd}
            onKeyDown={(evt) => evt.key === 'Tab' && evt.preventDefault()}
            onClick={closeModal}
        >
            <div
                className={styles.container}
                onClick={(evt) => evt.stopPropagation()}
                role="presentation"
                aria-modal="true"
            >
                {children}
            </div>
        </div>
    );
};

export default ({ currentFramework, closeModal, isOpen }) => {
    const index = `${envPrefix}_${currentFramework}`;

    return (
        <Modal isOpen={isOpen} closeModal={closeModal}>
            <InstantSearch searchClient={searchClient} indexName={index}>
                <SearchComponent closeModal={closeModal} />
            </InstantSearch>
        </Modal>
    );
};

const SearchComponent = ({ closeModal }) => {
    const { status } = useInstantSearch();
    const { query } = useSearchBox();
    const { hits } = useHits();
    const structuredHits = useMemo(() => getAllCrumbs(hits), [hits]);
    const flattenedHits = useMemo(() => flattenStructure(structuredHits), [structuredHits]);

    const [selectedHit, setSelectedHit] = useState(0);
    useEffect(() => {
        // when hits change, also reset the selected hit
        setSelectedHit(0);
    }, [hits]);

    const selectHit = (idx) => {
        setSelectedHit(idx);

        let block = 'nearest';
        if (idx === 0) {
            block = 'end';
        } else if (idx === hits.length - 1) {
            block = 'start';
        }

        const hitEl = document.querySelector(`[data-hit-index="${idx}"]`);
        if (hitEl) {
            hitEl.scrollIntoView({ behavior: 'smooth', block });
        }
    };

    const onKeyDown = (evt) => {
        if (hits.length === 0) {
            return;
        }

        if (evt.key === 'Enter') {
            window.location = flattenedHits[selectedHit].path;
            // close modal, if link was same page we don't want to keep the modal open.
            closeModal();
            return;
        }

        const newIdx = {
            PageUp: 0,
            PageDown: hits.length - 1,
            ArrowUp: (selectedHit - 1 + hits.length) % hits.length,
            ArrowDown: (selectedHit + 1) % hits.length,
            Tab: (selectedHit + (evt.shiftKey ? -1 : 1) + hits.length) % hits.length,
        }[evt.key];

        if (newIdx === undefined) {
            return;
        }
        evt.preventDefault();
        selectHit(newIdx);
    };

    return (
        <div onKeyDown={onKeyDown}>
            <SearchBox selectedHit={selectedHit} />
            {status === 'idle' && !!query.length && (
                <>
                    <Hits
                        structuredHits={structuredHits}
                        selectedHit={selectedHit}
                        setSelectedHit={setSelectedHit}
                        closeModal={closeModal}
                        query={query}
                    />
                    <Controls />
                </>
            )}
        </div>
    );
};

const flattenStructure = (structuredHits) => {
    const result = [];
    structuredHits.forEach(({ children }) => {
        children.forEach((child) => result.push(child));
    });
    return result;
};

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
        allCrumbs = allCrumbs.filter((crumb) => !crumb.breadcrumb.startsWith(nextCrumb.breadcrumb));
    }
    return result;
};

const getNextBreadCrumb = (crumbArray) => {
    const firstBreadCrumb = crumbArray[0].breadcrumb.split(' > ');
    const firstCrumb = firstBreadCrumb[0];

    const allSiblings = crumbArray.filter((crumb) => crumb.breadcrumb.startsWith(firstCrumb));
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
};
