/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { NoOpAnimationPlayer } from '../private_import_core';
var _NoOpAnimationDriver = (function () {
    function _NoOpAnimationDriver() {
    }
    _NoOpAnimationDriver.prototype.animate = function (element, startingStyles, keyframes, duration, delay, easing) {
        return new NoOpAnimationPlayer();
    };
    return _NoOpAnimationDriver;
}());
/**
 * @experimental
 */
export var AnimationDriver = (function () {
    function AnimationDriver() {
    }
    AnimationDriver.NOOP = new _NoOpAnimationDriver();
    return AnimationDriver;
}());
//# sourceMappingURL=animation_driver.js.map