/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { isPresent } from './facade/lang';
export var MockAnimationPlayer = (function () {
    function MockAnimationPlayer() {
        this._onDoneFns = [];
        this._onStartFns = [];
        this._finished = false;
        this._destroyed = false;
        this._started = false;
        this.parentPlayer = null;
        this.log = [];
    }
    MockAnimationPlayer.prototype._onFinish = function () {
        if (!this._finished) {
            this._finished = true;
            this.log.push('finish');
            this._onDoneFns.forEach(function (fn) { return fn(); });
            this._onDoneFns = [];
            if (!isPresent(this.parentPlayer)) {
                this.destroy();
            }
        }
    };
    MockAnimationPlayer.prototype.init = function () { this.log.push('init'); };
    MockAnimationPlayer.prototype.onDone = function (fn) { this._onDoneFns.push(fn); };
    MockAnimationPlayer.prototype.onStart = function (fn) { this._onStartFns.push(fn); };
    MockAnimationPlayer.prototype.hasStarted = function () { return this._started; };
    MockAnimationPlayer.prototype.play = function () {
        if (!this.hasStarted()) {
            this._onStartFns.forEach(function (fn) { return fn(); });
            this._onStartFns = [];
            this._started = true;
        }
        this.log.push('play');
    };
    MockAnimationPlayer.prototype.pause = function () { this.log.push('pause'); };
    MockAnimationPlayer.prototype.restart = function () { this.log.push('restart'); };
    MockAnimationPlayer.prototype.finish = function () { this._onFinish(); };
    MockAnimationPlayer.prototype.reset = function () { this.log.push('reset'); };
    MockAnimationPlayer.prototype.destroy = function () {
        if (!this._destroyed) {
            this._destroyed = true;
            this.finish();
            this.log.push('destroy');
        }
    };
    MockAnimationPlayer.prototype.setPosition = function (p /** TODO #9100 */) { };
    MockAnimationPlayer.prototype.getPosition = function () { return 0; };
    return MockAnimationPlayer;
}());
//# sourceMappingURL=mock_animation_player.js.map