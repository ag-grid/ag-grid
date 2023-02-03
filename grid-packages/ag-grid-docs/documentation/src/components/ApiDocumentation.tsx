import classnames from 'classnames';
import React, { useState } from 'react';
import anchorIcon from '../images/anchor';
import styles from './ApiDocumentation.module.scss';
import { ApiProps, ChildDocEntry, Config, DocEntryMap, FunctionCode, ICallSignature, IEvent, InterfaceEntry, ObjectCode, PropertyCall, PropertyType, SectionProps } from './ApiDocumentation.types';
import Code from './Code';
import { addMoreLink, convertMarkdown, convertUrl, escapeGenericCode, extractInterfaces, formatJsDocString, getInterfaceWithGenericParams, getJsonFromFile, getLinkedType, getLongestNameLength, getTypeUrl, inferType, sortAndFilterProperties, writeAllInterfaces } from './documentation-helpers';
import { useJsonFileNodes } from './use-json-file-nodes';

/**
 * This generates tabulated interface documentation based on information in JSON files.
 */
export const InterfaceDocumentation: React.FC<any> = ({ interfacename, framework, overridesrc, names = "", exclude = "", wrapNamesAt = null, config = {} }): any => {
    const nodes = useJsonFileNodes();
    let codeSrcProvided = [interfacename];
    let namesArr = [];
    let excludeArr = exclude && exclude.length > 0 ? JSON.parse(exclude) : [];

    if (names && names.length) {
        namesArr = JSON.parse(names);
        config = { overrideBottomMargin: "1rem", ...config, };
    }

    if (wrapNamesAt) {
        config = { wrapNamesAt: parseFloat(wrapNamesAt), ...config, };
    }

    const { lookupRoot = 'grid-api' } = config;
    const interfaceLookup = getJsonFromFile(nodes, undefined, `${lookupRoot}/interfaces.AUTO.json`);
    const codeLookup = getJsonFromFile(nodes, undefined, `${lookupRoot}/doc-interfaces.AUTO.json`);
    const htmlLookup = getJsonFromFile(nodes, undefined, `${lookupRoot}/doc-interfaces.HTML.json`);

    for (const ignoreName of config.suppressTypes ?? []) {
        delete interfaceLookup[ignoreName];
    }

    const lookups = { codeLookup: codeLookup[interfacename], interfaces: interfaceLookup, htmlLookup: htmlLookup[interfacename] };
    let hideHeader = true;
    if (config.hideHeader !== undefined) {
        hideHeader = config.hideHeader;
    }
    if (config.sortAlphabetically !== undefined) {
        config.sortAlphabetically = String(config.sortAlphabetically).toLowerCase() == 'true';
    }
    config = { ...config, lookupRoot, lookups, codeSrcProvided, hideHeader };

    const li = interfaceLookup[interfacename];

    if (config.asCode) {
        const interfacesToWrite = getInterfacesToWrite(interfacename, interfacename, config);
        if (interfacesToWrite.length < 1) {
            return <h2 style={{ color: 'red' }}>Could not find interface {interfacename} for interface-documentation component!</h2>
        }
        const lines = [];
        lines.push(...writeAllInterfaces(interfacesToWrite.slice(0, 1), framework, { lineBetweenProps: config.lineBetweenProps ?? true, hideName: config.hideName, exclude: excludeArr, applyOptionalOrdering: true }));
        const escapedLines = escapeGenericCode(lines);
        return <Code code={escapedLines} className={styles['reference__code-sample']} keepMarkup={true} />;
    }

    let props = {};
    let overrides = {};
    let interfaceOverrides = {};
    if (overridesrc) {
        overrides = getJsonFromFile(nodes, undefined, overridesrc);
        interfaceOverrides = overrides[interfacename];
        if (!interfaceOverrides) {
            throw new Error(`overrideSrc:${overridesrc} provided but does not contain expected section named: '${interfacename}'!`);
        }
    }

    const typeProps = Object.entries(li.type);
    sortAndFilterProperties(typeProps, framework).forEach(([k, v]) => {
        // interfaces include the ? as part of the name. We want to remove this for the <interface-documentation> component
        // Instead the type will be unioned with undefined as part of the propertyType
        let propNameOnly = k.replace('?', '');
        // for function properties like failCallback(): void; We only want the name failCallback part
        // as this is what is listed in the doc-interfaces.AUTO.json file
        propNameOnly = propNameOnly.split('(')[0];
        if ((namesArr.length === 0 || namesArr.includes(propNameOnly)) && (excludeArr.length == 0 || !excludeArr.includes(propNameOnly))) {
            const docs = (li.docs && formatJsDocString(li.docs[k])) || '';
            if (!docs.includes('@deprecated')) {
                props[propNameOnly] = { description: docs || v, ...interfaceOverrides[propNameOnly] }
            }
        }
    })

    let orderedProps = {};
    const ordered = Object.entries(props).sort(([, v1], [, v2]) => {
        // Put required props at the top as likely to be the most important
        if ((v1 as ChildDocEntry).isRequired == (v2 as ChildDocEntry).isRequired) {
            return 0;
        }
        return (v1 as ChildDocEntry).isRequired ? -1 : 1;
    });

    ordered.map(([k, v]) => orderedProps[k] = v);

    const interfaceDeclaration = getInterfaceWithGenericParams(interfacename, li.meta);
    const description = config.description != null ?
        config.description :
        `Properties available on the \`${interfaceDeclaration}\` interface.`;
    let properties: DocEntryMap = {
        [interfacename]: {
            ...orderedProps,
            "meta": {
                "displayName": interfacename,
                description,
                ...interfaceOverrides.meta
            }
        }
    }

    return Object.entries(properties)
        .map(([key, value]) => <Section key={key} framework={framework} title={key} properties={value} config={config} />);
};


/**
 * This generates tabulated API documentation based on information in JSON files. This way it is possible to show
 * information about different parts of an API in multiple places across the website while pulling the information
 * from one source of truth, so we only have to update one file when the documentation needs to change.
 */
export const ApiDocumentation: React.FC<ApiProps> = ({ pageName, framework, source, sources, section, names = "", config = {} as Config }): any => {
    const nodes = useJsonFileNodes();

    if (source) {
        sources = [source];
    }

    if (!sources || sources.length < 1) {
        return null;
    }
    let namesArr = [];
    if (names && names.length) {
        namesArr = JSON.parse(names);
        // Hide more links when properties included by name or use the value from config if its set
        config = { hideMore: true, overrideBottomMargin: "1rem", ...config, };
    }

    const propertiesFromFiles = sources.map(s => getJsonFromFile(nodes, pageName, s));


    const configs = propertiesFromFiles.map(p => p['_config_']);
    propertiesFromFiles.forEach(p => delete p['_config_']);

    let codeLookup = {};
    let codeSrcProvided = [];
    configs.forEach(c => {
        if (c == undefined) {
            console.warn(`_config_ property missing from source ${source || (sources || []).join()}.`)
            return;
        }
        if (c.codeSrc) {
            codeSrcProvided = [...codeSrcProvided, c.codeSrc];
            codeLookup = { ...codeLookup, ...getJsonFromFile(nodes, undefined, c.codeSrc) };
        }

        if (c.suppressMissingPropCheck) {
            config = { ...config, suppressMissingPropCheck: true }
        }
    })

    const { lookupRoot = 'grid-api' } = config;
    const interfaceLookup = getJsonFromFile(nodes, undefined, `${lookupRoot}/interfaces.AUTO.json`);
    const lookups = { codeLookup, interfaces: interfaceLookup };
    for (const ignoreName of config.suppressTypes ?? []) {
        delete interfaceLookup[ignoreName];
    }
    config = { ...config, lookupRoot, lookups, codeSrcProvided }

    if (section == null) {
        const properties: DocEntryMap = mergeObjects(propertiesFromFiles);

        const entries = Object.entries(properties);
        if (!config.suppressSort) {
            entries.sort(([k1, v1], [k2, v2]) => {
                const getName = (k, v) => v.meta && v.meta.displayName || k;
                return getName(k1, v1) < getName(k2, v2) ? -1 : 1;
            })
        }
        return entries
            .map(([key, value]) => <Section key={key} framework={framework} title={key} properties={value} config={config} />);
    }

    const keys = section.split('.');
    const processed = keys.reduce((current, key) => current.map(x => {
        const prop = x[key];
        if (!prop) {
            //console.warn(`Could not find a prop ${key} under source ${source} and section ${section}!`)
            throw new Error(`Could not find a prop ${key} under source ${source} and section ${section}!`)
        }
        return prop;
    }), propertiesFromFiles);
    const properties = mergeObjects(processed);

    return <Section
        framework={framework}
        title={keys[keys.length - 1]}
        properties={properties}
        config={{ ...config, isSubset: true }}
        names={namesArr} />;
};

const Section: React.FC<SectionProps> = ({ framework, title, properties, config = {} as Config, breadcrumbs = {}, names = [] }): any => {
    const { meta } = properties;
    const displayName = (meta && meta.displayName) || title;
    if (meta && meta.isEvent) {
        // Support event display for a section
        config = { ...config, isEvent: true }
    }
    if (meta && meta.suppressMissingPropCheck) {
        config = { ...config, suppressMissingPropCheck: true }
    }

    breadcrumbs[title] = displayName;

    const breadcrumbKeys = Object.keys(breadcrumbs);
    const id = breadcrumbKeys.join('.');

    let header = null;

    const pattern = new RegExp(config.namePattern || ".*");

    if (!config.isSubset) {
        const headerLevel = config.headerLevel || breadcrumbKeys.length + 1;
        const HeaderTag = `h${headerLevel}`;

        // We use a plugin (gatsby-remark-autolink-headers) to insert links for all the headings in Markdown
        // We manually add the element here ourselves to match
        header = <>
            {!config.hideHeader && <HeaderTag id={`reference-${id}`} style={{ position: 'relative' }}>
                <a href={`#reference-${id}`} className="anchor before">{anchorIcon}</a>
                {displayName}
            </HeaderTag>}
            <Breadcrumbs breadcrumbs={breadcrumbs} />
            {meta && meta.description &&
                <p dangerouslySetInnerHTML={{ __html: convertMarkdown(meta.description, framework) }}></p>}
            {meta && meta.page &&
                <p>See <a href={convertUrl(meta.page.url, framework)}>{meta.page.name}</a> for more information.</p>}
            {config.showSnippets && names.length < 1 &&
                <ObjectCodeSample framework={framework} id={id} breadcrumbs={breadcrumbs} properties={properties} />}
        </>;
    }

    if (Object.keys(properties).filter(p => p !== 'meta').length < 1) { return null; }

    const rows = [];
    const objectProperties: DocEntryMap = {};

    let leftColumnWidth = 25;
    let processed = new Set();
    Object.entries(properties).sort((a, b) => {
        return config.sortAlphabetically ? (a[0] < b[0] ? -1 : 1) : 0
    }).forEach(([name, definition]) => {
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
            leftColumnWidth = config.maxLeftColumnWidth
        }

        const gridOptionProperty = config.lookups.codeLookup[name];

        rows.push(<Property key={name} framework={framework} id={id} name={name} definition={definition} config={{ ...config, gridOpProp: gridOptionProperty, interfaceHierarchyOverrides: definition.interfaceHierarchyOverrides }} />);

        if (typeof definition !== 'string' && definition.meta) {
            // store object property to process later
            objectProperties[name] = definition;
        }
    });

    if (names.length > 0) {
        // Validate we found properties for each provided name
        names.forEach(n => {
            if (!processed.has(n)) {
                throw new Error(`Failed to find a property named ${n} that we requested under section ${title}. Check if you passed the correct name or if the name appears in the source json file that you are using.`)
            }
        })
    }

    const wrap = !!config.maxLeftColumnWidth;

    return <>
        {header}
        <table className={styles['reference']} style={config.overrideBottomMargin ? { "marginBottom": config.overrideBottomMargin } : {}}>
            <colgroup>
                <col className={styles['reference__expander-cell']} ></col>
                <col className={wrap ? styles['reference__name-cell__wrap'] : undefined} style={{ width: leftColumnWidth + 'ch' }}></col>
                <col></col>
            </colgroup>
            <tbody>
                {rows}
            </tbody>
        </table>
        {Object.entries(objectProperties).map(([name, definition]) => <Section
            key={name}
            framework={framework}
            title={name}
            properties={definition}
            config={{ ...config, isSubset: false }}
            breadcrumbs={{ ...breadcrumbs }}
        />)}
    </>;
};

const Property: React.FC<PropertyCall> = ({ framework, id, name, definition, config }) => {
    const [isExpanded, setExpanded] = useState(config.defaultExpand);

    let description = '';
    let isObject = false;
    let gridParams = config.gridOpProp;

    if (!gridParams && config.codeSrcProvided.length > 0 && !(config.suppressMissingPropCheck || definition.overrideMissingPropCheck)) {
        throw new Error(`We could not find a type for "${id}" -> "${name}" from the code sources ${config.codeSrcProvided.join()}. Has this property been removed from the source code / or is there a typo?`);
    }


    let propDescription = definition.description || (gridParams && gridParams.description) || undefined;
    if (propDescription) {
        propDescription = formatJsDocString(propDescription);
        // process property object
        description = convertMarkdown(propDescription, framework);

        const { more } = definition;

        if (more != null && more.url && !config.hideMore) {
            const seeMore = ` See <a href="${convertUrl(more.url, framework)}">${more.name}</a>.`;
            description = addMoreLink(description, seeMore);
        }
    } else {
        // this must be the parent of a child object
        if (definition.meta != null && definition.meta.description != null) {
            description = convertMarkdown(definition.meta.description, framework);
        }

        isObject = true;
    }

    let displayName = name;
    if (!!definition.isRequired) {
        displayName += `&nbsp;<span class="${styles['reference__required']}" title="Required">&ast;</span>`;
    }

    if (!!definition.strikeThrough) {
        displayName = `<span style='text-decoration: line-through'>${displayName}</span>`
    }

    // Use the type definition if manually specified in config
    let type: any = definition.type;
    let showAdditionalDetails = typeof (type) == 'object';
    if (!type) {
        // No type specified in the doc config file so check the GridOptions property
        if (gridParams && gridParams.type) {
            type = gridParams.type;

            if (gridParams.description && gridParams.description.includes('@deprecated')) {
                console.warn(`Docs include a property: ${name} that has been marked as deprecated.`);
                console.warn(gridParams.description);
            }

            const anyInterfaces = extractInterfaces(gridParams.type, config.lookups.interfaces, applyInterfaceInclusions(config));
            showAdditionalDetails = isCallSig(gridParams) || type.arguments || anyInterfaces.length > 0;
        } else {

            if (type == null && config.codeSrcProvided.length > 0) {
                throw new Error(`We could not find a type for "${name}" from the code sources ${config.codeSrcProvided.join()}. Has this property been removed from the source code / or is there a typo?`);
            }

            // If a codeSrc is not provided as a last resort try and infer the type
            type = inferType(definition.default);
        }
    }
    if (config.lookups.htmlLookup) {
        // Force open if we have custom html content to display for the property
        showAdditionalDetails = showAdditionalDetails || !!config.lookups.htmlLookup[name]
    }

    let propertyType = getPropertyType(type, config);
    const typeUrl = isObject
        ? `#reference-${id}.${name}` :
        (propertyType !== 'Function' ?
            getTypeUrl(type, framework) : null);

    const codeSection = <FunctionCodeSample framework={framework} name={name} type={type} config={config} />;

    if (config.codeOnly) {
        return <tr>
            <td colSpan={3} style={{ border: 0, padding: 0 }} >
                {codeSection}
            </td>
        </tr>
    }

    const wrap = !!config.maxLeftColumnWidth;

    return <tr>
        <td className={styles['reference__expander-cell']} onClick={() => setExpanded(!isExpanded)} role="presentation">
            {showAdditionalDetails && <div className={styles['reference__expander']}>
                <svg className={classnames({ 'fa-rotate-90': isExpanded })}><use href="#menu-item" /></svg>
            </div>}
        </td>
        <td role="presentation">
            <h6 id={`reference-${id}-${name}`} style={{ display: 'inline-flex' }} className="side-menu-exclude" >
                <code onClick={() => setExpanded(!isExpanded)} dangerouslySetInnerHTML={{ __html: displayName }} className={wrap ? `${styles['reference__name']} ${styles['reference__name__wrap']}`: styles['reference__name']}></code>
                <a href={`#reference-${id}-${name}`} className="anchor after" style={{ fontSize: 'small' }}>{anchorIcon}</a>
            </h6>

            <div onClick={() => setExpanded(!isExpanded)}>
                {typeUrl ?
                    <a className={styles['reference__property-type']} href={typeUrl} target={typeUrl.startsWith('http') ? '_blank' : '_self'} rel="noreferrer">
                        {isObject ? getInterfaceName(name) : propertyType}
                    </a> :
                    <span className={styles['reference__property-type']}>{propertyType}</span>}
            </div>
        </td>
        <td>
            <div onClick={() => setExpanded(!isExpanded)} role="presentation"
                className={classnames(styles['reference__description'], { [styles['reference__description--expanded']]: isExpanded })}
                dangerouslySetInnerHTML={{ __html: description }}></div>
            {isObject && <div>See <a href={`#reference-${id}.${name}`}>{name}</a> for more details.</div>}
            {definition.default != null && <div>Default: <code>{formatJson(definition.default)}</code></div>}
            {definition.options != null &&
                <div>Options: {definition.options.map((o, i) => <React.Fragment key={o}>{i > 0 ? ', ' : ''}<code>{formatJson(o)}</code></React.Fragment>)}</div>}
            {showAdditionalDetails &&
                <div className={isExpanded ? '' : 'd-none'}>
                    {codeSection}
                </div>}
        </td>
    </tr>;
};

const Breadcrumbs = ({ breadcrumbs }) => {
    const breadcrumbsLength = Object.keys(breadcrumbs).length;

    if (breadcrumbsLength <= 1) { return null; }

    const links = [];
    let href = '';
    let index = 0;

    Object.entries(breadcrumbs).forEach(([key, text]) => {
        href += `${href.length > 0 ? '.' : 'reference-'}${key}`;

        if (index < breadcrumbsLength - 1) {
            links.push(<React.Fragment key={key}><a href={`#${href}`} title={text}>{key}</a> &gt; </React.Fragment>);
        } else {
            links.push(<React.Fragment key={key}>{key}</React.Fragment>);
        }

        index++;
    });

    return <div className={styles['breadcrumbs']}>{links}</div>;
};

const ObjectCodeSample: React.FC<ObjectCode> = ({ framework, id, breadcrumbs, properties }) => {
    const lines = [];
    let indentationLevel = 0;

    const getIndent = level => '  '.repeat(level);

    Object.keys(breadcrumbs).forEach(key => {
        const indent = getIndent(indentationLevel);

        if (indentationLevel > 0) {
            lines.push(`${indent}...`);
        }

        lines.push(`${indent}${key}: {`);

        indentationLevel++;
    });

    Object.entries(properties).forEach(([key, definition]) => {
        if (key === 'meta') { return; }

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
            type = definition.options.map(option => formatJson(option)).join(' | ');
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

const getInterfaceName = name => `${name.substr(0, 1).toUpperCase()}${name.substr(1)}`;

function isGridOptionEvent(gridProp: InterfaceEntry): gridProp is IEvent {
    return (gridProp && gridProp.meta && gridProp.meta.isEvent)
}
function isCallSig(gridProp: InterfaceEntry): gridProp is ICallSignature {
    return (gridProp && gridProp.meta && gridProp.meta.isCallSignature)
}


const FunctionCodeSample: React.FC<FunctionCode> = ({ framework, name, type, config }) => {

    if (typeof (type) == 'string') {
        console.log('type is a string!', type);
    }

    type = type || {};
    let returnType = typeof (type) == 'string' ? undefined : type.returnType;
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
    if (typeof (type) !== 'string') {
        if (type.parameters) {
            args = {
                params: {
                    meta: { name: `${getInterfaceName(functionName)}Params` },
                    ...type.parameters
                }
            }
        } else if (type.arguments) {
            args = type.arguments;
        } else if (!!isCallSig) {
            // Required to handle call signature interfaces so we can flatten out the interface to make it clearer
            const callSigInterface = returnTypeInterface as ICallSignature
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

    const functionArguments = shouldUseNewline ?
        `\n    ${argumentDefinitions.join(',\n    ')}\n` :
        argumentDefinitions.join('');

    const returnTypeName = getInterfaceName(functionName).replace(/^get/, '');
    const functionPrefix = name.includes('(') || config.isApi ?
        `function ${functionName}(${functionArguments}):` :
        `${functionName} = (${functionArguments}) =>`;

    let lines = [];
    if (typeof (type) != 'string' && (type.parameters || type.arguments || isCallSig)) {
        lines.push(`${functionPrefix} ${returnTypeIsObject ? returnTypeName : (getLinkedType(returnType || 'void', framework))};`);
    } else {
        lines.push(`${name}: ${returnType};`);
    }

    let interfacesToWrite = [];
    if (type.parameters) {

        Object.keys(args)
            .filter(key => !Array.isArray(args[key]) && typeof args[key] === 'object')
            .forEach(key => {
                const { meta, ...type } = args[key];
                interfacesToWrite = [...interfacesToWrite, ...getInterfacesToWrite(getArgumentTypeName(key, { meta }), type, config)];

            });
    } else if (args) {

        Object.entries(args)
            .forEach(([key, type]) => {
                interfacesToWrite = [...interfacesToWrite, ...getInterfacesToWrite(getArgumentTypeName(key, type), type, config)];
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
        customHTML = <p dangerouslySetInnerHTML={{ __html: config.lookups.htmlLookup[name] }}></p>
    }

    return <>
        <Code code={escapedLines} className={styles['reference__code-sample']} keepMarkup={true} />
        {customHTML ?? customHTML}
    </>;
};

function applyInterfaceInclusions({ gridOpProp, interfaceHierarchyOverrides }) {
    return (typeName) => {
        if (interfaceHierarchyOverrides) {
            // If definition includes overrides apply them
            if ((interfaceHierarchyOverrides.exclude || []).includes(typeName)) {
                return false;
            }
            if ((interfaceHierarchyOverrides.include || []).includes(typeName)) {
                return true;
            }
        }
        // If its an event return true to force inclusion, otherwise undefined to use default inclusion logic.
        return isGridOptionEvent(gridOpProp) || undefined;
    }
}

const getInterfacesToWrite = (name, definition, config) => {
    let interfacesToWrite = []
    if (typeof (definition) === 'string') {
        // Extract all the words to enable support for Union types
        interfacesToWrite = extractInterfaces(definition, config.lookups.interfaces, applyInterfaceInclusions(config));
    } else if (
        (typeof (definition) == 'object' && !Array.isArray(definition)) ||
        (typeof (name) == 'string' && Array.isArray(definition))) {
        interfacesToWrite.push({
            name, interfaceType: { type: definition, meta: {} }
        })
    }

    return interfacesToWrite;
};

const mergeObjects = objects => {
    return objects.reduce((result, value) => Object.assign(result, value), {});
};

const formatJson = value => JSON.stringify(value, undefined, 2)
    .replace(/\[(.*?)\]/sg, (_, match) => `[${match.trim().replace(/,\s+/sg, ', ')}]`) // remove carriage returns from arrays
    .replace(/"/g, "'"); // use single quotes


/**
 * Property type is the small blue text that tells you the type of the given property
 */
function getPropertyType(type: string | PropertyType, config: Config) {
    let propertyType = '';
    if (type) {
        if (typeof (type) == 'string') {
            propertyType = type;
        }
        else if (typeof (type) == 'object') {
            if (type.arguments || type.parameters) {
                if (isGridOptionEvent(config.gridOpProp) || config.isEvent) {
                    // If an event show the event type instead of Function
                    propertyType = Object.values(type.arguments)[0];
                } else {
                    propertyType = `Function`;
                }
            }
            else if (type.returnType) {
                if (typeof (type.returnType) == 'object') {
                    propertyType = 'object';
                }
                else if (typeof (type.returnType) == 'string') {
                    const inter = config.lookups.interfaces[type.returnType];
                    if (inter && inter.meta && inter.meta.isCallSignature) {
                        propertyType = `Function`;
                    }
                    else {
                        propertyType = type.returnType;
                    }
                }
            }
            else {
                propertyType = 'void';
            }
        }
    }
    // We hide generics from this part of the display for simplicity
    // Could be done with a Regex...
    propertyType = propertyType
        .replace(/<TData>/g, '')
        .replace(/<TData, TValue>/g, '')
        .replace(/<TData, TValue, TContext>/g, '')
        .replace(/<TData, TContext>/g, '')
        .replace(/<TData, TContext, TValue>/g, '')
        .replace(/<TValue>/g, '')
        .replace(/<TContext>/g, '');

    return propertyType;
}

