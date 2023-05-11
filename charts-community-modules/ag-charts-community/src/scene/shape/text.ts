import { Shape } from './shape';
import { BBox } from '../bbox';
import { HdpiCanvas } from '../../canvas/hdpiCanvas';
import { RedrawType, SceneChangeDetection, RenderContext } from '../node';
import { FontStyle, FontWeight } from '../../chart/agChartOptions';

export interface TextSizeProperties {
    fontFamily: string;
    fontSize: number;
    fontStyle?: FontStyle;
    fontWeight?: FontWeight;
    lineHeight?: number;
}

export interface WordWrapProperties {
    breakWord?: boolean;
    hyphens?: boolean;
}

const ellipsis = '\u2026';

function SceneFontChangeDetection(opts?: { redraw?: RedrawType; changeCb?: (t: any) => any }) {
    const { redraw = RedrawType.MAJOR, changeCb } = opts || {};

    return SceneChangeDetection({ redraw, type: 'font', changeCb });
}

export class Text extends Shape {
    static className = 'Text';

    // The default line spacing for document editors is usually 1.15
    static defaultLineHeightRatio = 1.15;

    protected static defaultStyles = Object.assign({}, Shape.defaultStyles, {
        textAlign: 'start' as CanvasTextAlign,
        fontStyle: undefined,
        fontWeight: undefined,
        fontSize: 10,
        fontFamily: 'sans-serif',
        textBaseline: 'alphabetic' as CanvasTextBaseline,
    });

    @SceneChangeDetection({ redraw: RedrawType.MAJOR })
    x: number = 0;

    @SceneChangeDetection({ redraw: RedrawType.MAJOR })
    y: number = 0;

    private lines: string[] = [];
    private _splitText() {
        this.lines = typeof this.text === 'string' ? this.text.split(/\r?\n/g) : [];
    }

    @SceneChangeDetection({ redraw: RedrawType.MAJOR, changeCb: (o: Text) => o._splitText() })
    text: string = '';

    private _dirtyFont: boolean = true;
    private _font?: string;
    get font(): string {
        if (this._dirtyFont) {
            this._dirtyFont = false;
            this._font = getFont(this);
        }

        return this._font!;
    }

    @SceneFontChangeDetection()
    fontStyle?: FontStyle;

    @SceneFontChangeDetection()
    fontWeight?: FontWeight;

    @SceneFontChangeDetection()
    fontSize: number = 10;

    @SceneFontChangeDetection()
    fontFamily: string = 'sans-serif';

    @SceneChangeDetection({ redraw: RedrawType.MAJOR })
    textAlign: CanvasTextAlign = Text.defaultStyles.textAlign;

    @SceneChangeDetection({ redraw: RedrawType.MAJOR })
    textBaseline: CanvasTextBaseline = Text.defaultStyles.textBaseline;

    // TextMetrics are used if lineHeight is not defined.
    @SceneChangeDetection({ redraw: RedrawType.MAJOR })
    lineHeight?: number = undefined;

    computeBBox(): BBox {
        return HdpiCanvas.has.textMetrics ? this.getPreciseBBox() : this.getApproximateBBox();
    }

    private getPreciseBBox(): BBox {
        let left = 0;
        let top = 0;
        let width = 0;
        let height = 0;

        // Distance between first and last base lines.
        let baselineDistance = 0;

        for (let i = 0; i < this.lines.length; i++) {
            const metrics: any = HdpiCanvas.measureText(this.lines[i], this.font, this.textBaseline, this.textAlign);

            left = Math.max(left, metrics.actualBoundingBoxLeft);
            width = Math.max(width, metrics.width);

            if (i == 0) {
                top += metrics.actualBoundingBoxAscent;
                height += metrics.actualBoundingBoxAscent;
            } else {
                baselineDistance += metrics.fontBoundingBoxAscent ?? metrics.emHeightAscent;
            }

            if (i == this.lines.length - 1) {
                height += metrics.actualBoundingBoxDescent;
            } else {
                baselineDistance += metrics.fontBoundingBoxDescent ?? metrics.emHeightDescent;
            }
        }

        if (this.lineHeight !== undefined) {
            baselineDistance = (this.lines.length - 1) * this.lineHeight;
        }
        height += baselineDistance;

        top += baselineDistance * this.getVerticalOffset();

        return new BBox(this.x - left, this.y - top, width, height);
    }

    private getVerticalOffset(): number {
        switch (this.textBaseline) {
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

    private getApproximateBBox(): BBox {
        let width = 0;
        let firstLineHeight = 0;
        // Distance between first and last base lines.
        let baselineDistance = 0;

        if (this.lines.length > 0) {
            const lineSize = HdpiCanvas.getTextSize(this.lines[0], this.font);

            width = lineSize.width;
            firstLineHeight = lineSize.height;
        }

        for (let i = 1; i < this.lines.length; i++) {
            const lineSize = HdpiCanvas.getTextSize(this.lines[i], this.font);

            width = Math.max(width, lineSize.width);
            baselineDistance += this.lineHeight ?? lineSize.height;
        }

        let { x, y } = this;

        switch (this.textAlign) {
            case 'end':
            case 'right':
                x -= width;
                break;
            case 'center':
                x -= width / 2;
        }

        switch (this.textBaseline) {
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

    private getLineHeight(line: string): number {
        if (this.lineHeight) return this.lineHeight;

        if (HdpiCanvas.has.textMetrics) {
            const metrics: any = HdpiCanvas.measureText(line, this.font, this.textBaseline, this.textAlign);

            return (
                (metrics.fontBoundingBoxAscent ?? metrics.emHeightAscent) +
                (metrics.fontBoundingBoxDescent ?? metrics.emHeightDescent)
            );
        }
        return HdpiCanvas.getTextSize(line, this.font).height;
    }

    isPointInPath(x: number, y: number): boolean {
        const point = this.transformPoint(x, y);
        const bbox = this.computeBBox();

        return bbox ? bbox.containsPoint(point.x, point.y) : false;
    }

    render(renderCtx: RenderContext): void {
        const { ctx, forceRender, stats } = renderCtx;

        if (this.dirty === RedrawType.NONE && !forceRender) {
            if (stats) stats.nodesSkipped += this.nodeCount.count;
            return;
        }

        if (!this.lines.length || !this.layerManager) {
            if (stats) stats.nodesSkipped += this.nodeCount.count;
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

            if (fillShadow && fillShadow.enabled) {
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

    private renderLines(renderCallback: (line: string, x: number, y: number) => void): void {
        const { lines, x, y } = this;
        const lineHeights = this.lines.map((line) => this.getLineHeight(line));
        const totalHeight = lineHeights.reduce((a, b) => a + b, 0);
        let offsetY: number = -(totalHeight - lineHeights[0]) * this.getVerticalOffset();

        for (let i = 0; i < lines.length; i++) {
            renderCallback(lines[i], x, y + offsetY);

            offsetY += lineHeights[i];
        }
    }

    static wrap(
        text: string,
        maxWidth: number,
        maxHeight: number,
        textProps: TextSizeProperties,
        wrapProps: WordWrapProperties = {}
    ): string {
        const lines: string[] = text.split(/\r?\n/g);
        const result: string[] = [];
        let cumulativeHeight = 0;
        for (const line of lines) {
            const wrappedLine = Text.wrapLine(line, maxWidth, maxHeight, textProps, wrapProps, cumulativeHeight);
            result.push(wrappedLine.result);
            cumulativeHeight = wrappedLine.cumulativeHeight;
            if (wrappedLine.truncated) {
                break;
            }
        }
        return result.join('\n').trim();
    }

    private static wrapLine(
        text: string,
        maxWidth: number,
        maxHeight: number,
        textProps: TextSizeProperties,
        wrapProps: WordWrapProperties,
        cumulativeHeight: number
    ): { result: string; truncated: boolean; cumulativeHeight: number } {
        text = text.trim();
        if (!text) {
            return { result: '', truncated: false, cumulativeHeight };
        }

        const font = getFont(textProps);
        const initialSize = HdpiCanvas.getTextSize(text, font);
        if (initialSize.width <= maxWidth) {
            // Text fits into a single line
            return { result: text, truncated: false, cumulativeHeight: cumulativeHeight + initialSize.height };
        }
        if (initialSize.height > maxHeight || getTextMeasurer(font).getLineWidth('W') > maxWidth) {
            // Not enough space for a single line or character
            return { result: '', truncated: true, cumulativeHeight };
        }

        const words = text.split(/\s+/g);
        const wrapResult = Text.wrapLineSequentially(
            words,
            maxWidth,
            maxHeight,
            textProps,
            wrapProps,
            cumulativeHeight
        );

        let { lines } = wrapResult;
        if (!(wrapResult.wordsBrokenOrTruncated || wrapResult.linesTruncated)) {
            // If no word breaks or truncations, try the balanced wrapping
            const linesCount = wrapResult.lines.length;
            const balanced = Text.wrapLineBalanced(words, maxWidth, font, linesCount);
            if (balanced.length === lines.length) {
                // Some lines can't be balanced properly because of unusually long words
                lines = balanced;
            }
        }

        const wrappedText = lines.map((ln) => ln.join(' ')).join('\n');
        return { result: wrappedText, truncated: wrapResult.linesTruncated, cumulativeHeight };
    }

    private static punctuationMarks = ['.', ',', '-', ':', ';', '!', '?', `'`, '"', '(', ')'];

    private static breakWord(
        word: string,
        availWidth: number,
        hyphens: boolean,
        font: string
    ): [string, string] | null {
        const { getLineWidth } = getTextMeasurer(font);
        const wordWidth = getLineWidth(word);
        let index = Math.floor((word.length * availWidth) / wordWidth);
        if (index <= 0) {
            return null;
        }
        let leftWidth: number;
        let left: string;
        do {
            const needsHyphen =
                hyphens &&
                !Text.punctuationMarks.includes(word[index - 1]) &&
                !Text.punctuationMarks.includes(word[index]);
            left = `${word.substring(0, index)}${needsHyphen ? '-' : ''}`;
            leftWidth = getLineWidth(left);
        } while (--index > 0 && leftWidth > availWidth);
        const right = word.substring(index + 1);
        return [left, right];
    }

    private static truncateLine(text: string, maxWidth: number, font: string) {
        const { getLineWidth } = getTextMeasurer(font);
        const lineWidth = getLineWidth(text);
        const ellipsisWidth = getLineWidth(ellipsis);
        if (lineWidth + ellipsisWidth <= maxWidth) {
            return `${text}${ellipsis}`;
        }
        let index = Math.floor((text.length * maxWidth) / lineWidth) + 1;
        let trunc: string;
        let truncWidth: number;
        do {
            trunc = text.substring(0, index);
            truncWidth = getLineWidth(trunc);
        } while (--index >= 0 && truncWidth + ellipsisWidth > maxWidth);
        return `${trunc}${ellipsis}`;
    }

    private static wrapLineSequentially(
        words: string[],
        maxWidth: number,
        maxHeight: number,
        textProps: TextSizeProperties,
        wrapProps: WordWrapProperties,
        cumulativeHeight: number
    ) {
        const font = getFont(textProps);
        const { getLineWidth } = getTextMeasurer(font);
        const { fontSize, lineHeight = fontSize * Text.defaultLineHeightRatio } = textProps;
        const spaceWidth = getLineWidth(' ');

        let wordsBrokenOrTruncated = false;
        let linesTruncated = false;

        const lines: string[][] = [];
        let currentLine: string[] = [];
        let lineWidth = 0;
        let newLine = true;

        for (let i = 0; i < words.length; i++) {
            const word = words[i];
            const wordWidth = getLineWidth(word);
            const expectedSpaceWidth = currentLine.length === 0 ? 0 : spaceWidth;
            let expectedLineWidth = lineWidth + expectedSpaceWidth + wordWidth;

            const expectedHeight = cumulativeHeight + lineHeight;
            if ((newLine || expectedLineWidth > maxWidth) && expectedHeight >= maxHeight) {
                // Truncate the last line and finish processing
                const lastLine = currentLine.concat(word).join(' ');
                const trunc = Text.truncateLine(lastLine, maxWidth, font);
                currentLine.splice(0, currentLine.length, trunc);
                linesTruncated = true;
                break;
            }

            if (newLine) {
                // Add new line
                newLine = false;
                currentLine = [];
                lines.push(currentLine);
                lineWidth = 0;
                cumulativeHeight = expectedHeight;
                expectedLineWidth = wordWidth;
            }

            if (expectedLineWidth <= maxWidth) {
                // If the word fits, add it to the current line
                currentLine.push(word);
                lineWidth = expectedLineWidth;
                continue;
            }

            if (wordWidth <= maxWidth) {
                // If the word is not too long, process once again but with the line break
                newLine = true;
                i--;
                continue;
            }

            // Handle a long word
            if (wrapProps.breakWord) {
                // Break the word into parts
                const availWidth = maxWidth - lineWidth - expectedSpaceWidth;
                const parts = Text.breakWord(word, availWidth, wrapProps.hyphens!, font);
                if (!parts) {
                    if (currentLine.length === 0) {
                        // Too narrow for a single character break, end processing
                        break;
                    }
                    // Process once again but with the line break
                    newLine = true;
                    i--;
                    continue;
                }
                const [leftPart, rightPart] = parts;
                currentLine.push(leftPart);
                words.splice(i + 1, 0, rightPart);
            } else {
                // Truncate the word
                const trunc = Text.truncateLine(word, maxWidth, font);
                words.splice(i, 1, trunc);
                i--;
            }
            newLine = true;
            wordsBrokenOrTruncated = true;
        }

        return { lines, linesTruncated, wordsBrokenOrTruncated };
    }

    private static wrapLineBalanced(words: string[], maxWidth: number, font: string, linesCount: number) {
        const { getLineWidth } = getTextMeasurer(font);
        const totalWordsWidth = words.reduce((sum, w) => sum + getLineWidth(w), 0);
        const spaceWidth = getLineWidth(' ');
        const totalSpaceWidth = spaceWidth * (words.length - linesCount - 2);
        const averageLineWidth = (totalWordsWidth + totalSpaceWidth) / linesCount;

        const lines: string[][] = [];

        let currentLine: string[] = [];
        let lineWidth = getLineWidth(words[0]);
        let newLine = true;
        for (let i = 0; i < words.length; i++) {
            const word = words[i];
            const width = getLineWidth(word);
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
            } else if (expectedLineWidth <= maxWidth) {
                // Add the last word to the line
                currentLine.push(word);
                newLine = true;
            } else {
                // Put the word onto the next line
                currentLine = [word];
                lineWidth = width;
                lines.push(currentLine);
            }
        }

        return lines;
    }
}

const fontCaches: Map<string, Map<string, number>> = new Map();

function getTextMeasurer(font: string) {
    if (!fontCaches.has(font)) {
        fontCaches.set(font, new Map());
    }
    const cache = fontCaches.get(font)!;
    const getLineWidth = (text: string) => {
        if (cache.has(text)) {
            return cache.get(text)!;
        }
        const { width } = HdpiCanvas.getTextSize(text, font);
        cache.set(text, width);
        return width;
    };
    return { getLineWidth };
}

export function getFont(fontProps: TextSizeProperties): string {
    const { fontFamily, fontSize, fontStyle, fontWeight } = fontProps;
    return [fontStyle || '', fontWeight || '', fontSize + 'px', fontFamily].join(' ').trim();
}
