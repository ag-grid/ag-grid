import { createPart } from '../../Part';
import { columnDropStyleBorderedCSS } from './column-drop-style-bordered.css-GENERATED';
import { columnDropStylePlainCSS } from './column-drop-style-plain.css-GENERATED';

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
