/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v29.1.0
 * @link https://www.ag-grid.com/
 * @license MIT
 */
/**
 * Displays a message to the browser. this is useful in iPad, where you can't easily see the console.
 * so the javascript code can use this to give feedback. this is NOT intended to be called in production.
 * it is intended the AG Grid developer calls this to troubleshoot, but then takes out the calls before
 * checking in.
 * @param {string} msg
 * COMMENTED OUT: As only used for debug locally have commented out so not included in deployed build.
 */
/* export function message(msg: string): void {
    const eMessage = document.createElement('div');
    let eBox = document.querySelector('#__ag__message');

    eMessage.innerHTML = msg;

    if (!eBox) {
        const template = `<div id="__ag__message" style="display: inline-block; position: absolute; top: 0px; left: 0px; color: white; background-color: black; z-index: 20; padding: 2px; border: 1px solid darkred; height: 200px; overflow-y: auto;"></div>`;

        eBox = loadTemplate(template);

        if (document.body) {
            document.body.appendChild(eBox);
        }
    }

    eBox.insertBefore(eMessage, eBox.children[0]);
} */
