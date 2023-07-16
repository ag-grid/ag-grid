export class NavigatorMask {
    constructor(rangeMask) {
        this.rm = rangeMask;
    }
    set fill(value) {
        this.rm.fill = value;
    }
    get fill() {
        return this.rm.fill;
    }
    set stroke(value) {
        this.rm.stroke = value;
    }
    get stroke() {
        return this.rm.stroke;
    }
    set strokeWidth(value) {
        this.rm.strokeWidth = value;
    }
    get strokeWidth() {
        return this.rm.strokeWidth;
    }
    set fillOpacity(value) {
        this.rm.fillOpacity = value;
    }
    get fillOpacity() {
        return this.rm.fillOpacity;
    }
}
