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
import { BaseManager } from './baseManager';
import { animate as baseAnimate, tween, } from '../../motion/animate';
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
        var controller = baseAnimate(optsExtra);
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
        return tween(optsExtra);
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
}(BaseManager));
export { AnimationManager };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYW5pbWF0aW9uTWFuYWdlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy9jaGFydC9pbnRlcmFjdGlvbi9hbmltYXRpb25NYW5hZ2VyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLE9BQU8sRUFBRSxXQUFXLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFFNUMsT0FBTyxFQUNILE9BQU8sSUFBSSxXQUFXLEVBSXRCLEtBQUssR0FHUixNQUFNLHNCQUFzQixDQUFDO0FBa0I5QixJQUFNLGNBQWMsR0FBRyxHQUFHLENBQUM7QUFFM0I7SUFBc0Msb0NBQW1FO0lBZXJHLDBCQUFZLGtCQUFzQztRQUFsRCxZQUNJLGlCQUFPLFNBWVY7UUEzQmdCLGlCQUFXLEdBQTJDLEVBQUUsQ0FBQztRQUNsRSxnQkFBVSxHQUFnQyxFQUFFLENBQUM7UUFFN0MsY0FBUSxHQUErQyxFQUFFLENBQUM7UUFFMUQsZUFBUyxHQUFHLEtBQUssQ0FBQztRQUdsQixpQkFBVyxHQUFHLEtBQUssQ0FBQztRQUlyQixvQkFBYyxHQUFHLEtBQUssQ0FBQztRQUsxQixLQUFJLENBQUMsa0JBQWtCLEdBQUcsa0JBQWtCLENBQUM7UUFFN0MsTUFBTSxDQUFDLGdCQUFnQixDQUFDLGtCQUFrQixFQUFFO1lBQ3hDLEtBQUksQ0FBQyxXQUFXLEdBQUcsSUFBSSxDQUFDO1FBQzVCLENBQUMsQ0FBQyxDQUFDO1FBRUgsdUVBQXVFO1FBQ3ZFLFVBQVUsQ0FBQztZQUNQLEtBQUksQ0FBQyxXQUFXLEdBQUcsSUFBSSxDQUFDO1FBQzVCLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQzs7SUFDWCxDQUFDO0lBRU0sK0JBQUksR0FBWDtRQUNJLElBQUksSUFBSSxDQUFDLFNBQVM7WUFBRSxPQUFPO1FBRTNCLElBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDO1FBRXRCLEtBQUssSUFBTSxF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