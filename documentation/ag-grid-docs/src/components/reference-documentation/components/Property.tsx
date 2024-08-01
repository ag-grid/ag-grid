import type { Framework } from '@ag-grid-types';
import Code from '@ag-website-shared/components/code/Code';
import { Icon } from '@ag-website-shared/components/icon/Icon';
import { trackApiDocumentation } from '@utils/analytics';
import { urlWithPrefix } from '@utils/urlWithPrefix';
import classnames from 'classnames';
import { Fragment, type FunctionComponent, useEffect, useRef, useState } from 'react';

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
        displayName += `&nbsp;<span class="${styles.required}" title="Required">required</span>`;
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

    return (
        <>
            <tr ref={propertyRef}>
                <td className={styles.propertyNameDscription}>
                    <div className={classnames(styles.collapsedPropertyContent, { [styles.expandable]: isExpandable })}>
                        <div role="presentation" className={styles.leftColumn}>
                            <div className={styles.propertyName}>
                                <h6 id={idName} className={classnames(styles.name, 'side-menu-exclude')}>
                                    <span
                                        onClick={() => setExpanded(!isExpanded)}
                                        dangerouslySetInnerHTML={{ __html: displayNameSplit }}
                                    ></span>
                                </h6>
                                <div
                                    title={typeUrl && isObject ? getInterfaceName(name) : propertyType}
                                    className={styles.metaItem}
                                    onClick={() => setExpanded(!isExpanded)}
                                >
                                    {typeUrl ? (
                                        <a
                                            className={styles.metaValue}
                                            href={typeUrl}
                                            target={typeUrl.startsWith('http') ? '_blank' : '_self'}
                                            rel="noreferrer"
                                        >
                                            {isObject ? getInterfaceName(name) : propertyType}
                                        </a>
                                    ) : (
                                        <span className={styles.metaValue}>{propertyType}</span>
                                    )}

                                    {formattedDefaultValue != null && (
                                        <div className={styles.metaItem}>
                                            <span className={classnames(styles.metaValue, styles.defaultValue)}>
                                                <span>default: </span>
                                                {formattedDefaultValue}
                                            </span>
                                        </div>
                                    )}

                                    {isInitial && (
                                        <div className={styles.metaItem}>
                                            {config.initialLink ? (
                                                <a className={styles.initialLabel} href={config.initialLink}>
                                                    Initial
                                                </a>
                                            ) : (
                                                <span className={styles.initialLabel}>Initial</span>
                                            )}
                                        </div>
                                    )}
                                </div>
                                <a href={`#${idName}`} className="docs-header-icon">
                                    <Icon name="link" />
                                </a>
                            </div>
                        </div>

                        <div className={styles.rightColumn}>
                            <div
                                onClick={() => setExpanded(!isExpanded)}
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
                                <div onClick={() => setExpanded(!isExpanded)} className={styles.description}>
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
                        {formattedDefaultValue != null && (
                            <div className={styles.metaItem}>
                                <span className={styles.metaLabel}>Default</span>
                                <span className={styles.metaValue}>{formattedDefaultValue}</span>
                            </div>
                        )}
                        {isInitial && (
                            <div className={styles.metaItem}>
                                {config.initialLink ? (
                                    <a className={styles.metaLabel} href={config.initialLink}>
                                        Initial
                                    </a>
                                ) : (
                                    <span className={styles.metaLabel}>Initial</span>
                                )}
                            </div>
                        )}
                    </div>
                </td>
                <td className={styles.rightColumn}>
                    <div
                        onClick={() => setExpanded(!isExpanded)}
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
                        <div onClick={() => setExpanded(!isExpanded)} className={styles.description}>
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
                    <div className={styles.actions}>
                        {detailsCode && (
                            <button
                                className={classnames(styles.seeMore, 'button-as-link')}
                                onClick={() => {
                                    setExpanded(!isExpanded);
                                    trackApiDocumentation({
                                        type: isExpanded ? 'propertyHideDetails' : 'propertyShowDetails',
                                        framework,
                                        id,
                                        name,
                                    });
                                }}
                                aria-expanded={Boolean(isExpanded)}
                                aria-controls={getDetailsId(idName)}
                            >
                                {!isExpanded ? 'More' : 'Hide'} details{' '}
                                <Icon name={isExpanded ? 'chevronDown' : 'chevronRight'} />
                            </button>
                        )}
                        {more != null && more.url && !config.hideMore && (
                            <span className={styles.seeMoreLink}>
                                <span className="text-secondary">See: </span>{' '}
                                <a
                                    href={urlWithPrefix({
                                        url: more.url,
                                        framework,
                                    })}
                                    onClick={() => {
                                        trackApiDocumentation({
                                            type: 'seeMoreLink',
                                            framework,
                                            id,
                                            name,
                                            seeMoreName: more.name,
                                        });
                                    }}
                                    aria-label={`See more details about ${more.name}`}
                                >
                                    {more.name}
                                </a>
                            </span>
                        )}
                    </div>
                    <div className={styles.actions}>
                        {detailsCode && (
                            <button
                                className={classnames(styles.seeMore, 'button-as-link')}
                                onClick={() => {
                                    setExpanded(!isExpanded);
                                    trackApiDocumentation({
                                        type: isExpanded ? 'propertyHideDetails' : 'propertyShowDetails',
                                        framework,
                                        id,
                                        name,
                                    });
                                }}
                                role="presentation"
                            >
                                <Icon name={isExpanded ? 'chevronDown' : 'chevronUp'} />
                            </button>
                        )}
                    </div>
                </td>
            </tr>
            {detailsCode && isExpanded && (
                <tr id={getDetailsId(idName)} className={classnames(styles.expandedContent)}>
                    <td colSpan={2}>
                        <div className={styles.metaList}></div>
                        {detailsCode && <Code code={detailsCode} keepMarkup={true} />}
                    </td>
                </tr>
            )}
        </>
    );
};
