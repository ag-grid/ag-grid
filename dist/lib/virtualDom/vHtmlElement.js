/**
 * ag-grid - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v3.3.3
 * @link http://www.ag-grid.com/
 * @license MIT
 */
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var utils_1 = require('../utils');
var vElement_1 = require("./vElement");
var vWrapperElement_1 = require("./vWrapperElement");
var VHtmlElement = (function (_super) {
    __extends(VHtmlElement, _super);
    function VHtmlElement(type) {
        _super.call(this);
        this.style = {};
        this.type = type;
    }
    VHtmlElement.prototype.getElement = function () {
        return this.element;
    };
    VHtmlElement.prototype.setInnerHtml = function (innerHtml) {
        if (this.bound) {
            this.element.innerHTML = innerHtml;
        }
        else {
            this.innerHtml = innerHtml;
        }
    };
    VHtmlElement.prototype.addStyles = function (styles) {
        var _this = this;
        if (!styles) {
            return;
        }
        if (!this.bound && !this.style) {
            this.style = {};
        }
        utils_1.default.iterateObject(styles, function (key, value) {
            if (_this.bound) {
                var style = _this.element.style;
                style[key] = value;
            }
            else {
                _this.style[key] = value;
            }
        });
    };
    VHtmlElement.prototype.attachEventListeners = function (node) {
        if (!this.eventListeners) {
            return;
        }
        for (var i = 0; i < this.eventListeners.length; i++) {
            var listener = this.eventListeners[i];
            node.addEventListener(listener.event, listener.listener);
        }
    };
    VHtmlElement.prototype.addClass = function (newClass) {
        if (this.bound) {
            utils_1.default.addCssClass(this.element, newClass);
        }
        else {
            if (!this.classes) {
                this.classes = [];
            }
            this.classes.push(newClass);
        }
    };
    VHtmlElement.prototype.removeClass = function (oldClass) {
        if (this.bound) {
            utils_1.default.removeCssClass(this.element, oldClass);
        }
        else {
            if (!this.classes) {
                return;
            }
            while (this.classes.indexOf(oldClass) >= 0) {
                utils_1.default.removeFromArray(this.classes, oldClass);
            }
        }
    };
    VHtmlElement.prototype.addClasses = function (classes) {
        if (!classes || classes.length <= 0) {
            return;
        }
        if (this.bound) {
            for (var i = 0; i < classes.length; i++) {
                utils_1.default.addCssClass(this.element, classes[i]);
            }
        }
        else {
            if (!this.classes) {
                this.classes = [];
            }
            for (var j = 0; j < classes.length; j++) {
                this.classes.push(classes[j]);
            }
        }
    };
    VHtmlElement.prototype.toHtmlString = function () {
        var buff = '';
        // opening element
        buff += '<' + this.type + ' v_element_id="' + this.getId() + '" ';
        buff += this.toHtmlStringClasses();
        buff += this.toHtmlStringAttributes();
        buff += this.toHtmlStringStyles();
        buff += '>';
        // contents
        if (this.innerHtml !== null && this.innerHtml !== undefined) {
            buff += this.innerHtml;
        }
        buff += this.toHtmlStringChildren();
        // closing element
        buff += '</' + this.type + '>';
        return buff;
    };
    VHtmlElement.prototype.toHtmlStringChildren = function () {
        if (!this.children) {
            return '';
        }
        var result = '';
        for (var i = 0; i < this.children.length; i++) {
            result += this.children[i].toHtmlString();
        }
        return result;
    };
    VHtmlElement.prototype.toHtmlStringAttributes = function () {
        if (!this.attributes) {
            return '';
        }
        var result = '';
        utils_1.default.iterateObject(this.attributes, function (key, value) {
            result += ' ' + key + '="' + value + '"';
        });
        return result;
    };
    VHtmlElement.prototype.toHtmlStringClasses = function () {
        if (!this.classes) {
            return '';
        }
        return ' class="' + this.classes.join(' ') + '"';
    };
    VHtmlElement.prototype.toHtmlStringStyles = function () {
        var result = ' style="';
        var atLeastOne = false;
        utils_1.default.iterateObject(this.style, function (key, value) {
            result += ' ' + key + ': ' + value + ';';
            atLeastOne = true;
        });
        result += '"';
        if (atLeastOne) {
            return result;
        }
        else {
            return '';
        }
    };
    VHtmlElement.prototype.appendChild = function (child) {
        if (this.bound) {
            if (utils_1.default.isNodeOrElement(child)) {
                this.element.appendChild(child);
            }
            else {
                console.error('cannot appendChild with virtual child to already bound VHTMLElement');
            }
        }
        else {
            if (!this.children) {
                this.children = [];
            }
            if (utils_1.default.isNodeOrElement(child)) {
                this.children.push(new vWrapperElement_1.default(child));
            }
            else {
                this.children.push(child);
            }
        }
    };
    VHtmlElement.prototype.setAttribute = function (key, value) {
        if (this.bound) {
            this.element.setAttribute(key, value);
        }
        else {
            if (!this.attributes) {
                this.attributes = {};
            }
            this.attributes[key] = value;
        }
    };
    VHtmlElement.prototype.addEventListener = function (event, listener) {
        if (this.bound) {
            this.element.addEventListener(event, listener);
        }
        else {
            if (!this.eventListeners) {
                this.eventListeners = [];
            }
            var entry = new VEventListener(event, listener);
            this.eventListeners.push(entry);
        }
    };
    VHtmlElement.prototype.elementAttached = function (element) {
        _super.prototype.elementAttached.call(this, element);
        this.element = element;
        this.attachEventListeners(element);
        this.fireElementAttachedToChildren(element);
        this.bound = true;
    };
    VHtmlElement.prototype.fireElementAttachedToChildren = function (element) {
        if (!this.children) {
            return;
        }
        for (var i = 0; i < this.children.length; i++) {
            var child = this.children[i];
            var childElement = element.querySelector('[v_element_id="' + child.getId() + '"]');
            child.elementAttached(childElement);
        }
    };
    return VHtmlElement;
})(vElement_1.default);
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = VHtmlElement;
var VEventListener = (function () {
    function VEventListener(event, listener) {
        this.event = event;
        this.listener = listener;
    }
    return VEventListener;
})();
