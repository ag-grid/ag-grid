import { Link } from 'gatsby';
import { default as React } from 'react';
import {
    connectStateResults,
    Highlight,
    Hits,
    Index,
    Snippet,
} from 'react-instantsearch-dom';
import './searchResult.scss';

const HitCount = connectStateResults(({ searchResults }) => {
    const hitCount = searchResults && searchResults.nbHits;

    return hitCount > 0 ? (
        <div className="hit-wrapper">
            <div className="hit-count">Results: {hitCount}</div>
        </div>
    ) : null;
});

const PageHit = ({ hit }) => (
    <Link to={hit.path}>
        <h4>
            <Highlight attribute="title" hit={hit} tagName="mark" />
        </h4>
        <Snippet attribute="text" hit={hit} tagName="mark" />
    </Link>
);

const HitsInIndex = ({ index }) => (
    <Index indexName={index.name}>
        <HitCount />
        <Hits className="Hits" hitComponent={PageHit} />
    </Index>
);

const SearchResult = ({ indices, show }) => (
    <div className="search-result" style={{ display: show ? 'block' : 'none' }}>
        {indices.map(index => (
            <HitsInIndex index={index} key={index.name} />
        ))}
    </div>
);

export default SearchResult;