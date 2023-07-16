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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
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
var logger_1 = require("../../util/logger");
var AnimationManager = /** @class */ (function (_super) {
    __extends(AnimationManager, _super);
    function AnimationManager(interactionManager) {
        var _this = _super.call(this) || this;
        _this.controllers = {};
        _this.throttles = {};
        _this.throttleGroups = new Set();
        _this.updaters = [];
        _this.isPlaying = false;
        _this.readyToPlay = false;
        _this.defaultOptions = {};
        _this.skipAnimations = false;
        _this.debug = false;
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
        if (this.debug) {
            logger_1.Logger.debug('AnimationManager.play()');
        }
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
        if (this.debug) {
            logger_1.Logger.debug('AnimationManager.pause()');
        }
        for (var id in this.controllers) {
            this.controllers[id].pause();
        }
    };
    AnimationManager.prototype.stop = function () {
        this.isPlaying = false;
        this.cancelAnimationFrame();
        if (this.debug) {
            logger_1.Logger.debug('AnimationManager.stop()');
        }
        for (var id in this.controllers) {
            this.controllers[id].stop();
        }
    };
    AnimationManager.prototype.reset = function () {
        if (this.isPlaying) {
            this.stop();
            this.play();
        }
        else {
            this.stop();
        }
    };
    AnimationManager.prototype.animate = function (id, _a) {
        var _b, _c;
        var _d = _a.disableInteractions, disableInteractions = _d === void 0 ? true : _d, opts = __rest(_a, ["disableInteractions"]);
        if (this.skipAnimations) {
            // Initialise the animation with the final values immediately and then stop the animation
            (_b = opts.onUpdate) === null || _b === void 0 ? void 0 : _b.call(opts, opts.to);
            return;
        }
        var optsExtra = __assign(__assign({}, opts), { autoplay: this.isPlaying ? opts.autoplay : false, driver: this.createDriver(id, disableInteractions) });
        if (this.controllers[id]) {
            this.controllers[id].stop();
        }
        var controller = animate_1.animate(optsExtra);
        this.controllers[id] = controller;
        // Initialise the animation immediately without requesting a frame to prevent flashes
        (_c = opts.onUpdate) === null || _c === void 0 ? void 0 : _c.call(opts, opts.from);
        return controller;
    };
    AnimationManager.prototype.animateMany = function (id, props, opts) {
        var e_1, _a;
        var _b;
        if (this.skipAnimations) {
            var state_1 = props.map(function (prop) { return prop.to; });
            opts.onUpdate(state_1);
            (_b = opts.onComplete) === null || _b === void 0 ? void 0 : _b.call(opts);
            return;
        }
        var state = props.map(function (prop) { return prop.from; });
        var playBatch = 0;
        var stopBatch = 0;
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
        var onPlay = function () {
            var _a;
            if (++playBatch >= props.length) {
                (_a = opts.onPlay) === null || _a === void 0 ? void 0 : _a.call(opts);
            }
        };
        var onStop = function () {
            var _a;
            if (++stopBatch >= props.length) {
                (_a = opts.onStop) === null || _a === void 0 ? void 0 : _a.call(opts);
            }
        };
        var onComplete = function () {
            var _a;
            if (++completeBatch >= props.length) {
                (_a = opts.onComplete) === null || _a === void 0 ? void 0 : _a.call(opts);
            }
        };
        var index = 0;
        try {
            for (var props_1 = __values(props), props_1_1 = props_1.next(); !props_1_1.done; props_1_1 = props_1.next()) {
                var prop = props_1_1.value;
                var inner_id = id + "-" + index;
                this.animate(inner_id, __assign(__assign(__assign({}, opts), prop), { onUpdate: onUpdate(index), onPlay: onPlay, onStop: onStop, onComplete: onComplete }));
                index++;
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (props_1_1 && !props_1_1.done && (_a = props_1.return)) _a.call(props_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
    };
    AnimationManager.prototype.animateWithThrottle = function (id, opts) {
        var _a;
        var throttleId = (_a = opts.throttleId) !== null && _a !== void 0 ? _a : id;
        if (this.throttles[throttleId] && opts.duration && Date.now() - this.throttles[throttleId] < opts.duration) {
            opts.delay = 0;
            opts.duration = 1;
        }
        this.throttles[id] = Date.now();
        this.animate(id, __assign({}, opts));
    };
    AnimationManager.prototype.animateManyWithThrottle = function (id, props, opts) {
        var _this = this;
        var _a;
        var throttleGroup = opts.throttleGroup;
        var throttleId = (_a = opts.throttleId) !== null && _a !== void 0 ? _a : id;
        var now = Date.now();
        var isThrottled = this.throttles[throttleId] && opts.duration && now - this.throttles[throttleId] < opts.duration;
        var inGroup = throttleGroup && this.throttleGroups.has(throttleGroup);
        if (isThrottled && !inGroup) {
            opts.delay = 0;
            opts.duration = 1;
        }
        if (!isThrottled && throttleGroup) {
            this.throttleGroups.add(throttleGroup);
        }
        var onStop = function () {
            var _a;
            if (throttleGroup) {
                _this.throttleGroups.delete(throttleGroup);
            }
            (_a = opts.onStop) === null || _a === void 0 ? void 0 : _a.call(opts);
        };
        this.throttles[throttleId] = now;
        return this.animateMany(id, props, __assign(__assign({}, opts), { onStop: onStop }));
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
                    delete _this.controllers[id];
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
        if (this.updaters.length === 0)
            return;
        var frame = function (time) {
            _this.requestId = requestAnimationFrame(frame);
            if (!_this.readyToPlay)
                return;
            if (_this.lastTime === undefined)
                _this.lastTime = time;
            var deltaMs = time - _this.lastTime;
            _this.lastTime = time;
            if (_this.debug) {
                logger_1.Logger.debug('AnimationManager - frame()', { updaterCount: _this.updaters.length });
            }
            _this.updaters.forEach(function (_a) {
                var _b = __read(_a, 2), _ = _b[0], update = _b[1];
                return update(deltaMs);
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
        this.lastTime = undefined;
    };
    return AnimationManager;
}(baseManager_1.BaseManager));
exports.AnimationManager = AnimationManager;
//# sourceMappingURL=animationManager.js.map