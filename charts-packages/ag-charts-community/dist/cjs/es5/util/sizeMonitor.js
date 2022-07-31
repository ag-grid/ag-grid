"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
var SizeMonitor = /** @class */ (function () {
    function SizeMonitor() {
    }
    SizeMonitor.init = function () {
        var _this = this;
        var NativeResizeObserver = window.ResizeObserver;
        if (NativeResizeObserver) {
            this.resizeObserver = new NativeResizeObserver(function (entries) {
                var e_1, _a;
                try {
                    for (var entries_1 = __values(entries), entries_1_1 = entries_1.next(); !entries_1_1.done; entries_1_1 = entries_1.next()) {
                        var entry = entries_1_1.value;
                        var _b = entry.contentRect, width = _b.width, height = _b.height;
                        _this.checkSize(_this.elements.get(entry.target), entry.target, width, height);
                    }
                }
                catch (e_1_1) { e_1 = { error: e_1_1 }; }
                finally {
                    try {
                        if (entries_1_1 && !entries_1_1.done && (_a = entries_1.return)) _a.call(entries_1);
                    }
                    finally { if (e_1) throw e_1.error; }
                }
            });
        }
        else {
            // polyfill (more reliable even in browsers that support ResizeObserver)
            var step = function () {
                _this.elements.forEach(function (entry, element) {
                    _this.checkClientSize(element, entry);
                });
            };
            window.setInterval(step, 100);
        }
        this.ready = true;
    };
    SizeMonitor.checkSize = function (entry, element, width, height) {
        if (entry) {
            if (!entry.size || width !== entry.size.width || height !== entry.size.height) {
                entry.size = { width: width, height: height };
                entry.cb(entry.size, element);
            }
        }
    };
    // Only a single callback is supported.
    SizeMonitor.observe = function (element, cb) {
        if (!this.ready) {
            this.init();
        }
        this.unobserve(element);
        if (this.resizeObserver) {
            this.resizeObserver.observe(element);
        }
        this.elements.set(element, { cb: cb });
        // Ensure first size callback happens synchronously.
        this.checkClientSize(element, { cb: cb });
    };
    SizeMonitor.unobserve = function (element) {
        if (this.resizeObserver) {
            this.resizeObserver.unobserve(element);
        }
        this.elements.delete(element);
    };
    SizeMonitor.checkClientSize = function (element, entry) {
        var width = element.clientWidth ? element.clientWidth : 0;
        var height = element.clientHeight ? element.clientHeight : 0;
        this.checkSize(entry, element, width, height);
    };
    SizeMonitor.elements = new Map();
    SizeMonitor.ready = false;
    return SizeMonitor;
}());
exports.SizeMonitor = SizeMonitor;
