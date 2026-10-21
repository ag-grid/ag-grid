import ts from 'typescript';

const ROLE_PARAMS = new Set(['TData', 'TValue', 'TContext']);

/**
 * Flags a type argument named `TData`, `TValue` or `TContext` that fills a type parameter declared with a different
 * one of those names, e.g. `Column<TData>` where `Column<TValue, TData>` expects a value type first.
 */
export default {
    meta: {
        type: 'problem',
        schema: [],
        messages: {
            mismatch:
                "'{{arg}}' is passed for '{{param}}' of '{{name}}'. Pass the matching type argument, or '{{param}}' by position (e.g. `any`).",
        },
    },
    create(context) {
        const services = context.sourceCode.parserServices;
        if (!services?.program || !services.esTreeNodeToTSNodeMap) {
            return {};
        }
        const checker = services.program.getTypeChecker();

        function declaredParamNames(nameNode) {
            let symbol = checker.getSymbolAtLocation(services.esTreeNodeToTSNodeMap.get(nameNode));
            if (symbol && symbol.flags & ts.SymbolFlags.Alias) {
                symbol = checker.getAliasedSymbol(symbol);
            }
            const declarations = symbol?.declarations ?? [];
            for (let i = 0, len = declarations.length; i < len; ++i) {
                const typeParameters = declarations[i].typeParameters;
                if (typeParameters?.length) {
                    return typeParameters.map((p) => p.name.text);
                }
            }
            return null;
        }

        function check(nameNode, typeArguments) {
            if (!typeArguments?.params.length) {
                return;
            }
            const paramNames = declaredParamNames(nameNode);
            if (!paramNames) {
                return;
            }
            const params = typeArguments.params;
            for (let i = 0, len = Math.min(params.length, paramNames.length); i < len; ++i) {
                const arg = params[i];
                if (arg.type !== 'TSTypeReference' || arg.typeName.type !== 'Identifier' || arg.typeArguments) {
                    continue;
                }
                const argName = arg.typeName.name;
                const paramName = paramNames[i];
                if (ROLE_PARAMS.has(argName) && ROLE_PARAMS.has(paramName) && argName !== paramName) {
                    context.report({
                        node: arg,
                        messageId: 'mismatch',
                        data: { arg: argName, param: paramName, name: nameNode.name ?? nameNode.right?.name },
                    });
                }
            }
        }

        return {
            TSTypeReference(node) {
                check(node.typeName, node.typeArguments);
            },
            TSInterfaceHeritage(node) {
                check(node.expression, node.typeArguments);
            },
            TSClassImplements(node) {
                check(node.expression, node.typeArguments);
            },
        };
    },
};
