<?php
$pageTitle = "Clipboard: Enterprise Grade Feature of our Datagrid";
$pageDescription = "ag-Grid is a feature-rich data grid supporting major JavaScript Frameworks. One such feature is Clipboard. Copy and paste data to and from the Clipboard. Users will be able to edit data in Excel, then copy the data back into the grid when done. Version 17 is available for download now, take it for a free two month trial.";
$pageKeyboards = "Javascript Grid Clipboard";
$pageGroup = "feature";
include '../documentation-main/documentation_header.php';
?>


    <h1 class="heading-enterprise">Clipboard</h1>

    <p> You can copy and paste items to and from the grid using the system clipboard.  </p>

    <h2> Copy to Clipboard </h2>

    <p> Copy to clipboard operation can be done in the following ways: </p>

    <ul class="content">
        <li>Select 'Copy' from the context menu that appears when you right click over a cell.</li>
        <li>Press keys Ctrl+C while focus is on the grid.</li>
        <li>Use the API methods: copySelectedRowsToClipboard(includeHeaders) and
            copySelectedRangeToClipboard(includeHeaders)
        </li>
    </ul>

    <p>
    The API calls take a boolean value <code>includeHeaders</code> which when true, will include column headers in what is
    copied.
    </p>

    <note>
        Performing multiple 'Ctrl + Left Click' operations followed by 'Ctrl+C' will not preserve original cell layout
        but rather copy them vertically to the clipboard.
    </note>

    <h2> Paste from Clipboard </h2>

    <p> Paste to clipboard can only be done in the following ways:</p>

    <ul class="content">
        <li>Press keys <b>Ctrl+V</b> while focus in on the grid with a <b>single cell selected</b>. The paste will then proceed starting at
            the selected cell if multiple cells are to be pasted.</li>
        <li>
            Press keys <b>Ctrl+V</b> while focus in on the grid with a <b>range of cells selected</b>. If the selected
            range being pasted is larger than copied range, it will repeat if it fits evenly, otherwise it will just
            copy the cells into the start of the range.
        </li>
    </ul>

    <note>
        The 'paste' operation in the context menu is not possible and hence always disabled.
        It is not possible because of a browser security restriction that Javascript cannot
        take data from the clipboard without the user explicitly doing a paste command from the browser
        (eg Ctrl+V or from the browser menu). If Javascript could do this, then websites could steal
        data from the client via grabbing from the clipboard maliciously. The reason why ag-Grid keeps
        the paste in the menu as disabled is to indicate to the user that paste is possible and it provides
        the shortcut as a hint to the user. This is also why the API cannot copy from clipboard.
    </note>

    <p>
        The copy operation will copy selected ranges, selected rows, or the currently focused cell, based
        on this order:
    </p>

    <ul class="content">
        <li>
            If range selected (via range selection), copy range.
        </li>
        <li>
            Else if rows selected (via row selection), copy rows.
        </li>
        <li>
            Else copy focused cell.
        </li>
    </ul>

    <note>
        You can copy multiple ranges in range selection by holding down ctrl to select multiple
        ranges and then copy.
    </note>

    <h2>Safari Support</h2>

    <p>
        Copy to clipboard is not supported in Safari. This is because the Safari browser does not implement the
        required API that ag-Grid uses, further details are described
        <a href="https://developer.mozilla.org/en-US/docs/Web/API/Document/execCommand">here</a>. ag-Grid does
        not plan to support Safari clipboard as Safari is not generally used in corporate environments where
        the target audience for this feature resides.
    </p>

    <h2>Toggle Paste On / Off</h2>

    <p>
        Pasting is on by default as long as cells are editable (non-editable cells cannot be modified, even
        with a paste operation). To turn paste operations off, set grid property
        <code>suppressClipboardPaste=true</code>.
    </p>

    <h2 id="events">Clipboard Events</h2>

    <p>
        The following events are relevant to clipboard operations:
        <ul>
            <li>
                <code>pasteStart</code>: Paste event has started.
            </li>
            <li>
                <code>pasteEnd</code>: Paste event has ended.
            </li>
            <li>
                <code>cellValueChanged</code>: A cells value has changed. Typically happens after editing but also
                if cell value is changed as a result of paste operation.
            </li>
        </ul>
    </p>

    <p>
        For a paste operation the events will be fired as:
        <ol>
            <li>
                One <code>pasteStart</code> event.
            </li>
            <li>
                Many <code>cellValueChanged</code> events.
            </li>
            <li>
                One <code>pasteEnd</code> event.
            </li>
        </ol>
        If the application is doing work each time it receives a <code>cellValueChanged</code>, you can use
        the <code>pasteStart</code> and
        <code>pasteEnd</code> events to suspend the applications work and then do the work for all cells impacted
        by the paste operation after the paste operation.
    </p>

    <p>
        There are no events for paste to clipboard as this does not update the grids data.
    </p>

    <h2>Clipboard Example</h2>

    <p>
        Below you can:</p>

    <ul class="content">
        <li>Copy with the Context Menu or 'Ctrl & C'.</li>
        <li>Paste with 'Ctrl & V'.</li>
        <li>Copy with the provided buttons.</li>
        <li>
            Notice for paste that events <code>pasteStart</code>, <code>pasteEnd</code> and
            <code>cellValueChanged</code> are logged to the console.
        </li>
        <li>Buttons 'Toggle Paste On' and 'Toggle Paste Off' turn pasting on and off.</li>
    </ul>

    <p>The example has both row click selection and range selection enabled. You probably won't do
    this in your application as it's confusing, it's done below just to demonstrate them side by side.
    </p>

    <p>When row click selection and range selection are enabled the shortcut would copy the selected row, not the
        selected range, if you wish to let the range take precedence, then you can add this to your gridOptions
        <code>suppressCopyRowsToClipboard:true</code>
    </p>

    <?= example('Clipboard example', 'simple', 'generated', array("enterprise" => true)) ?>

    <h2>Controlling Clipboard Copy</h2>

    <p>
        If you want to do the copy to clipboard yourself (ie not use the grids clipboard interaction)
        then implement the callback <code>sendToClipboard(params)</code>. Use this if you are in a non-standard
        web container that has a bespoke API for interacting with the clipboard. The callback gets the
        data to go into the clipboard, it's your job to call the bespoke API.
    </p>

    <p>
        The example below shows using <code>sendToClipboard(params)</code>, but rather than using the clipboard,
        demonstrates the callback by just printing the data to the console.
    </p>

    <?= example('Controlling Clipboard Copy', 'custom', 'generated', array("enterprise" => true)) ?>

    <h2>Processing Clipboard Data</h2>

    <p>
        It is possible to process clipboard data before pasting it into the grid. This can be done either 1) on
        individual cells or 2) the whole paste operation. The following callbacks allow this:
    </p>

    <ol class="content">
        <li>
            Individual Cells:
            <ul>
                <li>
                    <code>processCellForClipboard(params):</code>
                    Allows you to process cells for the clipboard. Handy if you have date objects that you
                    need to have a particular format if importing into Excel.
                </li>
                <li>
                    <code>processHeaderForClipboard(params):</code>
                    Allows you to process header values for the clipboard.
                </li>
                <li>
                    <code>processCellFromClipboard(params):</code>
                    Allows you to process cells from the clipboard.
                    Handy if you have for example number fields and want to block non-numbers from getting into the grid.
                </li>
            </ul>
        </li>
        <li>
            Whole Paste Operation
            <ul>
                <li><code>processDataFromClipboard(params):</code> Allows complete control of the paste operation,
                including cancelling the operation (so nothing happens) or replacing the data with other data.</li>
            </ul>
        </li>
    </ol>

    <h3>Processing Individual Cells</h3>

    <p>The interfaces and parameters for processing individual cells are as follows:</p>
    <snippet>
// for processing cell during a copy / cut operation
processCellForClipboard(params: ProcessCellForExportParams): any;

// for processing header cell during a copy / cut operation
processHeaderForClipboard?params: ProcessHeaderForExportParams): any;

// for processing a cell during a paste operation
processCellFromClipboard(params: ProcessCellForExportParams): any;

// for processCellForClipboard and processCellFromClipboard
export interface ProcessCellForExportParams {
    value: any, // the value to paste
    node: RowNode, // the row node
    column: Column, // the column
    api: GridApi, // the grid's API
    columnApi: ColumnApi, // the grids column API
    context: any, // the context object
    type: string // clipboard, dragCopy (ctrl+D), export
}

// for processHeaderForClipboard
export interface ProcessHeaderForExportParams {
    column: Column, // the column
    api: GridApi, // the api
    columnApi: ColumnApi, // the column aPI
    context: any // the context object
}
    </snippet>

    <p>
        These three callbacks above are demonstrated in the example below. Note the following:
        <ul>
            <li>
                When cells are copied to the clipboard, values are prefixed with 'C-'.
                Cells can be copied by dragging a range with the mouse and hitting ctrl+c.
            </li>
            <li>
                When cells are pasted from the clipboard, values are prefixed with 'Z-'.
                Cells can be pasted by hitting ctrl+v.
            </li>
            <li>
                When headers are copied to the clipboard, values are prefixed with 'H-'.
                Headers can be copied by using the context menu.
            </li>
        </ul>
    </p>

    <?= example('Example Process', 'process', 'generated', array("enterprise" => true)) ?>

    <h3>Processing Whole Paste Operation</h3>

    <p>The interface and parameters for processing the whole paste operation is as follows:</p>

    <snippet>
// for processing data from the clipboard
processDataFromClipboard(params: ProcessDataFromClipboardParams)=>string[][];

// params for processDataFromClipboard
export interface ProcessDataFromClipboardParams {
    data: string[][]; // 2d array of all cells from the clipboard
}
    </snippet>

    <p>
        In summary the <code>processDataFromClipboard</code> takes a 2d array of data that was taken from
        the clipboard and the method returns a 2d array of data to be used. For the method to have no impact,
        it should return the 2d array it was provided. The method is free to return back anything it wants,
        as long as it is a 2d array of strings.
    </p>

    <p>
        The example below demonstrates <code>processDataFromClipboard</code>. Note the following:
    </p>

    <ul>
        <li>
            Paste data with no cells starting with 'Red' or 'Yellow' works as normal. This is achieved
            by <code>processDataFromClipboard</code> returning the 2d array it was provided with.
        </li>
        <li>
            Pasting any data where a cell starts with 'Red' will result in always 2x2 cells getting pasted
            with contents <code>[ ['Orange', 'Orange'], ['Grey', 'Grey'] ]</code>. To see this, copy and
            paste some 'Red' cells from column F.
            This is achieved by <code>processDataFromClipboard</code> returning the same 2d array always
            regardless of the data from the clipboard.
        </li>
        <li>
            Pasting any data where a cell starts with 'Yellow' will result in the paste operation getting
            cancelled. To see this, copy and paste some 'Yellow' cells from column G. This is achieved by
            <code>processDataFromClipboard</code> returning null.
        </li>
    </ul>

    <?= example('Example Process All', 'process-all', 'generated', array("enterprise" => true)) ?>

    <h2>Changing the Deliminator</h2>

    <p>
        By default, the grid will use '\t' (tab) as the field deliminator. This is to keep the
        copy / paste compatible with Excel. If you want another deliminator then use the
        property <code>clipboardDeliminator</code>.
    </p>

    <h2>Suppress Paste</h2>

    <p>
        The colDef has a property <code>suppressPaste</code> where you can specify to not allowing
        clipboard paste for a particular cell. This can be a boolean or a function (use a function
        to specify for a particular cell, or boolean for the whole column).
    </p>

    <h2>More Complex Example</h2>

    <p>
        The example below demonstrates:
    </p>

    <ul class="content">
        <li>
            Uses CSV by setting <code>clipboardDeliminator=','</code>. To test,
            copy to clipboard, then paste into a text editor.
        </li>
        <li>
            Does not allow paste into the 'silver' column by setting
            <code>colDef.suppressPaste=true</code>.
        </li>
    </ul>

    <?= example('Complex Example', 'complex', 'generated', array("enterprise" => true)) ?>

<?php include '../documentation-main/documentation_footer.php'; ?>
