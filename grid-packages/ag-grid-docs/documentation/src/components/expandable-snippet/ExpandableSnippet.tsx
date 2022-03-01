import React, { Fragment, useState } from "react";
import classnames from 'classnames';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faMinus, faChevronCircleDown, faChevronCircleUp } from '@fortawesome/free-solid-svg-icons';

import { escapeGenericCode, formatJsDocString, convertMarkdown } from "../documentation-helpers";
import styles from "./ExpandableSnippet.module.scss";
import codeStyles from '../Code.module.scss';

import { buildModel, JsonModel, JsonProperty, JsonUnionType, loadLookups, JsonModelProperty, JsonObjectProperty, JsonPrimitiveProperty, JsonArray } from "./model";

const defaultJSONNodesExpanded = false;
const defaultDocumentationNodesExpanded = false;
const singleExpanderMode = true;

type Config = {
    includeDeprecated?: boolean,
    jsdocsMode?: 'jsdoc' | 'expandable'
};

export interface ExpandableSnippetParams {
    interfacename: string;
    overridesrc: string;
    breadcrumbs?: string[];
    config?: Config;
}

export const ExpandableSnippet: React.FC<ExpandableSnippetParams> = ({
    interfacename,
    overridesrc,
    breadcrumbs = [],
    config,
}) => {
    const { interfaceLookup, codeLookup } = loadLookups(overridesrc);

    const model = buildModel(interfacename, interfaceLookup, codeLookup, config);

    console.log(model);

    return (
        <div className={styles["expandable-snippet"]}>
            <pre className={classnames(codeStyles['code'], 'language-ts')}>
                <code className={'language-ts'}>
                    <BuildSnippet breadcrumbs={breadcrumbs} model={model} config={config}/>
                </code>
            </pre>
        </div>
    );
};

interface BuildSnippetParams {
    framework?: string;
    breadcrumbs?: string[];
    model: JsonModel;
    config: Config;
}

const BuildSnippet: React.FC<BuildSnippetParams> = ({
    model,
    breadcrumbs = [],
    config = {},
}) => {
    const { prefixLines, suffixLines } = buildObjectBreadcrumb(breadcrumbs);

    return (
        <Fragment>
            {prefixLines.length > 0 && prefixLines.join('\n')}
            <div className={styles['json-object']}>
                <ModelSnippet model={model} config={config}></ModelSnippet>
            </div>
            {suffixLines.length > 0 && suffixLines.join('\n')}
        </Fragment>
    );
};

interface ModelSnippetParams {
    model: JsonModel | JsonUnionType;
    skip?: string[];
    closeWith?: string;
    config: Config;
}

const ModelSnippet: React.FC<ModelSnippetParams> = ({
    model,
    skip = [],
    closeWith = ';',
    config = {},
}) => {
    if (model.type === "model") {
        return <Fragment>{
            Object.entries(model.properties)
                .map(([propName, propInfo]) => {
                    if (skip.includes(propName)) {
                        return;
                    }

                    const { desc } = propInfo;
                    return (
                        <PropertySnippet key={propName} propName={propName} desc={desc} meta={propInfo} config={config}/>
                    );
                })
                .filter(v => !!v)
        }</Fragment>;
    } else if (model.type === "union") {
        return (
            <Fragment>
                {renderUnion(model, closeWith, config)}
            </Fragment>
        );
    }

    return null;
}

function renderUnion(
    model: JsonUnionType,
    closeWith: string,
    config: Config,
) {
    const renderPrimitiveUnionOption = (opt: JsonPrimitiveProperty, idx: number, last: boolean) => 
        <Fragment key={idx}>
            {renderPrimitiveType(opt)}
            {!last && <span className={classnames('token', 'operator')}> | </span>}
            {last && closeWith && <span className={classnames('token', 'punctuation')}>{closeWith}</span>}
        </Fragment>;

    if (model.options.every((opt => opt.type === 'primitive'))) {
        const lastIdx = model.options.length - 1;
        return model.options.map((opt, idx) => {
            return opt.type === 'primitive' ? renderPrimitiveUnionOption(opt, idx, idx >= lastIdx) : null;
        });
    }

    return (
        <div className={styles["json-object-union"]}>
        {
            model.options
                .map((desc, idx) => {
                    const lastIdx = model.options.length - 1;
                    switch (desc.type) {
                        case "primitive":
                            return renderPrimitiveUnionOption(desc, idx, idx >= lastIdx);
                        case "array":
                            break;
                        case "nested-object":
                            return renderUnionNestedObject(desc, idx, idx >= lastIdx, closeWith, config);
                        }
                })
                .map(el => <div className={styles["json-union-item"]}>{el}</div>)
        }
        </div>
    );
}

function renderUnionNestedObject(
    desc: JsonObjectProperty,
    index: number,
    last: boolean,
    closeWith: string,
    config: Config,
) { 
    const [isExpanded, setExpanded] = useState(defaultJSONNodesExpanded);
    const discriminatorProp = "type";
    const discriminator = desc.model.properties[discriminatorProp];

    if (discriminator && discriminator.desc.type === "primitive") {
        const { tsType } = discriminator.desc;
        return (
            <Fragment key={tsType}>
                <span onClick={() => setExpanded(!isExpanded)} className={styles["expandable"]}>
                    <span className={classnames('token', 'punctuation')}>{'{ '}</span>
                    {renderPropertyDeclaration(discriminatorProp, discriminator, isExpanded, true, 'union-type-property')}
                    {renderPrimitiveType(discriminator.desc)}
                    <span className={classnames('token', 'punctuation')}>; </span>
                    {renderTsTypeComment(desc)}
                    {
                        isExpanded ?
                            <div className={classnames(styles['json-object'])} onClick={(e) => e.stopPropagation()}>
                                <ModelSnippet model={desc.model} skip={[discriminatorProp]} config={config}></ModelSnippet>
                            </div> :
                            <span className={classnames('token', 'operator')}> ... </span>
                    }
                    <span className={classnames('token', 'punctuation')}>{' }'}</span>
                    {!last && <span className={classnames('token', 'operator')}> | <br/></span>}
                    {last && closeWith && <span className={classnames('token', 'punctuation')}>{closeWith}</span>}
                </span>
            </Fragment>
        );
    }

    return (
        <Fragment key={index}>
            <span onClick={() => setExpanded(!isExpanded)} className={styles["expandable"]}>
                <span className={classnames('token', 'punctuation', styles['union-type-object'])}>
                    {renderJsonNodeExpander(isExpanded)}
                    {'{ '}
                </span>
                {renderTsTypeComment(desc)}
                {
                    isExpanded ?
                        <div className={classnames(styles['json-object'], styles['unexpandable'])} onClick={(e) => e.stopPropagation()}>
                            <ModelSnippet model={desc.model} config={config}></ModelSnippet>
                        </div> :
                        <span className={classnames('token', 'operator')}> ... </span>
                }
                <span className={classnames('token', 'punctuation')}>{'}'}</span>
                {!last && <span className={classnames('token', 'operator')}> | <br/></span>}
                {last && closeWith && <span className={classnames('token', 'punctuation')}>{closeWith}</span>}
            </span>
        </Fragment>
    );
}

interface PropertySnippetParams {
    propName: string;
    desc: JsonProperty;
    meta: Omit<JsonModel['properties'][number], 'desc'>;
    config: Config;
}

const PropertySnippet: React.FC<PropertySnippetParams> = ({
    propName,
    desc,
    meta,
    config,
}) => {
    const [isJSONNodeExpanded, setJSONNodeExpanded] = useState(defaultJSONNodesExpanded);
    const [isDocumentationExpanded, setDocumentationExpanded] = useState(defaultDocumentationNodesExpanded);

    const { deprecated } = meta;
    const jsdocsMode = config.jsdocsMode || 'jsdoc';
    const formattedDocumentation = formatDocumentation(meta, config);

    let propertyRendering;
    let collapsePropertyRendering;
    let needsClosingSemi = true;
    switch (desc.type) {
        case "primitive":
            propertyRendering = renderPrimitiveType(desc);
            break;
        case "array":
            propertyRendering = renderArrayType(desc, isDocumentationExpanded, meta, config);
            collapsePropertyRendering = desc.elements.type !== 'primitive' && (
                <Fragment>
                    <span className={classnames('token', 'punctuation')}>{"[".repeat(desc.depth)}</span>
                    <span className={classnames('token', 'operator')}> ... </span>
                    <span className={classnames('token', 'punctuation')}>{"]".repeat(desc.depth)}</span>
                </Fragment>
            );
            break;
        case "nested-object":
            propertyRendering = renderNestedObject(desc, isDocumentationExpanded, meta, config);
            collapsePropertyRendering = renderCollapsedNestedObject(desc);
            break;
        case "union":
            const simpleUnion = isSimpleUnion(desc);
            propertyRendering = <ModelSnippet model={desc} config={config}></ModelSnippet>;
            collapsePropertyRendering = !simpleUnion ?
                <span className={classnames('token', 'type')}>{desc.tsType}</span> :
                null;
            needsClosingSemi = simpleUnion;
            break;
        default:
            console.warn(`AG Docs - unhandled sub-type: ${desc["type"]}`);
    }

    let expandable = !!collapsePropertyRendering || (singleExpanderMode && formattedDocumentation.length > 0);
    const toggleAll = () => {
        setJSONNodeExpanded(!isJSONNodeExpanded);
        setDocumentationExpanded(!isDocumentationExpanded);
    };
    return (
        <div
            className={classnames(
                expandable && styles["expandable"],
                styles['json-property'],
                deprecated && styles['deprecated'],
                styles['json-property-type-' + desc.type]
            )}
            onClick={() => expandable ? toggleAll() : null}
        >
            {
                jsdocsMode === 'jsdoc' &&
                <div
                    className={classnames('token', 'comment', styles['jsdoc'])}
                    dangerouslySetInnerHTML={{ __html: convertMarkdown(formattedDocumentation.join('\n')) }}
                >
                </div>
            }
            {renderPropertyDeclaration(propName, meta, isJSONNodeExpanded, expandable)}
            {
                !isJSONNodeExpanded && collapsePropertyRendering ? 
                    collapsePropertyRendering : 
                    <span className={classnames(styles['unexpandable'])} onClick={(e) => e.stopPropagation()}>{propertyRendering}</span>
            }
            {(!isJSONNodeExpanded || needsClosingSemi) && <span className={classnames('token', 'punctuation')}>; </span>}
            { maybeRenderDocumentationExpander(jsdocsMode, formattedDocumentation, setDocumentationExpanded, isDocumentationExpanded) }
            { maybeRenderDocumentation(meta, isDocumentationExpanded, config) }
        </div>
    );
};

function maybeRenderDocumentation(meta: Omit<JsonModel['properties'][number], 'desc'>, isDocumentationExpanded: boolean, config: Config): React.ReactNode {
    const jsdocsMode = config.jsdocsMode || 'jsdoc';

    const formattedDocumentation = formatDocumentation(meta, config);
    if (formattedDocumentation.length === 0) { return; }

    const renderedDocs = convertMarkdown(formattedDocumentation.join('\n'));
    if (renderedDocs.trim().length === 0) { return };

    return (
        <Fragment>
            {jsdocsMode === 'jsdoc' && renderPropertyDefault(meta)}
            {
                jsdocsMode !== 'jsdoc' && isDocumentationExpanded &&
                    <div className={classnames('token', 'comment', styles['jsdoc-expandable'])} dangerouslySetInnerHTML={{ __html: convertMarkdown(formattedDocumentation.join('\n')) }}>
                    </div>
            }
        </Fragment>
    );
}

function maybeRenderDocumentationExpander(jsdocsMode: string, formattedDocumentation: string[], setDocumentationExpanded: React.Dispatch<React.SetStateAction<boolean>>, isDocumentationExpanded: boolean): React.ReactNode {
    if (formattedDocumentation.length === 0 || defaultDocumentationNodesExpanded || singleExpanderMode) { return; }

    return jsdocsMode === 'expandable' && formattedDocumentation.length > 0 &&
        <span onClick={(e) => { setDocumentationExpanded(!isDocumentationExpanded); e.stopPropagation(); } } className={classnames(styles['documentation-expander'])}>
            {renderDocumentationExpander(isDocumentationExpanded)}
        </span>;
}

function renderTsTypeComment(desc: { tsType: string }) {
    return <span className={classnames('token', 'comment')}>/* {desc.tsType} */</span>;
}

function renderJsonNodeExpander(isExpanded: boolean) {
    return (
        <FontAwesomeIcon
            icon={isExpanded ? faMinus : faPlus}
            className={classnames(
                styles['expander'],
            )}
        />
    );
}

function renderDocumentationExpander(isExpanded: boolean) {
    return (
        <FontAwesomeIcon
            icon={isExpanded ? faChevronCircleUp : faChevronCircleDown}
            className={classnames(
                styles['documentation-expander'],
            )}
        />
    );
}

function renderPropertyDeclaration(
    propName: string,
    propDesc: { required: boolean },
    isExpanded: boolean,
    expandable: boolean,
    style = 'property-name',
) {
    const { required } = propDesc;
    return (
        <Fragment>
            <span className={classnames('token', 'name', styles[style])}>
                {expandable && renderJsonNodeExpander(isExpanded)}
                {propName}
            </span>
            {!required && <span className={classnames('token', 'operator')}>?</span>}
            <span className={classnames('token', 'operator')}>: </span>
        </Fragment>
    );
}

function renderPropertyDefault(
    meta: { default?: any },
) {
    return (
        <Fragment>
            {meta.default != null &&
                <span className={classnames('token', 'comment')}>// Default: {JSON.stringify(meta.default)}</span>}
        </Fragment>
    )
}

function renderPrimitiveType(desc: JsonPrimitiveProperty) {
    if (desc.aliasType) {
        return (
            <Fragment>
                <span className={classnames('token', 'comment')}>/* {desc.aliasType} */</span>
                <span className={classnames('token', 'builtin')}>{desc.tsType}</span>
            </Fragment>
        );
    }

    return <span className={classnames('token', 'builtin')}>{desc.tsType}</span>;
}

function renderNestedObject(
    desc: JsonObjectProperty,
    isDocumentationExpanded: boolean,
    meta: Omit<JsonModel['properties'][number], 'desc'>,
    config: Config,
) {
    return (
        <Fragment>
            <span className={classnames('token', 'punctuation')}>{'{ '}</span>
            {renderTsTypeComment(desc)}
            {maybeRenderDocumentation(meta, isDocumentationExpanded, config)}
            <div className={classnames(styles['json-object'])}>
                <ModelSnippet model={desc.model} config={config}></ModelSnippet>
            </div>
            <span className={classnames('token', 'punctuation')}>}</span>
        </Fragment>    
    );
}

function renderCollapsedNestedObject(desc: JsonObjectProperty) {
    return (
        <Fragment>
            <span className={classnames('token', 'punctuation')}>{'{ '}</span>
            {renderTsTypeComment(desc)}
            <span className={classnames('token', 'operator')}> ... </span>
            <span className={classnames('token', 'punctuation')}>}</span>
        </Fragment>
    )    
}

function renderArrayType(
    desc: JsonArray,
    isDocumentationExpanded: boolean,
    meta: Omit<JsonModel['properties'][number], 'desc'>,
    config: Config,
) {
    let arrayElementRendering;
    let arrayBracketsSurround = true;

    switch (desc.elements.type) {
        case "primitive":
            arrayBracketsSurround = false;
            arrayElementRendering = <span className={classnames('token', 'builtin')}>{desc.elements.tsType}</span>;
            break;
        case "nested-object":
            arrayElementRendering = (
                <Fragment>
                    {maybeRenderDocumentation(meta, isDocumentationExpanded, config)}
                    <span className={classnames('token', 'punctuation')}>{'{ '}</span>
                    <span className={classnames('token', 'comment')}>/* {desc.elements.tsType} */</span>
                    <div className={styles["json-object"]}>
                        <ModelSnippet model={desc.elements.model} config={config}></ModelSnippet>
                    </div>
                    <span className={classnames('token', 'punctuation')}>}</span>
                </Fragment>
            );
            break;
        case "union":
            arrayElementRendering = (
                <Fragment>
                    {maybeRenderDocumentation(meta, isDocumentationExpanded, config)}
                    <ModelSnippet model={desc.elements} closeWith={''} config={config}></ModelSnippet>
                </Fragment>
            );
            break;
        default:
            console.warn(`AG Docs - unhandled ub-type: ${desc["type"]}`);
    }

    return (
        <Fragment>
            {arrayBracketsSurround && <span className={classnames('token', 'punctuation')}>{"[".repeat(desc.depth)}</span>}
            {arrayElementRendering}
            {arrayBracketsSurround && <span className={classnames('token', 'punctuation')}>{"]".repeat(desc.depth)}</span>}
            {!arrayBracketsSurround && <span className={classnames('token', 'punctuation')}>{"[]".repeat(desc.depth)}</span>}
        </Fragment>
    );
}

function isSimpleUnion(desc: JsonUnionType) {
    return desc.options.every(opt => opt.type === 'primitive');
}

function formatDocumentation(meta: Omit<JsonModel['properties'][number], 'desc'>, config: Config): string[] {
    const { documentation } = meta;
    const defaultValue = meta.default;
    const jsdocsMode = config.jsdocsMode || 'jsdoc';
    const result: string[] = documentation?.trim() ? 
        jsdocsMode === 'jsdoc' ? [ documentation ] :
        [ formatJsDocString(documentation) ] :
        [];

    if (defaultValue && jsdocsMode !== 'jsdoc') {
        result.push('Default: `' + JSON.stringify(defaultValue) + '`');
    }
    
    return result;
}

export function buildObjectIndent(level: number): string {
    return "  ".repeat(level);
}

export function buildObjectBreadcrumb(
    breadcrumbs: string[]
): { prefixLines: string[]; suffixLines: string[]; indentationLevel: number } {
    const prefixLines = [];
    const suffixLines = [];
    let indentationLevel = 0;

    breadcrumbs.forEach(key => {
        const indent = buildObjectIndent(indentationLevel);

        if (indentationLevel > 0) {
            prefixLines.push(`${indent}...`);
        }

        prefixLines.push(`${indent}${key}: {`);
        suffixLines.push(`${indent}}`);

        indentationLevel++;
    });

    return {
        prefixLines,
        suffixLines,
        indentationLevel,
    };
}
