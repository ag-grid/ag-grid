import type { ModuleContext } from '../module/moduleContext';
import type { FontStyle, FontWeight, TextAlign, TextWrap } from '../options/agChartOptions';
import { Text } from '../scene/shape/text';
import { BaseProperties } from '../util/properties';
import type { CaptionLike } from './captionLike';
import type { InteractionEvent } from './interaction/interactionManager';
export declare class Caption extends BaseProperties implements CaptionLike {
    static readonly SMALL_PADDING = 10;
    static readonly LARGE_PADDING = 20;
    readonly id: string;
    readonly node: Text;
    enabled: boolean;
    text?: string;
    textAlign: TextAlign;
    fontStyle?: FontStyle;
    fontWeight?: FontWeight;
    fontSize: number;
    fontFamily: string;
    color?: string;
    spacing?: number;
    lineHeight?: number;
    maxWidth?: number;
    maxHeight?: number;
    wrapping: TextWrap;
    private truncated;
    registerInteraction(moduleCtx: ModuleContext): () => void;
    computeTextWrap(containerWidth: number, containerHeight: number): void;
    handleMouseMove(moduleCtx: ModuleContext, event: InteractionEvent<'hover'>): void;
}
