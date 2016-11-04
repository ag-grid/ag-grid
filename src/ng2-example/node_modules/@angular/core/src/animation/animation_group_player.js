/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { isPresent, scheduleMicroTask } from '../facade/lang';
export var AnimationGroupPlayer = (function () {
    function AnimationGroupPlayer(_players) {
        var _this = this;
        this._players = _players;
        this._onDoneFns = [];
        this._onStartFns = [];
        this._finished = false;
        this._started = false;
        this.parentPlayer = null;
        var count = 0;
        var total = this._players.length;
        if (total == 0) {
            scheduleMicroTask(function () { return _this._onFinish(); });
        }
        else {
            this._players.forEach(function (player) {
                player.parentPlayer = _this;
                player.onDone(function () {
                    if (++count >= total) {
                        _this._onFinish();
                    }
                });
            });
        }
    }
    AnimationGroupPlayer.prototype._onFinish = function () {
        if (!this._finished) {
            this._finished = true;
            if (!isPresent(this.parentPlayer)) {
                this.destroy();
            }
            this._onDoneFns.forEach(function (fn) { return fn(); });
            this._onDoneFns = [];
        }
    };
    AnimationGroupPlayer.prototype.init = function () { this._players.forEach(function (player) { return player.init(); }); };
    AnimationGroupPlayer.prototype.onStart = function (fn) { this._onStartFns.push(fn); };
    AnimationGroupPlayer.prototype.onDone = function (fn) { this._onDoneFns.push(fn); };
    AnimationGroupPlayer.prototype.hasStarted = function () { return this._started; };
    AnimationGroupPlayer.prototype.play = function () {
        if (!isPresent(this.parentPlayer)) {
            this.init();
        }
        if (!this.hasStarted()) {
            this._onStartFns.forEach(function (fn) { return fn(); });
            this._onStartFns = [];
            this._started = true;
        }
        this._players.forEach(function (player) { return player.play(); });
    };
    AnimationGroupPlayer.prototype.pause = function () { this._players.forEach(function (player) { return player.pause(); }); };
    AnimationGroupPlayer.prototype.restart = function () { this._players.forEach(function (player) { return player.restart(); }); };
    AnimationGroupPlayer.prototype.finish = function () {
        this._onFinish();
        this._players.forEach(function (player) { return player.finish(); });
    };
    AnimationGroupPlayer.prototype.destroy = function () {
        this._onFinish();
        this._players.forEach(function (player) { return player.destroy(); });
    };
    AnimationGroupPlayer.prototype.reset = function () { this._players.forEach(function (player) { return player.reset(); }); };
    AnimationGroupPlayer.prototype.setPosition = function (p /** TODO #9100 */) {
        this._players.forEach(function (player) { player.setPosition(p); });
    };
    AnimationGroupPlayer.prototype.getPosition = function () {
        var min = 0;
        this._players.forEach(function (player) {
            var p = player.getPosition();
            min = Math.min(p, min);
        });
        return min;
    };
    return AnimationGroupPlayer;
}());
//# sourceMappingURL=animation_group_player.js.map