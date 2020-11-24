import React from 'react';
import {
    connectStateResults,
    Highlight,
    Hits,
    Index,
    Snippet,
} from 'react-instantsearch-dom';
import styles from './search-result.module.scss';
import './search-result.scss';

const HitCount = connectStateResults(({ searchResults }) => {
    const hitCount = searchResults && searchResults.nbHits;

    return hitCount > 0 ? (
        <div className={styles.searchResult__hitWrapper}>
            <div className={styles.searchResult__hitCount}>Results: {hitCount}</div>
        </div>
    ) : null;
});

const PageHit = ({ hit }) => (
    <a href={hit.path}>
        <h4>
            <Highlight attribute="title" hit={hit} tagName="mark" />
        </h4>
        <Snippet attribute="text" hit={hit} tagName="mark" />
    </a>
);

const HitsInIndex = ({ index }) => (
    <Index indexName={index.name}>
        <HitCount />
        <Hits hitComponent={PageHit} />
    </Index>
);

const SearchResult = ({ indices, show }) => (
    <div className={styles.searchResult} style={{ display: show ? 'block' : 'none' }}>
        {indices.map(index => (
            <HitsInIndex index={index} key={index.name} />
        ))}
    </div>
);

export default SearchResult;