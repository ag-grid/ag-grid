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
