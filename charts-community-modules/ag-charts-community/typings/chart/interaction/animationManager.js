"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnimationManager = void 0;
var baseManager_1 = require("./baseManager");
var animate_1 = require("../../motion/animate");
var DEBOUNCE_DELAY = 300;
var AnimationManager = /** @class */ (function (_super) {
    __extends(AnimationManager, _super);
    function AnimationManager(interactionManager) {
        var _this = _super.call(this) || this;
        _this.controllers = {};
        _this.debouncers = {};
        _this.updaters = [];
        _this.isPlaying = false;
        _this.readyToPlay = false;
        _this.skipAnimations = false;
        _this.interactionManager = interactionManager;
        window.addEventListener('DOMContentLoaded', function () {
            _this.readyToPlay = true;
        });
        // Fallback if `DOMContentLoaded` event is not fired, e.g. in an iframe
        setTimeout(function () {
            _this.readyToPlay = true;
        }, 10);
        return _this;
    }
    AnimationManager.prototype.play = function () {
        if (this.isPlaying)
            return;
        this.isPlaying = true;
        for (var id in this.controllers) {
            this.controllers[id].play();
        }
        this.startAnimationCycle();
    };
    AnimationManager.prototype.pause = function () {
        if (!this.isPlaying)
            return;
        this.isPlaying = false;
        this.cancelAnimationFrame();
        for (var id in this.controllers) {
            this.controllers[id].pause();
        }
    };
    AnimationManager.prototype.stop = function () {
        this.isPlaying = false;
        this.cancelAnimationFrame();
        for (var id in this.controllers) {
            this.controllers[id].stop();
        }
    };
    AnimationManager.prototype.animate = function (id, opts) {
        var _a, _b;
        var optsExtra = __assign(__assign({}, opts), { autoplay: this.isPlaying ? opts.autoplay : false, driver: this.createDriver(id, opts.disableInteractions) });
        var controller = animate_1.animate(optsExtra);
        if (this.controllers[id]) {
            this.controllers[id].stop();
            delete this.controllers[id];
        }
        this.controllers[id] = controller;
        if (this.skipAnimations) {
            // Initialise the animation with the final values immediately and then stop the animation
            (_a = opts.onUpdate) === null || _a === void 0 ? void 0 : _a.call(opts, opts.to);
            controller.stop();
        }
        else {
            // Initialise the animation immediately without requesting a frame to prevent flashes
            (_b = opts.onUpdate) === null || _b === void 0 ? void 0 : _b.call(opts, opts.from);
        }
        return controller;
    };
    AnimationManager.prototype.animateMany = function (id, props, opts) {
        var _this = this;
        var state = props.map(function (prop) { return prop.from; });
        var updateBatch = 0;
        var completeBatch = 0;
        var onUpdate = function (index) { return function (v) {
            var _a;
            state[index] = v;
            if (++updateBatch >= props.length) {
                (_a = opts.onUpdate) === null || _a === void 0 ? void 0 : _a.call(opts, state);
                updateBatch = 0;
            }
        }; };
        var onComplete = function () {
            var _a;
            if (++completeBatch >= props.length) {
                (_a = opts.onComplete) === null || _a === void 0 ? void 0 : _a.call(opts);
            }
        };
        var drivers = props.map(function (prop, index) {
            var inner_id = id + "-" + index;
            return _this.animate(inner_id, __assign(__assign(__assign({}, opts), prop), { onUpdate: onUpdate(index), onComplete: onComplete }));
        });
        var controls = {
            get isPlaying() {
                return drivers.some(function (driver) { return driver.isPlaying; });
            },
            play: function () {
                drivers.forEach(function (driver) { return driver.play(); });
                return controls;
            },
            pause: function () {
                drivers.forEach(function (driver) { return driver.pause(); });
                return controls;
            },
            stop: function () {
                drivers.forEach(function (driver) { return driver.stop(); });
                return controls;
            },
            reset: function () {
                drivers.forEach(function (driver) { return driver.reset(); });
                return controls;
            },
        };
        return controls;
    };
    AnimationManager.prototype.debouncedAnimate = function (id, opts) {
        var _a;
        if (this.debouncers[id] && Date.now() - this.debouncers[id] < ((_a = opts.duration) !== null && _a !== void 0 ? _a : DEBOUNCE_DELAY)) {
            return this.controllers[id];
        }
        this.debouncers[id] = Date.now();
        return this.animate(id, opts);
    };
    AnimationManager.prototype.tween = function (opts) {
        var id = "tween-" + btoa(JSON.stringify(opts));
        var optsExtra = __assign(__assign({}, opts), { driver: this.createDriver(id) });
        return animate_1.tween(optsExtra);
    };
    AnimationManager.prototype.createDriver = function (id, disableInteractions) {
        var _this = this;
        return function (update) {
            return {
                start: function () {
                    _this.updaters.push([id, update]);
                    if (_this.requestId == null) {
                        _this.startAnimationCycle();
                    }
                    if (disableInteractions) {
                        _this.interactionManager.pause("animation_" + id);
                    }
                },
                stop: function () {
                    _this.updaters = _this.updaters.filter(function (_a) {
                        var _b = __read(_a, 1), uid = _b[0];
                        return uid !== id;
                    });
                    if (_this.updaters.length <= 0) {
                        _this.cancelAnimationFrame();
                    }
                    if (disableInteractions) {
                        _this.interactionManager.resume("animation_" + id);
                    }
                },
                reset: function () { },
            };
        };
    };
    AnimationManager.prototype.startAnimationCycle = function () {
        var _this = this;
        var frame = function (time) {
            _this.requestId = requestAnimationFrame(frame);
            if (!_this.readyToPlay) {
                return;
            }
            if (_this.lastTime === undefined)
                _this.lastTime = time;
            var deltaMs = time - _this.lastTime;
            _this.lastTime = time;
            _this.updaters.forEach(function (_a) {
                var _b = __read(_a, 2), _ = _b[0], update = _b[1];
                update(deltaMs);
            });
            _this.listeners.dispatch('animation-frame', { type: 'animation-frame', deltaMs: deltaMs });
        };
        this.requestId = requestAnimationFrame(frame);
    };
    AnimationManager.prototype.cancelAnimationFrame = function () {
        if (!this.requestId)
            return;
        cancelAnimationFrame(this.requestId);
        this.requestId = undefined;
    };
    return AnimationManager;
}(baseManager_1.BaseManager));
exports.AnimationManager = AnimationManager;
//# sourceMappingURL=animationManager.js.map