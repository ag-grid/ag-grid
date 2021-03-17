import React, { useState } from 'react';
import classnames from 'classnames';
import { useJsonFileNodes } from './use-json-file-nodes';
import anchorIcon from 'images/anchor';
import Code from './Code';
import { inferType, convertUrl } from 'components/documentation-helpers';
import styles from './ApiDocumentation.module.scss';

/**
 * These are used to create links from types to relevant documentation.
 */
const types = {
    Array: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array',
    Blob: 'https://developer.mozilla.org/en-US/docs/Web/API/Blob',
    boolean: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Boolean',
    CellPosition: '/keyboard-navigation/#cellposition',
    CellRange: '/range-selection/#range-selection-api',
    ChartModel: '/integrated-charts-api/#saving-and-restoring-charts',
    ColDef: '/column-properties/',
    CreatePivotChartParams: '/integrated-charts-api/#pivot-charts',
    CreateRangeChartParams: '/integrated-charts-api/#range-charts',
    Function: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function',
    HTMLElement: 'https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement',
    IAggFunc: '/aggregation/#custom-aggregation-functions',
    IDatasource: '/infinite-scrolling/#datasource-interface',
    IServerSideDatasource: '/server-side-model-datasource/#datasource-interface',
    IViewportDatasource: '/viewport/#interface-iviewportdatasource',
    number: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number',
    RowNode: '/row-object/',
    string: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String',
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

    const propertiesFromFiles = sources.map(s => getJsonFromFile(nodes, pageName, s));

    if (section == null) {
        const properties = mergeObjects(propertiesFromFiles);

        return Object.entries(properties)
            .map(([key, value]) => <Section key={key} framework={framework} title={key} properties={value} config={config} />);
    }

    const keys = section.split('.');
    const processed = keys.reduce((current, key) => current.map(x => x[key]), propertiesFromFiles);
    const properties = mergeObjects(processed);

    return <Section
        framework={framework}
        title={keys[keys.length - 1]}
        properties={properties}
        config={{ ...config, isSubset: true }}
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

        rows.push(<Property key={name} framework={framework} id={id} name={name} definition={definition} />);

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

const Property = ({ framework, id, name, definition }) => {
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

    const type = definition.type || inferType(definition.default);
    const isFunction = !isObject && type != null && typeof type === 'object';
    const typeUrl = isObject ? `#reference-${id}.${name}` : getTypeUrl(type, framework);

    return <tr>
        <td className={styles['reference__expander-cell']} onClick={() => setExpanded(!isExpanded)} role="presentation">
            {isFunction && <div className={styles['reference__expander']}>
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
                    <span className={styles['reference__type']}>{isFunction ? 'Function' : type}</span>}
            </div>
        </td>
        <td>
            <div
                className={classnames(styles['reference__description'], { [styles['reference__description--expanded']]: isExpanded })}
                dangerouslySetInnerHTML={{ __html: description }}></div>
            {isObject && <div>See <a href={`#reference-${id}.${name}`}>{name}</a> for more details.</div>}
            {definition.default != null && <div>Default: <code>{formatJson(definition.default)}</code></div>}
            {definition.options != null &&
                <div>Options: {definition.options.map((o, i) => <>{i > 0 ? ', ' : ''}<code key={o}>{formatJson(o)}</code></>)}</div>}
            {typeof definition.type === 'object' &&
                <div className={isExpanded ? '' : 'd-none'}>
                    <FunctionCodeSample framework={framework} name={name} type={definition.type} />
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

const convertMarkdown = (content, framework) => content
    .replace(/`(.*?)`/g, '<code>$1</code>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, text, href) => `<a href="${convertUrl(href, framework)}">${text}</a>`)
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');

const createLinkedType = (type, url) =>
    `<a href="${url}" target="${url.startsWith('http') ? '_blank' : '_self'}" rel="noreferrer">${type}</a>`;

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
            type = Array.isArray(definition.default) ? 'any[]' : typeof definition.default;
        } else if (definition.description != null) {
            type = 'any';
        } else {
            type = getInterfaceName(key);
            isObject = true;
        }

        const typeUrl = isObject ? `#reference-${id}.${key}` : getTypeUrl(type, framework);

        line += `: ${typeUrl ? createLinkedType(type, typeUrl) : type};`;

        if (definition.default != null) {
            line += ` // default: ${formatJson(definition.default)}`;
        }

        lines.push(line);
    });

    while (indentationLevel > 0) {
        lines.push(`${getIndent(indentationLevel-- - 1)}}`);
    }

    return <Code code={lines.join('\n')} keepMarkup={true} />;
};

const getInterfaceName = name => `I${name.substr(0, 1).toUpperCase()}${name.substr(1)}`;

const FunctionCodeSample = ({ framework, name, type }) => {
    const args = type.parameters ? { params: type.parameters } : type.arguments;
    const { returnType } = type;
    const returnTypeIsObject = returnType != null && typeof returnType === 'object';
    const argumentDefinitions = [];
    let shouldUseNewline = false;

    Object.entries(args).forEach(([key, value]) => {
        const type = typeof value === 'object' ? getInterfaceName(key) : value;
        const typeUrl = getTypeUrl(type, framework);

        argumentDefinitions.push(`${key}: ${typeUrl ? createLinkedType(type, typeUrl) : type}`);

        if (argumentDefinitions.length > 1 || type.length > 20) {
            shouldUseNewline = true;
        }
    });

    const functionName = name.endsWith('()') ? name.replace('()', '') : '';
    const functionArguments = shouldUseNewline ?
        `\n    ${argumentDefinitions.join(',\n    ')}\n` :
        argumentDefinitions.join('');

    const returnTypeUrl = getTypeUrl(returnType, framework);

    const lines = [
        `function ${functionName}(${functionArguments}): ${returnTypeIsObject ? 'IReturn' : (returnTypeUrl ? createLinkedType(returnType, returnTypeUrl) : returnType || 'void')};`,
    ];

    Object.keys(args)
        .filter(key => typeof args[key] === 'object')
        .forEach(key => lines.push('', ...getInterfaceLines(framework, getInterfaceName(key), args[key])));

    if (returnTypeIsObject) {
        lines.push('', ...getInterfaceLines(framework, 'IReturn', returnType));
    }

    return <Code code={lines.join('\n')} className={styles['reference__code-sample']} keepMarkup={true} />;
};

const getInterfaceLines = (framework, name, definition) => {
    const lines = [`interface ${name} {`];

    Object.entries(definition).forEach(([property, type]) => {
        const typeUrl = getTypeUrl(type, framework);

        lines.push(`  ${property}: ${typeUrl ? createLinkedType(type, typeUrl) : type};`);
    });

    lines.push('}');

    return lines;
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
