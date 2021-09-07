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

export function sortAndFilterProperties(properties, framework) {
    properties.sort(([p1,], [p2,]) => {
        // Push $scope to the end while maintaining original order
        if (p1 === '$scope')
            return 1;
        if (p2 === '$scope')
            return -1;
        return 0;
    });
    return properties
        // Only show AngularJS $scope property for Angular or Javascript frameworks
        .filter(([p,]) => p !== '$scope' || (framework === 'angular' || framework === 'javascript'));
}

export function appendInterface(name, interfaceType, framework, allLines) {

    const lines = [`interface ${name} {`];
    const properties = Object.entries(interfaceType.type);

    sortAndFilterProperties(properties, framework).forEach(([property, type]) => {
        const docs = interfaceType.docs && interfaceType.docs[property];
        if (!docs || (docs && !docs.includes('@deprecated'))) {
            addDocLines(docs, lines);
            lines.push(`  ${property}: ${getLinkedType(type, framework)};`);
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

export function removeJsDocStars(docString) {
    if (!docString || docString.length === 0) {
        return;
    }
    const paramReg = /\* @param/g;
    const newLineReg = /\n \* /g;

    return docString
        .replace('/**', '')
        .replace('*/', '')
        .replace(paramReg, '<br>')
        .replace(newLineReg, ' ');
}

export function appendCallSignature(name, interfaceType, framework, allLines) {
    const lines = [`interface ${name} {`];
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
    properties.forEach((property) => {
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

export function writeAllInterfaces(interfacesToWrite, framework) {
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
                appendInterface(name, interfaceType, framework, allLines);
            }
            alreadyWritten[name] = true;
        }
    });
    return allLines;
}

export function extractInterfaces(definitionOrArray, interfaceLookup, forceShowFunc, dontIncludeChildrenTypes) {
    if (!definitionOrArray) return [];

    if (Array.isArray(definitionOrArray)) {
        let allDefs = [];

        definitionOrArray.forEach(def => {
            allDefs = [...allDefs, ...extractInterfaces(def, interfaceLookup, forceShowFunc, dontIncludeChildrenTypes)]
        })
        return allDefs;
    }
    const definition = definitionOrArray;

    if (typeof (definition) == 'string') {
        const typeRegex = /\w+/g;
        const definitionTypes = [...definition.matchAll(typeRegex)];
        let interfacesToWrite = []
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
            // Show interface if we have found one.            
            // Do not show an interface if it has lots of properties and is a linked type.
            // Always show event interfaces
            if ((!isLinkedType && (!dontIncludeChildrenTypes || numMembers < 6))
                || (isLinkedType && numMembers < 12)
                || (forceShowFunc && forceShowFunc())) {
                interfacesToWrite.push({ name: type, interfaceType })

                // Now if this is a top level interface see if we should include any interfaces for its properties
                // We do not go below the top level to avoid long interface chains
                if (!dontIncludeChildrenTypes && interfaceType.type) {
                    let propertyTypes = typeof (interfaceType.type) === 'string' ? [interfaceType.type]
                        : Object.values(interfaceType.type);
                    let interfacesToInclude = [];
                    propertyTypes.filter(i => !!i && typeof i == 'string')
                        .map(i => {
                            // Extract all the words from the type to handle unions and functions and params cleanly.
                            const words = [...i.matchAll(typeRegex)].map(ws => ws[0]);
                            return words.filter(w => !TYPE_LINKS[w] && interfaceLookup[w]);
                        }).forEach((s) => {
                            if (s.length > 0) {
                                interfacesToInclude = [...interfacesToInclude, ...s];
                            }
                        });

                    if (interfacesToInclude.length > 0) {
                        // Be sure to pass true to dontIncludeChildrenTypes so we do not recurse indefinitely
                        interfacesToWrite = [...interfacesToWrite, ...extractInterfaces(interfacesToInclude, interfaceLookup, forceShowFunc, true)];
                    }
                }
            }

            if (interfaceType.meta.isCallSignature) {
                const args = interfaceType.type && interfaceType.type.arguments;
                if (args) {
                    const argInterfaces = Object.values(args)
                    interfacesToWrite = [...interfacesToWrite, ...extractInterfaces(argInterfaces, interfaceLookup, forceShowFunc, dontIncludeChildrenTypes)];
                }
            }
        });
        return interfacesToWrite;
    }

    let allDefs = [];
    Object.values(definition).forEach(v => {
        allDefs = [...allDefs, ...extractInterfaces(v, interfaceLookup, forceShowFunc, dontIncludeChildrenTypes)];
    })
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
        return JSON.parse(json.internal.content);
    }

    throw new Error(`Could not find JSON for source ${source}`);
};