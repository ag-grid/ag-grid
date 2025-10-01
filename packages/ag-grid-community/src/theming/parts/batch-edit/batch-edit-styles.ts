import type { Part } from '../../../agStack/theming/part';
import { createPart } from '../../../agStack/theming/partImpl';
import type { ColorValue } from '../../../agStack/theming/themeTypes';
import { batchEditStyleDefaultCSS } from './batch-edit-style-default.css-GENERATED';

export type BatchEditStyleParams = {
    /**
     * Background color of the cell when in batch edit mode.
     */
    cellBatchEditBackgroundColor: ColorValue;

    /**
     * Text color of the cell when in batch edit mode.
     */
    cellBatchEditTextColor: ColorValue;

    /**
     * Background color for rows in batch edit mode.
     */
    rowBatchEditBackgroundColor: ColorValue;

    /**
     * Text color for rows in batch edit mode.
     */
    rowBatchEditTextColor: ColorValue;
};

const baseParams: BatchEditStyleParams = {
    cellBatchEditBackgroundColor: 'rgba(220 181 139 / 16%)',
    cellBatchEditTextColor: '#422f00',

    rowBatchEditBackgroundColor: {
        ref: 'cellBatchEditBackgroundColor',
    },
    rowBatchEditTextColor: {
        ref: 'cellBatchEditTextColor',
    },
};

export const baseDarkBatchEditParams: BatchEditStyleParams = {
    ...baseParams,
    cellBatchEditTextColor: '#f3d0b3',
};

const makeBatchEditStyleBaseTreeShakeable = () =>
    createPart<BatchEditStyleParams>({
        feature: 'batchEditStyle',
        params: baseParams,
        css: batchEditStyleDefaultCSS,
    });

export const batchEditStyleBase: Part<BatchEditStyleParams> = /*#__PURE__*/ makeBatchEditStyleBaseTreeShakeable();
