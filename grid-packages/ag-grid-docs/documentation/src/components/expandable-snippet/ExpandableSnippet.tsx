import React, { Fragment, useState } from "react";
import classnames from 'classnames';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faMinus } from '@fortawesome/free-solid-svg-icons';

import { escapeGenericCode } from "../documentation-helpers";
import styles from "./ExpandableSnippet.module.scss";
import codeStyles from '../Code.module.scss';

import { buildModel, JsonModel, JsonProperty, JsonUnionType, loadLookups, JsonModelProperty, JsonObjectProperty, JsonPrimitiveProperty, JsonArray } from "./model";

const defaultExpanded = false;

export interface ExpandableSnippetParams {
    interfacename: string;
    overridesrc: string;
    breadcrumbs?: string[];
    config?: {
        includeDeprecated?: boolean,
    };
}

export const ExpandableSnippet: React.FC<ExpandableSnippetParams> = ({
    interfacename,
    overridesrc,
    breadcrumbs = [],
    config = {},
}) => {
    const { interfaceLookup, codeLookup } = loadLookups(overridesrc);

    const model = buildModel(interfacename, interfaceLookup, codeLookup, config);

    console.log(model);

    return (
        <div className={styles["expandable-snippet"]}>
            <pre className={classnames(codeStyles['code'], 'language-ts')}>
                <code className={'language-ts'}>
                    <BuildSnippet breadcrumbs={breadcrumbs} model={model} />
                </code>
            </pre>
        </div>
    );
};

interface BuildSnippetParams {
    framework?: string;
    breadcrumbs?: string[];
    model: JsonModel;
}

const BuildSnippet: React.FC<BuildSnippetParams> = ({
    model,
    breadcrumbs = [],
}) => {
    const { prefixLines, suffixLines } = buildObjectBreadcrumb(breadcrumbs);

    return (
        <Fragment>
            {prefixLines.length > 0 && prefixLines.join('\n')}
            <div className={styles['json-object']}>
                <ModelSnippet model={model}></ModelSnippet>
            </div>
            {suffixLines.length > 0 && suffixLines.join('\n')}
        </Fragment>
    );
};

interface ModelSnippetParams {
    model: JsonModel | JsonUnionType;
    skip?: string[];
    closeWith?: string;
}

const ModelSnippet: React.FC<ModelSnippetParams> = ({
    model,
    skip = [],
    closeWith = ';',
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
                        <PropertySnippet key={propName} propName={propName} desc={desc} meta={propInfo}/>
                    );
                })
                .filter(v => !!v)
        }</Fragment>;
    } else if (model.type === "union") {
        return (
            <Fragment>
                {renderUnion(model, closeWith)}
            </Fragment>
        );
    }

    return null;
}

function renderUnion(
    model: JsonUnionType,
    closeWith?: string,
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
                            return renderUnionNestedObject(desc, idx, idx >= lastIdx, closeWith);
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
    closeWith?: string,
) { 
    const [isExpanded, setExpanded] = useState(defaultExpanded);
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
                    {
                        isExpanded ?
                            <Fragment>
                                {renderTsTypeComment(desc)}
                                <div className={classnames(styles['json-object'])} onClick={(e) => e.stopPropagation()}>
                                    <ModelSnippet model={desc.model} skip={[discriminatorProp]}></ModelSnippet>
                                </div>
                            </Fragment> :
                            <Fragment>
                                {renderTsTypeComment(desc)}
                                <span className={classnames('token', 'operator')}> ... </span>
                            </Fragment>
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
                    {renderExpander(isExpanded)}
                    {'{ '}
                </span>
                {
                    isExpanded ?
                        <Fragment>
                            {renderTsTypeComment(desc)}
                            <div className={classnames(styles['json-object'], styles['unexpandable'])} onClick={(e) => e.stopPropagation()}>
                                <ModelSnippet model={desc.model}></ModelSnippet>
                            </div>
                        </Fragment> :
                        <Fragment>
                            {renderTsTypeComment(desc)}
                            <span className={classnames('token', 'operator')}> ... </span>
                        </Fragment>
                }
                <span className={classnames('token', 'punctuation')}>{'}'}</span>
                {!last && <span className={classnames('token', 'operator')}> | <br/></span>}
                {last && closeWith && <span className={classnames('token', 'punctuation')}>{closeWith}</span>}
            </span>
        </Fragment>
    );
}

interface PropertySnippetParams {
    propName: string,
    desc: JsonProperty,
    meta: Omit<JsonModel['properties'][number], 'desc'>,
}

const PropertySnippet: React.FC<PropertySnippetParams> = ({
    propName,
    desc,
    meta,
}) => {
    const [isExpanded, setExpanded] = useState(defaultExpanded);

    const { deprecated, documentation } = meta;
 
    let propertyRendering;
    let collapsePropertyRendering;
    let needsClosingSemi = true;
    switch (desc.type) {
        case "primitive":
            propertyRendering = renderPrimitiveType(desc);
            break;
        case "array":
            propertyRendering = renderArrayType(desc);
            collapsePropertyRendering = desc.elements.type !== 'primitive' && (
                <Fragment>
                    <span className={classnames('token', 'punctuation')}>{"[".repeat(desc.depth)}</span>
                    <span className={classnames('token', 'operator')}> ... </span>
                    <span className={classnames('token', 'punctuation')}>{"]".repeat(desc.depth)}</span>
                </Fragment>
            );
            break;
        case "nested-object":
            propertyRendering = renderNestedObject(desc);
            collapsePropertyRendering = renderCollapsedNestedObject(desc);
            break;
        case "union":
            const simpleUnion = isSimpleUnion(desc);
            propertyRendering = <ModelSnippet model={desc}></ModelSnippet>;
            collapsePropertyRendering = !simpleUnion ?
                <span className={classnames('token', 'type')}>{desc.tsType}</span> :
                null;
            needsClosingSemi = simpleUnion;
            break;
        default:
            console.warn(`AG Docs - unhandled sub-type: ${desc["type"]}`);
    }

    let expandable = !!collapsePropertyRendering;
    return (
        <div
            className={classnames(
                expandable && styles["expandable"],
                styles['json-property'],
                deprecated && styles['deprecated'],
                styles['json-property-type-' + desc.type]
            )}
            onClick={() => expandable ? setExpanded(!isExpanded) : null}
        >
            <div className={classnames('token', 'comment')}>{documentation}</div>
            {renderPropertyDeclaration(propName, meta, isExpanded, expandable)}
            {
                !isExpanded && collapsePropertyRendering ? 
                    collapsePropertyRendering : 
                    <span className={classnames(styles['unexpandable'])} onClick={(e) => e.stopPropagation()}>{propertyRendering}</span>
            }
            {(!isExpanded || needsClosingSemi) && <span className={classnames('token', 'punctuation')}>; </span>}
            {renderPropertyDefault(meta)}
        </div>
    );
};

function renderTsTypeComment(desc: { tsType: string }) {
    return <span className={classnames('token', 'comment')}>/* {desc.tsType} */</span>;
}

function renderExpander(isExpanded: boolean) {
    return (
        <FontAwesomeIcon
            icon={isExpanded ? faMinus : faPlus}
            className={classnames(
                styles['expander'],
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
                {expandable && renderExpander(isExpanded)}
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

function renderNestedObject(desc: JsonObjectProperty) {
    return (
        <Fragment>
            <span className={classnames('token', 'punctuation')}>{'{ '}</span>
            {renderTsTypeComment(desc)}
            <div className={classnames(styles['json-object'])}>
                <ModelSnippet model={desc.model}></ModelSnippet>
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

function renderArrayType(desc: JsonArray) {
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
                    <span className={classnames('token', 'punctuation')}>{'{ '}</span>
                    <span className={classnames('token', 'comment')}>/* {desc.elements.tsType} */</span>
                    <div className={styles["json-object"]}>
                        <ModelSnippet model={desc.elements.model}></ModelSnippet>
                    </div>
                    <span className={classnames('token', 'punctuation')}>}</span>
                </Fragment>
            );
            break;
        case "union":
            arrayElementRendering = (
                <Fragment>
                    <ModelSnippet model={desc.elements} closeWith={''}></ModelSnippet>
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
