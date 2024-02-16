/* eslint-disable no-console */
import * as ts from 'typescript';

import { inputGlob, parseFile } from '../../executors-utils';

type NodeType = any;
type HeritageType =
    | { kind?: string; type: any; typeParams: any[]; typeArguments?: any[]; members?: TypingMapItem[] }
    | string;
type TypingMapItem = { node: NodeType; heritage?: HeritageType[] };

const tsPrinter = ts.createPrinter({ removeComments: true, omitTrailingSemicolon: true });

const prioritisedMembers = ['type'];

export class TypeMapper {
    protected nodeMap: Map<string, TypingMapItem> = new Map();
    protected genericsMap: Map<string, string>;

    constructor(inputFiles: string[]) {
        for (const file of inputFiles.flatMap(inputGlob)) {
            parseFile(file).forEachChild((node) => {
                if (this.isTopLevelDeclaration(node)) {
                    const typeNode: TypingMapItem = { node: formatNode(node) };
                    if (ts.isInterfaceDeclaration(node)) {
                        typeNode.heritage = this.extractInterfaceHeritage(node);
                    }
                    this.nodeMap.set(node.name.text, typeNode);
                }
            });
        }
    }

    entries() {
        return Array.from(this.nodeMap.entries()).sort();
    }

    resolvedEntries() {
        return this.entries().map(([name]) => {
            this.genericsMap = new Map();
            return this.resolveType(name);
        });
    }

    protected isTopLevelDeclaration(
        node: ts.Node
    ): node is ts.EnumDeclaration | ts.InterfaceDeclaration | ts.TypeAliasDeclaration {
        return ts.isEnumDeclaration(node) || ts.isInterfaceDeclaration(node) || ts.isTypeAliasDeclaration(node);
    }

    protected extractInterfaceHeritage(node: ts.InterfaceDeclaration) {
        return node.heritageClauses?.flatMap((h) =>
            h.types.map(({ expression, typeArguments }) =>
                typeArguments
                    ? {
                          kind: 'typeRef',
                          type: formatNode(expression),
                          typeArguments: typeArguments.map(formatNode),
                      }
                    : formatNode(expression)
            )
        );
    }

    protected resolveType(nameOrNode: NodeType | string, typeArguments?: NodeType[]) {
        if (typeof nameOrNode === 'string') {
            const mapItem = this.nodeMap.get(nameOrNode);
            if (mapItem) {
                return this.resolveNode(mapItem, typeArguments);
            } else {
                console.error('Missing!', nameOrNode);
            }
        } else {
            return this.resolveNode({ node: nameOrNode }, typeArguments);
        }
    }

    protected resolveNode({ node, heritage = [] }: TypingMapItem, typeArguments?: NodeType[]) {
        if (node.typeParams) {
            node.typeParams.map((param, index) => {
                const value = typeArguments?.[index] ?? param.default;
                if (value && param.name !== value) {
                    this.genericsMap.set(param.name, value);
                }
            });
        }

        if (node.kind === 'indexAccess') {
            const memberName = node.index.replace(/^'(.*)'$/, '$1');
            const { members } = this.resolveType(node.type);
            const { type } = members.find((member) => member.name === memberName);
            return this.resolveType(type);
        }

        if (node.kind === 'typeAlias') {
            const { kind, type, ...rest } = node;
            switch (node.type.kind) {
                case 'typeRef':
                    return this.resolveNode(
                        { node: { ...rest, kind: 'interface', members: [] }, heritage: [type] },
                        typeArguments
                    );
                case 'typeLiteral':
                    return this.resolveType({ name: node.name, ...node.type });
                case 'intersection':
                    heritage = type.type.filter((subType) => {
                        if (subType.kind === 'typeLiteral') {
                            return true;
                        }
                        if (subType.kind === 'typeRef') {
                            subType = subType.type;
                        }
                        return !subType.match(/^['{].*['}]$/);
                    });
                    return this.resolveNode(
                        { node: { ...rest, kind: 'interface', members: [] }, heritage },
                        typeArguments
                    );
            }
        }

        for (const h of heritage) {
            node.members ??= [];
            if (typeof h === 'string' || this.nodeMap.has(h.type)) {
                const n = typeof h === 'string' ? this.resolveType(h) : this.resolveType(h.type, h.typeArguments);
                if (Array.isArray(n.members)) {
                    node.members.push(...n.members);
                } else {
                    console.warn('Node heritage without members found', h, n);
                }
            } else if (h.type === 'Omit' || h.type === 'Pick') {
                const n = this.resolveTypeRef(h);
                node.members.push(...n.members);
            } else if (h.type === 'Readonly') {
                const n = this.resolveType({ kind: 'typeAlias', type: h.typeArguments[0] });
                node.members.push(...n.members);
            } else if (h.kind === 'typeLiteral') {
                node.members.push(...h.members);
            } else {
                console.warn(`Unhandled type "${h.type}" on ${node.name}`, h);
            }
        }

        if (node.members) {
            node.members = this.cleanupMembers(node.members);
        }

        if (this.genericsMap.size) {
            node.genericsMap = Array.from(this.genericsMap).reduce((result, [key, value]) => {
                result[key] = value;
                return result;
            }, {});
        }

        return node;
    }

    protected resolveTypeRef(node) {
        if (node.type === 'NonNullable') {
            return this.resolveType(node.typeArguments[0]);
        } else if (node.type === 'Omit' || node.type === 'Pick') {
            const [typeRef, typeKeys] = node.typeArguments;
            const matchType =
                typeKeys.kind === 'union'
                    ? (m: any) => typeKeys.type.includes(`'${m.name}'`)
                    : (m: any) => (typeKeys.type ?? typeKeys) === `'${m.name}'`;
            const n = this.resolveType(typeof typeRef === 'string' ? typeRef : typeRef.type);
            return { ...n, members: n.members.filter(node.type === 'Pick' ? matchType : (m: any) => !matchType(m)) };
        } else {
            return this.resolveType(node.type, node.type.typeArguments);
        }
    }

    cleanupMembers(members) {
        // remove duplicates and push required members to the top of the list
        return members
            .filter(({ name, ...data }, index: number) => {
                const firstMatchIndex = members.findIndex((item) => item.name === name);
                const isFirstAppearance = firstMatchIndex === index;
                if (!isFirstAppearance) {
                    const existingMember = members[firstMatchIndex];
                    existingMember.docs ??= data.docs;
                }
                return isFirstAppearance;
            })
            .filter(({ docs }) => {
                return docs?.some((d) => d.includes('@deprecated')) !== true;
            })
            .sort((a, b) => (a.optional && !b.optional ? 1 : !a.optional && b.optional ? -1 : 0))
            .sort((a, b) => (prioritisedMembers.includes(a.name) ? -1 : prioritisedMembers.includes(b.name) ? 1 : 0));
    }
}

export function formatNode(node: ts.Node) {
    if (ts.isUnionTypeNode(node)) {
        return {
            kind: 'union',
            type: node.types.map(formatNode),
        };
    }

    if (ts.isIntersectionTypeNode(node)) {
        return {
            kind: 'intersection',
            type: node.types.map(formatNode),
        };
    }

    if (ts.isTypeParameterDeclaration(node)) {
        return {
            kind: 'typeParam',
            name: printNode(node.name),
            constraint: printNode(node.constraint),
            default: printNode(node.default),
        };
    }

    if (ts.isFunctionTypeNode(node) || ts.isMethodSignature(node)) {
        return {
            kind: 'function',
            params: node.parameters?.map(formatNode),
            typeParams: node.typeParameters?.map(formatNode),
            returnType: formatNode(node.type),
        };
    }

    if (ts.isEnumDeclaration(node)) {
        return {
            kind: 'typeAlias',
            name: printNode(node.name),
            type: {
                kind: 'union',
                type: node.members.map((node) => formatNode(node.initializer)),
            },
        };
    }

    if (ts.isTemplateLiteralTypeNode(node)) {
        if (node.templateSpans.length === 1) {
            return formatNode(node.templateSpans[0].type);
        }
    }

    if (ts.isTypeAliasDeclaration(node)) {
        return {
            kind: 'typeAlias',
            name: printNode(node.name),
            type: formatNode(node.type),
            typeParams: node.typeParameters?.map(formatNode),
        };
    }

    if (ts.isTypeLiteralNode(node)) {
        return {
            kind: 'typeLiteral',
            members: node.members.map((node) => ({
                kind: 'member',
                docs: getJsDoc(node),
                name: printNode(node.name),
                type: formatNode(node),
                optional: !!node.questionToken,
            })),
        };
    }

    if (ts.isInterfaceDeclaration(node)) {
        return {
            kind: 'interface',
            docs: getJsDoc(node),
            name: formatNode(node.name),
            members: node.members.map((node) => {
                const memberDocs = getJsDoc(node);
                const matchDefault = memberDocs?.[memberDocs.length - 1].match(/^\s*Default:\s*`([^`]+)`\s*$/);
                let defaultValue: string | undefined;
                if (matchDefault) {
                    defaultValue = matchDefault[1];
                    memberDocs.pop();
                }
                return {
                    kind: 'member',
                    docs: trimArray(memberDocs),
                    name: formatNode(node.name),
                    type: formatNode(node),
                    optional: !!node.questionToken,
                    defaultValue,
                };
            }),
            typeParams: node.typeParameters?.map(formatNode),
        };
    }

    if (ts.isParenthesizedTypeNode(node) || ts.isPropertySignature(node)) {
        return formatNode(node.type);
    }

    if (ts.isArrayTypeNode(node)) {
        return {
            kind: 'array',
            type: formatNode(node.elementType),
        };
    }

    if (ts.isTupleTypeNode(node)) {
        return {
            kind: 'tuple',
            type: node.elements.map(formatNode),
        };
    }

    if (ts.isParameter(node)) {
        return {
            kind: 'param',
            name: printNode(node.name),
            type: formatNode(node.type),
        };
    }

    if (ts.isTypeReferenceNode(node)) {
        const nodeType = formatNode(node.typeName);
        if (nodeType === 'Array') {
            return {
                kind: 'array',
                type:
                    node.typeArguments.length === 1
                        ? formatNode(node.typeArguments[0])
                        : node.typeArguments.map(formatNode),
            };
        }
        return node.typeArguments
            ? {
                  kind: 'typeRef',
                  type: nodeType,
                  typeArguments: node.typeArguments.map(formatNode),
              }
            : nodeType;
    }

    if (ts.isIndexedAccessTypeNode(node)) {
        return {
            kind: 'indexAccess',
            type: formatNode(node.objectType),
            index: printNode(node.indexType),
        };
    }

    switch (node.kind) {
        case ts.SyntaxKind.AnyKeyword:
        case ts.SyntaxKind.BooleanKeyword:
        case ts.SyntaxKind.Identifier:
        case ts.SyntaxKind.LiteralType:
        case ts.SyntaxKind.NeverKeyword:
        case ts.SyntaxKind.NumberKeyword:
        case ts.SyntaxKind.StringKeyword:
        case ts.SyntaxKind.StringLiteral:
        case ts.SyntaxKind.SymbolKeyword:
        case ts.SyntaxKind.TypeOperator:
        case ts.SyntaxKind.UndefinedKeyword:
        case ts.SyntaxKind.UnknownKeyword:
        case ts.SyntaxKind.VoidKeyword:
            return printNode(node);

        case ts.SyntaxKind.MappedType:
            const output = printNode(node);
            console.warn('Avoid using MappedType in user facing typings.', output);
            return output;

        default:
            // data structure used for locating and debugging undefined node kinds - uncomment when needed
            // return { _unknown: ts.SyntaxKind[node.kind], _output: printNode(node) };
            throw Error(`Unknown node kind "${ts.SyntaxKind[node.kind]}"\n${printNode(node)}`);
    }
}

function getJsDoc(node: ts.Node & { jsDoc?: { getFullText(): string }[] }) {
    return trimArray(
        node.jsDoc?.flatMap((doc) =>
            doc
                .getFullText()
                .split('\n')
                .map((line) =>
                    line
                        .replace(/\*\/\s*$/, '')
                        .replace(/^\s*(\/\*{1,2}|\*)/, '')
                        .trim()
                )
        )
    );
}

export function printNode(node: ts.Node) {
    try {
        return tsPrinter.printNode(ts.EmitHint.Unspecified, node, node.getSourceFile()).replace(/\n\s*/g, ' ');
    } catch (e) {
        return null;
    }
}

function trimArray(array?: string[]): string[] {
    return array?.join('\n').trim().split('\n');
}
