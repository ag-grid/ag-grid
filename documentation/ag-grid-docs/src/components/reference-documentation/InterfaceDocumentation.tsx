import type { Framework } from '@ag-grid-types';
import Code from '@ag-website-shared/components/code/Code';
import { Icon } from '@ag-website-shared/components/icon/Icon';
import { trackApiDocumentation } from '@utils/analytics';
import { urlWithPrefix } from '@utils/urlWithPrefix';
import classnames from 'classnames';
import { Fragment, type FunctionComponent, type ReactElement, useEffect, useRef, useState } from 'react';

import styles from './ApiReference.module.scss';
import {
    convertMarkdown,
    escapeGenericCode,
    formatJsDocString,
    getLinkedType,
    getTypeUrl,
    inferType,
    removeDefaultValue,
} from './documentation-helpers';
import { formatJson, getInterfaceName } from './interface-helpers';
import type { Config, DocProperties, ObjectCode, SectionProps } from './types';

interface Props {
    framework: Framework;
    model: DocProperties;
    config: Config;
}

function getDisplayNameSplit({ name, definition }) {
    let displayName = name;
    if (definition.isRequired) {
        displayName += `&nbsp;<span class="${styles.required}" title="Required">&ast;</span>`;
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

function getDescription({ definition, gridOpProp, framework }) {
    let description = '';
    let isObject: boolean = false;
    let propDescription: string = definition.description || (gridOpProp && gridOpProp.meta?.comment) || undefined;

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
function getDefinitionTypeUrl({ id, framework, definition, propertyType, gridOpProp, isObject, config }) {
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

function getTagsData({ definition, gridOpProp }) {
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

const ObjectCodeSample: React.FC<ObjectCode> = ({ framework, id, breadcrumbs, properties }) => {
    const lines = [];
    let indentationLevel = 0;

    const getIndent = (level: number) => '  '.repeat(level);

    Object.keys(breadcrumbs).forEach((key) => {
        const indent = getIndent(indentationLevel);

        if (indentationLevel > 0) {
            lines.push(`${indent}...`);
        }

        lines.push(`${indent}${key}: {`);

        indentationLevel++;
    });

    Object.entries(properties).forEach(([key, definition]) => {
        let line = getIndent(indentationLevel) + key;

        // process property object
        if (!definition.isRequired) {
            line += '?';
        }

        let type;
        let isObject = false;

        if (definition.meta && definition.meta.type != null) {
            type = definition.meta.type;
        } else if (definition.type != null) {
            type = typeof definition.type === 'object' ? 'Function' : definition.type;
        } else if (definition.options != null) {
            type = definition.options.map((option) => formatJson(option)).join(' | ');
        } else if (definition.default != null) {
            type = Array.isArray(definition.default) ? 'object[]' : typeof definition.default;
        } else if (definition.description != null) {
            type = 'object';
        } else {
            type = getInterfaceName(key);
            isObject = true;
        }

        line += `: ${isObject ? `<a href='#reference-${id}.${key}'>${type}</a>` : getLinkedType(type, framework)};`;

        if (definition.default != null) {
            line += ` // default: ${formatJson(definition.default)}`;
        }

        lines.push(line);
    });

    while (indentationLevel > 0) {
        lines.push(`${getIndent(indentationLevel-- - 1)}}`);
    }

    const escapedLines = escapeGenericCode(lines);
    return <Code code={escapedLines} keepMarkup={true} />;
};

const Property: FunctionComponent = ({
    id,
    name,
    framework,
    definition,
    gridOpProp,
    detailsCode,
    propertyType,
    config,
}: {
    id: string;
    name: string;
    framework: Framework;
    definition: any;
    gridOpProp: any;
    detailsCode: string;
    propertyType: string;
    config: any;
}) => {
    const idName = `reference-${id}-${name}`;
    const displayNameSplit = getDisplayNameSplit({ name, definition });
    const { isObject, description } = getDescription({ definition, gridOpProp, framework });
    const typeUrl = getDefinitionTypeUrl({
        id,
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

    return (
        <>
            <tr ref={propertyRef}>
                <td role="presentation" className={styles.leftColumn}>
                    <h6 id={idName} className={classnames(styles.name, 'side-menu-exclude')}>
                        <span
                            onClick={() => setExpanded(!isExpanded)}
                            dangerouslySetInnerHTML={{ __html: displayNameSplit }}
                        ></span>
                        <a href={`#${idName}`} className="docs-header-icon">
                            <Icon name="link" />
                        </a>
                    </h6>

                    <div className={styles.metaList}>
                        <div
                            title={typeUrl && isObject ? getInterfaceName(name) : propertyType}
                            className={styles.metaItem}
                            onClick={() => setExpanded(!isExpanded)}
                        >
                            <span className={styles.metaLabel}>Type</span>
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
                                role="presentation"
                            >
                                {!isExpanded ? 'More' : 'Hide'} details{' '}
                                <Icon name={isExpanded ? 'chevronDown' : 'chevronRight'} />
                            </button>
                        )}
                        {more != null && more.url && !config.hideMore && (
                            <span>
                                <span className="text-secondary">See:</span>{' '}
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
                                >
                                    {more.name}
                                </a>
                            </span>
                        )}
                    </div>
                </td>
            </tr>
            {detailsCode && isExpanded && (
                <tr className={classnames(styles.expandedContent)}>
                    <td colSpan={2}>
                        <Code code={detailsCode} keepMarkup={true} />
                    </td>
                </tr>
            )}
        </>
    );
};

const Breadcrumbs = ({ breadcrumbs }: { breadcrumbs: Record<string, string> }) => {
    const breadcrumbsLength = Object.keys(breadcrumbs).length;

    if (breadcrumbsLength <= 1) {
        return null;
    }

    const links: ReactElement[] = [];
    let href = '';
    let index = 0;

    Object.entries(breadcrumbs).forEach(([key, text]) => {
        href += `${href.length > 0 ? '.' : 'reference-'}${key}`;

        if (index < breadcrumbsLength - 1) {
            links.push(
                <Fragment key={key}>
                    <a href={`#${href}`} title={text}>
                        {key}
                    </a>{' '}
                    &gt;{' '}
                </Fragment>
            );
        } else {
            links.push(<Fragment key={key}>{key}</Fragment>);
        }

        index++;
    });

    return <div className={styles.breadcrumbs}>{links}</div>;
};

const SectionHeader = ({
    title,
    description,
    page,
    framework,
    breadcrumbs = {},
    displayName,
    headerLevel,
    hideHeader,
    showSnippets,
    properties,
}: {
    title: string;
    description?: string;
    page?: any;
    framework: Framework;
    breadcrumbs: Record<string, string>;
    displayName: string;
    headerLevel?: number;
    hideHeader?: boolean;
    showSnippets?: boolean;
    properties: any;
}) => {
    breadcrumbs[title] = displayName;
    const breadcrumbKeys = Object.keys(breadcrumbs);
    const id = breadcrumbKeys.join('.');
    const headerTagLevel = headerLevel || breadcrumbKeys.length + 1;
    const HeaderTag = `h${headerTagLevel}` as any;

    return (
        <>
            {!hideHeader && (
                <HeaderTag id={`reference-${id}`} style={{ position: 'relative' }}>
                    {displayName}
                    <a href={`#reference-${id}`} className="docs-header-icon">
                        <Icon name="link" />
                    </a>
                </HeaderTag>
            )}
            <Breadcrumbs breadcrumbs={breadcrumbs} />
            {description && <p dangerouslySetInnerHTML={{ __html: convertMarkdown(description, framework) }}></p>}
            {page && (
                <p>
                    See <a href={urlWithPrefix({ url: page.url, framework })}>{page.name}</a> for more information.
                </p>
            )}
            {showSnippets && (
                <ObjectCodeSample framework={framework} id={id} breadcrumbs={breadcrumbs} properties={properties} />
            )}
        </>
    );
};

const Section: FunctionComponent<SectionProps> = ({
    title,
    framework,
    names = [],
    properties,
    config = {},
    breadcrumbs = {},
    meta,
}) => {
    const showHeader = !config.isSubset;
    const breadcrumbKeys = Object.keys(breadcrumbs);
    const id = breadcrumbKeys.join('.');
    const displayName = meta?.displayName || title;

    return (
        <div className={styles.apiReferenceOuter}>
            {showHeader && (
                <SectionHeader
                    title={title}
                    description={meta.description}
                    page={meta.page}
                    framework={framework}
                    breadcrumbs={breadcrumbs}
                    displayName={displayName}
                    headerLevel={config.headerLevel}
                    hideHeader={config.hideHeader ?? true}
                    showSnippets={config.showSnippets && names.length < 1}
                    properties={properties}
                />
            )}
            <table
                className={classnames(styles.reference, styles.apiReference, 'no-zebra')}
                style={config.overrideBottomMargin ? { marginBottom: config.overrideBottomMargin } : {}}
            >
                <colgroup>
                    <col></col>
                    <col></col>
                </colgroup>
                <tbody>
                    {Object.entries(properties).map(
                        ([
                            name,
                            { definition, gridOpProp, interfaceHierarchyOverrides, detailsCode, propertyType },
                        ]) => {
                            return (
                                <Property
                                    key={name}
                                    id={id}
                                    name={name}
                                    framework={framework}
                                    definition={definition}
                                    gridOpProp={gridOpProp}
                                    interfaceHierarchyOverrides={interfaceHierarchyOverrides}
                                    detailsCode={detailsCode}
                                    propertyType={propertyType}
                                    config={config}
                                />
                            );
                        }
                    )}
                </tbody>
            </table>
            {/* {Object.entries(objectProperties).map(([name, definition]) => (
                <Section
                    key={name}
                    framework={framework}
                    title={name}
                    properties={definition}
                    config={{ ...config, isSubset: false }}
                    breadcrumbs={{ ...breadcrumbs }}
                />
            ))} */}
        </div>
    );
};

export const InterfaceDocumentation: FunctionComponent<Props> = ({ framework, model, config }) => {
    return Object.entries(model.properties).map(([key, properties]) => (
        <Section
            key={key}
            framework={framework}
            title={key}
            properties={properties}
            config={config}
            meta={model.meta}
        />
    ));
};
