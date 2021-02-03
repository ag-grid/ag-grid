import React from 'react';
import { Link } from 'gatsby';
import {
    connectStateResults,
    Highlight,
    Hits,
    Index,
    Snippet,
} from 'react-instantsearch-dom';
import classnames from 'classnames';
import styles from './SearchResult.module.scss';

const HitCount = connectStateResults(({ searchResults }) => {
    const hitCount = searchResults && searchResults.nbHits;

    return hitCount > 0 ? (
        <div className={styles['search-result__hit-wrapper']}>
            <div className={styles['search-result__hit-count']}>Results: {hitCount}</div>
        </div>
    ) : null;
});

const PageHit = ({ hit, onResultClicked }) => (
    <Link to={hit.path} onClick={onResultClicked}>
        <h4>
            <Highlight attribute="title" hit={hit} tagName="mark" />
        </h4>
        <Snippet attribute="text" hit={hit} tagName="mark" />
    </Link>
);

const HitsInIndex = ({ index, onResultClicked }) => (
    <Index indexName={index.name}>
        <HitCount />
        <Hits hitComponent={props => PageHit({ ...props, onResultClicked })} />
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