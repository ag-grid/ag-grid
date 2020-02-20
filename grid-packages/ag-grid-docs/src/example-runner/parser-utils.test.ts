import { removeFunctionKeyword, getFunctionName, NodeType, nodeIsVarWithName, nodeIsPropertyWithName, nodeIsFunctionWithName } from './parser-utils';

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
