import type { Framework } from '@ag-grid-types';
import { urlWithPrefix } from '@utils/urlWithPrefix';

import type { InterfaceEntry, Properties, PropertyType } from '../types';
import { getTypeLink } from './type-links';

const paramReg = /\* @param (\w+) (.*)\n/g;
const returnsReg = /\* (@returns) (.*)\n/g;
const newLineReg = /\n\s+\*(?!\*)/g;
// Turn option list, new line starting with - into bullet points
const optionReg = /\n[\s]*[*]*[\s]*- (.*)/g;

export const inferType = (value: any): string | null => {
    if (value == null) {
        return null;
    }

    if (Array.isArray(value)) {
        return value.length ? `${inferType(value[0])}[]` : 'object[]';
    }

    return typeof value;
};

/**
 * Converts a subset of Markdown so that it can be used in JSON files.
 */
export const convertMarkdown = (content: string | undefined, framework: Framework) =>
    content &&
    content
        .replace(/`(.*?)`/g, '<code>$1</code>')
        .replace(
            /\[([^\]]+)\]\(([^)]+)\)/g,
            (_, text, href) => `<a href="${urlWithPrefix({ url: href, framework })}">${text}</a>`
        )
        .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');

export function escapeGenericCode(lines: string[]) {
    // When you have generic parameters such as ChartOptions<any>
    // the <any> gets removed as the code formatter thinks its a invalid tag.

    // By adding a <span/> the generic type is preserved in the doc output

    // Regex to match all '<' but not valid links such as '<a ' and closing tags '</'
    const typeRegex = /<(?!a[\s]|[/])/g;
    const escapedLines = lines.join('\n').replace(typeRegex, '<<span/>');
    return escapedLines;
}

export function getTypeUrl(type: string | PropertyType, framework: Framework): string | undefined {
    if (typeof type === 'string') {
        if (type.includes('|')) {
            const linkedTypes = type
                .split('|')
                .map((t) => getTypeUrl(t.trim(), framework))
                .filter((url) => !!url);
            // If there is only one linked type then lets return that otherwise we don't support union type links
            if (linkedTypes.length === 1) {
                return linkedTypes[0];
            }

            return undefined;
        } else if (type.endsWith('[]')) {
            type = type.replace(/\[\]/g, '');
        }
    } else if (type && typeof type === 'object' && typeof type.returnType === 'string') {
        // This method can be called with a type object
        return getTypeUrl(type.returnType, framework);
    }

    const typeLink = getTypeLink(type);
    if (typeLink) {
        return urlWithPrefix({
            url: typeLink,
            framework,
        });
    }
    return undefined;
}

export function getLinkedType(type: string | string[], framework: Framework) {
    if (!Array.isArray(type)) {
        if (typeof type === 'string') {
            type = [...type.split('|')];
        } else {
            type = [type];
        }
    }

    // Extract all the words to enable support for Union types
    const typeRegex = /\w+/g;
    const formattedTypes = type
        .filter((t) => typeof t === 'string')
        .map((t) => {
            const definitionTypes = [...t.matchAll(typeRegex)];

            const typesToLink = definitionTypes
                .map((regMatch) => {
                    const typeName = regMatch[0];
                    const url = getTypeUrl(typeName, framework);

                    return url
                        ? {
                              toReplace: typeName,
                              link: `<a href="${url}" target="${url.startsWith('http') ? '_blank' : '_self'}" rel="noreferrer">${typeName}</a>`,
                          }
                        : undefined;
                })
                .filter((dt) => !!dt);

            let formatted = t;
            typesToLink.forEach((toLink) => {
                formatted = formatted.split(toLink.toReplace).join(toLink.link);
            });

            return formatted;
        });

    return formattedTypes.join(' | ');
}

export function sortAndFilterProperties(properties: Properties, framework: Framework, applyOptionalOrdering?: boolean) {
    properties.sort(([p1], [p2]) => {
        if (applyOptionalOrdering) {
            // Push mandatory props to the top
            const isP1Optional = p1.includes('?');
            const isP2Optional = p2.includes('?');
            if (isP1Optional && !isP2Optional) return 1;
            if (!isP1Optional && isP2Optional) return -1;
            if (!isP1Optional && !isP2Optional) {
                return p1 < p2 ? -1 : 1;
            }
        }
        return 0;
    });
    return properties;
}

export function getInterfaceWithGenericParams(name: string, meta: any) {
    return `${name}${meta?.typeParams?.length > 0 ? `&lt;${meta.typeParams.join(', ')}&gt;` : ''}`;
}

export function appendInterface(
    name: string,
    interfaceType: any,
    framework: Framework,
    allLines: string[],
    printConfig: any = {}
) {
    const toExclude = printConfig.exclude || [];
    const interfaceDeclaration = getInterfaceWithGenericParams(name, interfaceType.meta);
    const lines = [`interface ${printConfig.hideName ? '' : interfaceDeclaration} {`];
    const properties = Object.entries(interfaceType.type);

    sortAndFilterProperties(properties, framework, printConfig.applyOptionalOrdering)
        .filter(([prop]) => {
            return !toExclude.includes(prop);
        })
        .forEach(([property, type]) => {
            const docs = interfaceType.docs && interfaceType.docs[property];
            if (!docs || (docs && !docs.includes('@deprecated'))) {
                addDocLines(docs, lines);
                lines.push(`  ${property}: ${getLinkedType(type, framework)};`);
                if (printConfig.lineBetweenProps) {
                    lines.push('');
                }
            }
        });
    lines.push('}');
    allLines.push(...lines);
}

export function addDocLines(docs: string, lines: string[]) {
    if (!docs || docs.length === 0) {
        return;
    }

    const indentReg = /\s+\*(?!\*)/g;
    const lastNewLine = /\n\s+\*\//g;

    docs.replace('/**', '//')
        .replace(lastNewLine, '')
        .split(/\n/g)
        .forEach((s) => {
            lines.push(`  ${s.replace('*/', '').replace(indentReg, '//')}`);
        });
}

/**
 * Ensure that we correctly apply the undefined as a separate union type for complex type
 *  e.g isExternalFilterPresent: (() => boolean) | undefined = undefined;
 *  Without the brackets this changes the return type!
 */
export function applyUndefinedUnionType(typeName: string) {
    const trimmed = typeName.trim();
    if (trimmed === 'any') {
        // Don't union type with any
        return trimmed;
    }
    if (trimmed.includes('=>')) {
        return `(${trimmed}) | undefined`;
    } else {
        return `${trimmed} | undefined`;
    }
}

// const NEWLINE_DEFAULT_STRING = '<br> Default:';
/** Handle correct placement of more link so that default is always at the end on a new line even if already included in JsDoc. */
export function addMoreLink(description: string, seeMore: string) {
    // Get default string along with its value
    //  var defaultReg = new RegExp(NEWLINE_DEFAULT_STRING + '(.*)', "g");
    //  const hasDefault = description.match(defaultReg);
    //  if (hasDefault && hasDefault.length > 0) {
    //      return description.replace(hasDefault[0], seeMore + hasDefault[0]);
    //  }
    return description + seeMore;
}

export function removeDefaultValue(docString: string) {
    // Default may or may not be on a new line in JsDoc but in both cases we want the default to be on the next line
    const defaultReg = /@default .*\n/g;

    return docString.replace(defaultReg, '');
}

export function formatJsDocString(docString: string) {
    if (!docString || docString.length === 0) {
        return;
    }

    const formatted = docString
        .replace('/**', '')
        .replace('*/', '')
        .replace(paramReg, '<span class="param"> `$1` $2 </span>\n')
        .replace(returnsReg, '<strong>Returns: </strong> $2 \n')
        .replace(optionReg, '<li style="margin-left:1rem"> $1 </li>')
        .replace(newLineReg, ' ');

    return formatted;
}

export function extractJSDocTags(docString?: string) {
    if (!docString || docString.length === 0) {
        return {};
    }

    const params = [...docString.matchAll(paramReg)].map(([_, name, value]) => {
        return {
            name,
            value,
        };
    });
    const returns = [...docString.matchAll(returnsReg)].map(([_, _returns, value]) => {
        return value;
    })[0]; // Take first match only

    return { params, returns };
}

export function appendCallSignature(name: string, interfaceType: any, framework: Framework, allLines: string[]) {
    const interfaceDeclaration = getInterfaceWithGenericParams(name, interfaceType.meta);
    const lines = [`interface ${interfaceDeclaration} {`];
    const args = Object.entries(interfaceType.type.arguments);
    const argTypes = args.map(([property, type]) => {
        return `${property}: ${getLinkedType(type, framework)}`;
    });
    lines.push(`    (${argTypes.join(', ')}) : ${interfaceType.type.returnType}`);
    lines.push('}');
    allLines.push(...lines);
}

export function appendEnum(name: string, interfaceType: any, allLines: string[]) {
    const lines = [`enum ${name} {`];
    const properties = interfaceType.type;
    const docs = interfaceType.docs;
    properties.forEach((property, i) => {
        if (docs && docs[i]) {
            addDocLines(docs[i], lines);
        }
        lines.push(`  ${property}`);
    });
    lines.push('}');
    allLines.push(...lines);
}

export function appendTypeAlias(name: string, interfaceType: any, allLines: string[]) {
    const shouldMultiLine = interfaceType.type.length > 20;

    const split = interfaceType.type.split('|');
    const smartSplit = [];

    // Don't split union types that are in the same bracket pair
    // "type": "string | string[] | ((params: HeaderClassParams) => string | string[])"
    // Should become this note we have not split the union return type onto two lines
    //   string
    // | string[]
    // | ((params: HeaderClassParams) => string | string[])
    while (split.length > 0) {
        const next = split.pop();
        const countOpen = (next.match(/\(/g) || []).length;
        const countClosed = (next.match(/\)/g) || []).length;

        if (countOpen === countClosed) {
            smartSplit.push(next);
        } else {
            const n = split.pop();
            split.push(n + '|' + next);
        }
    }

    const multiLine = shouldMultiLine ? `\n      ${smartSplit.reverse().join('\n    |')}\n` : interfaceType.type;
    allLines.push(`type ${name} = ${multiLine}`);
}

export function writeAllInterfaces(interfacesToWrite: any[], framework: Framework, printConfig?: any) {
    const allLines: string[] = [];
    const alreadyWritten: Record<string, boolean> = {};
    interfacesToWrite.forEach(({ name, interfaceType }) => {
        if (!alreadyWritten[name]) {
            allLines.push('');
            if (interfaceType.meta.isTypeAlias) {
                appendTypeAlias(name, interfaceType, allLines);
            } else if (interfaceType.meta.isEnum) {
                appendEnum(name, interfaceType, allLines);
            } else if (interfaceType.meta.isCallSignature) {
                appendCallSignature(name, interfaceType, framework, allLines);
            } else {
                appendInterface(name, interfaceType, framework, allLines, printConfig);
            }
            alreadyWritten[name] = true;
        }
    });
    return allLines;
}

export function extractInterfaces(
    definitionOrArray: string[],
    interfaceLookup: Record<string, InterfaceEntry>,
    overrideIncludeInterfaceFunc: any,
    allDefs: string[] = []
) {
    if (!definitionOrArray) return [];

    if (allDefs.length > 1000) {
        // eslint-disable-next-line no-console
        console.warn('AG Charts - Possible recursion error on type: ', definitionOrArray, allDefs);
        return allDefs;
    }

    const alreadyIncluded = {};
    allDefs.forEach((v) => {
        alreadyIncluded[v.name] = true;
    });

    const addDef = (def) => {
        if (!alreadyIncluded[def.name]) {
            allDefs.push(def);
            alreadyIncluded[def.name] = true;

            return true;
        }

        return false;
    };
    const recurse = (defs, overrideFn) => {
        if (Array.isArray(defs)) {
            defs.forEach((def) => recurse(def, overrideFn));
            return;
        }

        if (typeof defs !== 'string') {
            return;
        }

        if (alreadyIncluded[defs]) {
            return;
        }

        extractInterfaces(defs, interfaceLookup, overrideFn, allDefs).forEach(addDef);
    };

    if (Array.isArray(definitionOrArray)) {
        definitionOrArray.forEach((def) => {
            recurse(def, overrideIncludeInterfaceFunc);
        });
        return allDefs;
    }
    const definition = definitionOrArray;

    if (typeof definition == 'string') {
        const typeRegex = /\w+/g;
        const definitionTypes = [...definition.matchAll(typeRegex)];
        definitionTypes.forEach((regMatch) => {
            const type = regMatch[0];
            // If we have the actual interface use that definition
            const interfaceType = interfaceLookup[type];
            if (!interfaceType) {
                return undefined;
            }

            const isLinkedType = !!getTypeLink(type);
            const numMembers =
                typeof interfaceType.type == 'string'
                    ? interfaceType.type.split('|').length
                    : Object.entries(interfaceType.type || {}).length;

            const overrideInclusion = overrideIncludeInterfaceFunc ? overrideIncludeInterfaceFunc(type) : undefined;
            if (overrideInclusion === false) {
                // Override function is false so do not include this interface
                return undefined;
            }

            // Show interface if we have found one.
            // Do not show an interface if it has lots of properties and is a linked type.
            // Always show event interfaces
            if (
                (!isLinkedType || (isLinkedType && numMembers < 12) || overrideInclusion === true) &&
                !alreadyIncluded[type]
            ) {
                if (!addDef({ name: type, interfaceType })) {
                    // Previously added - no need to continue.
                    return;
                }

                // Now if this is a top level interface see if we should include any interfaces for its properties
                if (interfaceType.type) {
                    const interfacesToInclude = {};

                    if (typeof interfaceType.type === 'string') {
                        interfacesToInclude[interfaceType.type] = true;
                    } else {
                        const propertyTypes = Object.entries(interfaceType.type);
                        propertyTypes
                            .filter(([, v]) => !!v && typeof v == 'string')
                            .filter(([k]) => {
                                const docs = interfaceType.docs && interfaceType.docs[k];
                                return !docs || !docs.includes('@deprecated');
                            })
                            .map(([k, i]) => {
                                // Extract all the words from the type to handle unions and functions and params cleanly.
                                const words = [...k.matchAll(typeRegex), ...i.matchAll(typeRegex)].map((ws) => ws[0]);
                                return words.filter((w) => !getTypeLink(w) && interfaceLookup[w]);
                            })
                            .forEach((s) => {
                                s.forEach((v) => {
                                    interfacesToInclude[v] = true;
                                });
                            });
                    }

                    const toAdd = Object.keys(interfacesToInclude);
                    if (toAdd.length > 0) {
                        toAdd.forEach((v) => recurse(v, overrideIncludeInterfaceFunc));
                    }
                }
            }

            // If a call signature we unwrap the interface and recurse on the call signature arguments instead.
            if (interfaceType.meta.isCallSignature) {
                const args = interfaceType.type && interfaceType.type.arguments;
                Object.values(args ?? {}).forEach((v) => recurse(v, overrideIncludeInterfaceFunc));
            }
        });
        return allDefs;
    }

    Object.values(definition).forEach((v) => recurse(v, overrideIncludeInterfaceFunc));
    return allDefs;
}

export function getLongestNameLength(nameWithBreaks: string) {
    const splitNames = nameWithBreaks.split(/<br(.*)\/>/);
    splitNames.sort((a, b) => (a.length > b.length ? 1 : -1));
    return splitNames[0].length;
}
