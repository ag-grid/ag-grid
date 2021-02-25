import React, { createRef, useState, useMemo } from 'react';
import algoliasearch from 'algoliasearch/lite';
import { InstantSearch, connectSearchBox } from 'react-instantsearch-dom';
import SearchBox from './SearchBox';
import SearchResult from './SearchResult';
import useClickOutside from './use-click-outside';
import isDevelopment from 'utils/is-development';
import styles from './Search.module.scss';

/**
 * The website uses Algolia to power its search functionality. This component builds on components provided by Algolia
 * to render the search box and results.
 */
const Search = ({ currentFramework }) => {
    const [query, setQuery] = useState();

    // It is important to memoise the client, otherwise we end up creating a new one on every re-render, resulting in
    // no caching and multiple repeated queries!
    const searchClient = useMemo(() =>
        algoliasearch(process.env.GATSBY_ALGOLIA_APP_ID, process.env.GATSBY_ALGOLIA_SEARCH_KEY), []);

    const indices = [{ name: `ag-grid${isDevelopment() ? '-dev' : ''}_${currentFramework}` }];

    return (
        <InstantSearch
            searchClient={searchClient}
            indexName={indices[0].name}
            onSearchStateChange={({ query }) => setQuery(query)}>
            <SearchComponents indices={indices} query={query} />
        </InstantSearch>
    );
};

const SearchComponents = connectSearchBox(({ indices, query, refine }) => {
    const rootRef = createRef();
    const [hasFocus, setFocus] = useState(false);
    const onResultClicked = () => { setFocus(false); refine(''); };

    useClickOutside(rootRef, () => setFocus(false));

    return <div className={styles['search-form']} ref={rootRef}>
        <SearchBox onFocus={() => setFocus(true)} hasFocus={hasFocus} />
        <SearchResult
            show={query && query.length > 0 && hasFocus}
            indices={indices}
            onResultClicked={onResultClicked} />
    </div>;
});

export default Search;