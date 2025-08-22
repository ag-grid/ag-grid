// ESLint rule to disallow Math.random() in module/global context, but allow in functions, methods, and class fields
module.exports = {
    meta: {
        type: 'problem',
        messages: {
            noMathRandomInModule:
                'Do not use Math.random() in module/global context. Use inside functions, methods, or class fields only.',
        },
    },
    create(context) {
        return {
            "CallExpression[callee.object.name='Math'][callee.property.name='random']"(node) {
                let parent = node.parent;

                while (parent) {
                    // Allow in any function-like context (functions, methods, arrow functions)
                    if (
                        [
                            'FunctionDeclaration',
                            'FunctionExpression',
                            'ArrowFunctionExpression',
                            'MethodDefinition',
                        ].includes(parent.type)
                    ) {
                        return; // Allowed context - inside a function or method
                    }

                    // Allow in class field initializers (PropertyDefinition)
                    if (parent.type === 'PropertyDefinition') {
                        return; // Allowed context - class field
                    }

                    // Check if we're at the top level of the program
                    if (parent.type === 'Program') {
                        // We've reached the program level without finding an allowed context
                        context.report({
                            node,
                            messageId: 'noMathRandomInModule',
                        });
                        return;
                    }

                    parent = parent.parent;
                }
            },
        };
    },
};
