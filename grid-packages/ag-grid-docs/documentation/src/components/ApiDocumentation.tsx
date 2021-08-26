import classnames from 'classnames';
import { convertMarkdown, convertUrl, escapeGenericCode, getLinkedType, getLongestNameLength, getTypeUrl, inferType } from 'components/documentation-helpers';
import anchorIcon from 'images/anchor';
import React, { useState } from 'react';
import styles from './ApiDocumentation.module.scss';
import { ApiProps, Config, DocEntryMap, FunctionCode, ICallSignature, IEvent, ObjectCode, PropertyCall, PropertyType, SectionProps, InterfaceEntry } from './ApiDocumentation.types';
import Code from './Code';
import { extractInterfaces, writeAllInterfaces, removeJsDocStars, sortAndFilterProperties } from './documentation-helpers';
import { useJsonFileNodes } from './use-json-file-nodes';


/**
 * This generates tabulated interface documentation based on information in JSON files.
 */
export const InterfaceDocumentation: React.FC<any> = ({ interfacename, framework, source, names = "", config = {} }): any => {
    const nodes = useJsonFileNodes();
    let codeSrcProvided = [interfacename];
    let namesArr = [];

    if (names && names.length) {
        namesArr = JSON.parse(names);
    }

    const interfaceLookup = getJsonFromFile(nodes, undefined, 'grid-api/interfaces.AUTO.json');
    const codeLookup = getJsonFromFile(nodes, undefined, 'grid-api/doc-interfaces.AUTO.json');

    const lookups = { codeLookup: codeLookup[interfacename], interfaces: interfaceLookup };
    config = { ...config, lookups, codeSrcProvided, hideHeader: true }

    const li = interfaceLookup[interfacename];

    let props = {};
    const overrides = source ? getJsonFromFile(nodes, undefined, source) : {};

    const typeProps = Object.entries(li.type).map(([k, v]) => [k.split(/\[^$\w\]/)[0], v]);

    sortAndFilterProperties(typeProps, framework).forEach(([k, v]) => {
        if (namesArr.length === 0 || namesArr.includes(k)) {
            props[k] = { description: (li.docs && removeJsDocStars(li.docs[k])) || v, }
        }
    })

    const interfaceOverrides = overrides[interfacename] || {};
    let properties: DocEntryMap = {
        [interfacename]: {
            ...{ ...props, ...interfaceOverrides },
            "meta": {
                "displayName": interfacename,
                "description": `Properties available on the \`${interfacename}\` interface.`,
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
        // Hide more links when properties included by name
        config = { ...config, hideMore: true };
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
        }

        switch (c.codeSrc) {
            case 'GridOptions':
                codeLookup = { ...codeLookup, ...getJsonFromFile(nodes, undefined, 'grid-api/grid-options.AUTO.json') };
                break;
            case 'GridApi':
                codeLookup = { ...codeLookup, ...getJsonFromFile(nodes, undefined, 'grid-api/grid-api.AUTO.json') };
                break;
            case 'RowNode':
                codeLookup = { ...codeLookup, ...getJsonFromFile(nodes, undefined, 'row-object/row-node.AUTO.json') };
                break;
            case 'ColumnOptions':
                codeLookup = { ...codeLookup, ...getJsonFromFile(nodes, undefined, 'column-properties/column-options.AUTO.json') };
                break;
            case 'ColumnApi':
                codeLookup = { ...codeLookup, ...getJsonFromFile(nodes, undefined, 'column-api/column-api.AUTO.json') };
                break;
            case 'Column':
                codeLookup = { ...codeLookup, ...getJsonFromFile(nodes, undefined, 'column-object/column.AUTO.json') };
                break;
        }            
    })
    const interfaceLookup = getJsonFromFile(nodes, undefined, 'grid-api/interfaces.AUTO.json');
    const lookups = { codeLookup, interfaces: interfaceLookup };
    config = { ...config, lookups, codeSrcProvided }

    if (section == null) {
        const properties: DocEntryMap = mergeObjects(propertiesFromFiles);

        return Object.entries(properties)
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

    breadcrumbs[title] = displayName;

    const breadcrumbKeys = Object.keys(breadcrumbs);
    const id = breadcrumbKeys.join('.');

    let header = null;

    if (!config.isSubset) {
        const headerLevel = breadcrumbKeys.length + 1;
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

    let longestNameLength = 25;
    let processed = new Set();
    Object.entries(properties).forEach(([name, definition]) => {
        const { relevantTo } = definition;

        if (name === 'meta' ||
            (names.length > 0 && !names.includes(name) && !(relevantTo && relevantTo.includes(names[0])))) {
            return;
        }
        // Either the name matched
        processed.add(name);
        // Or include via relevantTo, see simple-filters.json for example of relevantTo
        processed.add(names[0]);

        const length = getLongestNameLength(name);
        if (longestNameLength < length) {
            longestNameLength = length;
        }
        const gridOptionProperty = config.lookups.codeLookup[name];

        rows.push(<Property key={name} framework={framework} id={id} name={name} definition={definition} config={{ ...config, gridOpProp: gridOptionProperty }} />);

        if (typeof definition !== 'string' && !definition.description) {
            // store object property to process later
            objectProperties[name] = definition;
        }
    });

    if (names.length > 0) {
        // Validate we found properties for each provided name or relevantTo section
        names.forEach(n => {
            if (!processed.has(n)) {
                throw new Error(`Failed to find a property named ${n} or relevantTo label ${n} that we requested under section ${title}. Check if you passed the correct name or if the name appears in the source json file that you are using.`)
            }
        })
    }

    return <>
        {header}
        <table className={styles['reference']}>
            <colgroup>
                <col className={styles['reference__expander-cell']} ></col>
                <col style={{ width: longestNameLength + 'ch' }}></col>
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

    if (definition.description) {
        // process property object
        description = convertMarkdown(definition.description, framework);

        const { more } = definition;

        if (more != null && more.url && !config.hideMore) {
            description += ` See <a href="${convertUrl(more.url, framework)}">${more.name}</a>.`;
        }
    } else {
        // this must be the parent of a child object
        if (definition.meta != null && definition.meta.description != null) {
            description = convertMarkdown(definition.meta.description, framework);
        }

        isObject = true;
    }

    if (!!definition.isRequired) {
        name += `&nbsp;<span class="${styles['reference__required']}" title="Required">&ast;</span>`;
    }

    if (!!definition.strikeThrough) {
        name = `<span style='text-decoration: line-through'>${name}</span>`
    }

    // Use the type definition if manually specified in config
    let type: any = definition.type;    
    let showAdditionalDetails = typeof (type) == 'object';
    if (!type) {
        // No type specified in the doc config file so check the GridOptions property
        let gridParams = config.gridOpProp;
        if (gridParams && gridParams.type) {
            type = gridParams.type;

            if (gridParams.description && gridParams.description.includes('@deprecated')) {
                console.warn(`Docs include a property: ${name} that has been marked as deprecated.`);
                console.warn(gridParams.description);
            }

            const isInterface = extractInterfaces(gridParams.type, config.lookups.interfaces, () => isGridOptionEvent(config.gridOpProp)).length > 0;
            showAdditionalDetails = isCallSig(gridParams) || type.arguments || !!isInterface;
        } else {
            // As a last resort try and infer the type
            type = inferType(definition.default);

            if (type == null && config.codeSrcProvided.length > 0) {
                console.warn(`We could not find a type for ${name} but a code sources ${config.codeSrcProvided.join()} were provided.`)
            }
        }
    }

    let propertyType = getPropertyType(type, config);
    const typeUrl = isObject ? `#reference-${id}.${name}` : getTypeUrl(type, framework);

    const codeSection = <FunctionCodeSample framework={framework} name={name} type={type} config={config} />;

    if (config.codeOnly) {
        return <tr>
            <td colSpan={3} style={{ border: 0, padding: 0 }} >
                {codeSection}
            </td>
        </tr>
    }

    return <tr>
        <td className={styles['reference__expander-cell']} onClick={() => setExpanded(!isExpanded)} role="presentation">
            {showAdditionalDetails && <div className={styles['reference__expander']}>
                <svg className={classnames({ 'fa-rotate-90': isExpanded })}><use href="#menu-item" /></svg>
            </div>}
        </td>
        <td onClick={() => setExpanded(!isExpanded)} role="presentation">
            <code dangerouslySetInnerHTML={{ __html: name }} className={styles['reference__name']}></code>
            <div>
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
        {definition.relevantTo && <td style={{ whiteSpace: 'nowrap' }}>{definition.relevantTo.join(', ')}</td>}
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
    const extracted = extractInterfaces(returnType, config.lookups.interfaces, () => isGridOptionEvent(config.gridOpProp));
    const returnTypeInterface = extracted.length > 0 ? extracted[0].interfaceType : undefined;
    const isCallSignatureInterface = extracted.some(i => isCallSig(i.interfaceType));
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
        } else if (isCallSig(returnTypeInterface)) {
            // Required to handle call signature interfaces so we can flatten out the interface to make it clearer        
            args = returnTypeInterface.type.arguments;
            returnType = returnTypeInterface.type.returnType;
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
    if (typeof (type) != 'string' && (type.parameters || type.arguments || isCallSignatureInterface)) {
        lines.push(`${functionPrefix} ${returnTypeIsObject ? returnTypeName : (getLinkedType(returnType || 'void', framework))};`);
    }

    let addNewLine = lines.length > 0 ? [''] : [];
    if (type.parameters) {

        Object.keys(args)
            .filter(key => !Array.isArray(args[key]) && typeof args[key] === 'object')
            .forEach(key => {
                const { meta, ...type } = args[key];
                lines.push(...addNewLine, ...getInterfaceLines(framework, getArgumentTypeName(key, { meta }), type, config));
            });
    } else if (args) {

        Object.entries(args)
            .forEach(([key, type]) => {
                const result = getInterfaceLines(framework, getArgumentTypeName(key, type), type, config);
                if (result.length > 0) {
                    lines.push(...addNewLine, ...result);
                }
            });
    }

    addNewLine = lines.length > 0 ? [''] : [];
    if (returnTypeIsObject) {
        const result = getInterfaceLines(framework, returnTypeName, returnType, config);
        if (result.length > 0) {
            lines.push(...addNewLine, ...result);
        }
    } else if (returnTypeHasInterface) {
        const result = getInterfaceLines(framework, returnType, returnType, config);
        if (result) {
            lines.push(...addNewLine, ...result);
        }
    }

    const escapedLines = escapeGenericCode(lines);
    return <Code code={escapedLines} className={styles['reference__code-sample']} keepMarkup={true} />;
};

const getInterfaceLines = (framework, name, definition, config) => {
    let interfacesToWrite = []
    if (typeof (definition) === 'string') {
        // Extract all the words to enable support for Union types
        interfacesToWrite = extractInterfaces(definition, config.lookups.interfaces, () => isGridOptionEvent(config.gridOpProp));
    } else if (
        (typeof (definition) == 'object' && !Array.isArray(definition)) ||
        (typeof (name) == 'string' && Array.isArray(definition))) {
        interfacesToWrite.push({
            name, interfaceType: { type: definition, meta: {} }
        })
    }

    return writeAllInterfaces(interfacesToWrite, framework);
};

const getJsonFromFile = (nodes, pageName, source) => {
    const json = nodes.filter(n => n.relativePath === source || n.relativePath === `${pageName}/${source}`)[0];

    if (json) {
        return JSON.parse(json.internal.content);
    }

    throw new Error(`Could not find JSON for source ${source}`);
};

const mergeObjects = objects => {
    return objects.reduce((result, value) => Object.assign(result, value), {});
};

const formatJson = value => JSON.stringify(value, undefined, 2)
    .replace(/\[(.*?)\]/sg, (_, match) => `[${match.trim().replace(/,\s+/sg, ', ')}]`) // remove carriage returns from arrays
    .replace(/"/g, "'"); // use single quotes



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
                    propertyType = 'Function';
                }
            }
            else if (type.returnType) {
                if (typeof (type.returnType) == 'object') {
                    propertyType = 'object';
                }
                else if (typeof (type.returnType) == 'string') {
                    const inter = config.lookups.interfaces[type.returnType];
                    if (inter && inter.meta && inter.meta.isCallSignature) {
                        propertyType = 'Function';
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
    return propertyType;
}

