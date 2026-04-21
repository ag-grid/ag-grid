import type { Part } from '../../../agStack/theming/part';
import { createPart } from '../../../agStack/theming/partImpl';
import type { BorderValue, ColorValue, LengthValue } from '../../../agStack/theming/themeTypes';

export type NoteStyleParams = {
    /**
     * The color of the note indicator
     */
    noteIndicatorColor: ColorValue;
    /**
     * The size of the note indicator
     */
    noteIndicatorSize: LengthValue;
    /**
     * The background color of the note popup
     */
    notePopupBackgroundColor: ColorValue;
    /**
     * The color of the note popup text
     */
    notePopupTextColor: ColorValue;

    /**
     * The color of the note popup input text
     */
    notePopupInputTextColor: ColorValue;

    /**
     * The background color of the note popup input
     */
    notePopupInputBackgroundColor: ColorValue;
    /**
     * The border of the note popup
     */
    notePopupBorder: BorderValue;
};

const baseParams: NoteStyleParams = {
    noteIndicatorColor: {
        ref: 'accentColor',
    },
    noteIndicatorSize: '10px',
    notePopupBackgroundColor: {
        ref: 'backgroundColor',
    },
    notePopupTextColor: {
        ref: 'secondaryForegroundColor',
    },
    notePopupInputTextColor: {
        ref: 'inputTextColor',
    },
    notePopupInputBackgroundColor: {
        ref: 'inputBackgroundColor',
    },
    notePopupBorder: {
        ref: 'dialogBorder',
    },
};

const makeNoteStyleBaseTreeShakeable = () =>
    createPart<NoteStyleParams>({
        feature: 'noteStyle',
        params: baseParams,
    });

export const noteStyleBase: Part<NoteStyleParams> = /*#__PURE__*/ makeNoteStyleBaseTreeShakeable();
