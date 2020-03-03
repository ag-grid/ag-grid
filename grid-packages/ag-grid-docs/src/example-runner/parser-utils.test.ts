import {
    removeFunctionKeyword,
    getFunctionName,
    nodeIsVarWithName,
    nodeIsPropertyWithName,
    nodeIsFunctionWithName,
    nodeIsFunctionCall,
    convertFunctionToProperty,
    nodeIsGlobalFunctionCall
} from './parser-utils';

describe('convertFunctionToProperty', () => {
    it('returns property definition', () => {
        const functionDefinition = 'function foo(bar) { return true; }';
        const propertyDefinition = convertFunctionToProperty(functionDefinition);

        expect(propertyDefinition).toBe('foo = (bar) => { return true; }');
    });
});

describe('removeFunctionKeyword', () => {
    it('removes function keyword', () => {
        const functionDefinition = 'function foo(bar) { return true; }';
        const removed = removeFunctionKeyword(functionDefinition);

        expect(removed).toBe('foo(bar) { return true; }');
    });
});

describe('getFunctionName', () => {
    it('returns function name', () => {
        const functionDefinition = 'function foo(bar) { return true; }';
        const name = getFunctionName(functionDefinition);

        expect(name).toBe('foo');
    });
});

describe('nodeIsVarWithName', () => {
    it('returns true if node is var with matching name', () => {
        const name = 'foo';
        const node = {
            type: 'VariableDeclaration',
            declarations: [
                {
                    id: {
                        name
                    }
                }
            ]
        };

        expect(nodeIsVarWithName(node, name)).toBe(true);
    });

    it('returns false if node is var with different name', () => {
        const node = {
            type: 'VariableDeclaration',
            declarations: [
                {
                    id: {
                        name: 'bar'
                    }
                }
            ]
        };

        expect(nodeIsVarWithName(node, 'foo')).toBe(false);
    });

    it('returns false if node has matching name but is not a variable', () => {
        const name = 'foo';
        const node = {
            type: 'FunctionDeclaration',
            declarations: [
                {
                    id: {
                        name
                    }
                }
            ]
        };

        expect(nodeIsVarWithName(node, name)).toBe(false);
    });
});

describe('nodeIsPropertyWithName', () => {
    it('returns true if node is property with matching name', () => {
        const name = 'foo';
        const node = {
            key: {
                name
            },
            value: {
                type: 'Something',
            }
        };

        expect(nodeIsPropertyWithName(node, name)).toBe(true);
    });

    it('returns false if node is property with different name', () => {
        const node = {
            key: {
                name: 'bar'
            },
            value: {
                type: 'Something',
            }
        };

        expect(nodeIsPropertyWithName(node, 'foo')).toBe(false);
    });

    it('returns false if node has matching name but is not a property', () => {
        const name = 'foo';
        const node = {
            key: {
                name
            },
            value: {
                type: 'Identifier',
            }
        };

        expect(nodeIsPropertyWithName(node, name)).toBe(false);
    });
});

describe('nodeIsFunctionWithName', () => {
    it('returns true if node is function with matching name', () => {
        const name = 'foo';
        const node = {
            type: 'FunctionDeclaration',
            id: {
                name
            }
        };

        expect(nodeIsFunctionWithName(node, name)).toBe(true);
    });

    it('returns false if node is function with different name', () => {
        const node = {
            type: 'FunctionDeclaration',
            id: {
                name: 'bar'
            }
        };

        expect(nodeIsFunctionWithName(node, 'foo')).toBe(false);
    });

    it('returns false if node has matching name but is not a function', () => {
        const name = 'foo';
        const node = {
            type: 'VariableDeclaration',
            id: {
                name
            }
        };

        expect(nodeIsFunctionWithName(node, name)).toBe(false);
    });
});

describe('nodeIsFunctionCall', () => {
    it('returns true if node is an expression with a call', () => {
        const node = {
            type: 'ExpressionStatement',
            expression: {
                type: 'CallExpression',
            }
        };

        expect(nodeIsFunctionCall(node)).toBe(true);
    });

    it('returns false if node is an expression with something other than a call', () => {
        const node = {
            type: 'ExpressionStatement',
            expression: {
                type: 'LiteralExpression',
            }
        };

        expect(nodeIsFunctionCall(node)).toBe(false);
    });
});

describe('nodeIsGlobalFunctionCall', () => {
    it('returns true if node is an expression with a call using identifier', () => {
        const node = {
            type: 'ExpressionStatement',
            expression: {
                type: 'CallExpression',
            },
            callee: {
                type: 'Identifier',
            },
        };

        expect(nodeIsGlobalFunctionCall(node)).toBe(true);
    });

    it('returns false if node is an expression with a call but no callee', () => {
        const node = {
            type: 'ExpressionStatement',
            expression: {
                type: 'LiteralExpression',
            },
        };

        expect(nodeIsGlobalFunctionCall(node)).toBe(false);
    });

    it('returns false if node is an expression with a call using something other than an identifier', () => {
        const node = {
            type: 'ExpressionStatement',
            expression: {
                type: 'CallExpression',
            },
            callee: {
                type: 'MemberExpression',
            },
        };

        expect(nodeIsGlobalFunctionCall(node)).toBe(false);
    });

    it('returns false if node is an expression with something other than a call using identifier', () => {
        const node = {
            type: 'ExpressionStatement',
            expression: {
                type: 'LiteralExpression',
            },
            callee: {
                type: 'Identifier',
            },
        };

        expect(nodeIsGlobalFunctionCall(node)).toBe(false);
    });
});