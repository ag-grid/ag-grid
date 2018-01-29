<h2>Repositioning the Popup</h2>

<p>
    If not happy with the position of the popup, you can override it's position using
    <code>postProcessPopup(params)</code> callback. This gives you the popup HTML element
    so you can change it's position should you wish to.
</p>

<p> The params for the callback are as follows:</p>

    <snippet>
interface PostProcessPopupParams {

    // the popup we are showing
    ePopup: HTMLElement;

    // The different types are: 'contextMenu', 'columnMenu', 'aggFuncSelect', 'popupCellEditor'
    type: string;

    // if popup is for a column, this gives the Column
    column?: Column,
    // if popup is for a row, this gives the RowNode
    rowNode?: RowNode,

    // if the popup is as a result of a button click (eg menu button),
    // this is the component that the user clicked
    eventSource?: HTMLElement;
    // if the popup is as a result of a click or touch, this is the event
    // eg user showing context menu
    mouseEvent?: MouseEvent|Touch;
}</snippet>
