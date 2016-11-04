/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { AUTO_STYLE } from '@angular/core';
import { isPresent } from '../facade/lang';
import { getDOM } from './dom_adapter';
export var WebAnimationsPlayer = (function () {
    function WebAnimationsPlayer(element, keyframes, options) {
        this.element = element;
        this.keyframes = keyframes;
        this.options = options;
        this._onDoneFns = [];
        this._onStartFns = [];
        this._finished = false;
        this._initialized = false;
        this._started = false;
        this.parentPlayer = null;
        this._duration = options['duration'];
    }
    WebAnimationsPlayer.prototype._onFinish = function () {
        if (!this._finished) {
            this._finished = true;
            if (!isPresent(this.parentPlayer)) {
                this.destroy();
            }
            this._onDoneFns.forEach(function (fn) { return fn(); });
            this._onDoneFns = [];
        }
    };
    WebAnimationsPlayer.prototype.init = function () {
        var _this = this;
        if (this._initialized)
            return;
        this._initialized = true;
        var keyframes = this.keyframes.map(function (styles) {
            var formattedKeyframe = {};
            Object.keys(styles).forEach(function (prop) {
                var value = styles[prop];
                formattedKeyframe[prop] = value == AUTO_STYLE ? _computeStyle(_this.element, prop) : value;
            });
            return formattedKeyframe;
        });
        this._player = this._triggerWebAnimation(this.element, keyframes, this.options);
        // this is required so that the player doesn't start to animate right away
        this.reset();
        this._player.onfinish = function () { return _this._onFinish(); };
    };
    /** @internal */
    WebAnimationsPlayer.prototype._triggerWebAnimation = function (element, keyframes, options) {
        return element.animate(keyframes, options);
    };
    WebAnimationsPlayer.prototype.onStart = function (fn) { this._onStartFns.push(fn); };
    WebAnimationsPlayer.prototype.onDone = function (fn) { this._onDoneFns.push(fn); };
    WebAnimationsPlayer.prototype.play = function () {
        this.init();
        if (!this.hasStarted()) {
            this._onStartFns.forEach(function (fn) { return fn(); });
            this._onStartFns = [];
            this._started = true;
        }
        this._player.play();
    };
    WebAnimationsPlayer.prototype.pause = function () {
        this.init();
        this._player.pause();
    };
    WebAnimationsPlayer.prototype.finish = function () {
        this.init();
        this._onFinish();
        this._player.finish();
    };
    WebAnimationsPlayer.prototype.reset = function () { this._player.cancel(); };
    WebAnimationsPlayer.prototype.restart = function () {
        this.reset();
        this.play();
    };
    WebAnimationsPlayer.prototype.hasStarted = function () { return this._started; };
    WebAnimationsPlayer.prototype.destroy = function () {
        this.reset();
        this._onFinish();
    };
    Object.defineProperty(WebAnimationsPlayer.prototype, "totalTime", {
        get: function () { return this._duration; },
        enumerable: true,
        configurable: true
    });
    WebAnimationsPlayer.prototype.setPosition = function (p) { this._player.currentTime = p * this.totalTime; };
    WebAnimationsPlayer.prototype.getPosition = function () { return this._player.currentTime / this.totalTime; };
    return WebAnimationsPlayer;
}());
function _computeStyle(element, prop) {
    return getDOM().getComputedStyle(element)[prop];
}
//# sourceMappingURL=web_animations_player.js.map