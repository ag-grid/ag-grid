import { Icon } from '@ag-website-shared/components/icon/Icon';
import { ChevronRight } from 'lucide-react';
import React, { useEffect, useRef } from 'react';
import { useHits } from 'react-instantsearch';

import styles from './SearchHits.module.scss';

export default ({ closeModal, structuredHits, selectedHit, setSelectedHit, query }) => {
    const { sendEvent } = useHits();
    const containerRef = useRef();

    useEffect(() => {
        if (containerRef.current) {
            // when the hits change, scroll to the top of the container
            containerRef.current.scrollTop = 0;
        }
    }, [structuredHits]);

    if (structuredHits.length === 0) {
        return (
            <>
                <div className={styles.noResults}>
                    <Icon name="search" />
                    <span>
                        No Results for "<b>{query}</b>"
                    </span>
                </div>
            </>
        );
    }

    // Used for when hovered or focused (tab)
    const selectThisHit = (idx) => {
        setSelectedHit(idx);
    };

    // easy way of capturing the displayed index of each record, for highlighting
    let hitIndex = 0;

    return (
        <div
            className={styles.results}
            ref={containerRef}
            id="search-hits"
            role="listbox"
            aria-activedescendant={`hit-${selectedHit}`}
        >
            {structuredHits.map(({ breadcrumb, children }) => (
                <div key={breadcrumb}>
                    <div className={styles.crumbContainer}>
                        {breadcrumb.split(' > ').map((crumb, index) => (
                            <React.Fragment key={index}>
                                {' '}
                                {/* Ensure a key is provided for each fragment */}
                                {
                                    index > 0 && (
                                        <ChevronRight className={styles.chevronRight} />
                                    ) /* Replace > with ChevronRight component */
                                }
                                <span className={styles.crumb}>{crumb}</span>
                            </React.Fragment>
                        ))}
                    </div>
                    {children.map((hit) => {
                        const idx = hitIndex++;
                        const isApiResult = breadcrumb.substring(0, 3) === 'API';

                        let icon = 'pageResult';
                        if (isApiResult) {
                            icon = 'codeResult';
                        } else if (hit.heading) {
                            icon = 'headingResult';
                        }
                        return (
                            <a
                                className={styles.hitLink}
                                href={hit.path}
                                key={hit.objectID}
                                tabIndex={-1}
                                id={`hit-${idx}`}
                                role="option"
                                aria-selected={selectedHit === idx}
                            >
                                <article
                                    data-selected={selectedHit === idx}
                                    data-hit-index={idx}
                                    key={hit.objectID}
                                    className={styles.hit}
                                    onMouseMove={(e) => selectThisHit(idx)}
                                    onFocus={(e) => selectThisHit(idx)}
                                    onClick={() => {
                                        sendEvent('click', hit, 'Hit Clicked');
                                        closeModal();
                                    }}
                                >
                                    <span role="presentation" className={styles.hitIcon}>
                                        <Icon name={icon} />
                                    </span>

                                    <p className={styles.titleSection}>
                                        <span className={styles.title}>{hit.title}</span>
                                        <span className={styles.heading}>{hit.heading && <> - {hit.heading}</>}</span>
                                    </p>
                                    <p className={styles.text}>{hit.text}</p>
                                </article>
                            </a>
                        );
                    })}
                </div>
            ))}
        </div>
    );
};
