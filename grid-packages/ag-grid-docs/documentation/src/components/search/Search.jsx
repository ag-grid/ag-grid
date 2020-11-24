import algoliasearch from 'algoliasearch/lite';
import React, { createRef, useState } from 'react';
import { InstantSearch } from 'react-instantsearch-dom';
import SearchBox from './SearchBox';
import SearchResult from './SearchResult';
import useClickOutside from './use-click-outside';
import styles from './search.module.scss';

export default function Search({ indices }) {
    const rootRef = createRef();
    const [query, setQuery] = useState();
    const [hasFocus, setFocus] = useState(false);
    const searchClient = algoliasearch(
        process.env.GATSBY_ALGOLIA_APP_ID,
        process.env.GATSBY_ALGOLIA_SEARCH_KEY
    );

    useClickOutside(rootRef, () => setFocus(false));

    return (
        <div className={styles.searchForm} ref={rootRef}>
            <InstantSearch
                searchClient={searchClient}
                indexName={indices[0].name}
                onSearchStateChange={({ query }) => setQuery(query)}

            >
                <SearchBox onFocus={() => setFocus(true)} hasFocus={hasFocus} />
                <SearchResult
                    show={query && query.length > 0 && hasFocus}
                    indices={indices}
                />
            </InstantSearch>
        </div>
    );
}