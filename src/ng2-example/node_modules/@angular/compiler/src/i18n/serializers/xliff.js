/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { ListWrapper } from '../../facade/collection';
import * as ml from '../../ml_parser/ast';
import { XmlParser } from '../../ml_parser/xml_parser';
import { I18nError } from '../parse_util';
import { extractPlaceholderToIds, extractPlaceholders } from './serializer';
import * as xml from './xml_helper';
var _VERSION = '1.2';
var _XMLNS = 'urn:oasis:names:tc:xliff:document:1.2';
// TODO(vicb): make this a param (s/_/-/)
var _SOURCE_LANG = 'en';
var _PLACEHOLDER_TAG = 'x';
var _SOURCE_TAG = 'source';
var _TARGET_TAG = 'target';
var _UNIT_TAG = 'trans-unit';
// http://docs.oasis-open.org/xliff/v1.2/os/xliff-core.html
// http://docs.oasis-open.org/xliff/v1.2/xliff-profile-html/xliff-profile-html-1.2.html
export var Xliff = (function () {
    function Xliff(_htmlParser, _interpolationConfig) {
        this._htmlParser = _htmlParser;
        this._interpolationConfig = _interpolationConfig;
    }
    Xliff.prototype.write = function (messageMap) {
        var visitor = new _WriteVisitor();
        var transUnits = [];
        Object.keys(messageMap).forEach(function (id) {
            var message = messageMap[id];
            var transUnit = new xml.Tag(_UNIT_TAG, { id: id, datatype: 'html' });
            transUnit.children.push(new xml.CR(8), new xml.Tag(_SOURCE_TAG, {}, visitor.serialize(message.nodes)), new xml.CR(8), new xml.Tag(_TARGET_TAG));
            if (message.description) {
                transUnit.children.push(new xml.CR(8), new xml.Tag('note', { priority: '1', from: 'description' }, [new xml.Text(message.description)]));
            }
            if (message.meaning) {
                transUnit.children.push(new xml.CR(8), new xml.Tag('note', { priority: '1', from: 'meaning' }, [new xml.Text(message.meaning)]));
            }
            transUnit.children.push(new xml.CR(6));
            transUnits.push(new xml.CR(6), transUnit);
        });
        var body = new xml.Tag('body', {}, transUnits.concat([new xml.CR(4)]));
        var file = new xml.Tag('file', { 'source-language': _SOURCE_LANG, datatype: 'plaintext', original: 'ng2.template' }, [new xml.CR(4), body, new xml.CR(2)]);
        var xliff = new xml.Tag('xliff', { version: _VERSION, xmlns: _XMLNS }, [new xml.CR(2), file, new xml.CR()]);
        return xml.serialize([
            new xml.Declaration({ version: '1.0', encoding: 'UTF-8' }), new xml.CR(), xliff, new xml.CR()
        ]);
    };
    Xliff.prototype.load = function (content, url, messageBundle) {
        var _this = this;
        // Parse the xtb file into xml nodes
        var result = new XmlParser().parse(content, url);
        if (result.errors.length) {
            throw new Error("xtb parse errors:\n" + result.errors.join('\n'));
        }
        // Replace the placeholders, messages are now string
        var _a = new _LoadVisitor().parse(result.rootNodes, messageBundle), messages = _a.messages, errors = _a.errors;
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
    return Xliff;
}());
var _WriteVisitor = (function () {
    function _WriteVisitor() {
    }
    _WriteVisitor.prototype.visitText = function (text, context) { return [new xml.Text(text.value)]; };
    _WriteVisitor.prototype.visitContainer = function (container, context) {
        var _this = this;
        var nodes = [];
        container.children.forEach(function (node) { return nodes.push.apply(nodes, node.visit(_this)); });
        return nodes;
    };
    _WriteVisitor.prototype.visitIcu = function (icu, context) {
        if (this._isInIcu) {
            // nested ICU is not supported
            throw new Error('xliff does not support nested ICU messages');
        }
        this._isInIcu = true;
        // TODO(vicb): support ICU messages
        // https://lists.oasis-open.org/archives/xliff/201201/msg00028.html
        // http://docs.oasis-open.org/xliff/v1.2/xliff-profile-po/xliff-profile-po-1.2-cd02.html
        var nodes = [];
        this._isInIcu = false;
        return nodes;
    };
    _WriteVisitor.prototype.visitTagPlaceholder = function (ph, context) {
        var ctype = getCtypeForTag(ph.tag);
        var startTagPh = new xml.Tag(_PLACEHOLDER_TAG, { id: ph.startName, ctype: ctype });
        if (ph.isVoid) {
            // void tags have no children nor closing tags
            return [startTagPh];
        }
        var closeTagPh = new xml.Tag(_PLACEHOLDER_TAG, { id: ph.closeName, ctype: ctype });
        return [startTagPh].concat(this.serialize(ph.children), [closeTagPh]);
    };
    _WriteVisitor.prototype.visitPlaceholder = function (ph, context) {
        return [new xml.Tag(_PLACEHOLDER_TAG, { id: ph.name })];
    };
    _WriteVisitor.prototype.visitIcuPlaceholder = function (ph, context) {
        return [new xml.Tag(_PLACEHOLDER_TAG, { id: ph.name })];
    };
    _WriteVisitor.prototype.serialize = function (nodes) {
        var _this = this;
        this._isInIcu = false;
        return ListWrapper.flatten(nodes.map(function (node) { return node.visit(_this); }));
    };
    return _WriteVisitor;
}());
// TODO(vicb): add error management (structure)
// TODO(vicb): factorize (xtb) ?
var _LoadVisitor = (function () {
    function _LoadVisitor() {
    }
    _LoadVisitor.prototype.parse = function (nodes, messageBundle) {
        var _this = this;
        this._messageNodes = [];
        this._translatedMessages = {};
        this._msgId = '';
        this._target = [];
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
    _LoadVisitor.prototype.visitElement = function (element, context) {
        switch (element.name) {
            case _UNIT_TAG:
                this._target = null;
                var msgId = element.attrs.find(function (attr) { return attr.name === 'id'; });
                if (!msgId) {
                    this._addError(element, "<" + _UNIT_TAG + "> misses the \"id\" attribute");
                }
                else {
                    this._msgId = msgId.value;
                }
                ml.visitAll(this, element.children, null);
                if (this._msgId !== null) {
                    this._messageNodes.push([this._msgId, this._target]);
                }
                break;
            case _SOURCE_TAG:
                // ignore source message
                break;
            case _TARGET_TAG:
                this._target = element.children;
                break;
            case _PLACEHOLDER_TAG:
                var idAttr = element.attrs.find(function (attr) { return attr.name === 'id'; });
                if (!idAttr) {
                    this._addError(element, "<" + _PLACEHOLDER_TAG + "> misses the \"id\" attribute");
                }
                else {
                    var id = idAttr.value;
                    if (this._placeholders.hasOwnProperty(id)) {
                        return this._placeholders[id];
                    }
                    if (this._placeholderToIds.hasOwnProperty(id) &&
                        this._translatedMessages.hasOwnProperty(this._placeholderToIds[id])) {
                        return this._translatedMessages[this._placeholderToIds[id]];
                    }
                    // TODO(vicb): better error message for when
                    // !this._translatedMessages.hasOwnProperty(this._placeholderToIds[id])
                    this._addError(element, "The placeholder \"" + id + "\" does not exists in the source message");
                }
                break;
            default:
                ml.visitAll(this, element.children, null);
        }
    };
    _LoadVisitor.prototype.visitAttribute = function (attribute, context) {
        throw new Error('unreachable code');
    };
    _LoadVisitor.prototype.visitText = function (text, context) { return text.value; };
    _LoadVisitor.prototype.visitComment = function (comment, context) { return ''; };
    _LoadVisitor.prototype.visitExpansion = function (expansion, context) {
        throw new Error('unreachable code');
    };
    _LoadVisitor.prototype.visitExpansionCase = function (expansionCase, context) {
        throw new Error('unreachable code');
    };
    _LoadVisitor.prototype._addError = function (node, message) {
        this._errors.push(new I18nError(node.sourceSpan, message));
    };
    return _LoadVisitor;
}());
function getCtypeForTag(tag) {
    switch (tag.toLowerCase()) {
        case 'br':
            return 'lb';
        case 'img':
            return 'image';
        default:
            return "x-" + tag;
    }
}
//# sourceMappingURL=xliff.js.map