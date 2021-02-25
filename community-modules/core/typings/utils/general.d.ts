import { ICellRendererComp } from '../rendering/cellRenderers/iCellRenderer';
import { AgPromise } from './promise';
/** @deprecated */
export declare function getNameOfClass(theClass: any): string;
export declare function findLineByLeastSquares(values: number[]): number[];
/**
 * Converts a CSS object into string
 * @param {Object} stylesToUse an object eg: {color: 'black', top: '25px'}
 * @return {string} A string like "color: black; top: 25px;" for html
 */
export declare function cssStyleObjectToMarkup(stylesToUse: any): string;
/**
 * Displays a message to the browser. this is useful in iPad, where you can't easily see the console.
 * so the javascript code can use this to give feedback. this is NOT intended to be called in production.
 * it is intended the AG Grid developer calls this to troubleshoot, but then takes out the calls before
 * checking in.
 * @param {string} msg
 */
export declare function message(msg: string): void;
/**
 * cell renderers are used in a few places. they bind to dom slightly differently to other cell renderes as they
 * can return back strings (instead of html elemnt) in the getGui() method. common code placed here to handle that.
 * @param {AgPromise<ICellRendererComp>} cellRendererPromise
 * @param {HTMLElement} eTarget
 */
export declare function bindCellRendererToHtmlElement(cellRendererPromise: AgPromise<ICellRendererComp>, eTarget: HTMLElement): void;
