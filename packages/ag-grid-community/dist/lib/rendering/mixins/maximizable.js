/**
 * ag-grid-community - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v21.1.1
 * @link http://www.ag-grid.com/
 * @license MIT
 */
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var component_1 = require("../../widgets/component");
var utils_1 = require("../../utils");
function Maximizable(target) {
    var MixinClass = /** @class */ (function (_super) {
        __extends(MixinClass, _super);
        function MixinClass() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.MAXIMIZE_BTN_TEMPLATE = "<div class=\"ag-dialog-button\"></span>";
            _this.isMaximizable = false;
            _this.isMaximized = false;
            _this.maximizeListeners = [];
            _this.resizeListenerDestroy = null;
            _this.lastPosition = {
                x: 0,
                y: 0,
                width: 0,
                height: 0
            };
            return _this;
        }
        MixinClass.prototype.postConstruct = function () {
            _super.prototype.postConstruct.call(this);
            var maximizable = this.config.maximizable;
            if (maximizable) {
                this.setMaximizable(maximizable);
            }
        };
        MixinClass.prototype.setMaximizable = function (maximizable) {
            var _this = this;
            if (maximizable === false) {
                this.clearMaximizebleListeners();
                if (this.maximizeButtonComp) {
                    this.maximizeButtonComp.destroy();
                    this.maximizeButtonComp = this.maximizeIcon = this.minimizeIcon = undefined;
                }
                return;
            }
            var eTitleBar = this.eTitleBar;
            if (!eTitleBar || maximizable === this.isMaximizable) {
                return;
            }
            var maximizeButtonComp = this.maximizeButtonComp = new component_1.Component(this.MAXIMIZE_BTN_TEMPLATE);
            this.getContext().wireBean(maximizeButtonComp);
            var eGui = maximizeButtonComp.getGui();
            eGui.appendChild(this.maximizeIcon = utils_1._.createIconNoSpan('maximize', this.gridOptionsWrapper));
            eGui.appendChild(this.minimizeIcon = utils_1._.createIconNoSpan('minimize', this.gridOptionsWrapper));
            utils_1._.addCssClass(this.minimizeIcon, 'ag-hidden');
            maximizeButtonComp.addDestroyableEventListener(eGui, 'click', this.toggleMaximize.bind(this));
            this.addTitleBarButton(maximizeButtonComp, 0);
            this.maximizeListeners.push(this.addDestroyableEventListener(eTitleBar, 'dblclick', this.toggleMaximize.bind(this)));
            this.resizeListenerDestroy = this.addDestroyableEventListener(this, 'resize', function () {
                _this.isMaximized = false;
                _this.refreshMaximizeIcon();
            });
        };
        MixinClass.prototype.toggleMaximize = function () {
            if (this.isMaximized) {
                var _a = this.lastPosition, x = _a.x, y = _a.y, width = _a.width, height = _a.height;
                this.setWidth(width);
                this.setHeight(height);
                this.offsetElement(x, y);
            }
            else {
                this.lastPosition.width = this.getWidth();
                this.lastPosition.height = this.getHeight();
                this.lastPosition.x = this.position.x;
                this.lastPosition.y = this.position.y;
                this.offsetElement(0, 0);
                this.setHeight(Infinity);
                this.setWidth(Infinity);
            }
            this.isMaximized = !this.isMaximized;
            this.refreshMaximizeIcon();
        };
        MixinClass.prototype.refreshMaximizeIcon = function () {
            utils_1._.addOrRemoveCssClass(this.maximizeIcon, 'ag-hidden', this.isMaximized);
            utils_1._.addOrRemoveCssClass(this.minimizeIcon, 'ag-hidden', !this.isMaximized);
        };
        MixinClass.prototype.clearMaximizebleListeners = function () {
            if (this.maximizeListeners.length) {
                this.maximizeListeners.forEach(function (destroyListener) { return destroyListener(); });
                this.maximizeListeners.length = 0;
            }
            if (this.resizeListenerDestroy) {
                this.resizeListenerDestroy();
                this.resizeListenerDestroy = null;
            }
        };
        MixinClass.prototype.destroy = function () {
            _super.prototype.destroy.call(this);
            if (this.maximizeButtonComp) {
                this.maximizeButtonComp.destroy();
                this.maximizeButtonComp = undefined;
            }
            this.clearMaximizebleListeners();
        };
        return MixinClass;
    }(target));
    return MixinClass;
}
exports.Maximizable = Maximizable;
