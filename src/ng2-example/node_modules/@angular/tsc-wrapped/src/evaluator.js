"use strict";
var ts = require('typescript');
var schema_1 = require('./schema');
function isMethodCallOf(callExpression, memberName) {
    var expression = callExpression.expression;
    if (expression.kind === ts.SyntaxKind.PropertyAccessExpression) {
        var propertyAccessExpression = expression;
        var name_1 = propertyAccessExpression.name;
        if (name_1.kind == ts.SyntaxKind.Identifier) {
            return name_1.text === memberName;
        }
    }
    return false;
}
function isCallOf(callExpression, ident) {
    var expression = callExpression.expression;
    if (expression.kind === ts.SyntaxKind.Identifier) {
        var identifier = expression;
        return identifier.text === ident;
    }
    return false;
}
/**
 * ts.forEachChild stops iterating children when the callback return a truthy value.
 * This method inverts this to implement an `every` style iterator. It will return
 * true if every call to `cb` returns `true`.
 */
function everyNodeChild(node, cb) {
    return !ts.forEachChild(node, function (node) { return !cb(node); });
}
function isPrimitive(value) {
    return Object(value) !== value;
}
exports.isPrimitive = isPrimitive;
function isDefined(obj) {
    return obj !== undefined;
}
function getSourceFileOfNode(node) {
    while (node && node.kind != ts.SyntaxKind.SourceFile) {
        node = node.parent;
    }
    return node;
}
/* @internal */
function errorSymbol(message, node, context, sourceFile) {
    var result;
    if (node) {
        sourceFile = sourceFile || getSourceFileOfNode(node);
        if (sourceFile) {
            var _a = ts.getLineAndCharacterOfPosition(sourceFile, node.getStart(sourceFile)), line = _a.line, character = _a.character;
            result = { __symbolic: 'error', message: message, line: line, character: character };
        }
        ;
    }
    if (!result) {
        result = { __symbolic: 'error', message: message };
    }
    if (context) {
        result.context = context;
    }
    return result;
}
exports.errorSymbol = errorSymbol;
/**
 * Produce a symbolic representation of an expression folding values into their final value when
 * possible.
 */
var Evaluator = (function () {
    function Evaluator(symbols, nodeMap) {
        this.symbols = symbols;
        this.nodeMap = nodeMap;
    }
    Evaluator.prototype.nameOf = function (node) {
        if (node.kind == ts.SyntaxKind.Identifier) {
            return node.text;
        }
        var result = this.evaluateNode(node);
        if (schema_1.isMetadataError(result) || typeof result === 'string') {
            return result;
        }
        else {
            return errorSymbol('Name expected', node, { received: node.getText() });
        }
    };
    /**
     * Returns true if the expression represented by `node` can be folded into a literal expression.
     *
     * For example, a literal is always foldable. This means that literal expressions such as `1.2`
     * `"Some value"` `true` `false` are foldable.
     *
     * - An object literal is foldable if all the properties in the literal are foldable.
     * - An array literal is foldable if all the elements are foldable.
     * - A call is foldable if it is a call to a Array.prototype.concat or a call to CONST_EXPR.
     * - A property access is foldable if the object is foldable.
     * - A array index is foldable if index expression is foldable and the array is foldable.
     * - Binary operator expressions are foldable if the left and right expressions are foldable and
     *   it is one of '+', '-', '*', '/', '%', '||', and '&&'.
     * - An identifier is foldable if a value can be found for its symbol in the evaluator symbol
     *   table.
     */
    Evaluator.prototype.isFoldable = function (node) {
        return this.isFoldableWorker(node, new Map());
    };
    Evaluator.prototype.isFoldableWorker = function (node, folding) {
        var _this = this;
        if (node) {
            switch (node.kind) {
                case ts.SyntaxKind.ObjectLiteralExpression:
                    return everyNodeChild(node, function (child) {
                        if (child.kind === ts.SyntaxKind.PropertyAssignment) {
                            var propertyAssignment = child;
                            return _this.isFoldableWorker(propertyAssignment.initializer, folding);
                        }
                        return false;
                    });
                case ts.SyntaxKind.ArrayLiteralExpression:
                    return everyNodeChild(node, function (child) { return _this.isFoldableWorker(child, folding); });
                case ts.SyntaxKind.CallExpression:
                    var callExpression = node;
                    // We can fold a <array>.concat(<v>).
                    if (isMethodCallOf(callExpression, 'concat') && callExpression.arguments.length === 1) {
                        var arrayNode = callExpression.expression.expression;
                        if (this.isFoldableWorker(arrayNode, folding) &&
                            this.isFoldableWorker(callExpression.arguments[0], folding)) {
                            // It needs to be an array.
                            var arrayValue = this.evaluateNode(arrayNode);
                            if (arrayValue && Array.isArray(arrayValue)) {
                                return true;
                            }
                        }
                    }
                    // We can fold a call to CONST_EXPR
                    if (isCallOf(callExpression, 'CONST_EXPR') && callExpression.arguments.length === 1)
                        return this.isFoldableWorker(callExpression.arguments[0], folding);
                    return false;
                case ts.SyntaxKind.NoSubstitutionTemplateLiteral:
                case ts.SyntaxKind.StringLiteral:
                case ts.SyntaxKind.NumericLiteral:
                case ts.SyntaxKind.NullKeyword:
                case ts.SyntaxKind.TrueKeyword:
                case ts.SyntaxKind.FalseKeyword:
                    return true;
                case ts.SyntaxKind.ParenthesizedExpression:
                    var parenthesizedExpression = node;
                    return this.isFoldableWorker(parenthesizedExpression.expression, folding);
                case ts.SyntaxKind.BinaryExpression:
                    var binaryExpression = node;
                    switch (binaryExpression.operatorToken.kind) {
                        case ts.SyntaxKind.PlusToken:
                        case ts.SyntaxKind.MinusToken:
                        case ts.SyntaxKind.AsteriskToken:
                        case ts.SyntaxKind.SlashToken:
                        case ts.SyntaxKind.PercentToken:
                        case ts.SyntaxKind.AmpersandAmpersandToken:
                        case ts.SyntaxKind.BarBarToken:
                            return this.isFoldableWorker(binaryExpression.left, folding) &&
                                this.isFoldableWorker(binaryExpression.right, folding);
                        default:
                            return false;
                    }
                case ts.SyntaxKind.PropertyAccessExpression:
                    var propertyAccessExpression = node;
                    return this.isFoldableWorker(propertyAccessExpression.expression, folding);
                case ts.SyntaxKind.ElementAccessExpression:
                    var elementAccessExpression = node;
                    return this.isFoldableWorker(elementAccessExpression.expression, folding) &&
                        this.isFoldableWorker(elementAccessExpression.argumentExpression, folding);
                case ts.SyntaxKind.Identifier:
                    var identifier = node;
                    var reference = this.symbols.resolve(identifier.text);
                    if (reference !== undefined && isPrimitive(reference)) {
                        return true;
                    }
                    break;
            }
        }
        return false;
    };
    /**
     * Produce a JSON serialiable object representing `node`. The foldable values in the expression
     * tree are folded. For example, a node representing `1 + 2` is folded into `3`.
     */
    Evaluator.prototype.evaluateNode = function (node) {
        var _this = this;
        var t = this;
        var error;
        function recordEntry(entry, node) {
            t.nodeMap.set(entry, node);
            return entry;
        }
        switch (node.kind) {
            case ts.SyntaxKind.ObjectLiteralExpression:
                var obj_1 = {};
                ts.forEachChild(node, function (child) {
                    switch (child.kind) {
                        case ts.SyntaxKind.ShorthandPropertyAssignment:
                        case ts.SyntaxKind.PropertyAssignment:
                            var assignment = child;
                            var propertyName = _this.nameOf(assignment.name);
                            if (schema_1.isMetadataError(propertyName)) {
                                error = propertyName;
                                return true;
                            }
                            var propertyValue = isPropertyAssignment(assignment) ?
                                _this.evaluateNode(assignment.initializer) :
                                { __symbolic: 'reference', name: propertyName };
                            if (schema_1.isMetadataError(propertyValue)) {
                                error = propertyValue;
                                return true; // Stop the forEachChild.
                            }
                            else {
                                obj_1[propertyName] = propertyValue;
                            }
                    }
                });
                if (error)
                    return error;
                return obj_1;
            case ts.SyntaxKind.ArrayLiteralExpression:
                var arr_1 = [];
                ts.forEachChild(node, function (child) {
                    var value = _this.evaluateNode(child);
                    // Check for error
                    if (schema_1.isMetadataError(value)) {
                        error = value;
                        return true; // Stop the forEachChild.
                    }
                    // Handle spread expressions
                    if (schema_1.isMetadataSymbolicSpreadExpression(value)) {
                        if (Array.isArray(value.expression)) {
                            for (var _i = 0, _a = value.expression; _i < _a.length; _i++) {
                                var spreadValue = _a[_i];
                                arr_1.push(spreadValue);
                            }
                            return;
                        }
                    }
                    arr_1.push(value);
                });
                if (error)
                    return error;
                return arr_1;
            case ts.SyntaxKind.SpreadElementExpression:
                var spread = node;
                var spreadExpression = this.evaluateNode(spread.expression);
                return recordEntry({ __symbolic: 'spread', expression: spreadExpression }, node);
            case ts.SyntaxKind.CallExpression:
                var callExpression = node;
                if (isCallOf(callExpression, 'forwardRef') && callExpression.arguments.length === 1) {
                    var firstArgument = callExpression.arguments[0];
                    if (firstArgument.kind == ts.SyntaxKind.ArrowFunction) {
                        var arrowFunction = firstArgument;
                        return recordEntry(this.evaluateNode(arrowFunction.body), node);
                    }
                }
                var args_1 = callExpression.arguments.map(function (arg) { return _this.evaluateNode(arg); });
                if (args_1.some(schema_1.isMetadataError)) {
                    return args_1.find(schema_1.isMetadataError);
                }
                if (this.isFoldable(callExpression)) {
                    if (isMethodCallOf(callExpression, 'concat')) {
                        var arrayValue = this.evaluateNode(callExpression.expression.expression);
                        if (schema_1.isMetadataError(arrayValue))
                            return arrayValue;
                        return arrayValue.concat(args_1[0]);
                    }
                }
                // Always fold a CONST_EXPR even if the argument is not foldable.
                if (isCallOf(callExpression, 'CONST_EXPR') && callExpression.arguments.length === 1) {
                    return recordEntry(args_1[0], node);
                }
                var expression = this.evaluateNode(callExpression.expression);
                if (schema_1.isMetadataError(expression)) {
                    return recordEntry(expression, node);
                }
                var result = { __symbolic: 'call', expression: expression };
                if (args_1 && args_1.length) {
                    result.arguments = args_1;
                }
                return recordEntry(result, node);
            case ts.SyntaxKind.NewExpression:
                var newExpression = node;
                var newArgs = newExpression.arguments.map(function (arg) { return _this.evaluateNode(arg); });
                if (newArgs.some(schema_1.isMetadataError)) {
                    return recordEntry(newArgs.find(schema_1.isMetadataError), node);
                }
                var newTarget = this.evaluateNode(newExpression.expression);
                if (schema_1.isMetadataError(newTarget)) {
                    return recordEntry(newTarget, node);
                }
                var call = { __symbolic: 'new', expression: newTarget };
                if (newArgs.length) {
                    call.arguments = newArgs;
                }
                return recordEntry(call, node);
            case ts.SyntaxKind.PropertyAccessExpression: {
                var propertyAccessExpression = node;
                var expression_1 = this.evaluateNode(propertyAccessExpression.expression);
                if (schema_1.isMetadataError(expression_1)) {
                    return recordEntry(expression_1, node);
                }
                var member = this.nameOf(propertyAccessExpression.name);
                if (schema_1.isMetadataError(member)) {
                    return recordEntry(member, node);
                }
                if (expression_1 && this.isFoldable(propertyAccessExpression.expression))
                    return expression_1[member];
                if (schema_1.isMetadataModuleReferenceExpression(expression_1)) {
                    // A select into a module refrence and be converted into a reference to the symbol
                    // in the module
                    return recordEntry({ __symbolic: 'reference', module: expression_1.module, name: member }, node);
                }
                return recordEntry({ __symbolic: 'select', expression: expression_1, member: member }, node);
            }
            case ts.SyntaxKind.ElementAccessExpression: {
                var elementAccessExpression = node;
                var expression_2 = this.evaluateNode(elementAccessExpression.expression);
                if (schema_1.isMetadataError(expression_2)) {
                    return recordEntry(expression_2, node);
                }
                var index = this.evaluateNode(elementAccessExpression.argumentExpression);
                if (schema_1.isMetadataError(expression_2)) {
                    return recordEntry(expression_2, node);
                }
                if (this.isFoldable(elementAccessExpression.expression) &&
                    this.isFoldable(elementAccessExpression.argumentExpression))
                    return expression_2[index];
                return recordEntry({ __symbolic: 'index', expression: expression_2, index: index }, node);
            }
            case ts.SyntaxKind.Identifier:
                var identifier = node;
                var name_2 = identifier.text;
                var reference = this.symbols.resolve(name_2);
                if (reference === undefined) {
                    // Encode as a global reference. StaticReflector will check the reference.
                    return recordEntry({ __symbolic: 'reference', name: name_2 }, node);
                }
                return reference;
            case ts.SyntaxKind.TypeReference:
                var typeReferenceNode = node;
                var typeNameNode_1 = typeReferenceNode.typeName;
                var getReference = function (node) {
                    if (typeNameNode_1.kind === ts.SyntaxKind.QualifiedName) {
                        var qualifiedName = node;
                        var left_1 = _this.evaluateNode(qualifiedName.left);
                        if (schema_1.isMetadataModuleReferenceExpression(left_1)) {
                            return recordEntry({
                                __symbolic: 'reference',
                                module: left_1.module,
                                name: qualifiedName.right.text
                            }, node);
                        }
                        // Record a type reference to a declared type as a select.
                        return { __symbolic: 'select', expression: left_1, member: qualifiedName.right.text };
                    }
                    else {
                        var identifier_1 = typeNameNode_1;
                        var symbol = _this.symbols.resolve(identifier_1.text);
                        if (schema_1.isMetadataError(symbol) || schema_1.isMetadataSymbolicReferenceExpression(symbol)) {
                            return recordEntry(symbol, node);
                        }
                        return recordEntry(errorSymbol('Could not resolve type', node, { typeName: identifier_1.text }), node);
                    }
                };
                var typeReference = getReference(typeNameNode_1);
                if (schema_1.isMetadataError(typeReference)) {
                    return recordEntry(typeReference, node);
                }
                if (!schema_1.isMetadataModuleReferenceExpression(typeReference) &&
                    typeReferenceNode.typeArguments && typeReferenceNode.typeArguments.length) {
                    var args_2 = typeReferenceNode.typeArguments.map(function (element) { return _this.evaluateNode(element); });
                    // TODO: Remove typecast when upgraded to 2.0 as it will be corretly inferred.
                    // Some versions of 1.9 do not infer this correctly.
                    typeReference.arguments = args_2;
                }
                return recordEntry(typeReference, node);
            case ts.SyntaxKind.NoSubstitutionTemplateLiteral:
                return node.text;
            case ts.SyntaxKind.StringLiteral:
                return node.text;
            case ts.SyntaxKind.NumericLiteral:
                return parseFloat(node.text);
            case ts.SyntaxKind.AnyKeyword:
                return recordEntry({ __symbolic: 'reference', name: 'any' }, node);
            case ts.SyntaxKind.StringKeyword:
                return recordEntry({ __symbolic: 'reference', name: 'string' }, node);
            case ts.SyntaxKind.NumberKeyword:
                return recordEntry({ __symbolic: 'reference', name: 'number' }, node);
            case ts.SyntaxKind.BooleanKeyword:
                return recordEntry({ __symbolic: 'reference', name: 'boolean' }, node);
            case ts.SyntaxKind.ArrayType:
                var arrayTypeNode = node;
                return recordEntry({
                    __symbolic: 'reference',
                    name: 'Array',
                    arguments: [this.evaluateNode(arrayTypeNode.elementType)]
                }, node);
            case ts.SyntaxKind.NullKeyword:
                return null;
            case ts.SyntaxKind.TrueKeyword:
                return true;
            case ts.SyntaxKind.FalseKeyword:
                return false;
            case ts.SyntaxKind.ParenthesizedExpression:
                var parenthesizedExpression = node;
                return this.evaluateNode(parenthesizedExpression.expression);
            case ts.SyntaxKind.TypeAssertionExpression:
                var typeAssertion = node;
                return this.evaluateNode(typeAssertion.expression);
            case ts.SyntaxKind.PrefixUnaryExpression:
                var prefixUnaryExpression = node;
                var operand = this.evaluateNode(prefixUnaryExpression.operand);
                if (isDefined(operand) && isPrimitive(operand)) {
                    switch (prefixUnaryExpression.operator) {
                        case ts.SyntaxKind.PlusToken:
                            return +operand;
                        case ts.SyntaxKind.MinusToken:
                            return -operand;
                        case ts.SyntaxKind.TildeToken:
                            return ~operand;
                        case ts.SyntaxKind.ExclamationToken:
                            return !operand;
                    }
                }
                var operatorText = void 0;
                switch (prefixUnaryExpression.operator) {
                    case ts.SyntaxKind.PlusToken:
                        operatorText = '+';
                        break;
                    case ts.SyntaxKind.MinusToken:
                        operatorText = '-';
                        break;
                    case ts.SyntaxKind.TildeToken:
                        operatorText = '~';
                        break;
                    case ts.SyntaxKind.ExclamationToken:
                        operatorText = '!';
                        break;
                    default:
                        return undefined;
                }
                return recordEntry({ __symbolic: 'pre', operator: operatorText, operand: operand }, node);
            case ts.SyntaxKind.BinaryExpression:
                var binaryExpression = node;
                var left = this.evaluateNode(binaryExpression.left);
                var right = this.evaluateNode(binaryExpression.right);
                if (isDefined(left) && isDefined(right)) {
                    if (isPrimitive(left) && isPrimitive(right))
                        switch (binaryExpression.operatorToken.kind) {
                            case ts.SyntaxKind.BarBarToken:
                                return left || right;
                            case ts.SyntaxKind.AmpersandAmpersandToken:
                                return left && right;
                            case ts.SyntaxKind.AmpersandToken:
                                return left & right;
                            case ts.SyntaxKind.BarToken:
                                return left | right;
                            case ts.SyntaxKind.CaretToken:
                                return left ^ right;
                            case ts.SyntaxKind.EqualsEqualsToken:
                                return left == right;
                            case ts.SyntaxKind.ExclamationEqualsToken:
                                return left != right;
                            case ts.SyntaxKind.EqualsEqualsEqualsToken:
                                return left === right;
                            case ts.SyntaxKind.ExclamationEqualsEqualsToken:
                                return left !== right;
                            case ts.SyntaxKind.LessThanToken:
                                return left < right;
                            case ts.SyntaxKind.GreaterThanToken:
                                return left > right;
                            case ts.SyntaxKind.LessThanEqualsToken:
                                return left <= right;
                            case ts.SyntaxKind.GreaterThanEqualsToken:
                                return left >= right;
                            case ts.SyntaxKind.LessThanLessThanToken:
                                return left << right;
                            case ts.SyntaxKind.GreaterThanGreaterThanToken:
                                return left >> right;
                            case ts.SyntaxKind.GreaterThanGreaterThanGreaterThanToken:
                                return left >>> right;
                            case ts.SyntaxKind.PlusToken:
                                return left + right;
                            case ts.SyntaxKind.MinusToken:
                                return left - right;
                            case ts.SyntaxKind.AsteriskToken:
                                return left * right;
                            case ts.SyntaxKind.SlashToken:
                                return left / right;
                            case ts.SyntaxKind.PercentToken:
                                return left % right;
                        }
                    return recordEntry({
                        __symbolic: 'binop',
                        operator: binaryExpression.operatorToken.getText(),
                        left: left,
                        right: right
                    }, node);
                }
                break;
            case ts.SyntaxKind.ConditionalExpression:
                var conditionalExpression = node;
                var condition = this.evaluateNode(conditionalExpression.condition);
                var thenExpression = this.evaluateNode(conditionalExpression.whenTrue);
                var elseExpression = this.evaluateNode(conditionalExpression.whenFalse);
                if (isPrimitive(condition)) {
                    return condition ? thenExpression : elseExpression;
                }
                return recordEntry({ __symbolic: 'if', condition: condition, thenExpression: thenExpression, elseExpression: elseExpression }, node);
            case ts.SyntaxKind.FunctionExpression:
            case ts.SyntaxKind.ArrowFunction:
                return recordEntry(errorSymbol('Function call not supported', node), node);
        }
        return recordEntry(errorSymbol('Expression form not supported', node), node);
    };
    return Evaluator;
}());
exports.Evaluator = Evaluator;
function isPropertyAssignment(node) {
    return node.kind == ts.SyntaxKind.PropertyAssignment;
}
//# sourceMappingURL=evaluator.js.map