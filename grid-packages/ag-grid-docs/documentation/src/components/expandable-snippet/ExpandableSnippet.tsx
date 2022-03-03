import React, { Fragment, useState } from "react";
import classnames from 'classnames';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faMinus, faChevronCircleDown, faChevronCircleUp } from '@fortawesome/free-solid-svg-icons';

import { formatJsDocString, convertMarkdown } from "../documentation-helpers";
import styles from "./ExpandableSnippet.module.scss";
import codeStyles from '../Code.module.scss';

import { buildModel, JsonModel, JsonProperty, JsonUnionType, loadLookups, JsonModelProperty, JsonObjectProperty, JsonPrimitiveProperty, JsonArray } from "./model";

const DEFAULT_JSON_NODES_EXPANDED = false;

type Config = {
    includeDeprecated?: boolean,
    excludeProperties?: string[],
    expandedProperties?: string[],
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

    // console.log(model);

    return (
        <div className={styles["expandable-snippet"]} role="presentation">
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
    return renderObjectBreadcrumb(breadcrumbs, () => <Fragment>
        <div className={styles['json-object']} role="presentation">
            <ModelSnippet model={model} config={config}></ModelSnippet>
        </div>
    </Fragment>);
};

interface ModelSnippetParams {
    model: JsonModel | JsonUnionType;
    skip?: string[];
    closeWith?: string;
    config: Config;
}

const ModelSnippet: React.FC<ModelSnippetParams> = ({
    model,
    closeWith = ';',
    config = {},
}) => {
    if (model.type === "model") {
        const propertiesRendering = Object.entries(model.properties)
            .map(([propName, propInfo]) => {
                if (config.excludeProperties?.includes(propName)) {
                    return;
                }

                const { desc } = propInfo;
                return (
                    <PropertySnippet key={propName} propName={propName} desc={desc} meta={propInfo} config={config}/>
                );
            })
            .filter(v => !!v);
        return <Fragment>
            {maybeRenderModelDocumentation(model, config)}
            {propertiesRendering}
        </Fragment>;
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
        <div className={styles["json-object-union"]} role="presentation">
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
                .map(el => <div className={classnames(styles["json-union-item"])}>{el}</div>)
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
    const [isExpanded, setExpanded] = useState(DEFAULT_JSON_NODES_EXPANDED);
    const discriminatorProp = "type";
    const discriminator = desc.model.properties[discriminatorProp];

    if (discriminator && discriminator.desc.type === "primitive") {
        const { tsType } = discriminator.desc;
        return (
            <Fragment key={tsType}>
                <span onClick={() => setExpanded(!isExpanded)} className={styles["expandable"]}>
                    <span className={classnames('token', 'punctuation', styles['union-type-object'])}>
                        {isExpanded && renderJsonNodeExpander(isExpanded)}
                        {' { '}
                    </span>
                    {!isExpanded && renderPropertyDeclaration(discriminatorProp, tsType, discriminator, isExpanded, true, 'union-type-property')}
                    {!isExpanded && <span className={classnames('token', 'punctuation')}>; </span>}
                    {
                        isExpanded ?
                            <div className={classnames(styles['json-object'])} onClick={(e) => e.stopPropagation()} role="presentation">
                                <ModelSnippet model={desc.model} config={config}></ModelSnippet>
                            </div> :
                            <span className={classnames('token', 'operator')}> ... </span>
                    }
                    <span className={classnames('token', 'punctuation')}>{' }: '}</span>
                    <span className={classnames('token', 'builtin')}>{desc.tsType}</span>
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
                    {' {'}
                </span>
                {
                    isExpanded ?
                        <div className={classnames(styles['json-object'], styles['unexpandable'])} onClick={(e) => e.stopPropagation()} role="presentation">
                            <ModelSnippet model={desc.model} config={config}></ModelSnippet>
                        </div> :
                        <span className={classnames('token', 'operator')}> ... </span>
                }
                <span className={classnames('token', 'punctuation')}>{'}: '}</span>
                <span className={classnames('token', 'builtin')}>{desc.tsType}</span>
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
    const expandedInitially = config.expandedProperties?.includes(propName) ?? DEFAULT_JSON_NODES_EXPANDED;
    const [isJSONNodeExpanded, setJSONNodeExpanded] = useState(expandedInitially);

    const { deprecated } = meta;
    const { tsType } = desc;
    const formattedDocumentation = formatPropertyDocumentation(meta, config);

    let propertyRendering;
    let collapsePropertyRendering;
    let needsClosingSemi = true;
    switch (desc.type) {
        case "primitive":
            propertyRendering = null;
            break;
        case "array":
            propertyRendering = renderArrayType(desc, meta, config);
            collapsePropertyRendering = desc.elements.type !== 'primitive' && (
                <Fragment>
                    <span className={classnames('token', 'punctuation')}> {"[".repeat(desc.depth)}</span>
                    <span className={classnames('token', 'operator')}> ... </span>
                    <span className={classnames('token', 'punctuation')}>{"]".repeat(desc.depth)}</span>
                </Fragment>
            );
            break;
        case "nested-object":
            propertyRendering = renderNestedObject(desc, meta, config);
            collapsePropertyRendering = renderCollapsedNestedObject(desc);
            break;
        case "union":
            const simpleUnion = isSimpleUnion(desc);
            propertyRendering = !simpleUnion ? <ModelSnippet model={desc} config={config}></ModelSnippet> : null;
            collapsePropertyRendering = !simpleUnion ?
                <Fragment></Fragment> :
                null;
            needsClosingSemi = simpleUnion;
            break;
        default:
            console.warn(`AG Docs - unhandled sub-type: ${desc["type"]}`);
    }

    let expandable = !!collapsePropertyRendering || (formattedDocumentation.length > 0);
    let inlineDocumentation = !collapsePropertyRendering;
    return (
        <div
            className={classnames(
                expandable && styles["expandable"],
                styles['json-property'],
                deprecated && styles['deprecated'],
                styles['json-property-type-' + desc.type]
            )}
            onClick={() => expandable ? setJSONNodeExpanded(!isJSONNodeExpanded) : null}
            role="presentation"
        >
            {renderPropertyDeclaration(propName, tsType, meta, isJSONNodeExpanded, expandable)}
            {
                !isJSONNodeExpanded && collapsePropertyRendering ? 
                    collapsePropertyRendering : 
                    <span className={classnames(styles['unexpandable'])} onClick={(e) => e.stopPropagation()}>{propertyRendering}</span>
            }
            {(!isJSONNodeExpanded || needsClosingSemi) && <span className={classnames('token', 'punctuation')}>; </span>}
            {maybeRenderPropertyDocumentation(meta, inlineDocumentation && isJSONNodeExpanded, config)}
        </div>
    );
};

function maybeRenderPropertyDocumentation(
    meta: Omit<JsonModel['properties'][number], 'desc'>,
    isDocumentationExpanded: boolean,
    config: Config,
): React.ReactNode {
    if (!isDocumentationExpanded) { return; }

    const formattedDocumentation = formatPropertyDocumentation(meta, config);
    if (formattedDocumentation.length === 0) { return; }

    const renderedDocs = convertMarkdown(formattedDocumentation.join('\n'));
    if (renderedDocs.trim().length === 0) { return };

    return (
        <Fragment>
            <div
                className={classnames('token', 'comment', styles['jsdoc-expandable'])}
                dangerouslySetInnerHTML={{ __html: convertMarkdown(formattedDocumentation.join('\n')) }}
                role="presentation"                
            >
            </div>
        </Fragment>
    );
}

function maybeRenderModelDocumentation(
    model: JsonModel,
    config: Config,
): React.ReactNode {
    const formattedDocumentation = formatModelDocumentation(model, config);
    if (formattedDocumentation.length === 0) { return; }

    const renderedDocs = convertMarkdown(formattedDocumentation.join('\n'));
    if (renderedDocs.trim().length === 0) { return };

    return (
        <Fragment>
            <div
                className={classnames('token', 'comment', styles['jsdoc-expandable'])}
                dangerouslySetInnerHTML={{ __html: convertMarkdown(formattedDocumentation.join('\n')) }}
                role="presentation"
            >
            </div>
        </Fragment>
    );
}

function renderJsonNodeExpander(isExpanded: boolean) {
    return (
        <FontAwesomeIcon
            icon={isExpanded ? faMinus : faPlus}
            className={classnames(
                styles['expander'],
            )}
            role="button"
        />
    );
}

function renderPropertyDeclaration(
    propName: string,
    tsType: string,
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
            {tsType && <span className={classnames('token', 'builtin')}>{tsType}</span>}
        </Fragment>
    );
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
    meta: Omit<JsonModel['properties'][number], 'desc'>,
    config: Config,
) {
    return (
        <Fragment>
            <span className={classnames('token', 'punctuation')}>{' { '}</span>
            {maybeRenderPropertyDocumentation(meta, true, config)}
            <div className={classnames(styles['json-object'])} role="presentation">
                <ModelSnippet model={desc.model} config={config}></ModelSnippet>
            </div>
            <span className={classnames('token', 'punctuation')}>}</span>
        </Fragment>    
    );
}

function renderCollapsedNestedObject(desc: JsonObjectProperty) {
    return (
        <Fragment>
            <span className={classnames('token', 'punctuation')}>{' {'}</span>
            <span className={classnames('token', 'operator')}> ... </span>
            <span className={classnames('token', 'punctuation')}>}</span>
        </Fragment>
    )    
}

function renderArrayType(
    desc: JsonArray,
    meta: Omit<JsonModel['properties'][number], 'desc'>,
    config: Config,
) {
    let arrayElementRendering;
    let arrayBracketMode = 'surround';

    switch (desc.elements.type) {
        case "primitive":
            arrayBracketMode = 'none';
            arrayElementRendering = null;
            break;
        case "nested-object":
            arrayElementRendering = (
                <Fragment>
                    {maybeRenderPropertyDocumentation(meta, true, config)}
                    <span className={classnames('token', 'punctuation')}>{'{ '}</span>
                    <div className={styles["json-object"]} role="presentation">
                        <ModelSnippet model={desc.elements.model} config={config}></ModelSnippet>
                    </div>
                    <span className={classnames('token', 'punctuation')}>}</span>
                </Fragment>
            );
            break;
        case "union":
            arrayElementRendering = (
                <Fragment>
                    {maybeRenderPropertyDocumentation(meta, true, config)}
                    <ModelSnippet model={desc.elements} closeWith={''} config={config}></ModelSnippet>
                </Fragment>
            );
            break;
        default:
            console.warn(`AG Docs - unhandled ub-type: ${desc["type"]}`);
    }

    return (
        <Fragment>
            {arrayBracketMode === 'surround' && <span className={classnames('token', 'punctuation')}> {"[".repeat(desc.depth)}</span>}
            {arrayElementRendering}
            {arrayBracketMode === 'surround' && <span className={classnames('token', 'punctuation')}>{"]".repeat(desc.depth)}</span>}
            {arrayBracketMode === 'after' && <span className={classnames('token', 'punctuation')}>{"[]".repeat(desc.depth)}</span>}
        </Fragment>
    );
}

function isSimpleUnion(desc: JsonUnionType) {
    return desc.options.every(opt => opt.type === 'primitive');
}

function formatPropertyDocumentation(meta: Omit<JsonModel['properties'][number], 'desc'>, config: Config): string[] {
    const { documentation } = meta;
    const defaultValue = meta.default;
    const result: string[] = documentation?.trim() ? 
        [ formatJsDocString(documentation) ] :
        [];

    if (defaultValue) {
        result.push('Default: `' + JSON.stringify(defaultValue) + '`');
    }
    
    return result;
}

function formatModelDocumentation(model: JsonModel, config: Config) {
    const { documentation } = model;
    const result: string[] = documentation?.trim() ? 
        [ formatJsDocString(documentation) ] :
        [];

    return result;    
}

export function buildObjectIndent(level: number): string {
    return "  ".repeat(level);
}

export function renderObjectBreadcrumb(
    breadcrumbs: string[],
    bodyContent: () => any,
) {
    return (
        <Fragment>
            {
                breadcrumbs.length > 0 && (
                    <Fragment>
                        <div role="presentation">{breadcrumbs[0]}: {'{'}</div>
                    </Fragment>
                )
            }
            {
                breadcrumbs.length > 1 ?
                    <div className={styles['json-object']} role="presentation">
                        <div role="presentation">...</div>
                        {renderObjectBreadcrumb(breadcrumbs.slice(1), bodyContent)}
                    </div> :
                    bodyContent()
            }
            {
                breadcrumbs.length > 0 &&
                    <div>{'}'}</div>
            }
        </Fragment>
    );
}
