import algoliasearch from 'algoliasearch/lite';
import React, { createRef, useState } from 'react';
import { InstantSearch } from 'react-instantsearch-dom';
import SearchBox from './SearchBox';
import SearchResult from './SearchResult';
import useClickOutside from './use-click-outside';
import isDevelopment from 'utils/is-development';
import styles from './Search.module.scss';

export default function Search({ currentFramework }) {
    const rootRef = createRef();
    const [query, setQuery] = useState();
    const [hasFocus, setFocus] = useState(false);
    const searchClient = algoliasearch(process.env.GATSBY_ALGOLIA_APP_ID, process.env.GATSBY_ALGOLIA_SEARCH_KEY);

    useClickOutside(rootRef, () => setFocus(false));

    const indices = [{ name: `ag-grid${isDevelopment() ? '-dev' : ''}_${currentFramework}` }];
    const onResultClicked = () => setFocus(false);

    return (
        <div className={styles['search-form']} ref={rootRef}>
            <InstantSearch
                searchClient={searchClient}
                indexName={indices[0].name}
                onSearchStateChange={({ query }) => setQuery(query)}>
                <SearchBox onFocus={() => setFocus(true)} hasFocus={hasFocus} />
                <SearchResult
                    show={query && query.length > 0 && hasFocus}
                    indices={indices}
                    onResultClicked={onResultClicked} />
            </InstantSearch>
        </div>
    );
}
