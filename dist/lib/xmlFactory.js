/**
 * ag-grid - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v7.2.0
 * @link http://www.ag-grid.com/
 * @license MIT
 */
"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var context_1 = require("./context/context");
var LINE_SEPARATOR = '\r\n';
var XmlFactory = (function () {
    function XmlFactory() {
    }
    XmlFactory.prototype.createXml = function (xmlElement) {
        var _this = this;
        var props = "";
        if (xmlElement.properties && xmlElement.properties.prefix && xmlElement.properties.prefixedMap) {
            Object.keys(xmlElement.properties.prefixedMap).forEach(function (key) {
                props += " " + xmlElement.properties.prefix + key + "=\"" + xmlElement.properties.prefixedMap[key] + "\"";
            });
        }
        if (xmlElement.properties && xmlElement.properties.rawMap) {
            Object.keys(xmlElement.properties.rawMap).forEach(function (key) {
                props += " " + key + "=\"" + xmlElement.properties.rawMap[key] + "\"";
            });
        }
        var result = "<" + xmlElement.name + props;
        if (!xmlElement.children && !xmlElement.textNode) {
            return result + "/>" + LINE_SEPARATOR;
        }
        if (xmlElement.textNode) {
            return result + ">" + xmlElement.textNode + "</" + xmlElement.name + ">" + LINE_SEPARATOR;
        }
        result += ">" + LINE_SEPARATOR;
        xmlElement.children.forEach(function (it) {
            result += _this.createXml(it);
        });
        return result + "</" + xmlElement.name + ">" + LINE_SEPARATOR;
    };
    XmlFactory = __decorate([
        context_1.Bean('xmlFactory'), 
        __metadata('design:paramtypes', [])
    ], XmlFactory);
    return XmlFactory;
}());
exports.XmlFactory = XmlFactory;
