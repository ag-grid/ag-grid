// ag-grid-enterprise v20.0.0
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var FpsCounter = /** @class */ (function () {
    function FpsCounter(parent) {
        this.fps = 0;
        this.start = performance.now();
        this.minFps = Infinity;
        this.maxFps = 0;
        this.fpsSum = 0;
        this.fpsSamples = 0;
        if (parent) {
            var el = document.createElement('div');
            // el.style.position = 'absolute';
            // el.style.left = '0px';
            // el.style.top = '0px';
            el.style.opacity = '0.8';
            el.style.padding = '5px';
            el.style.color = 'black';
            el.style.backgroundColor = 'white';
            parent.appendChild(el);
            this.fpsElement = el;
        }
    }
    FpsCounter.prototype.countFrame = function () {
        var now = performance.now();
        var fps = this.fps++;
        if (now - this.start > 1000) {
            if (fps > this.maxFps) {
                this.maxFps = fps;
            }
            if (fps < this.minFps) {
                this.minFps = fps;
            }
            this.fpsSum += this.fps;
            this.fpsSamples++;
            var avgFps = (this.fpsSum / this.fpsSamples).toFixed(2);
            if (this.fpsElement) {
                this.fpsElement.innerText = "FPS: " + fps + "\nAvg: " + avgFps + "\nMin: " + this.minFps + "\nMax: " + this.maxFps;
            }
            else {
                console.log("FPS: " + fps + ", Avg: " + avgFps + ", Min: " + this.minFps + ", Max: " + this.maxFps);
            }
            this.fps = 0;
            this.start = now;
        }
    };
    return FpsCounter;
}());
exports.FpsCounter = FpsCounter;
