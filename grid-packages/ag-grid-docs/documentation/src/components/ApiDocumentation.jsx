import React from 'react';
import ReactDOMServer from 'react-dom/server';
import { useJsonFileNodes } from './use-json-file-nodes';
import anchorIcon from 'images/anchor';
import styles from './ApiDocumentation.module.scss';
import Code from './Code';

export const ApiDocumentation = ({ pageName, source, sources, section, names = [], config = {} }) => {
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
            .map(([key, value]) => <Section key={key} title={key} properties={value} config={config} />);
    }

    const keys = section.split('.');
    const processed = keys.reduce((current, key) => current.map(x => x[key]), propertiesFromFiles);
    const properties = mergeObjects(processed);

    return <Section
        title={keys[keys.length - 1]}
        properties={properties}
        config={{ ...config, isSubset: true }}
        names={names} />;
};

const Section = ({ title, properties, config = {}, breadcrumbs = {}, names = [] }) => {
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
            {meta && meta.description && <p dangerouslySetInnerHTML={{ __html: generateCodeTags(meta.description) }}></p>}
            {meta && meta.page && <p>See <a href={meta.page.url}>{meta.page.name}</a> for more information.</p>}
            {config.showSnippets && names.length < 1 && <ObjectCodeSample breadcrumbs={breadcrumbs} properties={properties} />}
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

        let isRequired = false;
        let description = null;

        if (definition.description) {
            // process property object
            isRequired = !!definition.isRequired;
            description = generateCodeTags(definition.description);

            const { more } = definition;

            if (more != null && more.url) {
                description += ` See <a href="${more.url}">${more.name}</a>.`;
            }

            if (definition.default != null) {
                description += `<br />Default: <code>${formatJson(definition.default)}</code>`;
            }

            if (definition.options != null) {
                description += `<br />Options: <code>${definition.options.map(o => formatJson(o)).join('</code>, <code>')}</code>`;
            }

            if (typeof definition.type === 'object') {
                description += ReactDOMServer.renderToStaticMarkup(<FunctionCodeSample type={definition.type} />);
            }
        } else if (typeof definition === 'string') {
            // process simple property string
            description = definition;
        } else {
            // this must be the parent of a child object
            if (definition.meta != null && definition.meta.description != null) {
                description = generateCodeTags(definition.meta.description);

                if (definition.meta.description.indexOf('<br') >= 0) {
                    // if the description already has line breaks, add these for more space
                    description += '<br /><br />';
                } else {
                    description += ' ';
                }
            } else {
                description = '';
            }

            description += `See <a href="#reference-${id}.${name}">${name}</a> for more details about this configuration object.`;
            objectProperties[name] = definition;
        }

        rows.push(<tr key={name}>
            <td>
                <code dangerouslySetInnerHTML={{ __html: name }} className={styles['reference__name']}></code>
                {isRequired && <><br /><span className={styles['reference__required']}>Required</span></>}
            </td>
            <td dangerouslySetInnerHTML={{ __html: description }}></td>
            {definition.relevantTo && <td style={{ whiteSpace: 'nowrap' }}>{definition.relevantTo.join(', ')}</td>}
        </tr>);
    });

    return <>
        {header}
        <table>
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

const generateCodeTags = content => content.replace(/`(.*?)`/g, '<code>$1</code>');

const ObjectCodeSample = ({ breadcrumbs, properties }) => {
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
        if (!!definition.isRequired) {
            line += '?';
        }

        line += ': ';

        if (definition.meta && definition.meta.type != null) {
            line += definition.meta.type;
        } else if (definition.type != null) {
            line += typeof definition.type === 'object' ? 'Function' : definition.type;
        } else if (definition.options != null) {
            line += definition.options.map(option => formatJson(option)).join(' | ');
        } else if (definition.default != null) {
            line += Array.isArray(definition.default) ? 'any[]' : typeof definition.default;
        } else if (definition.description != null) {
            line += 'any';
        } else {
            line += `I${ucfirst(key)}`;
        }

        line += ';';

        if (definition.default != null) {
            line += ` // default: ${formatJson(definition.default)}`;
        }

        lines.push(line);
    });

    while (indentationLevel > 0) {
        lines.push(`${getIndent(indentationLevel-- - 1)}}`);
    }

    return <Code code={lines.join('\n')} />;
};

const FunctionCodeSample = ({ type }) => {
    const args = type.parameters ? { params: type.parameters } : type.arguments;
    const { returnType } = type;
    const returnTypeIsObject = typeof returnType === 'object';
    const argumentDefinitions = [];

    Object.entries(args).forEach(([key, value]) => {
        const type = typeof value === 'object' ? `I${ucfirst(key)}` : value;
        argumentDefinitions.push(`${key}: ${type}`);
    });

    const lines = [
        `function (${argumentDefinitions.join(',\n         ')}): ${returnTypeIsObject ? 'IReturn' : returnType};`,
    ];

    Object.keys(args)
        .filter(key => typeof args[key] === 'object')
        .forEach(key => lines.push('', ...getInterfaceLines(`I${ucfirst(key)}`, args[key])));

    if (returnTypeIsObject) {
        lines.push('', ...getInterfaceLines('IReturn', returnType));
    }

    return <Code code={lines.join('\n')} />;
};

const getInterfaceLines = (name, definition) => {
    const lines = [`interface ${name} {`];

    Object.entries(definition).forEach(([key, value]) => {
        lines.push(`  ${key}: ${value};`);
    });

    lines.push('}');

    return lines;
};

const ucfirst = value => value.substr(0, 1).toUpperCase() + value.substr(1);

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
