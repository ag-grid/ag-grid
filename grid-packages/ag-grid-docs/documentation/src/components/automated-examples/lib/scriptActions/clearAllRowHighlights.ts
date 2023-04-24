import { AG_ROW_HOVER_CLASSNAME, AG_ROW_SELECTOR } from '../constants';

export function clearAllRowHighlights() {
    const rows = document.querySelectorAll(AG_ROW_SELECTOR);
    rows.forEach((row) => {
        row.classList.remove(AG_ROW_HOVER_CLASSNAME);
    });
}
