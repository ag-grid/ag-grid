import { createPart } from 'ag-stack';

import columnDropStyleBorderedCSS from './column-drop-style-bordered.css';
import columnDropStylePlainCSS from './column-drop-style-plain.css';

const makeColumnDropStyleBorderedTreeShakeable = () => {
    return createPart({
        feature: 'columnDropStyle',
        css: columnDropStyleBorderedCSS,
    });
};

export const columnDropStyleBordered = /*#__PURE__*/ makeColumnDropStyleBorderedTreeShakeable();

const makeColumnDropStylePlainTreeShakeable = () => {
    return createPart({
        feature: 'columnDropStyle',
        css: columnDropStylePlainCSS,
    });
};

export const columnDropStylePlain = /*#__PURE__*/ makeColumnDropStylePlainTreeShakeable();
