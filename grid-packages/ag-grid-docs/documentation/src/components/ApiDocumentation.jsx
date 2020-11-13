import React from 'react';
import ReactDOMServer from 'react-dom/server';
import { useStaticQuery, graphql } from 'gatsby';
import Prism from 'prismjs';
import styles from './api-documentation.module.scss';

export const ApiDocumentation = ({ pageName, source, sources, section, names = [], config = {} }) => {
    const { allFile: { nodes } } = useStaticQuery(graphql`
    {
        allFile(filter: { sourceInstanceName: { eq: "pages" }, relativePath: { regex: "/json$/" } }) {
            nodes {
                relativePath
                fields {
                    content
                }
            }
        }
    }
    `);

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

    // We use a plugin (gatsby-remark-autolink-headers) to insert links for all the headings in Markdown
    // We manually add the element here ourselves to match
    const anchorIcon = <svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="link" className="svg-inline--fa fa-link" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="currentColor" d="M326.612 185.391c59.747 59.809 58.927 155.698.36 214.59-.11.12-.24.25-.36.37l-67.2 67.2c-59.27 59.27-155.699 59.262-214.96 0-59.27-59.26-59.27-155.7 0-214.96l37.106-37.106c9.84-9.84 26.786-3.3 27.294 10.606.648 17.722 3.826 35.527 9.69 52.721 1.986 5.822.567 12.262-3.783 16.612l-13.087 13.087c-28.026 28.026-28.905 73.66-1.155 101.96 28.024 28.579 74.086 28.749 102.325.51l67.2-67.19c28.191-28.191 28.073-73.757 0-101.83-3.701-3.694-7.429-6.564-10.341-8.569a16.037 16.037 0 0 1-6.947-12.606c-.396-10.567 3.348-21.456 11.698-29.806l21.054-21.055c5.521-5.521 14.182-6.199 20.584-1.731a152.482 152.482 0 0 1 20.522 17.197zM467.547 44.449c-59.261-59.262-155.69-59.27-214.96 0l-67.2 67.2c-.12.12-.25.25-.36.37-58.566 58.892-59.387 154.781.36 214.59a152.454 152.454 0 0 0 20.521 17.196c6.402 4.468 15.064 3.789 20.584-1.731l21.054-21.055c8.35-8.35 12.094-19.239 11.698-29.806a16.037 16.037 0 0 0-6.947-12.606c-2.912-2.005-6.64-4.875-10.341-8.569-28.073-28.073-28.191-73.639 0-101.83l67.2-67.19c28.239-28.239 74.3-28.069 102.325.51 27.75 28.3 26.872 73.934-1.155 101.96l-13.087 13.087c-4.35 4.35-5.769 10.79-3.783 16.612 5.864 17.194 9.042 34.999 9.69 52.721.509 13.906 17.454 20.446 27.294 10.606l37.106-37.106c59.271-59.259 59.271-155.699.001-214.959z"></path></svg>;

    let header = null;

    if (!config.isSubset) {
        const headerLevel = breadcrumbKeys.length + 1;
        const HeaderTag = `h${headerLevel}`;

        header = <>
            <HeaderTag id={`reference-${id}`} style={{ position: 'relative' }}>
                <a href={`#reference-${id}`} className="anchor before">{anchorIcon}</a>
                {displayName}
            </HeaderTag>
            <Breadcrumbs breadcrumbs={breadcrumbs} />
            {meta && meta.description && <p dangerouslySetInnerHTML={{ __html: generateCodeTags(meta.description) }}></p>}
            {meta && meta.page && <p>See <a href={meta.page.url}>${meta.page.name}</a> for more information.</p>}
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
                <span className={styles.reference__name}><code dangerouslySetInnerHTML={{ __html: name }}></code></span>
                {isRequired && <><br /><span className={styles.reference__required}>Required</span></>}
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
            links.push(<><a href={`#${href}`} title={text}>{key}</a> &gt; </>);
        } else {
            links.push(key);
        }

        index++;
    });

    return <div className={styles.breadcrumbs}>{links}</div>;
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

    return <CodeSnippet code={lines.join('\n')} />;
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

    return <CodeSnippet code={lines.join('\n')} />;
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
        return JSON.parse(json.fields.content);
    }

    throw new Error(`Could not find JSON for source ${source}`);
};

const mergeObjects = objects => {
    return objects.reduce((result, value) => Object.assign(result, value), {});
};

const formatJson = value => JSON.stringify(value, undefined, 2)
    .replace(/\[(.*?)\]/sg, (_, match) => `[${match.trim().replace(/,\s+/sg, ', ')}]`) // remove carriage returns from arrays
    .replace(/"/g, "'"); // use single quotes

const CodeSnippet = ({ code }) => <pre className="language-ts">
    <code dangerouslySetInnerHTML={{ __html: Prism.highlight(code, Prism.languages.typescript) }}></code>
</pre>;