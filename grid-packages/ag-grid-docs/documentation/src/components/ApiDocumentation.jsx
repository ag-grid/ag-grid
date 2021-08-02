import React, { useState } from 'react';
import classnames from 'classnames';
import { useJsonFileNodes } from './use-json-file-nodes';
import anchorIcon from 'images/anchor';
import Code from './Code';
import { inferType, convertUrl, convertMarkdown, escapeGenericCode } from 'components/documentation-helpers';
import styles from './ApiDocumentation.module.scss';

/**
 * These are used to create links from types to relevant documentation.
 */
const types = {
    Blob: 'https://developer.mozilla.org/en-US/docs/Web/API/Blob',
    CellPosition: '/keyboard-navigation/#cellposition',
    CellRange: '/range-selection/#range-selection-api',
    ChartModel: '/integrated-charts-api/#saving-and-restoring-charts',
    ChartType: '/integrated-charts-events/#chartoptionschanged',
    ColDef: '/column-properties/',
    ColGroupDef: '/column-properties/',
    Column: '/column-object/',
    ColumnApi: '/column-api/',
    CreatePivotChartParams: '/integrated-charts-api/#pivot-charts',
    CreateRangeChartParams: '/integrated-charts-api/#range-charts',
    GetChartImageDataUrlParams: '/integrated-charts-api/#downloading-chart-image',
    CsvExportParams: '/csv-export/#csvexportparams',
    Document: 'https://developer.mozilla.org/en-US/docs/Web/API/Document',
    ExcelAlignment: '/excel-export-api/#excelalignment',
    ExcelBorder: '/excel-export-api/#excelborder',
    ExcelBorders: '/excel-export-api/#excelborders',
    ExcelCell: '/excel-export-api/#excelcell',
    ExcelData: '/excel-export-api/#exceldata',
    ExcelDataType: '/excel-export-api/#exceldatatype',
    ExcelExportParams: '/excel-export-api/#excelexportparams',
    ExcelExportMultipleSheetParams: '/excel-export-api/#excelexportmultiplesheetparams',
    ExcelFont: '/excel-export-api/#excelfont',
    ExcelHeaderFooter: '/excel-export-api/#excelheaderfooter',
    ExcelHeaderFooterConfig: '/excel-export-api/#excelheaderfooterconfig',
    ExcelHeaderFooterContent: '/excel-export-api/#excelheaderfootercontent',
    ExcelImage: '/excel-export-api/#excelimage',
    ExcelInterior: '/excel-export-api/#excelinterior',
    ExcelNumberFormat: '/excel-export-api/#excelnumberformat',
    ExcelProtection: '/excel-export-api/#excelprotection',
    ExcelStyle: '/excel-export-api/#excelstyle',
    ExcelSheetConfig: '/excel-export-api/#excelsheetconfig',
    ExcelSheetPageSetup: '/excel-export-api/#excelsheetpagesetup',
    ExcelSheetMargin: '/excel-export-api/#excelsheetmargin',
    GridApi: '/grid-api/',
    HeaderPosition: '/keyboard-navigation/#headerposition',
    HTMLElement: 'https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement',
    IAggFunc: '/aggregation/#custom-aggregation-functions',
    IDatasource: '/infinite-scrolling/#datasource-interface',
    IFilterDef: '/filter-multi/#ifilterdef',
    IServerSideDatasource: '/server-side-model-datasource/#datasource-interface',
    IViewportDatasource: '/viewport/#interface-iviewportdatasource',
    KeyboardEvent: 'https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent',
    MouseEvent: 'https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent',
    RowNode: '/row-object/',
    ServerSideTransaction: '/server-side-model-transactions/#transaction-api',
    ServerSideStoreType: 'https://ag-grid.com/javascript-grid/grid-properties/#reference-serverSideRowModel',
    Touch: 'https://developer.mozilla.org/en-US/docs/Web/API/Touch',
};


/**
 * This generates tabulated API documentation based on information in JSON files. This way it is possible to show
 * information about different parts of an API in multiple places across the website while pulling the information
 * from one source of truth, so we only have to update one file when the documentation needs to change.
 */
export const ApiDocumentation = ({ pageName, framework, source, sources, section, names = [], config = {} }) => {
    const nodes = useJsonFileNodes();

    if (source) {
        sources = [source];
    }

    if (!sources || sources.length < 1) {
        return null;
    }

    if (names && names.length) {
        names = JSON.parse(names);
    }

    const gridOptions = getJsonFromFile(nodes, pageName, 'grid-api/grid-options.json');
    const interfaces = getJsonFromFile(nodes, pageName, 'grid-api/interfaces.json');
    const lookups = { gridOptions, interfaces };

    const propertiesFromFiles = sources.map(s => getJsonFromFile(nodes, pageName, s));

    if (section == null) {
        const properties = mergeObjects(propertiesFromFiles);

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
        names={names} />;
};

const Section = ({ framework, title, properties, config = {}, breadcrumbs = {}, names = [] }) => {
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
    const objectProperties = {};

    Object.entries(properties).forEach(([name, definition]) => {
        const { relevantTo } = definition;

        if (name === 'meta' ||
            (names.length > 0 && !names.includes(name) && !(relevantTo && relevantTo.includes(names[0])))) {
            return;
        }

        rows.push(<Property key={name} framework={framework} id={id} name={name} definition={definition} config={config} />);

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

const getTypeUrl = (type, framework) => {
    if (typeof type === 'string') {
        if (type.includes('|')) {
            // can't handle multiple types
            return null;
        } else if (type.endsWith('[]')) {
            type = type.replace(/\[\]/g, '');
        }
    }

    return convertUrl(types[type], framework);
};

const Property = ({ framework, id, name, definition, config }) => {
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
    } else if (typeof definition === 'string') {
        // process simple property string
        description = definition;
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
    let type = definition.type;
    let showAdditionalDetails = typeof (type) == 'object';
    if (!type) {
        // No type specified in the config file so look it up from GridOptions
        let gridParams = { ...config.lookups.gridOptions[name] };
        if (gridParams && gridParams.type) {
            type = gridParams.type;
            const isInterface = config.lookups.interfaces[type.returnType];
            showAdditionalDetails = type.arguments || isInterface;
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
                    <a className={styles['reference__type']} href={typeUrl} target={typeUrl.startsWith('http') ? '_blank' : '_self'} rel="noreferrer">
                        {isObject ? getInterfaceName(name) : type}
                    </a> :
                    <span className={styles['reference__type']}>{propertyType}</span>}
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

const ObjectCodeSample = ({ framework, id, breadcrumbs, properties }) => {
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

const FunctionCodeSample = ({ framework, name, type, config }) => {
    const functionName = name.replace(/\([^)]*\)/g, '');

    type = type || {};
    let { returnType } = type;
    const returnTypeIsObject = returnType != null && typeof returnType === 'object';
    const returnTypeInterface = config.lookups.interfaces[returnType];
    const isCallSignatureInterface = returnTypeInterface && returnTypeInterface.meta.isCallSignature;

    let args = {};
    if (type.parameters) {
        args = {
            params: {
                meta: { name: `${getInterfaceName(functionName)}Params` },
                ...type.parameters
            }
        }
    } else if (type.arguments) {
        args = type.arguments;
    } else if (isCallSignatureInterface) {
        // Required to handle call signature interfaces so we can flatten out the interface to make it clearer        
        args = returnTypeInterface.type.arguments;
        returnType = returnTypeInterface.type.returnType;
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

        if (argumentDefinitions.length > 1 || typeName.length > 20) {
            shouldUseNewline = true;
        }
    });

    const functionArguments = shouldUseNewline ?
        `\n    ${argumentDefinitions.join(',\n    ')}\n` :
        argumentDefinitions.join('');

    const returnTypeName = getInterfaceName(functionName).replace(/^get/, '');
    const functionPrefix = name.includes('(') ?
        `function ${functionName}(${functionArguments}):` :
        `${functionName} = (${functionArguments}) =>`;

    const lines = type.parameters || type.arguments || isCallSignatureInterface ? [
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
                lines.push(...addNewLine, ...getInterfaceLines(framework, getArgumentTypeName(key, type), type, config));
            });
    }

    addNewLine = lines.length > 0 ? [''] : [];
    if (returnTypeIsObject) {
        lines.push(...addNewLine, ...getInterfaceLines(framework, returnTypeName, returnType, config));
    } else if (!!returnTypeInterface) {
        lines.push(...addNewLine, ...getInterfaceLines(framework, returnType, returnType, config));
    }

    const escapedLines = escapeGenericCode(lines);
    return <Code code={escapedLines} className={styles['reference__code-sample']} keepMarkup={true} />;
};

const getInterfaceLines = (framework, name, definition, config) => {
    let interfacesToWrite = []
    if (typeof (definition) === 'string') {
        // Extract all the words to enable support for Union types
        const typeRegex = /\w+/g;
        const definitionTypes = [...definition.matchAll(typeRegex)];

        interfacesToWrite = definitionTypes.map(regMatch => {
            const type = regMatch[0];
            // If we have the actual interface use that definition
            const interfaceType = config.lookups.interfaces[type];
            const numMembers = Object.entries((interfaceType && interfaceType.type) || {}).length;

            // Show interface if we have found one.            
            // Do not show an interface if it has lots of properties. Should be a linked type instead.
            return interfaceType && numMembers < 12 ? { name: type, interfaceType } : undefined;
        }).filter(dt => !!dt);
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

const getLinkedType = (type, framework) => {
    if (!Array.isArray(type)) {
        type = [type];
    }

    // Extract all the words to enable support for Union types
    const typeRegex = /\w+/g;
    const formattedTypes = type
        .filter(t => typeof (t) === 'string')
        .map(t => {
        const definitionTypes = [...t.matchAll(typeRegex)];

        const typesToLink = definitionTypes.map(regMatch => {
            const typeName = regMatch[0];
            const url = getTypeUrl(typeName, framework);

            return url ? {
                toReplace: typeName,
                link: `<a href="${url}" target="${url.startsWith('http') ? '_blank' : '_self'}" rel="noreferrer">${typeName}</a>`
            } : undefined;
        }).filter(dt => !!dt);

        let formatted = t;
        typesToLink.forEach(toLink => {
            formatted = formatted.split(toLink.toReplace).join(toLink.link);
        })

        return formatted;
    });

    return formattedTypes.join(' | ');
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

function getPropertyType(type, config) {
    let propertyType = '';
    if (type) {
        if (typeof (type) == 'string') {
            propertyType = type;
        }
        else if (typeof (type) == 'object') {
            if (type.arguments || type.parameters) {
                propertyType = 'Function';
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

function appendInterface(name, interfaceType, framework, allLines) {
    const lines = [`interface ${name} {`];
    const properties = Object.entries(interfaceType.type);
    properties.sort(([p1,], [p2,]) => {
        // Sort alphabetically but with $scope at the end
        if (p1 === '$scope')
            return 1;
        if (p2 === '$scope')
            return -1;
        return p1 < p2 ? -1 : 1;
    });
    properties
        // Only show AngularJS $scope property for Angular or Javascript frameworks
        .filter(([p,]) => p !== '$scope' || (framework === 'angular' || framework === 'javascript'))
        .forEach(([property, type]) => {
        lines.push(`  ${property}: ${getLinkedType(type, framework)};`);
    });
    lines.push('}');
    allLines.push(...lines);
}

function appendCallSignature(name, interfaceType, framework, allLines) {
    const lines = [`interface ${name} {`];
    const args = Object.entries(interfaceType.type.arguments);
    const argTypes = args.map(([property, type]) => {
        return `${property}: ${getLinkedType(type, framework)}`;
    });
    lines.push(`    (${argTypes.join(', ')}) : ${interfaceType.type.returnType}`);
    lines.push('}');
    allLines.push(...lines);
}

function appendEnum(name, interfaceType, allLines) {
    const lines = [`enum ${name} {`];
    const properties = interfaceType.type;
    properties.forEach((property) => {
        lines.push(`  ${property}`);
    });
    lines.push('}');
    allLines.push(...lines);
}

function appendTypeAlias(name, interfaceType, allLines) {
    const shouldMultiLine = interfaceType.type.length > 20;
    const multiLine = shouldMultiLine ?
        `\n      ${interfaceType.type.split('|').join('\n    |')}\n` :
        interfaceType.type;
    allLines.push(`type ${name} = ${multiLine}`);
}

