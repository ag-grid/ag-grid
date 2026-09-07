import type { Framework } from '@ag-grid-types';
import Code from '@ag-website-shared/components/code/Code';
import { LinkIcon } from '@ag-website-shared/components/link-icon/LinkIcon';
import styles from '@ag-website-shared/components/reference-documentation/ApiReference.module.scss';
import { urlWithPrefix } from '@utils/urlWithPrefix';
import classnames from 'classnames';
import { Fragment, type FunctionComponent, useCallback, useEffect, useRef, useState } from 'react';

import type { Config, PropertyViewModel } from '../types';
import { useReferenceDetails } from '../utils/useReferenceDetails';
import legacyStyles from './LegacyApiReference.module.scss';
import { PropertyModules } from './PropertyModules';
import { ReferenceIcon } from './ReferenceIcon';

function getDetailsId(id: string) {
    return `${id}-details`;
}

function CollapsibleButton({
    name,
    isExpanded,
    detailsId,
    onClick,
}: {
    name: string;
    isExpanded?: boolean;
    detailsId: string;
    onClick: () => void;
}) {
    return (
        <button
            type="button"
            // Safari omits buttons from the tab order without an explicit tabindex.
            tabIndex={0}
            className={classnames(styles.seeMore, 'button-tertiary', {
                [styles.isExpanded]: isExpanded,
            })}
            onClick={onClick}
            aria-expanded={Boolean(isExpanded)}
            // Only reference the panel while it exists — it is unmounted when collapsed.
            aria-controls={isExpanded ? detailsId : undefined}
            aria-label={`${isExpanded ? 'Hide' : 'See more'} details about ${name}`}
        >
            <ReferenceIcon name="chevronDown" />
        </button>
    );
}

export const Property: FunctionComponent<{
    id: string;
    name: string;
    framework: Framework;
    property: PropertyViewModel;
    config: Config;
}> = ({ id, name, framework, property, config }) => {
    const idName = `reference-${id}-${name}`;
    const {
        displayNameSplit,
        description,
        isObject,
        propertyType,
        interfaceName,
        defaultValue,
        isInitial,
        modules,
        more,
        options,
        detailsCode,
        detailsKey,
    } = property;

    const propertyRef = useRef<HTMLTableRowElement>(null);
    const [isExpanded, setExpanded] = useState(config.defaultExpand);

    const hasDetails = Boolean(detailsCode ?? detailsKey);
    const fetchedDetails = useReferenceDetails({
        url: config.detailsUrl,
        enabled: Boolean(isExpanded && detailsKey),
    });
    const expandedCode = detailsCode ?? (detailsKey ? fetchedDetails?.[detailsKey] : undefined);

    // An object property links to its own section, whose id only the rendering table knows.
    const typeUrl = isObject ? `#reference-${id}.${name}` : property.typeUrl;

    useEffect(() => {
        const hashId = location.hash.slice(1); // Remove the '#' symbol

        if (idName === hashId) {
            // eslint-disable-next-line react-hooks/set-state-in-effect -- expand property when URL hash matches
            setExpanded(true);
            propertyRef.current?.scrollIntoView();
        }
    }, [idName]);

    const onCollapseClick = useCallback(() => {
        setExpanded((prevIsExpanded) => {
            return !prevIsExpanded;
        });
    }, []);

    return (
        <tr ref={propertyRef} className={legacyStyles.tableRow}>
            <td className={legacyStyles.propertyNameDescription}>
                <div className={classnames(styles.propertyRow)} data-api-property>
                    <div className={styles.leftColumn}>
                        <div
                            id={idName}
                            className={classnames(styles.name, 'side-menu-exclude')}
                            data-api-property-name
                        >
                            <span dangerouslySetInnerHTML={{ __html: displayNameSplit }}></span>
                            <LinkIcon
                                href={`#${idName}`}
                                className={styles.linkIcon}
                                aria-label={`Link to ${name} property`}
                            />
                        </div>

                        <div className={styles.metaItem}>
                            <div className={styles.metaRow}>
                                {hasDetails && (
                                    <CollapsibleButton
                                        name={more?.name ?? name}
                                        isExpanded={isExpanded}
                                        detailsId={getDetailsId(idName)}
                                        onClick={onCollapseClick}
                                    />
                                )}
                                {typeUrl ? (
                                    <a
                                        tabIndex={0}
                                        className={styles.metaValue}
                                        href={typeUrl}
                                        target={typeUrl.startsWith('http') ? '_blank' : '_self'}
                                        rel="noreferrer"
                                    >
                                        {isObject ? interfaceName : propertyType}
                                    </a>
                                ) : (
                                    <span
                                        onClick={onCollapseClick}
                                        className={classnames(styles.metaValue, {
                                            [styles.isClickable]: hasDetails,
                                        })}
                                    >
                                        {propertyType}
                                    </span>
                                )}
                            </div>

                            {defaultValue != null && (
                                <div className={styles.metaItem}>
                                    <span className={classnames(styles.metaValue, styles.defaultValue)}>
                                        <span className={styles.defaultLabel}>default: </span>
                                        {defaultValue}
                                    </span>
                                </div>
                            )}

                            {isInitial && (
                                <div className={classnames(styles.metaItem, styles.initialItem)}>
                                    <a
                                        tabIndex={0}
                                        className={classnames(styles.metaValue)}
                                        href={urlWithPrefix({
                                            url: config?.initialLink ?? './grid-interface/#initial-grid-options',
                                            framework,
                                        })}
                                    >
                                        Initial
                                    </a>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className={styles.rightColumn}>
                        <div
                            role="presentation"
                            className={styles.description}
                            data-api-property-description
                            dangerouslySetInnerHTML={{ __html: description ?? '' }}
                        ></div>

                        <div className={styles.actions}>
                            {isObject && (
                                <div>
                                    See{' '}
                                    <a tabIndex={0} href={`#reference-${id}.${name}`}>
                                        {name}
                                    </a>{' '}
                                    for more details.
                                </div>
                            )}

                            {options != null && (
                                <div>
                                    Options:{' '}
                                    {options.map((option, i) => (
                                        <Fragment key={option}>
                                            {i > 0 ? ', ' : ''}
                                            <code>{option}</code>
                                        </Fragment>
                                    ))}
                                </div>
                            )}

                            {more != null && more.url && !config.hideMore && (
                                <a
                                    tabIndex={0}
                                    className={styles.docLink}
                                    href={urlWithPrefix({
                                        url: more.url,
                                        framework,
                                    })}
                                >
                                    {more.name}
                                    <ReferenceIcon name="newTab" />
                                </a>
                            )}

                            {modules[0] && <PropertyModules modules={modules} framework={framework} />}
                        </div>
                    </div>

                    {hasDetails && isExpanded && (
                        <div id={getDetailsId(idName)} className={styles.expandedContent}>
                            {expandedCode ? (
                                <Code code={expandedCode} keepMarkup={true} />
                            ) : (
                                <p className="text-secondary">Loading type details&hellip;</p>
                            )}
                        </div>
                    )}
                </div>
            </td>
        </tr>
    );
};
