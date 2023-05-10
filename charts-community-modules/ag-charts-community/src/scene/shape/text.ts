import { Shape } from './shape';
import { BBox } from '../bbox';
import { HdpiCanvas } from '../../canvas/hdpiCanvas';
import { RedrawType, SceneChangeDetection, RenderContext } from '../node';
import { FontStyle, FontWeight, AgChartCaptionWrappingOptions } from '../../chart/agChartOptions';

export interface TextSizeProperties {
    fontFamily: string;
    fontSize: number;
    fontStyle?: FontStyle;
    fontWeight?: FontWeight;
    lineHeight?: number;
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
        wrapProps: AgChartCaptionWrappingOptions
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
        wrapProps: AgChartCaptionWrappingOptions,
        cumulativeHeight: number
    ): { result: string; truncated: boolean; cumulativeHeight: number } {
        text = text.trim();
        if (!text) {
            return { result: '', truncated: false, cumulativeHeight };
        }

        const { fontSize, lineHeight = fontSize * Text.defaultLineHeightRatio } = textProps;
        const font = getFont(textProps);
        const initialSize = HdpiCanvas.getTextSize(text, font);
        if (initialSize.width <= maxWidth) {
            // Text fits into a single line
            return { result: text, truncated: false, cumulativeHeight: cumulativeHeight + initialSize.height };
        }
        if (initialSize.height > maxHeight) {
            // Not enough space for a single line
            return { result: '', truncated: true, cumulativeHeight };
        }

        const lines: string[][] = [];
        const words = text.split(/\s+/g);
        const spaceWidth = HdpiCanvas.getTextSize(' ', font).width;
        const wordsWidths = new Map<string, number>();
        let lineWidth = 0;
        let currentLine: string[] = [];
        let wordIndex = -1;
        let needsTruncation = false;
        let wordBroken = false;
        wordLoop: while (++wordIndex < words.length) {
            const word = words[wordIndex];
            const wordSize = HdpiCanvas.getTextSize(word, font);
            wordsWidths.set(word, wordSize.width);
            if (wordIndex === 0) {
                // Add first line
                lines.push(currentLine);
                cumulativeHeight += lineHeight;
            }
            if (wordSize.width > maxWidth) {
                if (wrapProps.breakWord) {
                    // Break word
                    wordBroken = true;
                    const h = wrapProps.hyphens ? '-' : '';
                    let availWidth = maxWidth - spaceWidth - lineWidth;
                    const singleCharacterWidth = HdpiCanvas.getTextSize(`${word.charAt(0)}${h}`, font).width;
                    const canRenderSingleCharacter = singleCharacterWidth <= maxWidth;
                    if (!canRenderSingleCharacter) {
                        // The width is too small for a single character, return empty string
                        return { result: '', truncated: true, cumulativeHeight };
                    }
                    if (availWidth < singleCharacterWidth) {
                        // Add new line
                        if (cumulativeHeight + lineHeight >= maxHeight) {
                            // Truncate last word
                            needsTruncation = true;
                            currentLine.push(word);
                            break;
                        }
                        currentLine = [];
                        lines.push(currentLine);
                        cumulativeHeight += lineHeight;
                        lineWidth = 0;
                        availWidth = maxWidth;
                    }

                    for (let len = word.length; len >= 1; len--) {
                        const truncWord = `${word.substring(0, len)}${h}`;
                        const truncWidth = HdpiCanvas.getTextSize(truncWord, font).width;
                        if (truncWidth <= availWidth) {
                            // Put the truncated word into the current line
                            // and put the remaining part onto a separate line
                            currentLine.push(truncWord);
                            const remainder = word.substring(len);
                            words.splice(wordIndex + 1, 0, remainder);
                            lineWidth = maxWidth;
                            break;
                        }
                    }
                } else {
                    // Truncate the long word
                    wordBroken = true;
                    for (let len = word.length; len >= 0; len--) {
                        const truncWord = `${word.substring(0, len)}${ellipsis}`;
                        const truncWidth = HdpiCanvas.getTextSize(truncWord, font).width;
                        if (truncWidth <= maxWidth) {
                            // Put the truncated word onto a new line
                            if (cumulativeHeight + lineHeight >= maxHeight) {
                                // Truncate last word
                                needsTruncation = true;
                                currentLine.push(word);
                                break wordLoop;
                            }
                            currentLine = [truncWord];
                            lines.push(currentLine);
                            cumulativeHeight += lineHeight;
                            lineWidth = maxWidth;
                            break;
                        }
                    }
                }
                continue;
            }
            const expectedLineWidth = lineWidth + (currentLine.length === 0 ? 0 : spaceWidth) + wordSize.width;
            if (expectedLineWidth > maxWidth) {
                if (cumulativeHeight + lineHeight >= maxHeight) {
                    // Truncate last word
                    needsTruncation = true;
                    currentLine.push(word);
                    break;
                }

                // Add new line
                currentLine = [word];
                lines.push(currentLine);
                if (wordIndex === words.length - 1) {
                    break;
                }

                lineWidth = wordSize.width;
                cumulativeHeight += lineHeight;
            } else {
                // Add a word to the current line
                currentLine.push(word);
                lineWidth = expectedLineWidth;
            }
        }

        if (!needsTruncation && !wordBroken) {
            // Balance lines
            const linesCount = lines.length;
            const wordsCount = words.length;
            const totalWordsWidth = words.reduce((sum, w) => sum + wordsWidths.get(w)!, 0);
            const totalSpaceWidth = spaceWidth * (wordsCount - linesCount - 2);
            const averageLineWidth = (totalWordsWidth + totalSpaceWidth) / linesCount;
            let currentLine: string[] = [];
            const balanced: string[][] = [];
            let lineWidth = wordsWidths.get(words[0])!;
            let newLine = true;
            for (let i = 0; i < wordsCount; i++) {
                const word = words[i];
                const width = wordsWidths.get(word)!;
                if (newLine) {
                    // New line
                    currentLine = [];
                    currentLine.push(word);
                    lineWidth = width;
                    newLine = false;
                    balanced.push(currentLine);
                    continue;
                }
                const expectedLineWidth = lineWidth + spaceWidth + width;
                if (balanced.length === linesCount || expectedLineWidth <= averageLineWidth) {
                    // Keep adding words to the line
                    currentLine.push(word);
                    lineWidth = expectedLineWidth;
                    continue;
                }
                if (expectedLineWidth <= maxWidth) {
                    // Add the last word to the line
                    currentLine.push(word);
                    newLine = true;
                } else {
                    // Put the word onto the next line
                    currentLine = [word];
                    lineWidth = width;
                    balanced.push(currentLine);
                }
            }
            lines.splice(0);
            lines.push(...balanced);
        }

        const joinedLines = lines.map((ln) => ln.join(' '));
        if (needsTruncation) {
            const lastIndex = joinedLines.length - 1;
            const [lastLine] = joinedLines.splice(lastIndex, 1, ellipsis);
            for (let len = lastLine.length; len >= 0; len--) {
                const truncLine = `${lastLine.substring(0, len)}${ellipsis}`;
                const truncWidth = HdpiCanvas.getTextSize(truncLine, font).width;
                if (truncWidth <= maxWidth) {
                    joinedLines[lastIndex] = truncLine;
                    break;
                }
            }
        }

        const wrappedText = joinedLines.join('\n');
        return { result: wrappedText, truncated: needsTruncation, cumulativeHeight };
    }
}

export function getFont(fontProps: TextSizeProperties): string {
    const { fontFamily, fontSize, fontStyle, fontWeight } = fontProps;
    return [fontStyle || '', fontWeight || '', fontSize + 'px', fontFamily].join(' ').trim();
}
