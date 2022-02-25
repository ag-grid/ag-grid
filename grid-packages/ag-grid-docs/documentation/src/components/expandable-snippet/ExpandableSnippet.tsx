import React, { Fragment, useState } from "react";
import classnames from 'classnames';

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
            <div className={styles['indent-level']}>
                <ModelSnippet model={model}></ModelSnippet>
            </div>
            {suffixLines.length > 0 && suffixLines.join('\n')}
        </Fragment>
    );
};

interface ModelSnippetParams {
    model: JsonModel | JsonUnionType;
    skip?: string[];
}

const ModelSnippet: React.FC<ModelSnippetParams> = ({
    model,
    skip = [],
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
        const children = model.options.map((desc, index) => {
            if (desc.type !== 'nested-object') {
                console.warn(`AG Docs - unhandled union sub-type: ` + desc.type);
                return null;
            }

            return renderUnionNestedObject(desc, index, index >= model.options.length - 1);
        });

        return (
            <Fragment>
                {children}
            </Fragment>
        );
    }

    return null;
}

function renderUnionNestedObject(
    desc: JsonObjectProperty,
    index: number,
    last: boolean,
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
                    {renderPropertyDeclaration(discriminatorProp, discriminator)}
                    {renderPrimitiveType(discriminator.desc)}
                    <span className={classnames('token', 'punctuation')}>; </span>
                </span>
                {
                    isExpanded ?
                        <Fragment>
                            {renderTsTypeComment(desc)}
                            <ModelSnippet model={desc.model} skip={[discriminatorProp]}></ModelSnippet>
                        </Fragment> :
                        <span onClick={() => setExpanded(!isExpanded)} className={styles["expandable"]}>
                            {renderTsTypeComment(desc)}
                            <span className={classnames('token', 'operator')}> ... </span>
                        </span>
                }
                <span onClick={() => setExpanded(!isExpanded)} className={styles["expandable"]}>
                    <span className={classnames('token', 'punctuation')}>{' }'}</span>
                    {!last && <span className={classnames('token', 'operator')}> | <br/></span>}
                </span>
            </Fragment>
        );
    }

    return (
        <Fragment key={index}>
            <span onClick={() => setExpanded(!isExpanded)} className={styles["expandable"]}>
                <span className={classnames('token', 'punctuation')}>{'{'}</span>
            </span>
            {
                isExpanded ?
                    <Fragment>
                        {renderTsTypeComment(desc)}
                        <ModelSnippet model={desc.model}></ModelSnippet>
                    </Fragment> :
                    <span onClick={() => setExpanded(!isExpanded)} className={styles["expandable"]}> ... </span>
            }
            <span onClick={() => setExpanded(!isExpanded)} className={styles["expandable"]}>
                <span className={classnames('token', 'punctuation')}>{'}'}</span>
                { !isExpanded && renderTsTypeComment(desc)}
                {!last && <span className={classnames('token', 'operator')}> | <br/></span>}
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
            collapsePropertyRendering = (
                <Fragment>
                    <span className={classnames('token', 'punctuation')}>{'{ '}</span>
                    {renderTsTypeComment(desc)}
                    <span className={classnames('token', 'operator')}> ... </span>
                    <span className={classnames('token', 'punctuation')}>}</span>
                </Fragment>
            );
            break;
        case "union":
            propertyRendering = <ModelSnippet model={desc}></ModelSnippet>;
            collapsePropertyRendering = <span className={classnames('token', 'type')}>{desc.tsType}</span>;
            break;
        default:
            console.warn(`AG Docs - unhandled sub-type: ${desc["type"]}`);
    }

    return (
        <div className={`${styles['json-property']} ${deprecated ? styles['deprecated'] : ''} ${styles['json-property-type-' + desc.type]}`}>
            <div className={classnames('token', 'comment')}>{documentation}</div>
            <span onClick={() => setExpanded(!isExpanded)} className={styles["expandable"]}>
                {renderPropertyDeclaration(propName, meta)}
            </span>
            {
                !isExpanded && collapsePropertyRendering ? 
                    <span onClick={() => setExpanded(!isExpanded)} className={styles["expandable"]}>{collapsePropertyRendering}</span> : 
                    propertyRendering
            }
            <span onClick={() => setExpanded(!isExpanded)} className={styles["expandable"]}>
                <span className={classnames('token', 'punctuation')}>; </span>
                {renderPropertyDefault(meta)}
            </span>
        </div>
    );
};

function renderTsTypeComment(desc: { tsType: string }) {
    return <span className={classnames('token', 'comment')}>/* {desc.tsType} */</span>;
}

function renderPropertyDeclaration(
    propName: string,
    propDesc: { required: boolean },
) {
    const { required } = propDesc;
    return (
        <Fragment>
            <span className={classnames('token', 'name')}>{propName}</span>
            {required && <span className={classnames('token', 'operator')}>?</span>}
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
            <span className={classnames('token', 'comment')}>/* {desc.tsType} */</span>
            <ModelSnippet model={desc.model}></ModelSnippet>
            <span className={classnames('token', 'punctuation')}>}</span>
        </Fragment>    
    );
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
                    <span className={classnames('token', 'type')}>/* {desc.elements.tsType} */</span>
                    <span className={classnames('token', 'punctuation')}>{'{'}</span>
                    <ModelSnippet model={desc.elements.model}></ModelSnippet>
                    <span className={classnames('token', 'punctuation')}>}</span>
                </Fragment>
            );
            break;
        case "union":
            arrayElementRendering = (
                <Fragment>
                    <div className={styles["json-object-union"]}>
                        <ModelSnippet model={desc.elements}></ModelSnippet>
                    </div>
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
