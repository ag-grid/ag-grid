/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as ml from '../../ml_parser/ast';
import { XmlParser } from '../../ml_parser/xml_parser';
import { I18nError } from '../parse_util';
import { extractPlaceholderToIds, extractPlaceholders } from './serializer';
var _TRANSLATIONS_TAG = 'translationbundle';
var _TRANSLATION_TAG = 'translation';
var _PLACEHOLDER_TAG = 'ph';
export var Xtb = (function () {
    function Xtb(_htmlParser, _interpolationConfig) {
        this._htmlParser = _htmlParser;
        this._interpolationConfig = _interpolationConfig;
    }
    Xtb.prototype.write = function (messageMap) { throw new Error('Unsupported'); };
    Xtb.prototype.load = function (content, url, messageBundle) {
        var _this = this;
        // Parse the xtb file into xml nodes
        var result = new XmlParser().parse(content, url);
        if (result.errors.length) {
            throw new Error("xtb parse errors:\n" + result.errors.join('\n'));
        }
        // Replace the placeholders, messages are now string
        var _a = new _Visitor().parse(result.rootNodes, messageBundle), messages = _a.messages, errors = _a.errors;
        if (errors.length) {
            throw new Error("xtb parse errors:\n" + errors.join('\n'));
        }
        // Convert the string messages to html ast
        // TODO(vicb): map error message back to the original message in xtb
        var messageMap = {};
        var parseErrors = [];
        Object.keys(messages).forEach(function (id) {
            var res = _this._htmlParser.parse(messages[id], url, true, _this._interpolationConfig);
            parseErrors.push.apply(parseErrors, res.errors);
            messageMap[id] = res.rootNodes;
        });
        if (parseErrors.length) {
            throw new Error("xtb parse errors:\n" + parseErrors.join('\n'));
        }
        return messageMap;
    };
    return Xtb;
}());
var _Visitor = (function () {
    function _Visitor() {
    }
    _Visitor.prototype.parse = function (nodes, messageBundle) {
        var _this = this;
        this._messageNodes = [];
        this._translatedMessages = {};
        this._bundleDepth = 0;
        this._translationDepth = 0;
        this._errors = [];
        // Find all messages
        ml.visitAll(this, nodes, null);
        var messageMap = messageBundle.getMessageMap();
        var placeholders = extractPlaceholders(messageBundle);
        var placeholderToIds = extractPlaceholderToIds(messageBundle);
        this._messageNodes
            .filter(function (message) {
            // Remove any messages that is not present in the source message bundle.
            return messageMap.hasOwnProperty(message[0]);
        })
            .sort(function (a, b) {
            // Because there could be no ICU placeholders inside an ICU message,
            // we do not need to take into account the `placeholderToMsgIds` of the referenced
            // messages, those would always be empty
            // TODO(vicb): overkill - create 2 buckets and [...woDeps, ...wDeps].process()
            if (Object.keys(messageMap[a[0]].placeholderToMsgIds).length == 0) {
                return -1;
            }
            if (Object.keys(messageMap[b[0]].placeholderToMsgIds).length == 0) {
                return 1;
            }
            return 0;
        })
            .forEach(function (message) {
            var id = message[0];
            _this._placeholders = placeholders[id] || {};
            _this._placeholderToIds = placeholderToIds[id] || {};
            // TODO(vicb): make sure there is no `_TRANSLATIONS_TAG` nor `_TRANSLATION_TAG`
            _this._translatedMessages[id] = ml.visitAll(_this, message[1]).join('');
        });
        return { messages: this._translatedMessages, errors: this._errors };
    };
    _Visitor.prototype.visitElement = function (element, context) {
        switch (element.name) {
            case _TRANSLATIONS_TAG:
                this._bundleDepth++;
                if (this._bundleDepth > 1) {
                    this._addError(element, "<" + _TRANSLATIONS_TAG + "> elements can not be nested");
                }
                ml.visitAll(this, element.children, null);
                this._bundleDepth--;
                break;
            case _TRANSLATION_TAG:
                this._translationDepth++;
                if (this._translationDepth > 1) {
                    this._addError(element, "<" + _TRANSLATION_TAG + "> elements can not be nested");
                }
                var idAttr = element.attrs.find(function (attr) { return attr.name === 'id'; });
                if (!idAttr) {
                    this._addError(element, "<" + _TRANSLATION_TAG + "> misses the \"id\" attribute");
                }
                else {
                    // ICU placeholders are reference to other messages.
                    // The referenced message might not have been decoded yet.
                    // We need to have all messages available to make sure deps are decoded first.
                    // TODO(vicb): report an error on duplicate id
                    this._messageNodes.push([idAttr.value, element.children]);
                }
                this._translationDepth--;
                break;
            case _PLACEHOLDER_TAG:
                var nameAttr = element.attrs.find(function (attr) { return attr.name === 'name'; });
                if (!nameAttr) {
                    this._addError(element, "<" + _PLACEHOLDER_TAG + "> misses the \"name\" attribute");
                }
                else {
                    var name_1 = nameAttr.value;
                    if (this._placeholders.hasOwnProperty(name_1)) {
                        return this._placeholders[name_1];
                    }
                    if (this._placeholderToIds.hasOwnProperty(name_1) &&
                        this._translatedMessages.hasOwnProperty(this._placeholderToIds[name_1])) {
                        return this._translatedMessages[this._placeholderToIds[name_1]];
                    }
                    // TODO(vicb): better error message for when
                    // !this._translatedMessages.hasOwnProperty(this._placeholderToIds[name])
                    this._addError(element, "The placeholder \"" + name_1 + "\" does not exists in the source message");
                }
                break;
            default:
                this._addError(element, 'Unexpected tag');
        }
    };
    _Visitor.prototype.visitAttribute = function (attribute, context) {
        throw new Error('unreachable code');
    };
    _Visitor.prototype.visitText = function (text, context) { return text.value; };
    _Visitor.prototype.visitComment = function (comment, context) { return ''; };
    _Visitor.prototype.visitExpansion = function (expansion, context) {
        var _this = this;
        var strCases = expansion.cases.map(function (c) { return c.visit(_this, null); });
        return "{" + expansion.switchValue + ", " + expansion.type + ", strCases.join(' ')}";
    };
    _Visitor.prototype.visitExpansionCase = function (expansionCase, context) {
        return expansionCase.value + " {" + ml.visitAll(this, expansionCase.expression, null) + "}";
    };
    _Visitor.prototype._addError = function (node, message) {
        this._errors.push(new I18nError(node.sourceSpan, message));
    };
    return _Visitor;
}());
//# sourceMappingURL=xtb.js.map