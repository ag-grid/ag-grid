"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SizeMonitor = void 0;
class SizeMonitor {
    static init() {
        const NativeResizeObserver = window.ResizeObserver;
        if (NativeResizeObserver) {
            this.resizeObserver = new NativeResizeObserver((entries) => {
                for (const entry of entries) {
                    const { width, height } = entry.contentRect;
                    this.checkSize(this.elements.get(entry.target), entry.target, width, height);
                }
            });
        }
        else {
            // polyfill (more reliable even in browsers that support ResizeObserver)
            const step = () => {
                this.elements.forEach((entry, element) => {
                    this.checkClientSize(element, entry);
                });
            };
            window.setInterval(step, 100);
        }
        this.ready = true;
    }
    static checkSize(entry, element, width, height) {
        if (entry) {
            if (!entry.size || width !== entry.size.width || height !== entry.size.height) {
                entry.size = { width, height };
                entry.cb(entry.size, element);
            }
        }
    }
    // Only a single callback is supported.
    static observe(element, cb) {
        if (!this.ready) {
            this.init();
        }
        this.unobserve(element);
        if (this.resizeObserver) {
            this.resizeObserver.observe(element);
        }
        this.elements.set(element, { cb });
        // Ensure first size callback happens synchronously.
        this.checkClientSize(element, { cb });
    }
    static unobserve(element) {
        if (this.resizeObserver) {
            this.resizeObserver.unobserve(element);
        }
        this.elements.delete(element);
    }
    static checkClientSize(element, entry) {
        const width = element.clientWidth ? element.clientWidth : 0;
        const height = element.clientHeight ? element.clientHeight : 0;
        this.checkSize(entry, element, width, height);
    }
}
exports.SizeMonitor = SizeMonitor;
SizeMonitor.elements = new Map();
SizeMonitor.ready = false;
