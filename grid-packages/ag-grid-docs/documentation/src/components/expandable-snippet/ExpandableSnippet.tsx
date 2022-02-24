import React, { Fragment, useState } from "react";
import Code from "../Code";
import { escapeGenericCode } from "../documentation-helpers";
import styles from "./ExpandableSnippet.module.scss";
import { buildModel, JsonModel, JsonProperty, JsonUnionType, loadLookups } from "./model";

const defaultExpanded = false;

export interface ExpandableSnippetParams {
    interfacename: string;
    overridesrc: string;
    breadcrumbs?: string[];
    config?: {};
}

export const ExpandableSnippet: React.FC<ExpandableSnippetParams> = ({
    interfacename,
    overridesrc,
    breadcrumbs = [],
}) => {
    const { interfaceLookup, codeLookup } = loadLookups(overridesrc);

    const model = buildModel(interfacename, interfaceLookup, codeLookup);

    console.log(model);

    return (
        <div className={styles["expandable-snippet"]}>
            <pre>
                <BuildSnippet breadcrumbs={breadcrumbs} model={model} />
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
            {prefixLines.length > 0 && <code>{prefixLines.join('\n')}</code>}
            <div className={styles['indent-level']}>
                <ModelSnippet model={model}></ModelSnippet>
            </div>
            {suffixLines.length > 0 && <code>{suffixLines.join('\n')}</code>}
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

            const [isExpanded, setExpanded] = useState(defaultExpanded);
            const discriminatorProp = "type";
            const discriminator = desc.model.properties[discriminatorProp];
            if (discriminator && discriminator.desc.type === "primitive") {
                const { tsType } = discriminator.desc;

                return (
                    <Fragment>
                        <span onClick={() => setExpanded(!isExpanded)} className={styles["expandable"]}>
                            <span className={styles["json-object-open"]}>{'{ '}</span>
                            <span className={styles["json-property-name"]}>{discriminatorProp}</span>
                            <span className={styles["json-property-delimited"]}>:</span>
                            <span className={styles["json-property-literal"]}>{tsType}</span>
                            <span className={styles["json-property-close"]}>; </span>
                        </span>
                        {
                            isExpanded ?
                                <Fragment>
                                    <span>/* {desc.tsType} */</span>
                                    <ModelSnippet model={desc.model} skip={[discriminatorProp]}></ModelSnippet>
                                </Fragment> :
                                <span onClick={() => setExpanded(!isExpanded)} className={styles["expandable"]}> ... </span>
                        }
                        <span onClick={() => setExpanded(!isExpanded)} className={styles["expandable"]}>
                            <span className={styles["json-object-close"]}>{'}'}</span>
                            {index < model.options.length - 1 && <span className={styles["json-property-union"]}>|<br/></span>}
                        </span>
                    </Fragment>
                );
            }
            return (
                <Fragment>
                    <span onClick={() => setExpanded(!isExpanded)} className={styles["expandable"]}>
                        <span className={styles["json-object-open"]}>{'{'}</span>
                    </span>
                    {
                        isExpanded ?
                            <Fragment>
                                <span>/* ${desc.tsType} */</span>
                                <ModelSnippet model={desc.model}></ModelSnippet>
                            </Fragment> :
                            <span onClick={() => setExpanded(!isExpanded)} className={styles["expandable"]}> ... </span>
                    }
                    <span onClick={() => setExpanded(!isExpanded)} className={styles["expandable"]}>
                        <span className={styles["json-object-close"]}>{'}'}</span>
                        {index < model.options.length - 1 && <span className={styles["json-property-union"]}>|</span>}
                    </span>
                </Fragment>
            );
        });

        return (
            <Fragment>
                {children}
            </Fragment>
        );
    }

    return null;
}

interface PropertySnippetParams {
    propName: string;
    desc: JsonProperty,
    meta: Omit<JsonModel['properties'][number], 'desc'>,
}

const PropertySnippet: React.FC<PropertySnippetParams> = ({
    propName,
    desc,
    meta,
}) => {
    const [isExpanded, setExpanded] = useState(defaultExpanded);

    const { deprecated, required, documentation } = meta;
    // TODO: Skip deprecated properties?

    let propertyRendering;
    let collapsePropertyRendering;
    switch (desc.type) {
        case "primitive":
            if (desc.aliasType) {
                propertyRendering = (
                    <Fragment>
                        <span className={styles['json-property-alias']}>/* {desc.aliasType} */</span>
                        <span className={styles["json-property-ts-type"]}>{desc.tsType}</span>
                    </Fragment>
                );
            } else {
                propertyRendering = <span className={styles["json-property-ts-type"]}>{desc.tsType}</span>;
            }
            break;
        case "array":
            let arrayElementRendering;
            switch (desc.elements.type) {
                case "primitive":
                    arrayElementRendering = <span className={styles["json-property-ts-type"]}>{desc.elements.tsType}</span>;
                    break;
                case "nested-object":
                    arrayElementRendering = (
                        <Fragment>
                            <span className={styles["json-property-ts-type"]}>/* {desc.elements.tsType} */</span>
                            <span className={styles["json-object-open"]}>{'{'}</span>
                            <ModelSnippet model={desc.elements.model}></ModelSnippet>
                            <span className={styles["json-object-close"]}>}</span>
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

            propertyRendering = (
                <Fragment>
                    <span className={styles["json-array-open"]}>{"[".repeat(desc.depth)}</span>
                    {arrayElementRendering}
                    <span className={styles["json-array-close"]}>{"]".repeat(desc.depth)}</span>
                </Fragment>
            );
            collapsePropertyRendering = desc.elements.type !== 'primitive' && (
                <Fragment>
                    <span className={styles["json-array-open"]}>{"[".repeat(desc.depth)}</span>
                    <span className={styles["json-array-collapsed"]}> ... </span>
                    <span className={styles["json-array-close"]}>{"]".repeat(desc.depth)}</span>
                </Fragment>
            );

            break;
        case "nested-object":
            propertyRendering = (
                <Fragment>
                    <span className={styles["json-property-ts-type"]}>/* {desc.tsType} */</span>
                    <span className={styles["json-object-open"]}>{' {'}</span>
                    <ModelSnippet model={desc.model}></ModelSnippet>
                    <span className={styles["json-object-close"]}>}</span>
                </Fragment>
            );
            collapsePropertyRendering = (
                <Fragment>
                    <span className={styles["json-object-open"]}>{'{'}</span>
                    <span className={styles["json-object-collapsed"]}> ... </span>
                    <span className={styles["json-object-close"]}>}</span>
                </Fragment>
            );
            break;
        case "union":
            propertyRendering = <ModelSnippet model={desc}></ModelSnippet>;
            collapsePropertyRendering = <span className={styles["json-property-ts-type"]}>{desc.tsType}</span>;
            break;
        default:
            console.warn(`AG Docs - unhandled ub-type: ${desc["type"]}`);
    }

    return (
        <div className={`${styles['json-property']} ${deprecated ? styles['deprecated'] : ''} ${styles['json-property-type-' + desc.type]}`}>
            <div className={styles["json-property-documentation"]}>{documentation}</div>
            <span onClick={() => setExpanded(!isExpanded)} className={styles["expandable"]}>
                <span className={styles["json-property-name"]}>{propName}</span>
                {required &&
                    <span className={styles["json-property-is-optional"]}>?</span>}
                <span className={styles["json-property-delimited"]}>: </span>
            </span>
            {
                !isExpanded && collapsePropertyRendering ? 
                    <span onClick={() => setExpanded(!isExpanded)} className={styles["expandable"]}>{collapsePropertyRendering}</span> : 
                    propertyRendering
            }
            <span onClick={() => setExpanded(!isExpanded)} className={styles["expandable"]}>
                <span className={styles["json-property-close"]}>;</span>
            </span>
        </div>
    );
};

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
