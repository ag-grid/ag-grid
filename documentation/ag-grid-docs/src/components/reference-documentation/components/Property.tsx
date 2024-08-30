import type { Framework } from '@ag-grid-types';
import Code from '@ag-website-shared/components/code/Code';
import { Icon } from '@ag-website-shared/components/icon/Icon';
import { urlWithPrefix } from '@utils/urlWithPrefix';
import classnames from 'classnames';
import { Fragment, type FunctionComponent, useCallback, useEffect, useRef, useState } from 'react';

import type { ChildDocEntry, Config, ICallSignature, InterfaceEntry } from '../types';
import {
    convertMarkdown,
    formatJsDocString,
    getTypeUrl,
    inferType,
    removeDefaultValue,
} from '../utils/documentation-helpers';
import { formatJson, getInterfaceName } from '../utils/interface-helpers';
import styles from './ApiReference.module.scss';

function getDisplayNameSplit({ name, definition }: { name: string; definition: ChildDocEntry }) {
    let displayName = name;
    if (definition.isRequired) {
        displayName += `&nbsp;<span class="${styles.required}">required</span>`;
    }

    if (definition.strikeThrough) {
        displayName = `<span style='text-decoration: line-through'>${displayName}</span>`;
    }

    // Split display name on capital letter, add <wbr> to improve text splitting across lines
    let displayNameSplit: string;

    const { isRequired, strikeThrough } = definition;
    // displayName is hardCoded for isRequired and strikeThrough
    if (isRequired || strikeThrough) {
        displayNameSplit = displayName;
    } else {
        displayNameSplit = displayName
            .split(/(?=[A-Z])/)
            .reverse()
            .reduce((acc, cv) => {
                return `${cv}<wbr />` + acc;
            });
    }

    return displayNameSplit;
}

function getDescription({
    definition,
    gridOpProp,
    framework,
}: {
    definition: ChildDocEntry;
    gridOpProp: InterfaceEntry;
    framework: Framework;
}) {
    let description: string | undefined = '';
    let isObject: boolean = false;
    let propDescription: string | undefined =
        definition.description || (gridOpProp && (gridOpProp.meta as ICallSignature['meta'])?.comment) || undefined;

    if (propDescription) {
        propDescription = formatJsDocString(propDescription);
        // process property object
        description = convertMarkdown(propDescription, framework);
    } else {
        // this must be the parent of a child object
        if (definition.meta != null && definition.meta.description != null) {
            description = convertMarkdown(definition.meta.description, framework);
        }

        isObject = true;
    }

    return {
        isObject,
        description,
    };
}

// Use the type definition if manually specified in config
function getDefinitionTypeUrl({
    id,
    name,
    framework,
    definition,
    propertyType,
    gridOpProp,
    isObject,
    config,
}: {
    id: string;
    name: string;
    framework: Framework;
    definition: ChildDocEntry;
    propertyType: string;
    gridOpProp: InterfaceEntry;
    isObject: boolean;
    config: Config;
}) {
    let type: any = definition.type;
    if (!type) {
        // No type specified in the doc config file so check the GridOptions property
        if (gridOpProp && gridOpProp.type) {
            type = gridOpProp.type;

            const isDeprecated = gridOpProp.meta?.tags?.some((t) => t.name === 'deprecated');
            if (isDeprecated) {
                // eslint-disable-next-line no-console
                console.warn(
                    `<api-documentation>: Docs include a property: ${name} that has been marked as deprecated.`
                );
                // eslint-disable-next-line no-console
                console.warn('<api-documentation>: ' + gridOpProp.meta?.all);
            }
        } else {
            if (type == null && config.codeSrcProvided?.length > 0) {
                throw new Error(
                    `We could not find a type for "${name}" from the code sources ${config.codeSrcProvided.join()}. Has this property been removed from the source code / or is there a typo?`
                );
            }

            // If a codeSrc is not provided as a last resort try and infer the type
            type = inferType(definition.default);
        }
    }

    const typeUrl = isObject
        ? `#reference-${id}.${name}`
        : propertyType !== 'Function'
          ? getTypeUrl(type, framework)
          : null;

    return typeUrl;
}

function getTagsData({ definition, gridOpProp }: { definition: ChildDocEntry; gridOpProp: InterfaceEntry }) {
    // Default may or may not be on a new line in JsDoc but in both cases we want the default to be on the next line
    const tags = gridOpProp?.meta?.tags ?? definition?.tags ?? [];
    const jsdocDefault = tags.find((t) => t.name === 'default');
    const defaultValue = definition.default ?? jsdocDefault?.comment;
    const formattedDefaultValue = Array.isArray(defaultValue)
        ? '[' +
          defaultValue.map((v, i) => {
              return i === 0 ? `"${v}"` : ` "${v}"`;
          }) +
          ']'
        : defaultValue;
    const isInitial = tags.some((t) => t.name === 'initial') ?? false;

    return {
        formattedDefaultValue,
        isInitial,
    };
}

function getDetailsId(id: string) {
    return `${id}-details`;
}

function CollapsibleButton({ name, isExpanded, onClick }: { name: string; isExpanded?: boolean; onClick: () => void }) {
    return (
        <button
            className={classnames(styles.seeMore, 'button-style-none', {
                [styles.isExpanded]: isExpanded,
            })}
            onClick={onClick}
            aria-label={`See more details about ${name}`}
        >
            <Icon className={`${styles.chevron} ${isExpanded ? 'expandedIcon' : ''}`} name="chevronDown" />
        </button>
    );
}

export const Property: FunctionComponent<{
    id: string;
    name: string;
    framework: Framework;
    definition: ChildDocEntry;
    gridOpProp: InterfaceEntry;
    detailsCode: string;
    propertyType: string;
    config: Config;
}> = ({ id, name, framework, definition, gridOpProp, detailsCode, propertyType, config }) => {
    const idName = `reference-${id}-${name}`;
    const displayNameSplit = getDisplayNameSplit({ name, definition });
    const { isObject, description } = getDescription({ definition, gridOpProp, framework });
    const typeUrl = getDefinitionTypeUrl({
        id,
        name,
        framework,
        definition,
        propertyType,
        gridOpProp,
        isObject,
        config,
    });
    const { formattedDefaultValue, isInitial } = getTagsData({ definition, gridOpProp });
    const { more } = definition;

    const propertyRef = useRef<HTMLTableRowElement>(null);
    const [isExpanded, setExpanded] = useState(config.defaultExpand);
    useEffect(() => {
        const hashId = location.hash.slice(1); // Remove the '#' symbol

        if (idName === hashId) {
            setExpanded(true);
            propertyRef.current?.scrollIntoView();
        }
    }, [idName]);

    const isExpandable = detailsCode;
    const onCollapseClick = useCallback(() => {
        setExpanded((prevIsExpanded) => {
            return !prevIsExpanded;
        });
    }, []);

    return (
        <>
            <tr ref={propertyRef}>
                <td className={styles.propertyNameDscription}>
                    <div className={styles.columnWrapper}>
                        <div className={styles.leftColumn}>
                            {' '}
                            <div className={styles.propertyMeta}>
                                <div id={idName} className={classnames(styles.name, 'side-menu-exclude')}>
                                    <span dangerouslySetInnerHTML={{ __html: displayNameSplit }}></span>
                                    <a
                                        href={`#${idName}`}
                                        className="docs-header-icon"
                                        aria-label={`Link to '${name}' property`}
                                    >
                                        <Icon name="link" />
                                    </a>
                                </div>
                                <div className={styles.metaItem}>
                                    <div className={styles.metaRow}>
                                        {detailsCode && (
                                            <CollapsibleButton
                                                name={more?.name ?? name}
                                                isExpanded={isExpanded}
                                                onClick={onCollapseClick}
                                            />
                                        )}
                                        {typeUrl ? (
                                            <a
                                                className={classnames(styles.metaValue, {
                                                    [styles.isExpanded]: isExpanded,
                                                })}
                                                href={typeUrl}
                                                target={typeUrl.startsWith('http') ? '_blank' : '_self'}
                                                rel="noreferrer"
                                            >
                                                {isObject ? getInterfaceName(name) : propertyType}
                                            </a>
                                        ) : (
                                            <span
                                                onClick={onCollapseClick}
                                                className={classnames(styles.metaValue, {
                                                    [styles.isExpandable]: detailsCode,
                                                })}
                                            >
                                                {propertyType}
                                            </span>
                                        )}
                                    </div>

                                    {formattedDefaultValue != null && (
                                        <div className={styles.metaItem}>
                                            <span className={classnames(styles.metaValue, styles.defaultValue)}>
                                                <span>default: </span>
                                                {formattedDefaultValue}
                                            </span>
                                        </div>
                                    )}

                                    {isInitial && (
                                        <div className={classnames(styles.metaItem, styles.initialItem)}>
                                            <a
                                                className={styles.initialLabel}
                                                href={urlWithPrefix({
                                                    url: './grid-interface/#initial-grid-options',
                                                    framework,
                                                })}
                                            >
                                                Initial
                                            </a>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className={styles.rightColumn}>
                            {' '}
                            <div className={styles.contentDescription}>
                                <div
                                    className={classnames(styles.collapsedPropertyContent, {
                                        [styles.expandable]: isExpandable,
                                    })}
                                >
                                    <div className={styles.rightColumn}>
                                        <div
                                            role="presentation"
                                            className={styles.description}
                                            dangerouslySetInnerHTML={{ __html: removeDefaultValue(description) }}
                                        ></div>
                                        {isObject && (
                                            <div>
                                                See <a href={`#reference-${id}.${name}`}>{name}</a> for more details.
                                            </div>
                                        )}
                                        {isInitial && config.showInitialDescription && (
                                            <div
                                                onClick={() => setExpanded(!isExpanded)}
                                                className={styles.description}
                                            >
                                                This property will only be read on initialisation.
                                            </div>
                                        )}

                                        {definition.options != null && (
                                            <div>
                                                Options:{' '}
                                                {definition.options.map((o, i) => (
                                                    <Fragment key={o}>
                                                        {i > 0 ? ', ' : ''}
                                                        <code>{formatJson(o)}</code>
                                                    </Fragment>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className={styles.actionsRow}>
                                {more != null && more.url && !config.hideMore && (
                                    <a
                                        className={styles.docLink}
                                        href={urlWithPrefix({
                                            url: more.url,
                                            framework,
                                        })}
                                    >
                                        {more.name}
                                        <Icon name="newTab"> </Icon>
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>
                    {detailsCode && isExpanded && (
                        <div id={getDetailsId(idName)} className={classnames(styles.expandedContent)}>
                            <div>{detailsCode && <Code code={detailsCode} keepMarkup={true} />}</div>
                        </div>
                    )}
                </td>
            </tr>
        </>
    );
};
