var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Shape } from './shape';
import { BBox } from '../bbox';
import { HdpiCanvas } from '../../canvas/hdpiCanvas';
import { RedrawType, SceneChangeDetection } from '../node';
const ellipsis = '\u2026';
function SceneFontChangeDetection(opts) {
    const { redraw = RedrawType.MAJOR, changeCb } = opts !== null && opts !== void 0 ? opts : {};
    return SceneChangeDetection({ redraw, type: 'font', changeCb });
}
export class Text extends Shape {
    constructor() {
        super(...arguments);
        this.x = 0;
        this.y = 0;
        this.lines = [];
        this.text = undefined;
        this._dirtyFont = true;
        this.fontSize = 10;
        this.fontFamily = 'sans-serif';
        this.textAlign = Text.defaultStyles.textAlign;
        this.textBaseline = Text.defaultStyles.textBaseline;
        // TextMetrics are used if lineHeight is not defined.
        this.lineHeight = undefined;
    }
    _setLines() {
        this.lines = splitText(this.text);
    }
    get font() {
        if (this._dirtyFont) {
            this._dirtyFont = false;
            this._font = getFont(this);
        }
        return this._font;
    }
    computeBBox() {
        return HdpiCanvas.has.textMetrics
            ? getPreciseBBox(this.lines, this.x, this.y, this)
            : getApproximateBBox(this.lines, this.x, this.y, this);
    }
    getLineHeight(line) {
        var _a, _b;
        if (this.lineHeight)
            return this.lineHeight;
        if (HdpiCanvas.has.textMetrics) {
            const metrics = HdpiCanvas.measureText(line, this.font, this.textBaseline, this.textAlign);
            return (((_a = metrics.fontBoundingBoxAscent) !== null && _a !== void 0 ? _a : metrics.emHeightAscent) +
                ((_b = metrics.fontBoundingBoxDescent) !== null && _b !== void 0 ? _b : metrics.emHeightDescent));
        }
        return HdpiCanvas.getTextSize(line, this.font).height;
    }
    isPointInPath(x, y) {
        const point = this.transformPoint(x, y);
        const bbox = this.computeBBox();
        return bbox ? bbox.containsPoint(point.x, point.y) : false;
    }
    render(renderCtx) {
        const { ctx, forceRender, stats } = renderCtx;
        if (this.dirty === RedrawType.NONE && !forceRender) {
            if (stats)
                stats.nodesSkipped += this.nodeCount.count;
            return;
        }
        if (!this.lines.length || !this.layerManager) {
            if (stats)
                stats.nodesSkipped += this.nodeCount.count;
            return;
        }
        this.computeTransformMatrix();
        this.matrix.toContext(ctx);
        const { fill, stroke, strokeWidth } = this;
        ctx.font = this.font;
        ctx.textAlign = this.textAlign;
        ctx.textBaseline = this.textBaseline;
        const pixelRatio = this.layerManager.canvas.pixelRatio || 1;
        const { globalAlpha } = ctx;
        if (fill) {
            ctx.fillStyle = fill;
            ctx.globalAlpha = globalAlpha * this.opacity * this.fillOpacity;
            const { fillShadow } = this;
            if (fillShadow === null || fillShadow === void 0 ? void 0 : fillShadow.enabled) {
                ctx.shadowColor = fillShadow.color;
                ctx.shadowOffsetX = fillShadow.xOffset * pixelRatio;
                ctx.shadowOffsetY = fillShadow.yOffset * pixelRatio;
                ctx.shadowBlur = fillShadow.blur * pixelRatio;
            }
            this.renderLines((line, x, y) => ctx.fillText(line, x, y));
        }
        if (stroke && strokeWidth) {
            ctx.strokeStyle = stroke;
            ctx.lineWidth = strokeWidth;
            ctx.globalAlpha = globalAlpha * this.opacity * this.strokeOpacity;
            const { lineDash, lineDashOffset, lineCap, lineJoin } = this;
            if (lineDash) {
                ctx.setLineDash(lineDash);
            }
            if (lineDashOffset) {
                ctx.lineDashOffset = lineDashOffset;
            }
            if (lineCap) {
                ctx.lineCap = lineCap;
            }
            if (lineJoin) {
                ctx.lineJoin = lineJoin;
            }
            this.renderLines((line, x, y) => ctx.strokeText(line, x, y));
        }
        super.render(renderCtx);
    }
    renderLines(renderCallback) {
        const { lines, x, y } = this;
        const lineHeights = this.lines.map((line) => this.getLineHeight(line));
        const totalHeight = lineHeights.reduce((a, b) => a + b, 0);
        let offsetY = -(totalHeight - lineHeights[0]) * getVerticalOffset(this.textBaseline);
        for (let i = 0; i < lines.length; i++) {
            renderCallback(lines[i], x, y + offsetY);
            offsetY += lineHeights[i];
        }
    }
    static wrap(text, maxWidth, maxHeight, textProps, wrapping) {
        const font = getFont(textProps);
        const measurer = createTextMeasurer(font);
        const lines = text.split(/\r?\n/g);
        if (lines.length === 0) {
            return '';
        }
        if (wrapping === 'never') {
            return Text.truncateLine(lines[0], maxWidth, measurer, false);
        }
        const result = [];
        let cumulativeHeight = 0;
        for (const line of lines) {
            const wrappedLine = Text.wrapLine(line, maxWidth, maxHeight, measurer, textProps, wrapping, cumulativeHeight);
            result.push(wrappedLine.result);
            cumulativeHeight = wrappedLine.cumulativeHeight;
            if (wrappedLine.truncated) {
                break;
            }
        }
        return result.join('\n').trim();
    }
    static wrapLine(text, maxWidth, maxHeight, measurer, textProps, wrapping, cumulativeHeight) {
        text = text.trim();
        if (!text) {
            return { result: '', truncated: false, cumulativeHeight };
        }
        const initialSize = measurer.size(text);
        if (initialSize.width <= maxWidth) {
            // Text fits into a single line
            return { result: text, truncated: false, cumulativeHeight: cumulativeHeight + initialSize.height };
        }
        if (initialSize.height > maxHeight || measurer.width('W') > maxWidth) {
            // Not enough space for a single line or character
            return { result: '', truncated: true, cumulativeHeight };
        }
        const words = text.split(/\s+/g);
        const wrapResult = Text.wrapLineSequentially(words, maxWidth, maxHeight, measurer, textProps, wrapping, cumulativeHeight);
        cumulativeHeight = wrapResult.cumulativeHeight;
        let { lines } = wrapResult;
        if (!(wrapResult.wordsBrokenOrTruncated || wrapResult.linesTruncated)) {
            // If no word breaks or truncations, try the balanced wrapping
            const linesCount = wrapResult.lines.length;
            const balanced = Text.wrapLineBalanced(words, maxWidth, measurer, linesCount);
            if (balanced.length === lines.length) {
                // Some lines can't be balanced properly because of unusually long words
                lines = balanced;
            }
        }
        const wrappedText = lines.map((ln) => ln.join(' ')).join('\n');
        return { result: wrappedText, truncated: wrapResult.linesTruncated, cumulativeHeight };
    }
    static breakWord(word, firstLineWidth, maxWidth, hyphens, measurer) {
        const isPunctuationAt = (index) => Text.punctuationMarks.includes(word[index]);
        const h = hyphens ? measurer.width('-') : 0;
        const breaks = [];
        let partWidth = 0;
        let p = 0;
        for (let i = 0; i < word.length; i++) {
            const c = word[i];
            const w = measurer.width(c);
            const limit = p === 0 ? firstLineWidth : maxWidth;
            if (partWidth + w + h > limit) {
                breaks.push(i);
                partWidth = 0;
                p++;
            }
            partWidth += w;
        }
        const parts = [];
        let start = 0;
        for (const index of breaks) {
            let part = word.substring(start, index);
            if (hyphens && part.length > 0 && !isPunctuationAt(index - 1) && !isPunctuationAt(index)) {
                part += '-';
            }
            parts.push(part);
            start = index;
        }
        parts.push(word.substring(start));
        return parts;
    }
    static truncateLine(text, maxWidth, measurer, forceEllipsis) {
        const lineWidth = measurer.width(text);
        if (lineWidth < maxWidth && !forceEllipsis) {
            return text;
        }
        const ellipsisWidth = measurer.width(ellipsis);
        if (lineWidth + ellipsisWidth <= maxWidth) {
            return `${text}${ellipsis}`;
        }
        let index = Math.floor((text.length * maxWidth) / lineWidth) + 1;
        let trunc;
        let truncWidth;
        do {
            trunc = text.substring(0, index);
            truncWidth = measurer.width(trunc);
        } while (--index >= 0 && truncWidth + ellipsisWidth > maxWidth);
        return `${trunc}${ellipsis}`;
    }
    static wrapLineSequentially(words, maxWidth, maxHeight, measurer, textProps, wrapping, cumulativeHeight) {
        const { fontSize, lineHeight = fontSize * Text.defaultLineHeightRatio } = textProps;
        const breakWord = wrapping === 'always' || wrapping === 'hyphenate';
        const hyphenate = wrapping === 'hyphenate';
        const spaceWidth = measurer.width(' ');
        let wordsBrokenOrTruncated = false;
        let linesTruncated = false;
        const lines = [];
        let currentLine = [];
        let lineWidth = 0;
        const addNewLine = () => {
            const expectedHeight = cumulativeHeight + lineHeight;
            if (expectedHeight >= maxHeight) {
                // Truncate the last line
                const lastLine = currentLine.join(' ');
                const trunc = Text.truncateLine(lastLine, maxWidth, measurer, true);
                currentLine.splice(0, currentLine.length, trunc);
                linesTruncated = true;
                return false;
            }
            // Add new line
            currentLine = [];
            lineWidth = 0;
            cumulativeHeight = expectedHeight;
            lines.push(currentLine);
            return true;
        };
        if (!addNewLine()) {
            return { lines, linesTruncated: true, wordsBrokenOrTruncated, cumulativeHeight };
        }
        for (let i = 0; i < words.length; i++) {
            const word = words[i];
            const wordWidth = measurer.width(word);
            const expectedSpaceWidth = currentLine.length === 0 ? 0 : spaceWidth;
            const expectedLineWidth = lineWidth + expectedSpaceWidth + wordWidth;
            if (expectedLineWidth <= maxWidth) {
                // If the word fits, add it to the current line
                currentLine.push(word);
                lineWidth = expectedLineWidth;
                continue;
            }
            if (wordWidth <= maxWidth) {
                // If the word is not too long, put it onto new line
                if (!addNewLine()) {
                    break;
                }
                currentLine.push(word);
                lineWidth = wordWidth;
                continue;
            }
            // Handle a long word
            wordsBrokenOrTruncated = true;
            if (breakWord) {
                // Break the word into parts
                const availWidth = maxWidth - lineWidth - expectedSpaceWidth;
                const parts = Text.breakWord(word, availWidth, maxWidth, hyphenate, measurer);
                let breakLoop = false;
                for (let p = 0; p < parts.length; p++) {
                    const part = parts[p];
                    part && currentLine.push(part);
                    if (p === parts.length - 1) {
                        lineWidth = measurer.width(part);
                    }
                    else if (!addNewLine()) {
                        breakLoop = true;
                        break;
                    }
                }
                if (breakLoop)
                    break;
            }
            else {
                // Truncate the word
                if (!addNewLine()) {
                    break;
                }
                const trunc = Text.truncateLine(word, maxWidth, measurer, true);
                currentLine.push(trunc);
                if (i < words.length - 1) {
                    linesTruncated = true;
                }
                break;
            }
        }
        return { lines, linesTruncated, wordsBrokenOrTruncated, cumulativeHeight };
    }
    static wrapLineBalanced(words, maxWidth, measurer, linesCount) {
        const totalWordsWidth = words.reduce((sum, w) => sum + measurer.width(w), 0);
        const spaceWidth = measurer.width(' ');
        const totalSpaceWidth = spaceWidth * (words.length - linesCount - 2);
        const averageLineWidth = (totalWordsWidth + totalSpaceWidth) / linesCount;
        const lines = [];
        let currentLine = [];
        let lineWidth = measurer.width(words[0]);
        let newLine = true;
        for (const word of words) {
            const width = measurer.width(word);
            if (newLine) {
                // New line
                currentLine = [];
                currentLine.push(word);
                lineWidth = width;
                newLine = false;
                lines.push(currentLine);
                continue;
            }
            const expectedLineWidth = lineWidth + spaceWidth + width;
            if (expectedLineWidth <= averageLineWidth) {
                // Keep adding words to the line
                currentLine.push(word);
                lineWidth = expectedLineWidth;
            }
            else if (expectedLineWidth <= maxWidth) {
                // Add the last word to the line
                currentLine.push(word);
                newLine = true;
            }
            else {
                // Put the word onto the next line
                currentLine = [word];
                lineWidth = width;
                lines.push(currentLine);
            }
        }
        return lines;
    }
}
Text.className = 'Text';
// The default line spacing for document editors is usually 1.15
Text.defaultLineHeightRatio = 1.15;
Text.defaultStyles = Object.assign({}, Shape.defaultStyles, {
    textAlign: 'start',
    fontStyle: undefined,
    fontWeight: undefined,
    fontSize: 10,
    fontFamily: 'sans-serif',
    textBaseline: 'alphabetic',
});
Text.punctuationMarks = ['.', ',', '-', ':', ';', '!', '?', `'`, '"', '(', ')'];
__decorate([
    SceneChangeDetection({ redraw: RedrawType.MAJOR })
], Text.prototype, "x", void 0);
__decorate([
    SceneChangeDetection({ redraw: RedrawType.MAJOR })
], Text.prototype, "y", void 0);
__decorate([
    SceneChangeDetection({ redraw: RedrawType.MAJOR, changeCb: (o) => o._setLines() })
], Text.prototype, "text", void 0);
__decorate([
    SceneFontChangeDetection()
], Text.prototype, "fontStyle", void 0);
__decorate([
    SceneFontChangeDetection()
], Text.prototype, "fontWeight", void 0);
__decorate([
    SceneFontChangeDetection()
], Text.prototype, "fontSize", void 0);
__decorate([
    SceneFontChangeDetection()
], Text.prototype, "fontFamily", void 0);
__decorate([
    SceneChangeDetection({ redraw: RedrawType.MAJOR })
], Text.prototype, "textAlign", void 0);
__decorate([
    SceneChangeDetection({ redraw: RedrawType.MAJOR })
], Text.prototype, "textBaseline", void 0);
__decorate([
    SceneChangeDetection({ redraw: RedrawType.MAJOR })
], Text.prototype, "lineHeight", void 0);
export function createTextMeasurer(font) {
    const cache = new Map();
    const getTextSize = (text) => HdpiCanvas.getTextSize(text, font);
    const getLineWidth = (text) => {
        if (cache.has(text)) {
            return cache.get(text);
        }
        const { width } = getTextSize(text);
        cache.set(text, width);
        return width;
    };
    return { size: getTextSize, width: getLineWidth };
}
export function getFont(fontProps) {
    const { fontFamily, fontSize, fontStyle, fontWeight } = fontProps;
    return [fontStyle !== null && fontStyle !== void 0 ? fontStyle : '', fontWeight !== null && fontWeight !== void 0 ? fontWeight : '', fontSize + 'px', fontFamily].join(' ').trim();
}
export function measureText(lines, x, y, textProps) {
    return HdpiCanvas.has.textMetrics
        ? getPreciseBBox(lines, x, y, textProps)
        : getApproximateBBox(lines, x, y, textProps);
}
function getPreciseBBox(lines, x, y, textProps) {
    var _a, _b;
    let left = 0;
    let top = 0;
    let width = 0;
    let height = 0;
    // Distance between first and last base lines.
    let baselineDistance = 0;
    const font = getFont(textProps);
    const { lineHeight, textBaseline = Text.defaultStyles.textBaseline, textAlign = Text.defaultStyles.textAlign, } = textProps;
    for (let i = 0; i < lines.length; i++) {
        const metrics = HdpiCanvas.measureText(lines[i], font, textBaseline, textAlign);
        left = Math.max(left, metrics.actualBoundingBoxLeft);
        width = Math.max(width, metrics.width);
        if (i == 0) {
            top += metrics.actualBoundingBoxAscent;
            height += metrics.actualBoundingBoxAscent;
        }
        else {
            baselineDistance += (_a = metrics.fontBoundingBoxAscent) !== null && _a !== void 0 ? _a : metrics.emHeightAscent;
        }
        if (i == lines.length - 1) {
            height += metrics.actualBoundingBoxDescent;
        }
        else {
            baselineDistance += (_b = metrics.fontBoundingBoxDescent) !== null && _b !== void 0 ? _b : metrics.emHeightDescent;
        }
    }
    if (lineHeight !== undefined) {
        baselineDistance = (lines.length - 1) * lineHeight;
    }
    height += baselineDistance;
    top += baselineDistance * getVerticalOffset(textBaseline);
    return new BBox(x - left, y - top, width, height);
}
function getApproximateBBox(lines, x, y, textProps) {
    let width = 0;
    let firstLineHeight = 0;
    // Distance between first and last base lines.
    let baselineDistance = 0;
    const font = getFont(textProps);
    const { lineHeight, textBaseline = Text.defaultStyles.textBaseline, textAlign = Text.defaultStyles.textAlign, } = textProps;
    if (lines.length > 0) {
        const lineSize = HdpiCanvas.getTextSize(lines[0], font);
        width = lineSize.width;
        firstLineHeight = lineSize.height;
    }
    for (let i = 1; i < lines.length; i++) {
        const lineSize = HdpiCanvas.getTextSize(lines[i], font);
        width = Math.max(width, lineSize.width);
        baselineDistance += lineHeight !== null && lineHeight !== void 0 ? lineHeight : lineSize.height;
    }
    switch (textAlign) {
        case 'end':
        case 'right':
            x -= width;
            break;
        case 'center':
            x -= width / 2;
    }
    switch (textBaseline) {
        case 'alphabetic':
            y -= firstLineHeight * 0.7 + baselineDistance * 0.5;
            break;
        case 'middle':
            y -= firstLineHeight * 0.45 + baselineDistance * 0.5;
            break;
        case 'ideographic':
            y -= firstLineHeight + baselineDistance;
            break;
        case 'hanging':
            y -= firstLineHeight * 0.2 + baselineDistance * 0.5;
            break;
        case 'bottom':
            y -= firstLineHeight + baselineDistance;
            break;
    }
    return new BBox(x, y, width, firstLineHeight + baselineDistance);
}
function getVerticalOffset(textBaseline) {
    switch (textBaseline) {
        case 'top':
        case 'hanging':
            return 0;
        case 'bottom':
        case 'alphabetic':
        case 'ideographic':
            return 1;
        case 'middle':
            return 0.5;
    }
}
export function splitText(text) {
    return typeof text === 'string' ? text.split(/\r?\n/g) : [];
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGV4dC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy9zY2VuZS9zaGFwZS90ZXh0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBLE9BQU8sRUFBRSxLQUFLLEVBQUUsTUFBTSxTQUFTLENBQUM7QUFDaEMsT0FBTyxFQUFFLElBQUksRUFBRSxNQUFNLFNBQVMsQ0FBQztBQUMvQixPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0seUJBQXlCLENBQUM7QUFDckQsT0FBTyxFQUFFLFVBQVUsRUFBRSxvQkFBb0IsRUFBaUIsTUFBTSxTQUFTLENBQUM7QUFhMUUsTUFBTSxRQUFRLEdBQUcsUUFBUSxDQUFDO0FBRTFCLFNBQVMsd0JBQXdCLENBQUMsSUFBMEQ7SUFDeEYsTUFBTSxFQUFFLE1BQU0sR0FBRyxVQUFVLENBQUMsS0FBSyxFQUFFLFFBQVEsRUFBRSxHQUFHLElBQUksYUFBSixJQUFJLGNBQUosSUFBSSxHQUFJLEVBQUUsQ0FBQztJQUUzRCxPQUFPLG9CQUFvQixDQUFDLEVBQUUsTUFBTSxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUUsUUFBUSxFQUFFLENBQUMsQ0FBQztBQUNwRSxDQUFDO0FBRUQsTUFBTSxPQUFPLElBQUssU0FBUSxLQUFLO0lBQS9COztRQWdCSSxNQUFDLEdBQVcsQ0FBQyxDQUFDO1FBR2QsTUFBQyxHQUFXLENBQUMsQ0FBQztRQUVOLFVBQUssR0FBYSxFQUFFLENBQUM7UUFNN0IsU0FBSSxHQUFZLFNBQVMsQ0FBQztRQUVsQixlQUFVLEdBQVksSUFBSSxDQUFDO1FBa0JuQyxhQUFRLEdBQVcsRUFBRSxDQUFDO1FBR3RCLGVBQVUsR0FBVyxZQUFZLENBQUM7UUFHbEMsY0FBUyxHQUFvQixJQUFJLENBQUMsYUFBYSxDQUFDLFNBQVMsQ0FBQztRQUcxRCxpQkFBWSxHQUF1QixJQUFJLENBQUMsYUFBYSxDQUFDLFlBQVksQ0FBQztRQUVuRSxxREFBcUQ7UUFFckQsZUFBVSxHQUFZLFNB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