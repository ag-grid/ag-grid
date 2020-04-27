var SizeMonitor = /** @class */ (function () {
    function SizeMonitor() {
    }
    SizeMonitor.init = function () {
        var _this = this;
        var NativeResizeObserver = window.ResizeObserver;
        if (NativeResizeObserver) {
            this.resizeObserver = new NativeResizeObserver(function (entries) {
                for (var _i = 0, entries_1 = entries; _i < entries_1.length; _i++) {
                    var entry = entries_1[_i];
                    var _a = entry.contentRect, width = _a.width, height = _a.height;
                    _this.checkSize(_this.elements.get(entry.target), entry.target, width, height);
                }
            });
        }
        else { // polyfill (more reliable even in browsers that support ResizeObserver)
            var step = function () {
                _this.elements.forEach(function (entry, element) {
                    var width = element.clientWidth ? element.clientWidth : 0;
                    var height = element.clientHeight ? element.clientHeight : 0;
                    _this.checkSize(entry, element, width, height);
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
    };
    SizeMonitor.unobserve = function (element) {
        if (this.resizeObserver) {
            this.resizeObserver.unobserve(element);
        }
        this.elements.delete(element);
    };
    SizeMonitor.elements = new Map();
    SizeMonitor.requestAnimationFrameId = 0;
    SizeMonitor.ready = false;
    return SizeMonitor;
}());
export { SizeMonitor };
