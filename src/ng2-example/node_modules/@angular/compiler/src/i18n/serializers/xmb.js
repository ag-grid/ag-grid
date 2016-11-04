/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { ListWrapper } from '../../facade/collection';
import * as xml from './xml_helper';
var _MESSAGES_TAG = 'messagebundle';
var _MESSAGE_TAG = 'msg';
var _PLACEHOLDER_TAG = 'ph';
var _EXEMPLE_TAG = 'ex';
var _DOCTYPE = "<!ELEMENT messagebundle (msg)*>\n<!ATTLIST messagebundle class CDATA #IMPLIED>\n\n<!ELEMENT msg (#PCDATA|ph|source)*>\n<!ATTLIST msg id CDATA #IMPLIED>\n<!ATTLIST msg seq CDATA #IMPLIED>\n<!ATTLIST msg name CDATA #IMPLIED>\n<!ATTLIST msg desc CDATA #IMPLIED>\n<!ATTLIST msg meaning CDATA #IMPLIED>\n<!ATTLIST msg obsolete (obsolete) #IMPLIED>\n<!ATTLIST msg xml:space (default|preserve) \"default\">\n<!ATTLIST msg is_hidden CDATA #IMPLIED>\n\n<!ELEMENT source (#PCDATA)>\n\n<!ELEMENT ph (#PCDATA|ex)*>\n<!ATTLIST ph name CDATA #REQUIRED>\n\n<!ELEMENT ex (#PCDATA)>";
export var Xmb = (function () {
    function Xmb() {
    }
    Xmb.prototype.write = function (messageMap) {
        var visitor = new _Visitor();
        var rootNode = new xml.Tag(_MESSAGES_TAG);
        Object.keys(messageMap).forEach(function (id) {
            var message = messageMap[id];
            var attrs = { id: id };
            if (message.description) {
                attrs['desc'] = message.description;
            }
            if (message.meaning) {
                attrs['meaning'] = message.meaning;
            }
            rootNode.children.push(new xml.CR(2), new xml.Tag(_MESSAGE_TAG, attrs, visitor.serialize(message.nodes)));
        });
        rootNode.children.push(new xml.CR());
        return xml.serialize([
            new xml.Declaration({ version: '1.0', encoding: 'UTF-8' }),
            new xml.CR(),
            new xml.Doctype(_MESSAGES_TAG, _DOCTYPE),
            new xml.CR(),
            rootNode,
            new xml.CR(),
        ]);
    };
    Xmb.prototype.load = function (content, url, messageBundle) {
        throw new Error('Unsupported');
    };
    return Xmb;
}());
var _Visitor = (function () {
    function _Visitor() {
    }
    _Visitor.prototype.visitText = function (text, context) { return [new xml.Text(text.value)]; };
    _Visitor.prototype.visitContainer = function (container, context) {
        var _this = this;
        var nodes = [];
        container.children.forEach(function (node) { return nodes.push.apply(nodes, node.visit(_this)); });
        return nodes;
    };
    _Visitor.prototype.visitIcu = function (icu, context) {
        var _this = this;
        var nodes = [new xml.Text("{" + icu.expression + ", " + icu.type + ", ")];
        Object.keys(icu.cases).forEach(function (c) {
            nodes.push.apply(nodes, [new xml.Text(c + " {")].concat(icu.cases[c].visit(_this), [new xml.Text("} ")]));
        });
        nodes.push(new xml.Text("}"));
        return nodes;
    };
    _Visitor.prototype.visitTagPlaceholder = function (ph, context) {
        var startEx = new xml.Tag(_EXEMPLE_TAG, {}, [new xml.Text("<" + ph.tag + ">")]);
        var startTagPh = new xml.Tag(_PLACEHOLDER_TAG, { name: ph.startName }, [startEx]);
        if (ph.isVoid) {
            // void tags have no children nor closing tags
            return [startTagPh];
        }
        var closeEx = new xml.Tag(_EXEMPLE_TAG, {}, [new xml.Text("</" + ph.tag + ">")]);
        var closeTagPh = new xml.Tag(_PLACEHOLDER_TAG, { name: ph.closeName }, [closeEx]);
        return [startTagPh].concat(this.serialize(ph.children), [closeTagPh]);
    };
    _Visitor.prototype.visitPlaceholder = function (ph, context) {
        return [new xml.Tag(_PLACEHOLDER_TAG, { name: ph.name })];
    };
    _Visitor.prototype.visitIcuPlaceholder = function (ph, context) {
        return [new xml.Tag(_PLACEHOLDER_TAG, { name: ph.name })];
    };
    _Visitor.prototype.serialize = function (nodes) {
        var _this = this;
        return ListWrapper.flatten(nodes.map(function (node) { return node.visit(_this); }));
    };
    return _Visitor;
}());
//# sourceMappingURL=xmb.js.map