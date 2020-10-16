import { Link } from 'gatsby';
import { default as React } from 'react';
import {
    connectStateResults,
    Highlight,
    Hits,
    Index,
    Snippet,
} from 'react-instantsearch-dom';

const HitCount = connectStateResults(({ searchResults }) => {
    const hitCount = searchResults && searchResults.nbHits;

    return hitCount > 0 ? (
        <div className="HitCount">
            {hitCount} result{hitCount !== 1 ? `s` : ``}
        </div>
    ) : null;
});

const PageHit = ({ hit }) => (
    <div>
        <Link to={hit.path}>
            <h4>
                <Highlight attribute="title" hit={hit} tagName="mark" />
            </h4>
        </Link>
        <Snippet attribute="text" hit={hit} tagName="mark" />
    </div>
);

const HitsInIndex = ({ index }) => (
    <Index indexName={index.name}>
        <HitCount />
        <Hits className="Hits" hitComponent={PageHit} />
    </Index>
);

const SearchResult = ({ indices, className }) => (
    <div className={className}>
        {indices.map(index => (
            <HitsInIndex index={index} key={index.name} />
        ))}
    </div>
);

export default SearchResult;