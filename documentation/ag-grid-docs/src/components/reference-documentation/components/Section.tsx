import type { Framework } from '@ag-grid-types';
import Code from '@ag-website-shared/components/code/Code';
import { Icon } from '@ag-website-shared/components/icon/Icon';
import { urlWithPrefix } from '@utils/urlWithPrefix';
import classnames from 'classnames';
import type { FunctionComponent, ReactElement } from 'react';
import React, { Fragment } from 'react';

import type { Config, ObjectCode, Properties, SectionProps } from '../types';
import { convertMarkdown, escapeGenericCode, getLinkedType } from '../utils/documentation-helpers';
import { formatJson, getInterfaceName } from '../utils/interface-helpers';
import styles from './ApiReference.module.scss';
import { Property } from './Property';

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

const ObjectCodeSample: React.FC<ObjectCode> = ({ framework, id, breadcrumbs = {}, properties }) => {
    const lines: string[] = [];
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

const SectionHeader = ({
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
    description?: string;
    page?: any;
    framework: Framework;
    breadcrumbs: Record<string, string>;
    displayName: string;
    headerLevel?: number;
    hideHeader?: boolean;
    showSnippets?: boolean;
    properties: Properties;
}) => {
    const breadcrumbKeys = Object.keys(breadcrumbs);
    const id = breadcrumbKeys.join('.');
    const headerTagLevel = headerLevel || breadcrumbKeys.length + 1;
    const HeaderTag = `h${headerTagLevel}` as any;
    const descriptionDisplay = convertMarkdown(description, framework);

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
            {descriptionDisplay && <p dangerouslySetInnerHTML={{ __html: descriptionDisplay }}></p>}
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

export const Section: FunctionComponent<SectionProps> = ({
    title,
    framework,
    names = [],
    properties,
    config = {} as Config,
    breadcrumbs = {},
    meta,
}) => {
    const showHeader = !config.isSubset;
    const displayName = meta?.displayName || title;
    const newBreadcrumbs = {
        [title]: displayName,
        ...breadcrumbs,
    };
    const breadcrumbKeys = Object.keys(newBreadcrumbs);
    const id = breadcrumbKeys.join('.');

    return (
        <div className={styles.apiReferenceOuter}>
            {showHeader && (
                <SectionHeader
                    description={meta?.description}
                    page={meta?.page}
                    framework={framework}
                    breadcrumbs={newBreadcrumbs}
                    displayName={displayName}
                    headerLevel={config.headerLevel}
                    hideHeader={config.hideHeader}
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
                    {Object.entries(properties).map(([name, { definition, gridOpProp, detailsCode, propertyType }]) => {
                        return (
                            <Property
                                key={name}
                                id={id}
                                name={name}
                                framework={framework}
                                definition={definition}
                                gridOpProp={gridOpProp}
                                detailsCode={detailsCode}
                                propertyType={propertyType}
                                config={config}
                            />
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};
