import classnames from 'classnames';
import { appendCallSignature, appendEnum, appendInterface, appendTypeAlias, convertMarkdown, convertUrl, escapeGenericCode, inferType, getTypeUrl, getLinkedType } from 'components/documentation-helpers';
import anchorIcon from 'images/anchor';
import React, { useState } from 'react';
import styles from './ApiDocumentation.module.scss';
import Code from './Code';
import { useJsonFileNodes } from './use-json-file-nodes';
import { ApiProps, DocEntryMap, SectionProps, PropertyCall, ObjectCode, InterfaceEntry, IEvent, ICallSignature, FunctionCode, PropertyType, Config } from './ApiDocumentation.types';
import { TYPE_LINKS } from './type-links';

/**
 * This generates tabulated API documentation based on information in JSON files. This way it is possible to show
 * information about different parts of an API in multiple places across the website while pulling the information
 * from one source of truth, so we only have to update one file when the documentation needs to change.
 */
export const ApiDocumentation: React.FC<ApiProps> = ({ pageName, framework, source, sources, section, names = "", config = { codeSrc: undefined } }) : any => {
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
    }

    let codeLookup = {};
    let lookups = { codeLookup, interfaces: {} };
    if (config.codeSrc) {
        switch (config.codeSrc) {
            case 'GridOptions':
                codeLookup = getJsonFromFile(nodes, undefined, 'grid-api/grid-options.AUTO.json');
                break;
            case 'GridApi':
                codeLookup = getJsonFromFile(nodes, undefined, 'grid-api/grid-api.AUTO.json');
                break;
            case 'RowNode':
                codeLookup = getJsonFromFile(nodes, undefined, 'row-object/row-node.AUTO.json');
                break;
            case 'ColumnOptions':
                codeLookup = getJsonFromFile(nodes, undefined, 'column-properties/column-options.AUTO.json');
                break;
        }
        const interfaces = getJsonFromFile(nodes, undefined, 'grid-api/interfaces.AUTO.json');
        lookups = { codeLookup, interfaces };
    }

    const propertiesFromFiles = sources.map(s => getJsonFromFile(nodes, pageName, s));

    if (section == null) {
        const properties: DocEntryMap = mergeObjects(propertiesFromFiles);

        return Object.entries(properties)
            .map(([key, value]) => <Section key={key} framework={framework} title={key} properties={value} config={{ ...config, lookups }} />);
    }

    const keys = section.split('.');
    const processed = keys.reduce((current, key) => current.map(x => x[key]), propertiesFromFiles);
    const properties = mergeObjects(processed);

    return <Section
        framework={framework}
        title={keys[keys.length - 1]}
        properties={properties}
        config={{ ...config, lookups, isSubset: true }}
        names={namesArr} />;
};


const Section: React.FC<SectionProps> = ({ framework, title, properties, config = {}, breadcrumbs = {}, names = [] }) : any => {
    const { meta } = properties;
    const displayName = (meta && meta.displayName) || title;

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
            <HeaderTag id={`reference-${id}`} style={{ position: 'relative' }}>
                <a href={`#reference-${id}`} className="anchor before">{anchorIcon}</a>
                {displayName}
            </HeaderTag>
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

    Object.entries(properties).forEach(([name, definition]) => {
        const { relevantTo } = definition;

        if (name === 'meta' ||
            (names.length > 0 && !names.includes(name) && !(relevantTo && relevantTo.includes(names[0])))) {
            return;
        }

        const gridOptionProperty = config.lookups.codeLookup[name];

        rows.push(<Property key={name} framework={framework} id={id} name={name} definition={definition} config={{ ...config, gridOpProp: gridOptionProperty }} />);

        if (typeof definition !== 'string' && !definition.description) {
            // store object property to process later
            objectProperties[name] = definition;
        }
    });

    return <>
        {header}
        <table className={styles['reference']}>
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
    const [isExpanded, setExpanded] = useState(false);

    let description = '';
    let isObject = false;

    if (definition.description) {
        // process property object
        description = convertMarkdown(definition.description, framework);

        const { more } = definition;

        if (more != null && more.url) {
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

    // Use the type definition if manually specified in config
    let type: any = definition.type;
    let showAdditionalDetails = typeof (type) == 'object';
    if (!type) {
        // No type specified in the doc config file so check the GridOptions property
        let gridParams = config.gridOpProp;
        if (gridParams && gridParams.type) {
            type = gridParams.type;
            const isInterface = extractInterfaces(gridParams.type, config).length > 0;// config.lookups.interfaces[type.returnType];
            showAdditionalDetails = isCallSig(gridParams) || type.arguments || !!isInterface;
        } else {
            // As a last resort try and infer the type
            type = inferType(definition.default);
        }
    }

    let propertyType = getPropertyType(type, config);

    const typeUrl = isObject ? `#reference-${id}.${name}` : getTypeUrl(type, framework);

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
                        {isObject ? getInterfaceName(name) : type}
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
                    <FunctionCodeSample framework={framework} name={name} type={type} config={config} />
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
    const returnTypeInterface = config.lookups.interfaces[returnType];
    const isCallSignatureInterface = isCallSig(returnTypeInterface);
    const returnTypeHasInterface = returnTypeInterface || extractInterfaces(returnType, config).length > 0;

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

    const lines = typeof (type) != 'string' && (type.parameters || type.arguments || isCallSignatureInterface) ? [
        `${functionPrefix} ${returnTypeIsObject ? returnTypeName : (getLinkedType(returnType || 'void', framework))};`,
    ] : [];

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
        interfacesToWrite = extractInterfaces(definition, config);
    } else if (
        (typeof (definition) == 'object' && !Array.isArray(definition)) ||
        (typeof (name) == 'string' && Array.isArray(definition))) {
        interfacesToWrite.push({
            name, interfaceType: { type: definition, meta: {} }
        })
    }

    let allLines = [];
    interfacesToWrite.forEach(({ name, interfaceType }) => {
        if (interfaceType.meta.isTypeAlias) {
            appendTypeAlias(name, interfaceType, allLines);
        }
        else if (interfaceType.meta.isEnum) {
            appendEnum(name, interfaceType, allLines);
        }
        else if (interfaceType.meta.isCallSignature) {
            appendCallSignature(name, interfaceType, framework, allLines);
        }
        else {
            appendInterface(name, interfaceType, framework, allLines);
        }
    })
    return allLines;
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

function extractInterfaces(definitionOrArray, config) {
    if (!definitionOrArray) return [];

    if (Array.isArray(definitionOrArray)) {
        let allDefs = [];

        definitionOrArray.forEach(def => {
            allDefs = [...allDefs, ...extractInterfaces(def, config)]
        })
        return allDefs;
    }
    const definition = definitionOrArray;

    if (typeof (definition) == 'string') {
        const typeRegex = /\w+/g;
        const definitionTypes = [...definition.matchAll(typeRegex)];
        const interfacesToWrite = definitionTypes.map(regMatch => {
            const type = regMatch[0];
            // If we have the actual interface use that definition
            const interfaceType = config.lookups.interfaces[type];
            if (!interfaceType) {
                return undefined;
            }
            const isLinkedType = !!TYPE_LINKS[type];
            const numMembers = typeof (interfaceType.type) == 'string' ? 1 : Object.entries((interfaceType.type) || {}).length;
            // Show interface if we have found one.            
            // Do not show an interface if it has lots of properties and is a linked type.
            // Always show event interfaces
            return (!isLinkedType || (isLinkedType && numMembers < 12) || isGridOptionEvent(config.gridOpProp)) ? { name: type, interfaceType } : undefined;
        }).filter(dt => !!dt);
        return interfacesToWrite;
    }

    let allDefs = [];
    Object.entries(definition).forEach(([k, v]) => {
        allDefs = [...allDefs, ...extractInterfaces(v, config)]
    })
    return allDefs;

}

function getPropertyType(type: string | PropertyType, config: Config) {
    let propertyType = '';
    if (type) {
        if (typeof (type) == 'string') {
            propertyType = type;
        }
        else if (typeof (type) == 'object') {
            if (type.arguments || type.parameters) {
                if (isGridOptionEvent(config.gridOpProp)) {
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

