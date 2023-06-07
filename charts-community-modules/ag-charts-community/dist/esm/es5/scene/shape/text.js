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
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
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
import { Shape } from './shape';
import { BBox } from '../bbox';
import { HdpiCanvas } from '../../canvas/hdpiCanvas';
import { RedrawType, SceneChangeDetection } from '../node';
var ellipsis = '\u2026';
function SceneFontChangeDetection(opts) {
    var _a = opts !== null && opts !== void 0 ? opts : {}, _b = _a.redraw, redraw = _b === void 0 ? RedrawType.MAJOR : _b, changeCb = _a.changeCb;
    return SceneChangeDetection({ redraw: redraw, type: 'font', changeCb: changeCb });
}
var Text = /** @class */ (function (_super) {
    __extends(Text, _super);
    function Text() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.x = 0;
        _this.y = 0;
        _this.lines = [];
        _this.text = undefined;
        _this._dirtyFont = true;
        _this.fontSize = 10;
        _this.fontFamily = 'sans-serif';
        _this.textAlign = Text.defaultStyles.textAlign;
        _this.textBaseline = Text.defaultStyles.textBaseline;
        // TextMetrics are used if lineHeight is not defined.
        _this.lineHeight = undefined;
        return _this;
    }
    Text.prototype._setLines = function () {
        this.lines = splitText(this.text);
    };
    Object.defineProperty(Text.prototype, "font", {
        get: function () {
            if (this._dirtyFont) {
                this._dirtyFont = false;
                this._font = getFont(this);
            }
            return this._font;
        },
        enumerable: false,
        configurable: true
    });
    Text.prototype.computeBBox = function () {
        return HdpiCanvas.has.textMetrics
            ? getPreciseBBox(this.lines, this.x, this.y, this)
            : getApproximateBBox(this.lines, this.x, this.y, this);
    };
    Text.prototype.getLineHeight = function (line) {
        var _a, _b;
        if (this.lineHeight)
            return this.lineHeight;
        if (HdpiCanvas.has.textMetrics) {
            var metrics = HdpiCanvas.measureText(line, this.font, this.textBaseline, this.textAlign);
            return (((_a = metrics.fontBoundingBoxAscent) !== null && _a !== void 0 ? _a : metrics.emHeightAscent) +
                ((_b = metrics.fontBoundingBoxDescent) !== null && _b !== void 0 ? _b : metrics.emHeightDescent));
        }
        return HdpiCanvas.getTextSize(line, this.font).height;
    };
    Text.prototype.isPointInPath = function (x, y) {
        var point = this.transformPoint(x, y);
        var bbox = this.computeBBox();
        return bbox ? bbox.containsPoint(point.x, point.y) : false;
    };
    Text.prototype.render = function (renderCtx) {
        var ctx = renderCtx.ctx, forceRender = renderCtx.forceRender, stats = renderCtx.stats;
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
        var _a = this, fill = _a.fill, stroke = _a.stroke, strokeWidth = _a.strokeWidth;
        ctx.font = this.font;
        ctx.textAlign = this.textAlign;
        ctx.textBaseline = this.textBaseline;
        var pixelRatio = this.layerManager.canvas.pixelRatio || 1;
        var globalAlpha = ctx.globalAlpha;
        if (fill) {
            ctx.fillStyle = fill;
            ctx.globalAlpha = globalAlpha * this.opacity * this.fillOpacity;
            var fillShadow = this.fillShadow;
            if (fillShadow === null || fillShadow === void 0 ? void 0 : fillShadow.enabled) {
                ctx.shadowColor = fillShadow.color;
                ctx.shadowOffsetX = fillShadow.xOffset * pixelRatio;
                ctx.shadowOffsetY = fillShadow.yOffset * pixelRatio;
                ctx.shadowBlur = fillShadow.blur * pixelRatio;
            }
            this.renderLines(function (line, x, y) { return ctx.fillText(line, x, y); });
        }
        if (stroke && strokeWidth) {
            ctx.strokeStyle = stroke;
            ctx.lineWidth = strokeWidth;
            ctx.globalAlpha = globalAlpha * this.opacity * this.strokeOpacity;
            var _b = this, lineDash = _b.lineDash, lineDashOffset = _b.lineDashOffset, lineCap = _b.lineCap, lineJoin = _b.lineJoin;
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
            this.renderLines(function (line, x, y) { return ctx.strokeText(line, x, y); });
        }
        _super.prototype.render.call(this, renderCtx);
    };
    Text.prototype.renderLines = function (renderCallback) {
        var _this = this;
        var _a = this, lines = _a.lines, x = _a.x, y = _a.y;
        var lineHeights = this.lines.map(function (line) { return _this.getLineHeight(line); });
        var totalHeight = lineHeights.reduce(function (a, b) { return a + b; }, 0);
        var offsetY = -(totalHeight - lineHeights[0]) * getVerticalOffset(this.textBaseline);
        for (var i = 0; i < lines.length; i++) {
            renderCallback(lines[i], x, y + offsetY);
            offsetY += lineHeights[i];
        }
    };
    Text.wrap = function (text, maxWidth, maxHeight, textProps, wrapping) {
        var e_1, _a;
        var font = getFont(textProps);
        var measurer = createTextMeasurer(font);
        var lines = text.split(/\r?\n/g);
        if (lines.length === 0) {
            return '';
        }
        if (wrapping === 'never') {
            return Text.truncateLine(lines[0], maxWidth, measurer, false);
        }
        var result = [];
        var cumulativeHeight = 0;
        try {
            for (var lines_1 = __values(lines), lines_1_1 = lines_1.next(); !lines_1_1.done; lines_1_1 = lines_1.next()) {
                var line = lines_1_1.value;
                var wrappedLine = Text.wrapLine(line, maxWidth, maxHeight, measurer, textProps, wrapping, cumulativeHeight);
                result.push(wrappedLine.result);
                cumulativeHeight = wrappedLine.cumulativeHeight;
                if (wrappedLine.truncated) {
                    break;
                }
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (lines_1_1 && !lines_1_1.done && (_a = lines_1.return)) _a.call(lines_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
        return result.join('\n').trim();
    };
    Text.wrapLine = function (text, maxWidth, maxHeight, measurer, textProps, wrapping, cumulativeHeight) {
        text = text.trim();
        if (!text) {
            return { result: '', truncated: false, cumulativeHeight: cumulativeHeight };
        }
        var initialSize = measurer.size(text);
        if (initialSize.width <= maxWidth) {
            // Text fits into a single line
            return { result: text, truncated: false, cumulativeHeight: cumulativeHeight + initialSize.height };
        }
        if (initialSize.height > maxHeight || measurer.width('W') > maxWidth) {
            // Not enough space for a single line or character
            return { result: '', truncated: true, cumulativeHeight: cumulativeHeight };
        }
        var words = text.split(/\s+/g);
        var wrapResult = Text.wrapLineSequentially(words, maxWidth, maxHeight, measurer, textProps, wrapping, cumulativeHeight);
        cumulativeHeight = wrapResult.cumulativeHeight;
        var lines = wrapResult.lines;
        if (!(wrapResult.wordsBrokenOrTruncated || wrapResult.linesTruncated)) {
            // If no word breaks or truncations, try the balanced wrapping
            var linesCount = wrapResult.lines.length;
            var balanced = Text.wrapLineBalanced(words, maxWidth, measurer, linesCount);
            if (balanced.length === lines.length) {
                // Some lines can't be balanced properly because of unusually long words
                lines = balanced;
            }
        }
        var wrappedText = lines.map(function (ln) { return ln.join(' '); }).join('\n');
        return { result: wrappedText, truncated: wrapResult.linesTruncated, cumulativeHeight: cumulativeHeight };
    };
    Text.breakWord = function (word, firstLineWidth, maxWidth, hyphens, measurer) {
        var e_2, _a;
        var isPunctuationAt = function (index) { return Text.punctuationMarks.includes(word[index]); };
        var h = hyphens ? measurer.width('-') : 0;
        var breaks = [];
        var partWidth = 0;
        var p = 0;
        for (var i = 0; i < word.length; i++) {
            var c = word[i];
            var w = measurer.width(c);
            var limit = p === 0 ? firstLineWidth : maxWidth;
            if (partWidth + w + h > limit) {
                breaks.push(i);
                partWidth = 0;
                p++;
            }
            partWidth += w;
        }
        var parts = [];
        var start = 0;
        try {
            for (var breaks_1 = __values(breaks), breaks_1_1 = breaks_1.next(); !breaks_1_1.done; breaks_1_1 = breaks_1.next()) {
                var index = breaks_1_1.value;
                var part = word.substring(start, index);
                if (hyphens && part.length > 0 && !isPunctuationAt(index - 1) && !isPunctuationAt(index)) {
                    part += '-';
                }
                parts.push(part);
                start = index;
            }
        }
        catch (e_2_1) { e_2 = { error: e_2_1 }; }
        finally {
            try {
                if (breaks_1_1 && !breaks_1_1.done && (_a = breaks_1.return)) _a.call(breaks_1);
            }
            finally { if (e_2) throw e_2.error; }
        }
        parts.push(word.substring(start));
        return parts;
    };
    Text.truncateLine = function (text, maxWidth, measurer, forceEllipsis) {
        var lineWidth = measurer.width(text);
        if (lineWidth < maxWidth && !forceEllipsis) {
            return text;
        }
        var ellipsisWidth = measurer.width(ellipsis);
        if (lineWidth + ellipsisWidth <= maxWidth) {
            return "" + text + ellipsis;
        }
        var index = Math.floor((text.length * maxWidth) / lineWidth) + 1;
        var trunc;
        var truncWidth;
        do {
            trunc = text.substring(0, index);
            truncWidth = measurer.width(trunc);
        } while (--index >= 0 && truncWidth + ellipsisWidth > maxWidth);
        return "" + trunc + ellipsis;
    };
    Text.wrapLineSequentially = function (words, maxWidth, maxHeight, measurer, textProps, wrapping, cumulativeHeight) {
        var fontSize = textProps.fontSize, _a = textProps.lineHeight, lineHeight = _a === void 0 ? fontSize * Text.defaultLineHeightRatio : _a;
        var breakWord = wrapping === 'always' || wrapping === 'hyphenate';
        var hyphenate = wrapping === 'hyphenate';
        var spaceWidth = measurer.width(' ');
        var wordsBrokenOrTruncated = false;
        var linesTruncated = false;
        var lines = [];
        var currentLine = [];
        var lineWidth = 0;
        var addNewLine = function () {
            var expectedHeight = cumulativeHeight + lineHeight;
            if (expectedHeight >= maxHeight) {
                // Truncate the last line
                var lastLine = currentLine.join(' ');
                var trunc = Text.truncateLine(lastLine, maxWidth, measurer, true);
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
            return { lines: lines, linesTruncated: true, wordsBrokenOrTruncated: wordsBrokenOrTruncated, cumulativeHeight: cumulativeHeight };
        }
        for (var i = 0; i < words.length; i++) {
            var word = words[i];
            var wordWidth = measurer.width(word);
            var expectedSpaceWidth = currentLine.length === 0 ? 0 : spaceWidth;
            var expectedLineWidth = lineWidth + expectedSpaceWidth + wordWidth;
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
                var availWidth = maxWidth - lineWidth - expectedSpaceWidth;
                var parts = Text.breakWord(word, availWidth, maxWidth, hyphenate, measurer);
                var breakLoop = false;
                for (var p = 0; p < parts.length; p++) {
                    var part = parts[p];
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
                var trunc = Text.truncateLine(word, maxWidth, measurer, true);
                currentLine.push(trunc);
                if (i < words.length - 1) {
                    linesTruncated = true;
                }
                break;
            }
        }
        return { lines: lines, linesTruncated: linesTruncated, wordsBrokenOrTruncated: wordsBrokenOrTruncated, cumulativeHeight: cumulativeHeight };
    };
    Text.wrapLineBalanced = function (words, maxWidth, measurer, linesCount) {
        var e_3, _a;
        var totalWordsWidth = words.reduce(function (sum, w) { return sum + measurer.width(w); }, 0);
        var spaceWidth = measurer.width(' ');
        var totalSpaceWidth = spaceWidth * (words.length - linesCount - 2);
        var averageLineWidth = (totalWordsWidth + totalSpaceWidth) / linesCount;
        var lines = [];
        var currentLine = [];
        var lineWidth = measurer.width(words[0]);
        var newLine = true;
        try {
            for (var words_1 = __values(words), words_1_1 = words_1.next(); !words_1_1.done; words_1_1 = words_1.next()) {
                var word = words_1_1.value;
                var width = measurer.width(word);
                if (newLine) {
                    // New line
                    currentLine = [];
                    currentLine.push(word);
                    lineWidth = width;
                    newLine = false;
                    lines.push(currentLine);
                    continue;
                }
                var expectedLineWidth = lineWidth + spaceWidth + width;
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
        }
        catch (e_3_1) { e_3 = { error: e_3_1 }; }
        finally {
            try {
                if (words_1_1 && !words_1_1.done && (_a = words_1.return)) _a.call(words_1);
            }
            finally { if (e_3) throw e_3.error; }
        }
        return lines;
    };
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
    Text.punctuationMarks = ['.', ',', '-', ':', ';', '!', '?', "'", '"', '(', ')'];
    __decorate([
        SceneChangeDetection({ redraw: RedrawType.MAJOR })
    ], Text.prototype, "x", void 0);
    __decorate([
        SceneChangeDetection({ redraw: RedrawType.MAJOR })
    ], Text.prototype, "y", void 0);
    __decorate([
        SceneChangeDetection({ redraw: RedrawType.MAJOR, changeCb: function (o) { return o._setLines(); } })
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
    return Text;
}(Shape));
export { Text };
export function createTextMeasurer(font) {
    var cache = new Map();
    var getTextSize = function (text) { return HdpiCanvas.getTextSize(text, font); };
    var getLineWidth = function (text) {
        if (cache.has(text)) {
            return cache.get(text);
        }
        var width = getTextSize(text).width;
        cache.set(text, width);
        return width;
    };
    return { size: getTextSize, width: getLineWidth };
}
export function getFont(fontProps) {
    var fontFamily = fontProps.fontFamily, fontSize = fontProps.fontSize, fontStyle = fontProps.fontStyle, fontWeight = fontProps.fontWeight;
    return [fontStyle !== null && fontStyle !== void 0 ? fontStyle : '', fontWeight !== null && fontWeight !== void 0 ? fontWeight : '', fontSize + 'px', fontFamily].join(' ').trim();
}
export function measureText(lines, x, y, textProps) {
    return HdpiCanvas.has.textMetrics
        ? getPreciseBBox(lines, x, y, textProps)
        : getApproximateBBox(lines, x, y, textProps);
}
function getPreciseBBox(lines, x, y, textProps) {
    var _a, _b;
    var left = 0;
    var top = 0;
    var width = 0;
    var height = 0;
    // Distance between first and last base lines.
    var baselineDistance = 0;
    var font = getFont(textProps);
    var lineHeight = textProps.lineHeight, _c = textProps.textBaseline, textBaseline = _c === void 0 ? Text.defaultStyles.textBaseline : _c, _d = textProps.textAlign, textAlign = _d === void 0 ? Text.defaultStyles.textAlign : _d;
    for (var i = 0; i < lines.length; i++) {
        var metrics = HdpiCanvas.measureText(lines[i], font, textBaseline, textAlign);
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
    var width = 0;
    var firstLineHeight = 0;
    // Distance between first and last base lines.
    var baselineDistance = 0;
    var font = getFont(textProps);
    var lineHeight = textProps.lineHeight, _a = textProps.textBaseline, textBaseline = _a === void 0 ? Text.defaultStyles.textBaseline : _a, _b = textProps.textAlign, textAlign = _b === void 0 ? Text.defaultStyles.textAlign : _b;
    if (lines.length > 0) {
        var lineSize = HdpiCanvas.getTextSize(lines[0], font);
        width = lineSize.width;
        firstLineHeight = lineSize.height;
    }
    for (var i = 1; i < lines.length; i++) {
        var lineSize = HdpiCanvas.getTextSize(lines[i], font);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGV4dC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy9zY2VuZS9zaGFwZS90ZXh0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsT0FBTyxFQUFFLEtBQUssRUFBRSxNQUFNLFNBQVMsQ0FBQztBQUNoQyxPQUFPLEVBQUUsSUFBSSxFQUFFLE1BQU0sU0FBUyxDQUFDO0FBQy9CLE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSx5QkFBeUIsQ0FBQztBQUNyRCxPQUFPLEVBQUUsVUFBVSxFQUFFLG9CQUFvQixFQUFpQixNQUFNLFNBQVMsQ0FBQztBQWExRSxJQUFNLFFBQVEsR0FBRyxRQUFRLENBQUM7QUFFMUIsU0FBUyx3QkFBd0IsQ0FBQyxJQUEwRDtJQUNsRixJQUFBLEtBQTBDLElBQUksYUFBSixJQUFJLGNBQUosSUFBSSxHQUFJLEVBQUUsRUFBbEQsY0FBeUIsRUFBekIsTUFBTSxtQkFBRyxVQUFVLENBQUMsS0FBSyxLQUFBLEVBQUUsUUFBUSxjQUFlLENBQUM7SUFFM0QsT0FBTyxvQkFBb0IsQ0FBQyxFQUFFLE1BQU0sUUFBQSxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUUsUUFBUSxVQUFBLEVBQUUsQ0FBQyxDQUFDO0FBQ3BFLENBQUM7QUFFRDtJQUEwQix3QkFBSztJQUEvQjtRQUFBLHFFQThjQztRQTliRyxPQUFDLEdBQVcsQ0FBQyxDQUFDO1FBR2QsT0FBQyxHQUFXLENBQUMsQ0FBQztRQUVOLFdBQUssR0FBYSxFQUFFLENBQUM7UUFNN0IsVUFBSSxHQUFZLFNBQVMsQ0FBQztRQUVsQixnQkFBVSxHQUFZLElBQUksQ0FBQztRQWtCbkMsY0FBUSxHQUFXLEVBQUUsQ0FBQztRQUd0QixnQkFBVSxHQUFXLFlBQVksQ0FBQztRQUdsQyxlQUFTLEdBQW9CLElBQUksQ0FBQyxhQUFhLENBQUMsU0FBUyxDQUFDO1FBRzFELGtCQUFZLEdBQXVCLElBQUks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