<h3>Repositioning the Popup</h3>

<p>
    If not happy with the position of the popup, you can override it's position using
    <code>postProcessPopup(params)</code> callback. This gives you the popup HTML element
    so you can change it's position should you wish to.
</p>

<p>
    The params for the callback are as follows:

    <pre>interface PostProcessPopupParams {

    <span class="codeComment">// the popup we are showing</span>
    ePopup: HTMLElement;

    <span class="codeComment">// The different types are: 'contextMenu', 'columnMenu', 'aggFuncSelect', 'popupCellEditor'</span>
    type: string;

    <span class="codeComment">// if popup is for a column, this gives the Column</span>
    column?: Column,
    <span class="codeComment">// if popup is for a row, this gives the RowNode</span>
    rowNode?: RowNode,

    <span class="codeComment">// if the popup is as a result of a button click (eg menu button),</span>
    <span class="codeComment">// this is the component that the user clicked</span>
    eventSource?: HTMLElement;
    <span class="codeComment">// if the popup is as a result of a click or touch, this is the event</span>
    <span class="codeComment">// eg user showing context menu</span>
    mouseEvent?: MouseEvent|Touch;
}</pre>

</p>

<p>

</p>
