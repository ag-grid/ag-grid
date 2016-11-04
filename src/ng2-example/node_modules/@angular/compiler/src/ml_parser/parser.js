/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
import { isBlank, isPresent } from '../facade/lang';
import { ParseError, ParseSourceSpan } from '../parse_util';
import * as html from './ast';
import { DEFAULT_INTERPOLATION_CONFIG } from './interpolation_config';
import * as lex from './lexer';
import { getNsPrefix, mergeNsAndName } from './tags';
export var TreeError = (function (_super) {
    __extends(TreeError, _super);
    function TreeError(elementName, span, msg) {
        _super.call(this, span, msg);
        this.elementName = elementName;
    }
    TreeError.create = function (elementName, span, msg) {
        return new TreeError(elementName, span, msg);
    };
    return TreeError;
}(ParseError));
export var ParseTreeResult = (function () {
    function ParseTreeResult(rootNodes, errors) {
        this.rootNodes = rootNodes;
        this.errors = errors;
    }
    return ParseTreeResult;
}());
export var Parser = (function () {
    function Parser(getTagDefinition) {
        this.getTagDefinition = getTagDefinition;
    }
    Parser.prototype.parse = function (source, url, parseExpansionForms, interpolationConfig) {
        if (parseExpansionForms === void 0) { parseExpansionForms = false; }
        if (interpolationConfig === void 0) { interpolationConfig = DEFAULT_INTERPOLATION_CONFIG; }
        var tokensAndErrors = lex.tokenize(source, url, this.getTagDefinition, parseExpansionForms, interpolationConfig);
        var treeAndErrors = new _TreeBuilder(tokensAndErrors.tokens, this.getTagDefinition).build();
        return new ParseTreeResult(treeAndErrors.rootNodes, tokensAndErrors.errors.concat(treeAndErrors.errors));
    };
    return Parser;
}());
var _TreeBuilder = (function () {
    function _TreeBuilder(tokens, getTagDefinition) {
        this.tokens = tokens;
        this.getTagDefinition = getTagDefinition;
        this._index = -1;
        this._rootNodes = [];
        this._errors = [];
        this._elementStack = [];
        this._advance();
    }
    _TreeBuilder.prototype.build = function () {
        while (this._peek.type !== lex.TokenType.EOF) {
            if (this._peek.type === lex.TokenType.TAG_OPEN_START) {
                this._consumeStartTag(this._advance());
            }
            else if (this._peek.type === lex.TokenType.TAG_CLOSE) {
                this._consumeEndTag(this._advance());
            }
            else if (this._peek.type === lex.TokenType.CDATA_START) {
                this._closeVoidElement();
                this._consumeCdata(this._advance());
            }
            else if (this._peek.type === lex.TokenType.COMMENT_START) {
                this._closeVoidElement();
                this._consumeComment(this._advance());
            }
            else if (this._peek.type === lex.TokenType.TEXT || this._peek.type === lex.TokenType.RAW_TEXT ||
                this._peek.type === lex.TokenType.ESCAPABLE_RAW_TEXT) {
                this._closeVoidElement();
                this._consumeText(this._advance());
            }
            else if (this._peek.type === lex.TokenType.EXPANSION_FORM_START) {
                this._consumeExpansion(this._advance());
            }
            else {
                // Skip all other tokens...
                this._advance();
            }
        }
        return new ParseTreeResult(this._rootNodes, this._errors);
    };
    _TreeBuilder.prototype._advance = function () {
        var prev = this._peek;
        if (this._index < this.tokens.length - 1) {
            // Note: there is always an EOF token at the end
            this._index++;
        }
        this._peek = this.tokens[this._index];
        return prev;
    };
    _TreeBuilder.prototype._advanceIf = function (type) {
        if (this._peek.type === type) {
            return this._advance();
        }
        return null;
    };
    _TreeBuilder.prototype._consumeCdata = function (startToken) {
        this._consumeText(this._advance());
        this._advanceIf(lex.TokenType.CDATA_END);
    };
    _TreeBuilder.prototype._consumeComment = function (token) {
        var text = this._advanceIf(lex.TokenType.RAW_TEXT);
        this._advanceIf(lex.TokenType.COMMENT_END);
        var value = isPresent(text) ? text.parts[0].trim() : null;
        this._addToParent(new html.Comment(value, token.sourceSpan));
    };
    _TreeBuilder.prototype._consumeExpansion = function (token) {
        var switchValue = this._advance();
        var type = this._advance();
        var cases = [];
        // read =
        while (this._peek.type === lex.TokenType.EXPANSION_CASE_VALUE) {
            var expCase = this._parseExpansionCase();
            if (!expCase)
                return; // error
            cases.push(expCase);
        }
        // read the final }
        if (this._peek.type !== lex.TokenType.EXPANSION_FORM_END) {
            this._errors.push(TreeError.create(null, this._peek.sourceSpan, "Invalid ICU message. Missing '}'."));
            return;
        }
        var sourceSpan = new ParseSourceSpan(token.sourceSpan.start, this._peek.sourceSpan.end);
        this._addToParent(new html.Expansion(switchValue.parts[0], type.parts[0], cases, sourceSpan, switchValue.sourceSpan));
        this._advance();
    };
    _TreeBuilder.prototype._parseExpansionCase = function () {
        var value = this._advance();
        // read {
        if (this._peek.type !== lex.TokenType.EXPANSION_CASE_EXP_START) {
            this._errors.push(TreeError.create(null, this._peek.sourceSpan, "Invalid ICU message. Missing '{'."));
            return null;
        }
        // read until }
        var start = this._advance();
        var exp = this._collectExpansionExpTokens(start);
        if (!exp)
            return null;
        var end = this._advance();
        exp.push(new lex.Token(lex.TokenType.EOF, [], end.sourceSpan));
        // parse everything in between { and }
        var parsedExp = new _TreeBuilder(exp, this.getTagDefinition).build();
        if (parsedExp.errors.length > 0) {
            this._errors = this._errors.concat(parsedExp.errors);
            return null;
        }
        var sourceSpan = new ParseSourceSpan(value.sourceSpan.start, end.sourceSpan.end);
        var expSourceSpan = new ParseSourceSpan(start.sourceSpan.start, end.sourceSpan.end);
        return new html.ExpansionCase(value.parts[0], parsedExp.rootNodes, sourceSpan, value.sourceSpan, expSourceSpan);
    };
    _TreeBuilder.prototype._collectExpansionExpTokens = function (start) {
        var exp = [];
        var expansionFormStack = [lex.TokenType.EXPANSION_CASE_EXP_START];
        while (true) {
            if (this._peek.type === lex.TokenType.EXPANSION_FORM_START ||
                this._peek.type === lex.TokenType.EXPANSION_CASE_EXP_START) {
                expansionFormStack.push(this._peek.type);
            }
            if (this._peek.type === lex.TokenType.EXPANSION_CASE_EXP_END) {
                if (lastOnStack(expansionFormStack, lex.TokenType.EXPANSION_CASE_EXP_START)) {
                    expansionFormStack.pop();
                    if (expansionFormStack.length == 0)
                        return exp;
                }
                else {
                    this._errors.push(TreeError.create(null, start.sourceSpan, "Invalid ICU message. Missing '}'."));
                    return null;
                }
            }
            if (this._peek.type === lex.TokenType.EXPANSION_FORM_END) {
                if (lastOnStack(expansionFormStack, lex.TokenType.EXPANSION_FORM_START)) {
                    expansionFormStack.pop();
                }
                else {
                    this._errors.push(TreeError.create(null, start.sourceSpan, "Invalid ICU message. Missing '}'."));
                    return null;
                }
            }
            if (this._peek.type === lex.TokenType.EOF) {
                this._errors.push(TreeError.create(null, start.sourceSpan, "Invalid ICU message. Missing '}'."));
                return null;
            }
            exp.push(this._advance());
        }
    };
    _TreeBuilder.prototype._consumeText = function (token) {
        var text = token.parts[0];
        if (text.length > 0 && text[0] == '\n') {
            var parent_1 = this._getParentElement();
            if (isPresent(parent_1) && parent_1.children.length == 0 &&
                this.getTagDefinition(parent_1.name).ignoreFirstLf) {
                text = text.substring(1);
            }
        }
        if (text.length > 0) {
            this._addToParent(new html.Text(text, token.sourceSpan));
        }
    };
    _TreeBuilder.prototype._closeVoidElement = function () {
        if (this._elementStack.length > 0) {
            var el = this._elementStack[this._elementStack.length - 1];
            if (this.getTagDefinition(el.name).isVoid) {
                this._elementStack.pop();
            }
        }
    };
    _TreeBuilder.prototype._consumeStartTag = function (startTagToken) {
        var prefix = startTagToken.parts[0];
        var name = startTagToken.parts[1];
        var attrs = [];
        while (this._peek.type === lex.TokenType.ATTR_NAME) {
            attrs.push(this._consumeAttr(this._advance()));
        }
        var fullName = this._getElementFullName(prefix, name, this._getParentElement());
        var selfClosing = false;
        // Note: There could have been a tokenizer error
        // so that we don't get a token for the end tag...
        if (this._peek.type === lex.TokenType.TAG_OPEN_END_VOID) {
            this._advance();
            selfClosing = true;
            var tagDef = this.getTagDefinition(fullName);
            if (!(tagDef.canSelfClose || getNsPrefix(fullName) !== null || tagDef.isVoid)) {
                this._errors.push(TreeError.create(fullName, startTagToken.sourceSpan, "Only void and foreign elements can be self closed \"" + startTagToken.parts[1] + "\""));
            }
        }
        else if (this._peek.type === lex.TokenType.TAG_OPEN_END) {
            this._advance();
            selfClosing = false;
        }
        var end = this._peek.sourceSpan.start;
        var span = new ParseSourceSpan(startTagToken.sourceSpan.start, end);
        var el = new html.Element(fullName, attrs, [], span, span, null);
        this._pushElement(el);
        if (selfClosing) {
            this._popElement(fullName);
            el.endSourceSpan = span;
        }
    };
    _TreeBuilder.prototype._pushElement = function (el) {
        if (this._elementStack.length > 0) {
            var parentEl = this._elementStack[this._elementStack.length - 1];
            if (this.getTagDefinition(parentEl.name).isClosedByChild(el.name)) {
                this._elementStack.pop();
            }
        }
        var tagDef = this.getTagDefinition(el.name);
        var _a = this._getParentElementSkippingContainers(), parent = _a.parent, container = _a.container;
        if (isPresent(parent) && tagDef.requireExtraParent(parent.name)) {
            var newParent = new html.Element(tagDef.parentToAdd, [], [], el.sourceSpan, el.startSourceSpan, el.endSourceSpan);
            this._insertBeforeContainer(parent, container, newParent);
        }
        this._addToParent(el);
        this._elementStack.push(el);
    };
    _TreeBuilder.prototype._consumeEndTag = function (endTagToken) {
        var fullName = this._getElementFullName(endTagToken.parts[0], endTagToken.parts[1], this._getParentElement());
        if (this._getParentElement()) {
            this._getParentElement().endSourceSpan = endTagToken.sourceSpan;
        }
        if (this.getTagDefinition(fullName).isVoid) {
            this._errors.push(TreeError.create(fullName, endTagToken.sourceSpan, "Void elements do not have end tags \"" + endTagToken.parts[1] + "\""));
        }
        else if (!this._popElement(fullName)) {
            this._errors.push(TreeError.create(fullName, endTagToken.sourceSpan, "Unexpected closing tag \"" + endTagToken.parts[1] + "\""));
        }
    };
    _TreeBuilder.prototype._popElement = function (fullName) {
        for (var stackIndex = this._elementStack.length - 1; stackIndex >= 0; stackIndex--) {
            var el = this._elementStack[stackIndex];
            if (el.name == fullName) {
                this._elementStack.splice(stackIndex, this._elementStack.length - stackIndex);
                return true;
            }
            if (!this.getTagDefinition(el.name).closedByParent) {
                return false;
            }
        }
        return false;
    };
    _TreeBuilder.prototype._consumeAttr = function (attrName) {
        var fullName = mergeNsAndName(attrName.parts[0], attrName.parts[1]);
        var end = attrName.sourceSpan.end;
        var value = '';
        var valueSpan;
        if (this._peek.type === lex.TokenType.ATTR_VALUE) {
            var valueToken = this._advance();
            value = valueToken.parts[0];
            end = valueToken.sourceSpan.end;
            valueSpan = valueToken.sourceSpan;
        }
        return new html.Attribute(fullName, value, new ParseSourceSpan(attrName.sourceSpan.start, end), valueSpan);
    };
    _TreeBuilder.prototype._getParentElement = function () {
        return this._elementStack.length > 0 ? this._elementStack[this._elementStack.length - 1] : null;
    };
    /**
     * Returns the parent in the DOM and the container.
     *
     * `<ng-container>` elements are skipped as they are not rendered as DOM element.
     */
    _TreeBuilder.prototype._getParentElementSkippingContainers = function () {
        var container = null;
        for (var i = this._elementStack.length - 1; i >= 0; i--) {
            if (this._elementStack[i].name !== 'ng-container') {
                return { parent: this._elementStack[i], container: container };
            }
            container = this._elementStack[i];
        }
        return { parent: this._elementStack[this._elementStack.length - 1], container: container };
    };
    _TreeBuilder.prototype._addToParent = function (node) {
        var parent = this._getParentElement();
        if (isPresent(parent)) {
            parent.children.push(node);
        }
        else {
            this._rootNodes.push(node);
        }
    };
    /**
     * Insert a node between the parent and the container.
     * When no container is given, the node is appended as a child of the parent.
     * Also updates the element stack accordingly.
     *
     * @internal
     */
    _TreeBuilder.prototype._insertBeforeContainer = function (parent, container, node) {
        if (!container) {
            this._addToParent(node);
            this._elementStack.push(node);
        }
        else {
            if (parent) {
                // replace the container with the new node in the children
                var index = parent.children.indexOf(container);
                parent.children[index] = node;
            }
            else {
                this._rootNodes.push(node);
            }
            node.children.push(container);
            this._elementStack.splice(this._elementStack.indexOf(container), 0, node);
        }
    };
    _TreeBuilder.prototype._getElementFullName = function (prefix, localName, parentElement) {
        if (isBlank(prefix)) {
            prefix = this.getTagDefinition(localName).implicitNamespacePrefix;
            if (isBlank(prefix) && isPresent(parentElement)) {
                prefix = getNsPrefix(parentElement.name);
            }
        }
        return mergeNsAndName(prefix, localName);
    };
    return _TreeBuilder;
}());
function lastOnStack(stack, element) {
    return stack.length > 0 && stack[stack.length - 1] === element;
}
//# sourceMappingURL=parser.js.map