import { withPrefix } from 'gatsby';
import convertToFrameworkUrl from 'utils/convert-to-framework-url';
import { TYPE_LINKS } from './type-links';

export const inferType = value => {
    if (value == null) {
        return null;
    }

    if (Array.isArray(value)) {
        return value.length ? `${inferType(value[0])}[]` : 'object[]';
    }

    return typeof value;
};

const prefixRegex = new RegExp(`^${withPrefix('/')}`);

/**
 * Converts a root-based page link (e.g. /getting-started/) into one which is correct for the website
 * (e.g. /javascript-grid/getting-started/).
 */
export const convertUrl = (href, framework) => {
    const link = href || '';

    if (link.includes('/static/')) { return link; }

    return link.startsWith('/') ?
        // strip the prefix is case it's been applied, before creating the proper URL
        withPrefix(convertToFrameworkUrl(href.replace(prefixRegex, '/'), framework)) :
        href;
}

/**
 * Converts a subset of Markdown so that it can be used in JSON files.
 */
export const convertMarkdown = (content, framework) => content
    .replace(/`(.*?)`/g, '<code>$1</code>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, text, href) => `<a href="${convertUrl(href, framework)}">${text}</a>`)
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');


export function escapeGenericCode(lines) {

    // When you have generic parameters such as ChartOptions<any>
    // the <any> gets removed as the code formatter thinks its a invalid tag.

    // By adding a <span/> the generic type is preserved in the doc output

    // Regex to match all '<' but not valid links such as '<a ' and closing tags '</'
    const typeRegex = /<(?!a[\s]|[/])/g;
    const escapedLines = lines.join('\n').replace(typeRegex, '<<span/>');
    return escapedLines;
}

export function getTypeUrl(type, framework) {
    if (typeof type === 'string') {
        if (type.includes('|')) {

            const linkedTypes = type.split('|').map(t => getTypeUrl(t.trim(), framework)).filter(url => !!url);
            // If there is only one linked type then lets return that otherwise we don't support union type links
            if (linkedTypes.length === 1) {
                return linkedTypes[0];
            }

            return null;
        } else if (type.endsWith('[]')) {
            type = type.replace(/\[\]/g, '');
        }
    } else if (type && typeof type === 'object' && typeof (type.returnType) === 'string') {
        // This method can be called with a type object
        return getTypeUrl(type.returnType, framework);
    }

    return convertUrl(TYPE_LINKS[type], framework);
};


export function getLinkedType(type, framework) {
    if (!Array.isArray(type)) {
        type = [type];
    }

    // Extract all the words to enable support for Union types
    const typeRegex = /\w+/g;
    const formattedTypes = type
        .filter(t => typeof (t) === 'string')
        .map(t => {
            const definitionTypes = [...t.matchAll(typeRegex)];

            const typesToLink = definitionTypes.map(regMatch => {
                const typeName = regMatch[0];
                const url = getTypeUrl(typeName, framework);

                return url ? {
                    toReplace: typeName,
                    link: `<a href="${url}" target="${url.startsWith('http') ? '_blank' : '_self'}" rel="noreferrer">${typeName}</a>`
                } : undefined;
            }).filter(dt => !!dt);

            let formatted = t;
            typesToLink.forEach(toLink => {
                formatted = formatted.split(toLink.toReplace).join(toLink.link);
            })

            return formatted;
        });

    return formattedTypes.join(' | ');
};

export function sortAndFilterProperties(properties, framework, applyOptionalOrdering = false) {

    properties.sort(([p1,], [p2,]) => {
        if (applyOptionalOrdering) {
            // Push mandatory props to the top
            const isP1Optional = p1.includes('?');
            const isP2Optional = p2.includes('?');
            if (isP1Optional && !isP2Optional)
                return 1;
            if (!isP1Optional && isP2Optional)
                return -1;
            if (!isP1Optional && !isP2Optional) {
                return p1 < p2 ? -1 : 1;
            }
        }
        return 0;
    });
    return properties;
}

export function getInterfaceWithGenericParams(name, meta) {
    return `${name}${meta?.typeParams?.length > 0 ? `&lt;${meta.typeParams.join(', ')}&gt;` : ""}`
}

export function appendInterface(name, interfaceType, framework, allLines, printConfig = {}) {
    const toExclude = printConfig.exclude || [];
    const interfaceDeclaration = getInterfaceWithGenericParams(name, interfaceType.meta);
    const lines = [`interface ${printConfig.hideName ? '' : interfaceDeclaration} {`];
    const properties = Object.entries(interfaceType.type);

    sortAndFilterProperties(properties, framework, printConfig.applyOptionalOrdering)
        .filter(([prop,]) => {
            return !toExclude.includes(prop)
        })
        .forEach(([property, type]) => {
            const docs = interfaceType.docs && interfaceType.docs[property];
            if (!docs || (docs && !docs.includes('@deprecated'))) {
                addDocLines(docs, lines);
                lines.push(`  ${property}: ${getLinkedType(type, framework)};`);
                if (printConfig.lineBetweenProps) {
                    lines.push('')
                }
            }
        });
    lines.push('}');
    allLines.push(...lines);
}

export function addDocLines(docs, lines) {
    if (!docs || docs.length === 0) {
        return;
    }
    docs.replace('/**', '//').replace('\n */', '').split(/\n/g).forEach(s => {
        lines.push(`  ${s.replace('*/', '').replace(' *', '//')}`);
    });
}

/**
 * Ensure that we correctly apply the undefined as a separate union type for complex type
 *  e.g isExternalFilterPresent: (() => boolean) | undefined = undefined;
 *  Without the brackets this changes the return type!
 */
export function applyUndefinedUnionType(typeName) {
    const trimmed = typeName.trim();
    if (trimmed === 'any') {
        // Don't union type with any
        return trimmed;
    }
    if (trimmed.includes('=>')) {
        return `(${trimmed}) | undefined`;
    }
    else {
        return `${trimmed} | undefined`;
    }
}

const NEWLINE_DEFAULT_STRING = '<br> Default:';
/** Handle correct placement of more link so that default is always at the end on a new line even if already included in JsDoc. */
export function addMoreLink(description, seeMore) {
    // Get default string along with its value
    var defaultReg = new RegExp(NEWLINE_DEFAULT_STRING + '(.*)', "g");
    const hasDefault = description.match(defaultReg);
    if (hasDefault && hasDefault.length > 0) {
        return description.replace(hasDefault[0], seeMore + hasDefault[0]);
    }
    return description + seeMore;
}

export function formatJsDocString(docString) {
    if (!docString || docString.length === 0) {
        return;
    }
    const paramReg = /\* @param (\w+) (.*)\n/g;
    const returnsReg = /\* (@returns) (.*)\n/g;
    const newLineReg = /\n\s+\*(?!\*)/g;
    // Default may or may not be on a new line in JsDoc but in both cases we want the default to be on the next line
    const defaultReg = /(\n\s+\*)?(<br>)? Default:/g;

    // Turn option list, new line starting with - into bullet points
    // eslint-disable-next-line
    const optionReg = /\n[\s]*[*]*[\s]*- (.*)/g;

    let formatted = docString
        .replace('/**', '')
        .replace('*/', '')
        .replace(defaultReg, NEWLINE_DEFAULT_STRING)
        .replace(paramReg, '<br> <strong>$1</strong> $2 \n')
        .replace(returnsReg, '<br> <strong>Returns: </strong> $2 \n')
        .replace(optionReg, '<li style="margin-left:1rem"> $1 </li>')
        .replace(newLineReg, ' ');

    return formatted;
}

export function appendCallSignature(name, interfaceType, framework, allLines) {
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

export function appendEnum(name, interfaceType, allLines) {
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

export function appendTypeAlias(name, interfaceType, allLines) {
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
        var countOpen = (next.match(/\(/g) || []).length;
        var countClosed = (next.match(/\)/g) || []).length;

        if (countOpen === countClosed) {
            smartSplit.push(next);
        } else {
            const n = split.pop()
            split.push(n + '|' + next);
        }
    }

    const multiLine = shouldMultiLine ?
        `\n      ${smartSplit.reverse().join('\n    |')}\n` :
        interfaceType.type;
    allLines.push(`type ${name} = ${multiLine}`);
}

export function writeAllInterfaces(interfacesToWrite, framework, printConfig) {
    let allLines = [];
    const alreadyWritten = {};
    interfacesToWrite.forEach(({ name, interfaceType }) => {
        if (!alreadyWritten[name]) {
            allLines.push('')
            if (interfaceType.meta.isTypeAlias) {
                appendTypeAlias(name, interfaceType, allLines);
            }
            else if (interfaceType.meta.isEnum) {
                appendEnum(name, interfaceType, allLines);
            }
            else if (interfaceType.meta.isCallSignature) {
                appendCallSignature(name, interfaceType, framework, allLines);
            }
            else {
                appendInterface(name, interfaceType, framework, allLines, printConfig);
            }
            alreadyWritten[name] = true;
        }
    });
    return allLines;
}

export function extractInterfaces(definitionOrArray, interfaceLookup, overrideIncludeInterfaceFunc, allDefs = []) {
    if (!definitionOrArray) return [];

    if (allDefs.length > 1000) {
        console.warn('AG Charts - Possible recursion error on type: ', definitionOrArray, allDefs);
        return allDefs;
    }

    const alreadyIncluded = {};
    allDefs.forEach((v) => { alreadyIncluded[v.name] = true; });

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
            defs.forEach(def => recurse(def, overrideFn));
            return;
        }

        if (typeof defs !== 'string') {
            return;
        }

        if (alreadyIncluded[defs]) {
            return;
        }

        extractInterfaces(defs, interfaceLookup, overrideFn, allDefs)
            .forEach(addDef);
    };

    if (Array.isArray(definitionOrArray)) {
        definitionOrArray.forEach(def => {
            recurse(def, overrideIncludeInterfaceFunc);
        })
        return allDefs;
    }
    const definition = definitionOrArray;

    if (typeof (definition) == 'string') {
        const typeRegex = /\w+/g;
        const definitionTypes = [...definition.matchAll(typeRegex)];
        definitionTypes.forEach(regMatch => {
            const type = regMatch[0];
            // If we have the actual interface use that definition
            const interfaceType = interfaceLookup[type];
            if (!interfaceType) {
                return undefined;
            }

            const isLinkedType = !!TYPE_LINKS[type];
            const numMembers = typeof (interfaceType.type) == 'string'
                ? interfaceType.type.split('|').length
                : Object.entries((interfaceType.type) || {}).length;

            const overrideInclusion = overrideIncludeInterfaceFunc ? overrideIncludeInterfaceFunc(type) : undefined;
            if (overrideInclusion === false) {
                // Override function is false so do not include this interface
                return undefined;
            }

            // Show interface if we have found one.
            // Do not show an interface if it has lots of properties and is a linked type.
            // Always show event interfaces
            if ((!isLinkedType
                || (isLinkedType && numMembers < 12)
                || (overrideInclusion === true)) && !alreadyIncluded[type]) {

                if (!addDef({ name: type, interfaceType })) {
                    // Previously added - no need to continue.
                    return;
                }

                // Now if this is a top level interface see if we should include any interfaces for its properties
                if (interfaceType.type) {
                    let interfacesToInclude = {};

                    if (typeof (interfaceType.type) === 'string') {
                        interfacesToInclude[interfaceType.type] = true;;
                    } else {
                        let propertyTypes = Object.entries(interfaceType.type);
                        propertyTypes.filter(([k, v]) => !!v && typeof v == 'string')
                            .filter(([k, v]) => {
                                const docs = interfaceType.docs && interfaceType.docs[k];
                                return !docs || !docs.includes('@deprecated');
                            })
                            .map(([k, i]) => {
                                // Extract all the words from the type to handle unions and functions and params cleanly.
                                const words = [...k.matchAll(typeRegex), ...i.matchAll(typeRegex)].map(ws => ws[0]);
                                return words.filter(w => !TYPE_LINKS[w] && interfaceLookup[w]);

                            }).forEach((s) => {
                                s.forEach(v => { interfacesToInclude[v] = true; })
                            });
                    }

                    const toAdd = Object.keys(interfacesToInclude);
                    if (toAdd.length > 0) {
                        toAdd.forEach(v => recurse(v, overrideIncludeInterfaceFunc));
                    }
                }
            }

            // If a call signature we unwrap the interface and recurse on the call signature arguments instead.
            if (interfaceType.meta.isCallSignature) {
                const args = interfaceType.type && interfaceType.type.arguments;
                Object.values(args ?? {})
                    .forEach(v => recurse(v, overrideIncludeInterfaceFunc))
            }

        });
        return allDefs;
    }

    Object.values(definition)
        .forEach(v => recurse(v, overrideIncludeInterfaceFunc))
    return allDefs;
}

export function getLongestNameLength(nameWithBreaks) {
    const splitNames = nameWithBreaks.split(/<br(.*)\/>/);
    splitNames.sort((a, b) => a.length > b.length ? 1 : -1);
    return splitNames[0].length;
}

export function getJsonFromFile(nodes, pageName, source) {
    const json = nodes.filter(n => n.relativePath === source || n.relativePath === `${pageName}/${source}`)[0];

    if (json) {
        try {
            return JSON.parse(json.internal.content);
        } catch (e) {
            throw new Error(`Unable to JSON parse: ${json.relativePath} ; Reason: ${e.message}`);
        }
    }

    throw new Error(`Could not find JSON for source ${source}`);
};
