import React, {useState} from 'react';
import classnames from 'classnames';
import {connectSearchBox} from 'react-instantsearch-dom';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faSearch} from '@fortawesome/free-solid-svg-icons';
import styles from './SearchBox.module.scss';

/**
 * The search box shown in the header at the top of the page.
 */
const SearchBox = ({delay, refine, currentRefinement, className, onFocus}) => {
    const [timerId, setTimerId] = useState();

    const onChangeDebounced = event => {
        const inputValue = event.target.value;

        clearTimeout(timerId);
        setTimerId(setTimeout(() => {
            refine(inputValue);
        }, delay));
    };

    return (
        <form className={classnames(className, styles['search-box'])}>
            <input
                className={classnames('SearchInput', styles['search-box__input'])}
                type="text"
                placeholder="Search..."
                aria-label="Search"
                onChange={onChangeDebounced}
                onFocus={onFocus}
            />
            <FontAwesomeIcon icon={faSearch} className={styles['search-box__icon']}/>
        </form>
    )
}
export default connectSearchBox(SearchBox);
