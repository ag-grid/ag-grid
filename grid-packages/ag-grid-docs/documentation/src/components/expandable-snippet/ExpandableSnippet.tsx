import React from "react";
import Code from "../Code";
import { escapeGenericCode } from "../documentation-helpers";
import styles from "./ExpandableSnippet.module.scss";
import { buildModel, JsonModel, JsonProperty, JsonUnionType, loadLookups } from "./model";

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
            <BuildSnippet breadcrumbs={breadcrumbs} model={model} />
        </div>
    );
};

interface BuildSnippetParams {
    framework?: string;
    breadcrumbs?: string[];
    model: JsonModel;
    nestingLevel?: number;
}

const BuildSnippet: React.FC<BuildSnippetParams> = ({
    model,
    breadcrumbs = [],
    nestingLevel = 0,
}) => {
    const lines = [];
    const { prefixLines, suffixLines, indentationLevel } = buildObjectBreadcrumb(breadcrumbs);
    if (nestingLevel === 0) {
        lines.push(...prefixLines);
    }

    lines.push(
        ...buildSubSnippet(model, { indentLevel: indentationLevel + nestingLevel, path: "root" })
    );

    if (nestingLevel === 0) {
        lines.push(...suffixLines);
    }

    const escapedLines = escapeGenericCode(lines);
    return <Code code={escapedLines} keepMarkup={true} />;
};

interface RenderContext {
    indentLevel: number;
    path: string;
}

function buildSubSnippet(
    model: JsonModel | JsonUnionType,
    ctx: RenderContext,
    skip = [] as string[]
): string[] {
    const lines = [];

    if (model.type === "model") {
        Object.entries(model.properties).forEach(([propName, propInfo]) => {
            if (skip.includes(propName)) {
                return;
            }

            const { desc } = propInfo;
            buildPropertySnippet(propName, desc, propInfo, lines, ctx);
        });
    } else if (model.type === "union") {
        const baseIndent = buildObjectIndent(ctx.indentLevel);
        model.options.forEach((desc, index) => {
            switch (desc.type) {
                case "nested-object":
                    const discriminatorProp = "type";
                    const discriminator = desc.model.properties[discriminatorProp];
                    if (discriminator && discriminator.desc.type === "primitive") {
                        const { tsType } = discriminator.desc;
                        lines.push(`${baseIndent}{ ${discriminatorProp}: ${tsType}; /* ${desc.tsType} */`);
                        lines.push(...buildSubSnippet(
                            desc.model,
                            { indentLevel: ctx.indentLevel + 1, path: `${ctx.path}[${index}]` },
                            [discriminatorProp]
                        ));
                    } else {
                        lines.push(`${baseIndent}{ /* ${desc.tsType} */`);
                        lines.push(...buildSubSnippet(
                            desc.model,
                            { indentLevel: ctx.indentLevel + 1, path: `${ctx.path}[${index}]` },
                            [discriminatorProp]
                        ));
                    }
                    lines.push(`${baseIndent}}`);
                    break;
                default:
                    console.warn(`AG Docs - unhandled union sub-type: ` + desc.type);
            }

            if (index < model.options.length - 1) {
                lines[lines.length - 1] += " |";
            }
        });
    }

    return lines;
}

function buildPropertySnippet(
    propName: string,
    desc: JsonProperty,
    meta: Omit<JsonModel['properties'][number], 'desc'>,
    lines: string[],
    ctx: RenderContext
) {
    const { deprecated, required, documentation } = meta;
    // TODO: Skip deprecated properties?
    const baseIndent = buildObjectIndent(ctx.indentLevel);
    if (documentation) {
        lines.push(`${baseIndent}${documentation}`);
    }
    let line = `${baseIndent}${deprecated ? '<del>' : ''}${propName}${required ? "" : "?"}${deprecated ? '</del>' : ''}`;

    switch (desc.type) {
        case "primitive":
            if (desc.aliasType) {
                lines.push(`${line}: /*${desc.aliasType}*/ ${desc.tsType};`);
            } else {
                lines.push(`${line}: ${desc.tsType};`);
            }
            break;
        case "array":
            line += `: ${"[".repeat(desc.depth)}`;
            const closeArray = "]".repeat(desc.depth);

            switch (desc.elements.type) {
                case "primitive":
                    lines.push(`${line}${desc.elements.tsType}${closeArray};`);
                    break;
                case "nested-object":
                    lines.push(`${line} /*${desc.elements.tsType}*/ {`);
                    lines.push(
                        ...buildSubSnippet(desc.elements.model, {
                            indentLevel: ctx.indentLevel + 1,
                            path: `${ctx.path}.${propName}`,
                        })
                    );
                    lines.push(`${baseIndent}${closeArray};`);
                    break;
                case "union":
                    lines.push(`${line}`);
                    lines.push(
                        ...buildSubSnippet(desc.elements, {
                            indentLevel: ctx.indentLevel + 1,
                            path: `${ctx.path}.${propName}`,
                        })
                    );
                    lines.push(`${baseIndent}${closeArray};`);
                    break;
                default:
                    console.warn(`AG Docs - unhandled ub-type: ${desc["type"]}`);
            }
            break;
        case "nested-object":
            lines.push(`${line}: /*${desc.tsType}*/ {`);
            lines.push(
                ...buildSubSnippet(desc.model, {
                    indentLevel: ctx.indentLevel + 1,
                    path: `${ctx.path}.${propName}`,
                })
            );
            lines.push(`${baseIndent}};`);
            break;
        case "union":
            lines.push(`${line}:`);
            lines.push(
                ...buildSubSnippet(desc, {
                    indentLevel: ctx.indentLevel + 1,
                    path: `${ctx.path}.${propName}`,
                })
            );
            lines[lines.length - 1] += ";";
            break;
        default:
            console.warn(`AG Docs - unhandled ub-type: ${desc["type"]}`);
    }
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
