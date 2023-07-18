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
Object.defineProperty(exports, "__esModule", { value: true });
exports.splitText = exports.measureText = exports.getFont = exports.createTextMeasurer = exports.Text = void 0;
var shape_1 = require("./shape");
var bbox_1 = require("../bbox");
var hdpiCanvas_1 = require("../../canvas/hdpiCanvas");
var node_1 = require("../node");
var ellipsis = '\u2026';
function SceneFontChangeDetection(opts) {
    var _a = opts !== null && opts !== void 0 ? opts : {}, _b = _a.redraw, redraw = _b === void 0 ? node_1.RedrawType.MAJOR : _b, changeCb = _a.changeCb;
    return node_1.SceneChangeDetection({ redraw: redraw, type: 'font', changeCb: changeCb });
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
            if (this._font == null || this._dirtyFont) {
                this._dirtyFont = false;
                this._font = getFont(this);
            }
            return this._font;
        },
        enumerable: false,
        configurable: true
    });
    Text.prototype.computeBBox = function () {
        return hdpiCanvas_1.HdpiCanvas.has.textMetrics
            ? getPreciseBBox(this.lines, this.x, this.y, this)
            : getApproximateBBox(this.lines, this.x, this.y, this);
    };
    Text.prototype.getLineHeight = function (line) {
        var _a, _b;
        if (this.lineHeight)
            return this.lineHeight;
        if (hdpiCanvas_1.HdpiCanvas.has.textMetrics) {
            var metrics = hdpiCanvas_1.HdpiCanvas.measureText(line, this.font, this.textBaseline, this.textAlign);
            return (((_a = metrics.fontBoundingBoxAscent) !== null && _a !== void 0 ? _a : metrics.emHeightAscent) +
                ((_b = metrics.fontBoundingBoxDescent) !== null && _b !== void 0 ? _b : metrics.emHeightDescent));
        }
        return hdpiCanvas_1.HdpiCanvas.getTextSize(line, this.font).height;
    };
    Text.prototype.isPointInPath = function (x, y) {
        var point = this.transformPoint(x, y);
        var bbox = this.computeBBox();
        return bbox ? bbox.containsPoint(point.x, point.y) : false;
    };
    Text.prototype.render = function (renderCtx) {
        var ctx = renderCtx.ctx, forceRender = renderCtx.forceRender, stats = renderCtx.stats;
        if (this.dirty === node_1.RedrawType.NONE && !forceRender) {
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
    Text.prototype.setFont = function (props) {
        this.fontFamily = props.fontFamily;
        this.fontSize = props.fontSize;
        this.fontStyle = props.fontStyle;
        this.fontWeight = props.fontWeight;
    };
    Text.prototype.setAlign = function (props) {
        this.textAlign = props.textAlign;
        this.textBaseline = props.textBaseline;
    };
    Text.className = 'Text';
    // The default line spacing for document editors is usually 1.15
    Text.defaultLineHeightRatio = 1.15;
    Text.defaultStyles = Object.assign({}, shape_1.Shape.defaultStyles, {
        textAlign: 'start',
        fontStyle: undefined,
        fontWeight: undefined,
        fontSize: 10,
        fontFamily: 'sans-serif',
        textBaseline: 'alphabetic',
    });
    Text.punctuationMarks = ['.', ',', '-', ':', ';', '!', '?', "'", '"', '(', ')'];
    __decorate([
        node_1.SceneChangeDetection({ redraw: node_1.RedrawType.MAJOR })
    ], Text.prototype, "x", void 0);
    __decorate([
        node_1.SceneChangeDetection({ redraw: node_1.RedrawType.MAJOR })
    ], Text.prototype, "y", void 0);
    __decorate([
        node_1.SceneChangeDetection({ redraw: node_1.RedrawType.MAJOR, changeCb: function (o) { return o._setLines(); } })
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
        node_1.SceneChangeDetection({ redraw: node_1.RedrawType.MAJOR })
    ], Text.prototype, "textAlign", void 0);
    __decorate([
        node_1.SceneChangeDetection({ redraw: node_1.RedrawType.MAJOR })
    ], Text.prototype, "textBaseline", void 0);
    __decorate([
        node_1.SceneChangeDetection({ redraw: node_1.RedrawType.MAJOR })
    ], Text.prototype, "lineHeight", void 0);
    return Text;
}(shape_1.Shape));
exports.Text = Text;
function createTextMeasurer(font) {
    var cache = new Map();
    var getTextSize = function (text) { return hdpiCanvas_1.HdpiCanvas.getTextSize(text, font); };
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
exports.createTextMeasurer = createTextMeasurer;
function getFont(fontProps) {
    var fontFamily = fontProps.fontFamily, fontSize = fontProps.fontSize, fontStyle = fontProps.fontStyle, fontWeight = fontProps.fontWeight;
    return [fontStyle !== null && fontStyle !== void 0 ? fontStyle : '', fontWeight !== null && fontWeight !== void 0 ? fontWeight : '', fontSize + 'px', fontFamily].join(' ').trim();
}
exports.getFont = getFont;
function measureText(lines, x, y, textProps) {
    return hdpiCanvas_1.HdpiCanvas.has.textMetrics
        ? getPreciseBBox(lines, x, y, textProps)
        : getApproximateBBox(lines, x, y, textProps);
}
exports.measureText = measureText;
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
        var metrics = hdpiCanvas_1.HdpiCanvas.measureText(lines[i], font, textBaseline, textAlign);
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
    return new bbox_1.BBox(x - left, y - top, width, height);
}
function getApproximateBBox(lines, x, y, textProps) {
    var width = 0;
    var firstLineHeight = 0;
    // Distance between first and last base lines.
    var baselineDistance = 0;
    var font = getFont(textProps);
    var lineHeight = textProps.lineHeight, _a = textProps.textBaseline, textBaseline = _a === void 0 ? Text.defaultStyles.textBaseline : _a, _b = textProps.textAlign, textAlign = _b === void 0 ? Text.defaultStyles.textAlign : _b;
    if (lines.length > 0) {
        var lineSize = hdpiCanvas_1.HdpiCanvas.getTextSize(lines[0], font);
        width = lineSize.width;
        firstLineHeight = lineSize.height;
    }
    for (var i = 1; i < lines.length; i++) {
        var lineSize = hdpiCanvas_1.HdpiCanvas.getTextSize(lines[i], font);
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
    return new bbox_1.BBox(x, y, width, firstLineHeight + baselineDistance);
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
function splitText(text) {
    return typeof text === 'string' ? text.split(/\r?\n/g) : [];
}
exports.splitText = splitText;
//# sourceMappingURL=text.js.map