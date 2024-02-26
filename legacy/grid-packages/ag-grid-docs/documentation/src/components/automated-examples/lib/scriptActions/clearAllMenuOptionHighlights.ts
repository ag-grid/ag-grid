import { AG_MENU_OPTION_ACTIVE_CLASSNAME, AG_MENU_OPTION_SELECTOR } from '../constants';

export function clearAllMenuOptionHighlights() {
    const menuOptions = document.querySelectorAll(AG_MENU_OPTION_SELECTOR);
    menuOptions.forEach((row) => {
        row.classList.remove(AG_MENU_OPTION_ACTIVE_CLASSNAME);
    });
}
