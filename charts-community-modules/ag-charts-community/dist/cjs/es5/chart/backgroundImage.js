"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BackgroundImage = void 0;
var image_1 = require("../scene/image");
var BackgroundImage = /** @class */ (function () {
    function BackgroundImage() {
        var _this = this;
        this._image = document.createElement('img');
        this.loadedSynchronously = true;
        this.left = undefined;
        this.top = undefined;
        this.right = undefined;
        this.bottom = undefined;
        this.width = undefined;
        this.height = undefined;
        this.opacity = 1;
        this.containerWidth = 0;
        this.containerHeight = 0;
        this.onload = undefined;
        this.onImageLoad = function () {
            if (_this.loadedSynchronously) {
                return;
            }
            _this.node.visible = false; // Ensure marked dirty.
            _this.performLayout(_this.containerWidth, _this.containerHeight);
            if (_this.onload) {
                _this.onload();
            }
        };
        this.node = new image_1.Image(this._image);
        this._image.onload = this.onImageLoad;
    }
    Object.defineProperty(BackgroundImage.prototype, "url", {
        get: function () {
            return this._image.src;
        },
        set: function (value) {
            this._image.src = value;
            this.loadedSynchronously = this.complete;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(BackgroundImage.prototype, "complete", {
        get: function () {
            // In tests image is nodejs-canvas Image, which doesn't report its status in the 'complete' method correctly.
            return this._image.width > 0 && this._image.height > 0;
        },
        enumerable: false,
        configurable: true
    });
    BackgroundImage.prototype.performLayout = function (containerWidth, containerHeight) {
        this.containerWidth = containerWidth;
        this.containerHeight = containerHeight;
        if (!this.complete) {
            this.node.visible = false;
            return;
        }
        var position = this.calculatePosition(this._image.width, this._image.height);
        Object.assign(this.node, position);
        this.node.visible = true;
        this.node.opacity = this.opacity;
    };
    BackgroundImage.prototype.calculatePosition = function (naturalWidth, naturalHeight) {
        var left = this.left;
        var right = this.right;
        var width = this.width;
        var top = this.top;
        var bottom = this.bottom;
        var height = this.height;
        if (left != null) {
            if (right != null) {
                width = this.containerWidth - left - right;
            }
            else if (width != null) {
                right = this.containerWidth - left + width;
            }
        }
        else if (right != null) {
            if (width != null) {
                left = this.containerWidth - right - width;
            }
        }
        if (top != null) {
            if (bottom != null) {
                height = this.containerHeight - bottom - top;
            }
            else if (height != null) {
                bottom = this.containerHeight - top - height;
            }
        }
        else if (bottom != null) {
            if (height != null) {
                top = this.containerHeight - bottom - height;
            }
        }
        // If width and height still undetermined, derive them from natural size.
        if (width == null) {
            if (height == null) {
                width = naturalWidth;
                height = naturalHeight;
            }
            else {
                width = Math.ceil((naturalWidth * height) / naturalHeight);
            }
        }
        else if (height == null) {
            height = Math.ceil((naturalHeight * width) / naturalWidth);
        }
        if (left == null) {
            if (right == null) {
                left = Math.floor((this.containerWidth - width) / 2);
            }
            else {
                left = this.containerWidth - right - width;
            }
        }
        if (top == null) {
            if (bottom == null) {
                top = Math.floor((this.containerHeight - height) / 2);
            }
            else {
                top = this.containerHeight - height - bottom;
            }
        }
        return { x: left, y: top, width: width, height: height };
    };
    return BackgroundImage;
}());
exports.BackgroundImage = BackgroundImage;
