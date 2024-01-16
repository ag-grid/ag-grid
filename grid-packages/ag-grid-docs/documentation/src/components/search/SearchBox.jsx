import classnames from 'classnames';
import React, { useState } from 'react';
import { Icon } from '../Icon';
import { DocSearch } from '@docsearch/react';
import '@design-system/modules/SearchModal.scss';


const IS_SSR = typeof window === 'undefined';

/**
 * The search box shown in the header at the top of the page.
 */
const SearchBox = ({ delay, refine, currentRefinement, className, onFocus, resultsOpen }) => {
    const [timerId, setTimerId] = useState();

    const onChangeDebounced = (event) => {
        const inputValue = event.target.value;

        clearTimeout(timerId);
        setTimerId(
            setTimeout(() => {
                refine(inputValue);
            }, delay)
        );
    };

    const searchPlaceholder = !IS_SSR && window.innerWidth < 620 ? 'Search...' : 'Search documentation...';

    return (
        <><DocSearch
                appId="R2IYF7ETH7"
                apiKey="599cec31baffa4868cae4e79f180729b"
                indexName="docsearch" /></>


    );
};
export default SearchBox;
