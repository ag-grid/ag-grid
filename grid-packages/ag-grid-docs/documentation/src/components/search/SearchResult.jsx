import React from 'react';
import { Link } from 'gatsby';
import {
    connectStateResults,
    Highlight,
    InfiniteHits,
    Index,
    Snippet,
} from 'react-instantsearch-dom';
import classnames from 'classnames';
import styles from './SearchResult.module.scss';

const HitCount = connectStateResults(({ searchResults }) => {
    const hitCount = searchResults && searchResults.nbHits;

    return <div className={styles['search-result__hit-wrapper']}>
        <div className={styles['search-result__hit-count']}>Results: {hitCount}</div>
    </div>;
});

const PageHit = ({ hit, onResultClicked }) => (
    <Link to={hit.path} onClick={onResultClicked}>
        <div className={styles['search-result__hit-item__breadcrumb']}>{hit.breadcrumb}</div>
        <h4>
            <Highlight attribute="title" hit={hit} tagName="mark" />
            {hit.heading && <>{`: `}<Highlight attribute="heading" hit={hit} tagName="mark" /></>}
        </h4>
        <Snippet attribute="text" hit={hit} tagName="mark" />
    </Link>
);

const Results = connectStateResults(({ searchState, searchResults, children, isSearchStalled }) => {
    if (searchResults && searchResults.nbHits > 0) {
        return children;
    } else {
        return <div className={styles['search-result__message']}>
            {isSearchStalled ? 'Loading...' : `We couldn't find any matches for "${searchState.query}"`}
        </div>;
    }
});

const HitsInIndex = ({ index, onResultClicked }) => (
    <Index indexName={index.name}>
        <HitCount />
        <Results>
            <InfiniteHits hitComponent={props => PageHit({ ...props, onResultClicked })} />
        </Results>
    </Index>
);

const SearchResult = ({ indices, show, onResultClicked }) => (
    <div className={classnames(styles['search-result'], { [styles['search-result--show']]: show })}>
        {indices.map(index => (
            <HitsInIndex index={index} key={index.name} onResultClicked={onResultClicked} />
        ))}
    </div>
);

export default SearchResult;