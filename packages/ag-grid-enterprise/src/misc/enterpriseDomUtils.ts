import type { BeanCollection } from 'ag-grid-community';
import { _getRootNode, _isBrowserFirefox, _isBrowserSafari } from 'ag-grid-community';

function _getTextSelectionRanges(beans: BeanCollection): { selection: Selection | null; ranges: Range[] } {
    const rootNode = _getRootNode(beans);
    const selection = 'getSelection' in rootNode ? (rootNode.getSelection() as Selection) : null;
    const ranges: Range[] = [];

    for (let i = 0; i < (selection?.rangeCount ?? 0); i++) {
        const range = selection?.getRangeAt(i);

        if (range) {
            ranges.push(range);
        }
    }

    return { selection, ranges };
}

/**
 * FF and Safari remove text selections when the focus changes. This is inconsistent with Chrome, whose behaviour
 * we prefer in this case. This utility preserves whatever text selection exists before the given action is taken.
 */
export function _preserveRangesWhile(beans: BeanCollection, fn: () => void): void {
    const enableCellTextSelection = beans.gos.get('enableCellTextSelection');
    if (!enableCellTextSelection) {
        return fn();
    }

    if (!_isBrowserFirefox() && !_isBrowserSafari()) {
        return fn();
    }

    const { selection, ranges } = _getTextSelectionRanges(beans);

    fn();

    selection?.removeAllRanges();
    for (const range of ranges) {
        selection?.addRange(range);
    }
}
