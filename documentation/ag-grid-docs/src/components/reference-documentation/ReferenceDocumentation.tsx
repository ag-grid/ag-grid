import type { Framework } from '@ag-grid-types';
import { Icon } from '@ag-website-shared/components/icon/Icon';
import Code from '@components/Code';
import styles from '@legacy-design-system/modules/ApiReference.module.scss';
import { trackApiDocumentation } from '@utils/analytics';
import { urlWithPrefix } from '@utils/urlWithPrefix';
import classnames from 'classnames';
import { Fragment, type FunctionComponent, type ReactElement, useEffect, useRef, useState } from 'react';

import {
    convertMarkdown,
    escapeGenericCode,
    extractInterfaces,
    formatJsDocString,
    getInterfaceWithGenericParams,
    getLinkedType,
    getLongestNameLength,
    getTypeUrl,
    inferType,
    removeDefaultValue,
    sortAndFilterProperties,
    writeAllInterfaces,
} from './documentation-helpers';
import {
    applyInterfaceInclusions,
    formatJson,
    getAllSectionPropertyEntries,
    getInterfaceName,
    getInterfacesToWrite,
    getPropertyType,
    getSectionProperties,
    isCallSig,
    isGridOptionEvent,
} from './interface-helpers';
import type {
    ChildDocEntry,
    Config,
    DocEntryMap,
    FunctionCode,
    ICallSignature,
    ObjectCode,
    Overrides,
    PropertyCall,
    SectionProps,
} from './types';

interface InterfaceDocumentationProps {
    interfaceName: string;
    framework: Framework;
    overrides: Overrides;
    names: string[];
    exclude: string[];
    wrapNamesAt: number;
    config: any;
    interfaceLookup: Record<string, any>;
    codeLookup: Record<string, any>;
    htmlLookup: Record<string, any>;
}

interface ApiDocumentationProps {
    pageName: string;
    framework: Framework;
    sources: string[];
    section: string;
    names: string[];
    config: Config;
    propertiesFromFiles: unknown;
    propertyConfigs: any[];
    interfaceLookup: Record<string, any>;
    codeConfigs: Record<string, any>;
}

/**
 * This generates tabulated interface documentation based on information in JSON files.
 */
export const InterfaceDocumentation: FunctionComponent<InterfaceDocumentationProps> = ({
    interfaceName,
    framework,
    overrides,
    names = [],
    exclude = [],
    wrapNamesAt = null,
    config = {},
    interfaceLookup,
    codeLookup,
    htmlLookup,
}): any => {
    let codeSrcProvided = [interfaceName];

    if (names && names.length) {
        config = { overrideBottomMargin: '1rem', ...config };
    }

    if (wrapNamesAt) {
        config = { wrapNamesAt, ...config };
    }

    const { lookupRoot = 'grid-api' } = config;

    for (const ignoreName of config.suppressTypes ?? []) {
        delete interfaceLookup[ignoreName];
    }

    const lookups = {
        codeLookup: codeLookup[interfaceName],
        interfaces: interfaceLookup,
        htmlLookup: htmlLookup[interfaceName],
    };
    let hideHeader = true;
    if (config.hideHeader !== undefined) {
        hideHeader = config.hideHeader;
    }
    if (config.sortAlphabetically !== undefined) {
        config.sortAlphabetically = String(config.sortAlphabetically).toLowerCase() == 'true';
    }
    config = { ...config, lookupRoot, lookups, codeSrcProvided, hideHeader };

    const li = interfaceLookup[interfaceName];

    if (config.asCode) {
        const interfacesToWrite = getInterfacesToWrite(interfaceName, interfaceName, config);
        if (interfacesToWrite.length < 1) {
            return (
                <h2 style={{ color: 'red' }}>
                    Could not find interface {interfaceName} for interface-documentation component!
                </h2>
            );
        }
        const lines = [];
        lines.push(
            ...writeAllInterfaces(interfacesToWrite.slice(0, 1), framework, {
                lineBetweenProps: config.lineBetweenProps ?? true,
                hideName: config.hideName,
                exclude,
                applyOptionalOrdering: true,
            })
        );
        const escapedLines = escapeGenericCode(lines);
        return <Code code={escapedLines} keepMarkup={true} />;
    }

    let props: any = {};
    let interfaceOverrides: Overrides = {};
    if (Object.keys(overrides).length) {
        interfaceOverrides = overrides[interfaceName];
        if (!interfaceOverrides) {
            throw new Error(`override provided but does not contain expected section named: '${interfaceName}'!`);
        }
    }

    let typeProps: any[] = [];
    if(typeof li.type === 'string'){
        if(interfaceOverrides){
            typeProps = Object.entries(interfaceOverrides);
        }else{
            console.error(`Please provide an override for type alias: ${interfaceName}`);
        }
    }else{
        typeProps = Object.entries(li.type);
    }
    sortAndFilterProperties(typeProps, framework).forEach(([k, v]) => {
        // interfaces include the ? as part of the name. We want to remove this for the <interface-documentation> component
        // Instead the type will be unioned with undefined as part of the propertyType
        let propNameOnly = k.replace('?', '');
        // for function properties like failCallback(): void; We only want the name failCallback part
        // as this is what is listed in the doc-interfaces.AUTO.json file
        propNameOnly = propNameOnly.split('(')[0];
        if (
            (names.length === 0 || names.includes(propNameOnly)) &&
            (exclude.length == 0 || !exclude.includes(propNameOnly))
        ) {
            const docs = (li.docs && formatJsDocString(li.docs[k])) || '';
            if (!docs.includes('@deprecated')) {
                props[propNameOnly] = { description: docs || v, ...interfaceOverrides[propNameOnly] };
            }
        }
    });

    let orderedProps = {};
    const ordered = Object.entries(props).sort(([, v1], [, v2]) => {
        // Put required props at the top as likely to be the most important
        if ((v1 as ChildDocEntry).isRequired == (v2 as ChildDocEntry).isRequired) {
            return 0;
        }
        return (v1 as ChildDocEntry).isRequired ? -1 : 1;
    });

    ordered.map(([k, v]) => (orderedProps[k] = v));

    const interfaceDeclaration = getInterfaceWithGenericParams(interfaceName, li.meta);
    const description =
        config.description != null
            ? config.description
            : `Properties available on the \`${interfaceDeclaration}\` interface.`;
    let properties: DocEntryMap = {
        [interfaceName]: {
            ...orderedProps,
            meta: {
                displayName: interfaceName,
                description,
                ...interfaceOverrides.meta,
            },
        },
    };

    return Object.entries(properties).map(([key, value]) => (
        <Section key={key} framework={framework} title={key} properties={value} config={config} />
    ));
};

/**
 * This generates tabulated API documentation based on information in JSON files. This way it is possible to show
 * information about different parts of an API in multiple places across the website while pulling the information
 * from one source of truth, so we only have to update one file when the documentation needs to change.
 */
export const ApiDocumentation: FunctionComponent<ApiDocumentationProps> = ({
    framework,
    sources,
    section,
    names = [],
    config = {},
    propertiesFromFiles,
    propertyConfigs,
    interfaceLookup,
    codeConfigs,
}) => {
    if (!sources || sources.length < 1) {
        return null;
    }

    if (names && names.length) {
        // Hide more links when properties included by name or use the value from config if its set
        config = { hideMore: true, overrideBottomMargin: '1rem', ...config };
    }

    let codeLookup = {};
    let codeSrcProvided = [];
    propertyConfigs.forEach((c) => {
        if (c.codeSrc) {
            codeSrcProvided = [...codeSrcProvided, c.codeSrc];

            const codeConfig = codeConfigs[c.codeSrc];
            codeLookup = { ...codeLookup, ...codeConfig };
        }

        if (c.suppressMissingPropCheck) {
            config = { ...config, suppressMissingPropCheck: true };
        }
    });

    const { lookupRoot = 'grid-api' } = config;
    const lookups = { codeLookup, interfaces: interfaceLookup };
    for (const ignoreName of config.suppressTypes ?? []) {
        delete interfaceLookup[ignoreName];
    }
    config = { ...config, lookupRoot, lookups, codeSrcProvided };

    if (section == null) {
        const entries = getAllSectionPropertyEntries({ propertiesFromFiles, suppressSort: config.suppressSort });

        return entries.map(([key, properties]) => (
            <Section key={key} framework={framework} title={key} properties={properties} config={config} />
        ));
    }

    const { title, properties } = getSectionProperties({
        section,
        propertiesFromFiles,
    });

    return (
        <Section
            framework={framework}
            title={title}
            properties={properties}
            config={{ ...config, isSubset: true }}
            names={names}
        />
    );
};

const Section: React.FC<SectionProps> = ({
    framework,
    title,
    properties,
    config = {} as Config,
    breadcrumbs = {},
    names = [],
}) => {
    const { meta } = properties;
    const displayName = (meta && meta.displayName) || title;
    if (meta && meta.isEvent) {
        // Support event display for a section
        config = { ...config, isEvent: true };
    }
    if (meta && meta.suppressMissingPropCheck) {
        config = { ...config, suppressMissingPropCheck: true };
    }

    breadcrumbs[title] = displayName;

    const breadcrumbKeys = Object.keys(breadcrumbs);
    const id = breadcrumbKeys.join('.');

    let header = null;

    const pattern = new RegExp(config.namePattern || '.*');

    if (!config.isSubset) {
        const headerLevel = config.headerLevel || breadcrumbKeys.length + 1;
        const HeaderTag = `h${headerLevel}` as any;

        // Astro normally inserts links for all the headings in Markdown
        // We manually add the element here ourselves to match
        header = (
            <>
                {!config.hideHeader && (
                    <HeaderTag id={`reference-${id}`} style={{ position: 'relative' }}>
                        {displayName}
                        <a href={`#reference-${id}`} className="docs-header-icon">
                            <Icon name="link" />
                        </a>
                    </HeaderTag>
                )}
                <Breadcrumbs breadcrumbs={breadcrumbs} />
                {meta && meta.description && (
                    <p dangerouslySetInnerHTML={{ __html: convertMarkdown(meta.description, framework) }}></p>
                )}
                {meta && meta.page && (
                    <p>
                        See <a href={urlWithPrefix({ url: meta.page.url, framework })}>{meta.page.name}</a> for more
                        information.
                    </p>
                )}
                {config.showSnippets && names.length < 1 && (
                    <ObjectCodeSample framework={framework} id={id} breadcrumbs={breadcrumbs} properties={properties} />
                )}
            </>
        );
    }

    if (Object.keys(properties).filter((p) => p !== 'meta').length < 1) {
        return null;
    }

    const rows = [];
    const objectProperties: DocEntryMap = {};

    let leftColumnWidth = 25;
    let processed = new Set();
    Object.entries(properties)
        .sort((a, b) => {
            return config.sortAlphabetically ? (a[0] < b[0] ? -1 : 1) : 0;
        })
        .forEach(([name, definition]) => {
            if (name === 'meta' || (names.length > 0 && !names.includes(name))) {
                return;
            }
            processed.add(name);

            if (!pattern.test(name)) {
                return;
            }

            const length = getLongestNameLength(name);
            if (leftColumnWidth < length) {
                leftColumnWidth = length;
            }
            if (config.maxLeftColumnWidth < leftColumnWidth) {
                leftColumnWidth = config.maxLeftColumnWidth;
            }

            const gridOptionProperty = config.lookups?.codeLookup[name];

            rows.push(
                <Property
                    key={name}
                    framework={framework}
                    id={id}
                    name={name}
                    definition={definition}
                    config={{
                        ...config,
                        gridOpProp: gridOptionProperty,
                        interfaceHierarchyOverrides: definition.interfaceHierarchyOverrides,
                    }}
                />
            );

            if (typeof definition !== 'string' && definition.meta) {
                // store object property to process later
                objectProperties[name] = definition;
            }
        });

    if (names.length > 0) {
        // Validate we found properties for each provided name
        names.forEach((n) => {
            if (!processed.has(n)) {
                throw new Error(
                    `<api-documentation>: Failed to find a property named ${n} that we requested under section ${title}. Check if you passed the correct name or if the name appears in the source json file that you are using.`
                );
            }
        });
    }

    const wrap = !!config.maxLeftColumnWidth;

    return (
        <div className={styles.apiReferenceOuter}>
            {header}
            <table
                className={classnames(styles.reference, styles.apiReference, 'no-zebra')}
                style={config.overrideBottomMargin ? { marginBottom: config.overrideBottomMargin } : {}}
            >
                <colgroup>
                    <col></col>
                    <col></col>
                </colgroup>
                <tbody>{rows}</tbody>
            </table>
            {Object.entries(objectProperties).map(([name, definition]) => (
                <Section
                    key={name}
                    framework={framework}
                    title={name}
                    properties={definition}
                    config={{ ...config, isSubset: false }}
                    breadcrumbs={{ ...breadcrumbs }}
                />
            ))}
        </div>
    );
};

const Breadcrumbs = ({ breadcrumbs }) => {
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

const ObjectCodeSample: React.FC<ObjectCode> = ({ framework, id, breadcrumbs, properties }) => {
    const lines = [];
    let indentationLevel = 0;

    const getIndent = (level) => '  '.repeat(level);

    Object.keys(breadcrumbs).forEach((key) => {
        const indent = getIndent(indentationLevel);

        if (indentationLevel > 0) {
            lines.push(`${indent}...`);
        }

        lines.push(`${indent}${key}: {`);

        indentationLevel++;
    });

    Object.entries(properties).forEach(([key, definition]) => {
        if (key === 'meta') {
            return;
        }

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

const Property: React.FC<PropertyCall> = ({ framework, id, name, definition, config }) => {
    const [isExpanded, setExpanded] = useState(config.defaultExpand);
    const propertyRef = useRef<HTMLElement>(null);
    const idName = `reference-${id}-${name}`;
    let description = '';
    let isObject = false;
    let gridParams = config.gridOpProp;

    useEffect(() => {
        const hashId = location.hash.slice(1); // Remove the '#' symbol

        if (idName === hashId) {
            setExpanded(true);
            propertyRef.current?.scrollIntoView();
        }
    }, []);

    if (
        !gridParams &&
        config.codeSrcProvided.length > 0 &&
        !(config.suppressMissingPropCheck || definition.overrideMissingPropCheck)
    ) {
        throw new Error(
            `We could not find a type for "${id}" -> "${name}" from the code sources ${config.codeSrcProvided.join()}. Has this property been removed from the source code / or is there a typo? Alternatively, if this type has an override you can suppress this error by setting meta.suppressMissingPropCheck to true in the override config.`
        );
    }

    let propDescription = definition.description || (gridParams && gridParams.meta.comment) || undefined;
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

    // Default may or may not be on a new line in JsDoc but in both cases we want the default to be on the next line
    const tags = gridParams?.meta?.tags ?? definition?.tags ?? [];
    const jsdocDefault = tags.find((t) => t.name === 'default');
    const defaultValue = definition.default ?? jsdocDefault?.comment;
    const isInitial = tags.some((t) => t.name === 'initial') ?? false;

    let displayName = name;
    if (!!definition.isRequired) {
        displayName += `&nbsp;<span class="${styles.required}" title="Required">&ast;</span>`;
    }

    if (!!definition.strikeThrough) {
        displayName = `<span style='text-decoration: line-through'>${displayName}</span>`;
    }

    // Use the type definition if manually specified in config
    let type: any = definition.type;
    let showAdditionalDetails = typeof type == 'object';
    if (!type) {
        // No type specified in the doc config file so check the GridOptions property
        if (gridParams && gridParams.type) {
            type = gridParams.type;

            const isDeprecated = gridParams.meta?.tags?.some((t) => t.name === 'deprecated');
            if (isDeprecated) {
                console.warn(
                    `<api-documentation>: Docs include a property: ${name} that has been marked as deprecated.`
                );
                console.warn('<api-documentation>: ' + gridParams.meta?.all);
            }

            const anyInterfaces = extractInterfaces(
                gridParams.type,
                config.lookups.interfaces,
                applyInterfaceInclusions(config)
            );
            showAdditionalDetails = isCallSig(gridParams) || type.arguments || anyInterfaces.length > 0;
        } else {
            if (type == null && config.codeSrcProvided.length > 0) {
                throw new Error(
                    `We could not find a type for "${name}" from the code sources ${config.codeSrcProvided.join()}. Has this property been removed from the source code / or is there a typo?`
                );
            }

            // If a codeSrc is not provided as a last resort try and infer the type
            type = inferType(definition.default);
        }
    }
    if (config.lookups.htmlLookup) {
        // Force open if we have custom html content to display for the property
        showAdditionalDetails = showAdditionalDetails || !!config.lookups.htmlLookup[name];
    }

    let propertyType = getPropertyType(type, config);
    const typeUrl = isObject
        ? `#reference-${id}.${name}`
        : propertyType !== 'Function'
          ? getTypeUrl(type, framework)
          : null;

    const codeSection = <FunctionCodeSample framework={framework} name={name} type={type} config={config} />;

    if (config.codeOnly) {
        return (
            <tr>
                <td colSpan={3} style={{ border: 0, padding: 0 }}>
                    {codeSection}
                </td>
            </tr>
        );
    }

    const wrap = !!config.maxLeftColumnWidth;

    // Split display name on capital letter, add <wbr> to improve text splitting across lines
    let displayNameSplit: string;

    const { more, isRequired, strikeThrough } = definition;
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

    const formattedDefaultValue = Array.isArray(defaultValue)
        ? '[' +
          defaultValue.map((v, i) => {
              return i === 0 ? `"${v}"` : ` "${v}"`;
          }) +
          ']'
        : defaultValue;

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
                        {showAdditionalDetails && (
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
            {showAdditionalDetails && isExpanded && (
                <tr className={classnames(styles.expandedContent)}>
                    <td colSpan={2}>
                        <div>{codeSection}</div>
                    </td>
                </tr>
            )}
        </>
    );
};

const FunctionCodeSample: React.FC<FunctionCode> = ({ framework, name, type, config }) => {
    if (typeof type == 'string') {
        console.log('<api-documentation>: type is a string!', type);
    }

    type = type || {};
    let returnType = typeof type == 'string' ? undefined : type.returnType;
    const returnTypeIsObject = !!returnType && typeof returnType === 'object';
    const extracted = extractInterfaces(returnType, config.lookups.interfaces, applyInterfaceInclusions(config));
    const returnTypeInterface = config.lookups.interfaces[returnType];
    const isCallSig = returnTypeInterface && returnTypeInterface.meta.isCallSignature;
    const returnTypeHasInterface = extracted.length > 0;

    let functionName = name.replace(/\([^)]*\)/g, '');
    if (isGridOptionEvent(config.gridOpProp)) {
        functionName = 'on' + getInterfaceName(functionName);
    }

    let args = {};
    if (typeof type !== 'string') {
        if (type.parameters) {
            args = {
                params: {
                    meta: { name: `${getInterfaceName(functionName)}Params` },
                    ...type.parameters,
                },
            };
        } else if (type.arguments) {
            args = type.arguments;
        } else if (!!isCallSig) {
            // Required to handle call signature interfaces so we can flatten out the interface to make it clearer
            const callSigInterface = returnTypeInterface as ICallSignature;
            args = callSigInterface.type.arguments;
            returnType = callSigInterface.type.returnType;
        }
    }

    let shouldUseNewline = false;
    const argumentDefinitions = [];

    const getArgumentTypeName = (key, type) => {
        if (!Array.isArray(type) && typeof type === 'object') {
            return (type.meta && type.meta.name) || getInterfaceName(key);
        }

        return type;
    };

    Object.entries(args).forEach(([key, type]) => {
        const typeName = getArgumentTypeName(key, type);

        argumentDefinitions.push(`${key}: ${getLinkedType(typeName, framework)}`);

        if (argumentDefinitions.length > 1 || (key + typeName).length > 20) {
            shouldUseNewline = true;
        }
    });

    const functionArguments = shouldUseNewline
        ? `\n    ${argumentDefinitions.join(',\n    ')}\n`
        : argumentDefinitions.join('');

    const returnTypeName = getInterfaceName(functionName).replace(/^get/, '');
    const functionPrefix =
        name.includes('(') || config.isApi
            ? `function ${functionName}(${functionArguments}):`
            : `${functionName} = (${functionArguments}) =>`;

    let lines = [];
    if (typeof type != 'string' && (type.parameters || type.arguments || isCallSig)) {
        lines.push(
            `${functionPrefix} ${returnTypeIsObject ? returnTypeName : getLinkedType(returnType || 'void', framework)};`
        );
    } else {
        lines.push(`${name}: ${returnType};`);
    }

    let interfacesToWrite = [];
    if (type.parameters) {
        Object.keys(args)
            .filter((key) => !Array.isArray(args[key]) && typeof args[key] === 'object')
            .forEach((key) => {
                const { meta, ...type } = args[key];
                interfacesToWrite = [
                    ...interfacesToWrite,
                    ...getInterfacesToWrite(getArgumentTypeName(key, { meta }), type, config),
                ];
            });
    } else if (args) {
        Object.entries(args).forEach(([key, type]) => {
            interfacesToWrite = [
                ...interfacesToWrite,
                ...getInterfacesToWrite(getArgumentTypeName(key, type), type, config),
            ];
        });
    }

    if (returnTypeIsObject) {
        interfacesToWrite = [...interfacesToWrite, ...getInterfacesToWrite(returnTypeName, returnType, config)];
    } else if (returnTypeHasInterface) {
        interfacesToWrite = [...interfacesToWrite, ...getInterfacesToWrite(returnType, returnType, config)];
    }

    lines.push(...writeAllInterfaces(interfacesToWrite, framework));

    const escapedLines = escapeGenericCode(lines);
    let customHTML = undefined;
    if (config.lookups.htmlLookup && config.lookups.htmlLookup[name]) {
        customHTML = <p dangerouslySetInnerHTML={{ __html: config.lookups.htmlLookup[name] }}></p>;
    }

    return (
        <>
            <Code code={escapedLines} keepMarkup={true} />
            {customHTML ?? customHTML}
        </>
    );
};
