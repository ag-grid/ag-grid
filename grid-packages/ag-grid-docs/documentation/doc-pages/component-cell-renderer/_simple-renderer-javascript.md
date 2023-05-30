<framework-specific-section frameworks="javascript">
|Below is an example of cell renderer class:
</framework-specific-section>

<framework-specific-section frameworks="javascript">
<snippet transform={false}>
|class TotalValueRenderer {
|    // gets called once before the renderer is used
|    init(params) {
|        // create the cell
|        this.eGui = document.createElement('div');
|        this.eGui.innerHTML = `
|          &lt;span>
|              &lt;span class="my-value">&lt;/span>
|              &lt;button class="btn-simple">Push For Total&lt;/button>
|          &lt;/span>
|       `;
|
|        // get references to the elements we want
|        this.eButton = this.eGui.querySelector('.btn-simple');
|        this.eValue = this.eGui.querySelector('.my-value');
|
|        // set value into cell
|        this.cellValue = this.getValueToDisplay(params);
|        this.eValue.innerHTML = this.cellValue;
|
|        // add event listener to button
|        this.eventListener = () => alert(`${this.cellValue} medals won!`);
|        this.eButton.addEventListener('click', this.eventListener);
|    }
|
|    getGui() {
|        return this.eGui;
|    }
|
|    // gets called whenever the cell refreshes
|    refresh(params) {
|        // set value into cell again
|        this.cellValue = this.getValueToDisplay(params);
|        this.eValue.innerHTML = this.cellValue;
|
|        // return true to tell the grid we refreshed successfully
|        return true;
|    }
|
|    // gets called when the cell is removed from the grid
|    destroy() {
|        // do cleanup, remove event listener from button
|        if (this.eButton) {
|            // check that the button element exists as destroy() can be called before getGui()
|            this.eButton.removeEventListener('click', this.eventListener);
|        }
|    }
|
|    getValueToDisplay(params) {
|        return params.valueFormatted ? params.valueFormatted : params.value;
|    }
|}
</snippet>
</framework-specific-section>