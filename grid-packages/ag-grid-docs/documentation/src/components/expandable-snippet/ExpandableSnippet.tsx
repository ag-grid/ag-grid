import React, { Fragment, useState } from "react";
import classnames from 'classnames';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronRight } from '@fortawesome/free-solid-svg-icons';

import {convertMarkdown, formatJsDocString} from "../documentation-helpers";
import styles from "./ExpandableSnippet.module.scss";
import codeStyles from '../Code.module.scss';

import {
    buildModel,
    JsonArray,
    JsonFunction,
    JsonModel,
    JsonObjectProperty,
    JsonPrimitiveProperty,
    JsonProperty,
    JsonUnionType,
    loadLookups
} from "./model";

const DEFAULT_JSON_NODES_EXPANDED = false;

type Config = {
    includeDeprecated?: boolean,
    excludeProperties?: string[],
    expandedProperties?: string[],
    expandedPaths?: string[],
    expandAll?: boolean,
    lookupRoot?: string;
};

export interface ExpandableSnippetParams {
    interfacename: string;
    overridesrc?: string;
    breadcrumbs?: string[];
    config?: Config;
}

export const ExpandableSnippet: React.FC<ExpandableSnippetParams> = ({
    interfacename,
    overridesrc,
    breadcrumbs = [],
    config = {},
}) => {
    const {lookupRoot = 'grid-api'}: { lookupRoot: string } = config as any;
    const { interfaceLookup, codeLookup } = loadLookups(lookupRoot, overridesrc);

    const model = buildModel(interfacename, interfaceLookup, codeLookup, config);

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
        <FontAwesomeIcon icon={faChevronRight} className={styles['node-expander']} symbol="node-expander" />
        <div className={styles['json-object']} role="presentation">
            <ModelSnippet model={model} config={config} path={[]}></ModelSnippet>
        </div>
    </Fragment>);
};

interface ModelSnippetParams {
    model: JsonModel | JsonUnionType;
    skip?: string[];
    closeWith?: string;
    path: string[];
    config: Config;
}

const ModelSnippet: React.FC<ModelSnippetParams> = ({
    model,
    closeWith = ';',
    path,
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
                    <PropertySnippet key={propName} propName={propName} desc={desc} meta={propInfo} path={path} config={config}/>
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
                {renderUnion(model, closeWith, path, config)}
            </Fragment>
        );
    }

    return null;
}

function renderUnion(
    model: JsonUnionType,
    closeWith: string,
    path: string[],
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
                            return renderUnionNestedObject(desc, idx, idx >= lastIdx, closeWith, path, config);
                    }
                })
                .map((el, idx) => <div key={idx} className={classnames(styles["json-union-item"])}>{el}</div>)
        }
        </div>
    );
}

function renderUnionNestedObject(
    desc: JsonObjectProperty,
    index: number,
    last: boolean,
    closeWith: string,
    path: string[],
    config: Config,
) {
    const discriminatorProp = "type";
    const discriminator = desc.model.properties[discriminatorProp];
    const discriminatorType = discriminator && discriminator.desc.type === "primitive" ?
        discriminator.desc.tsType :
        null;
    const unionPath = path.concat(`[${discriminatorType || index}]`);
    const expandedInitially = isExpandedInitially(discriminatorType || String(index), unionPath, config);
    const [isExpanded, setExpanded] = useState(expandedInitially);

    if (discriminatorType) {
        return (
            <Fragment key={discriminatorType}>
                <span onClick={() => setExpanded(!isExpanded)} className={styles["expandable"]}>
                    {isExpanded && <div className={classnames(styles['expander-bar'])}></div>}
                    <span className={classnames('token', 'punctuation', styles['union-type-object'])}>
                        {isExpanded && renderJsonNodeExpander(isExpanded)}
                        {' { '}
                    </span>
                    {!isExpanded && renderPropertyDeclaration(discriminatorProp, discriminatorType, discriminator, isExpanded, true, 'union-type-property')}
                    {!isExpanded && <span className={classnames('token', 'punctuation')}>; </span>}
                    {
                        isExpanded ?
                            <div className={classnames(styles['json-object'])} onClick={(e) => e.stopPropagation()} role="presentation">
                                <ModelSnippet model={desc.model} config={config} path={unionPath}></ModelSnippet>
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
                {isExpanded && <div className={classnames(styles['expander-bar'])}></div>}
                <span className={classnames('token', 'punctuation', styles['union-type-object'])}>
                    {renderJsonNodeExpander(isExpanded)}
                    {' {'}
                </span>
                {
                    isExpanded ?
                        <div className={classnames(styles['json-object'], styles['unexpandable'])} onClick={(e) => e.stopPropagation()} role="presentation">
                            <ModelSnippet model={desc.model} config={config} path={unionPath}></ModelSnippet>
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
    forceInitiallyExpanded?: boolean,
    needsClosingSemi?: boolean,
    path: string[],
    config: Config;
}

const PropertySnippet: React.FC<PropertySnippetParams> = ({
    propName,
    desc,
    meta,
    forceInitiallyExpanded,
    needsClosingSemi = true,
    path,
    config,
}) => {
    const propPath = path.concat(propName);
    const expandedInitially = forceInitiallyExpanded || isExpandedInitially(propName, propPath, config);
    const [isJSONNodeExpanded, setJSONNodeExpanded] = useState(expandedInitially);

    const { deprecated } = meta;
    const { tsType } = desc;
    const formattedDocumentation = formatPropertyDocumentation(meta, config);

    let propertyRendering;
    let collapsePropertyRendering;
    let renderTsType = true;
    switch (desc.type) {
        case "primitive":
            propertyRendering = null;
            break;
        case "array":
            propertyRendering = renderArrayType(desc, meta, propPath, config);
            collapsePropertyRendering = desc.elements.type !== 'primitive' && (
                <Fragment>
                    <span className={classnames('token', 'punctuation')}> {"[".repeat(desc.depth)}</span>
                    <span className={classnames('token', 'operator')}> ... </span>
                    <span className={classnames('token', 'punctuation')}>{"]".repeat(desc.depth)}</span>
                </Fragment>
            );
            break;
        case "nested-object":
            propertyRendering = renderNestedObject(desc, meta, propPath, config);
            collapsePropertyRendering = renderCollapsedNestedObject(desc);
            break;
        case "union":
            const simpleUnion = isSimpleUnion(desc);
            propertyRendering = !simpleUnion ? <ModelSnippet model={desc} config={config} path={propPath}></ModelSnippet> : null;
            collapsePropertyRendering = !simpleUnion ?
                <Fragment></Fragment> :
                null;
            needsClosingSemi = simpleUnion;
            break;
        case "function":
            propertyRendering = isJSONNodeExpanded ? renderFunction(desc, propPath, config) : null;
            collapsePropertyRendering = renderCollapsedFunction(desc);
            renderTsType = isSimpleFunction(desc);
            break;
        default:
            console.warn(`AG Docs - unhandled sub-type: ${desc["type"]}`);
    }

    let expandable = !!collapsePropertyRendering || (formattedDocumentation.length > 0);
    let inlineDocumentation = desc.type === 'function' || !collapsePropertyRendering;
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
            {renderPropertyDeclaration(propName, renderTsType ? tsType : null, meta, isJSONNodeExpanded, expandable)}
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
    if (!renderedDocs || renderedDocs?.trim().length === 0) { return };

    return (
        <Fragment>
            <div
                className={classnames('token', 'comment', styles['jsdoc-expandable'])}
                onClick={(e) => e.stopPropagation()}
                dangerouslySetInnerHTML={{ __html: convertMarkdown(formattedDocumentation.join('\n')) }}
                role="presentation"
            >
            </div>
        </Fragment>
    );
}

function maybeRenderModelDocumentation(
    model: JsonModel | JsonFunction,
    config: Config,
): React.ReactNode {
    const formattedDocumentation = formatModelDocumentation(model, config);
    if (formattedDocumentation.length === 0) { return; }

    const renderedDocs = convertMarkdown(formattedDocumentation.join('\n'));
    if (!renderedDocs || renderedDocs?.trim().length === 0) { return };

    return (
        <Fragment>
            <div
                className={classnames('token', 'comment', styles['jsdoc-expandable'])}
                onClick={(e) => e.stopPropagation()}
                dangerouslySetInnerHTML={{ __html: convertMarkdown(formattedDocumentation.join('\n')) }}
                role="presentation"
            >
            </div>
        </Fragment>
    );
}

function renderJsonNodeExpander(isExpanded: boolean) {
    return (
        <Fragment>
            <svg className={classnames(styles['expander'], { 'fa-rotate-90': isExpanded })}><use href="#node-expander" role="button"/></svg>
        </Fragment>
    );
}

function renderPropertyDeclaration(
    propName: string,
    tsType: string | null,
    propDesc: { required: boolean },
    isExpanded: boolean,
    expandable: boolean,
    style = 'property-name',
) {
    const { required } = propDesc;
    return (
        <Fragment>
            {expandable && <div className={classnames(styles['expander-bar'])}></div>}
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
    path: string[],
    config: Config,
) {
    return (
        <Fragment>
            <span className={classnames('token', 'punctuation')}>{' { '}</span>
            {maybeRenderPropertyDocumentation(meta, true, config)}
            <div className={classnames(styles['json-object'])} role="presentation">
                <ModelSnippet model={desc.model} config={config} path={path}></ModelSnippet>
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
    path: string[],
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
                        <ModelSnippet model={desc.elements.model} path={path.concat('[]')} config={config}></ModelSnippet>
                    </div>
                    <span className={classnames('token', 'punctuation')}>}</span>
                </Fragment>
            );
            break;
        case "union":
            arrayElementRendering = (
                <Fragment>
                    {maybeRenderPropertyDocumentation(meta, true, config)}
                    <ModelSnippet model={desc.elements} closeWith={''} path={path.concat('[]')} config={config}></ModelSnippet>
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

function renderCollapsedFunction(desc: JsonFunction) {
    if (isSimpleFunction(desc)) {
        return null;
    }

    const paramEntries = Object.entries(desc.parameters);
    return (
        <Fragment>
            <span className={classnames('token', 'punctuation')}>(</span>
            {
                paramEntries.map(([name, type], idx) => (
                    <Fragment key={name}>
                        <span className={classnames('token', 'name')}>{name}</span>
                        <span className={classnames('token', 'punctuation')}>: </span>
                        <span className={classnames('token', 'builtin')}>{type.desc.tsType}</span>
                        {(idx + 1) < paramEntries.length && <span className={classnames('token', 'punctuation')}>, </span>}
                    </Fragment>
                ))
            }
            <span className={classnames('token', 'punctuation')}>)</span>
            <span className={classnames('token', 'operator')}> => </span>
            <span className={classnames('token', 'builtin')}>{desc.returnType.tsType}</span>
        </Fragment>
    );
}

function renderFunction(
    desc: JsonFunction,
    path: string[],
    config: Config,
) {
    if (isSimpleFunction(desc)) {
        return null;
    }

    const paramEntries = Object.entries(desc.parameters);
    const singleParameter = paramEntries.length === 1;
    return (
        <Fragment>
            {maybeRenderModelDocumentation(desc, config)}
            <span className={classnames('token', 'punctuation')}>(</span>
                <div className={styles['json-object']} role="presentation">
                {
                    paramEntries.map(([prop, model], idx) => (
                        <Fragment key={prop}>
                            <PropertySnippet propName={prop} desc={model.desc} meta={model} path={path} config={config} forceInitiallyExpanded={singleParameter} needsClosingSemi={false}></PropertySnippet>
                            {(idx + 1) < paramEntries.length && <span className={classnames('token', 'punctuation')}>, </span>}
                        </Fragment>
                    ))
                }
            </div>
            <span className={classnames('token', 'punctuation')}>)</span>
            <span className={classnames('token', 'operator')}> => </span>
            <span className={classnames('token', 'builtin')}>{desc.returnType.tsType}</span>
        </Fragment>
    );
}

function isSimpleUnion(desc: JsonUnionType) {
    return desc.options.every(opt => opt.type === 'primitive');
}

function isSimpleFunction(desc: JsonFunction) {
    return Object.entries(desc.parameters)
        .every(([_, type]) => type.desc.type === "primitive");
}

function isExpandedInitially(propName: string, path: string[], config: Config) {
    if (config.expandAll) { return true; }

    const currentPath = path.join('.')
        .replace(/\.\[/g, '[')
        .replace(/'/g, '');
    return config.expandedProperties?.includes(propName) ??
        config.expandedPaths?.some(p => p.startsWith(currentPath)) ??
        DEFAULT_JSON_NODES_EXPANDED;
}

function formatPropertyDocumentation(meta: Omit<JsonModel['properties'][number], 'desc'>, config: Config): string[] {
    const { documentation } = meta;
    const defaultValue = meta.default;
    const result: string[] = documentation?.trim() ?
        [ formatJsDocString(documentation.trim()) ] :
        [];

    if (meta.hasOwnProperty('default')) {
        result.push('Default: `' + JSON.stringify(defaultValue) + '`');
    }

    return result.filter(v => !!v?.trim());
}

function formatModelDocumentation(model: JsonModel | JsonFunction, config: Config) {
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
