[[only-javascript]]
|Below is a simple example of cell renderer class:
|
|```js
|// function to act as a class
|function MyCellRenderer () {}
|
|// gets called once before the renderer is used
|MyCellRenderer.prototype.init = function(params) {
|    // create the cell
|    this.eGui = document.createElement('div');
|    this.eGui.innerHTML = '<span class="my-css-class"><button class="btn-simple">Push Me</button><span class="my-value"></span></span>';
|
|    // get references to the elements we want
|    this.eButton = this.eGui.querySelector('.btn-simple');
|    this.eValue = this.eGui.querySelector('.my-value');
|
|    // set value into cell
|    this.eValue.innerHTML = params.valueFormatted ? params.valueFormatted : params.value;
|
|    // add event listener to button
|    this.eventListener = function() {
|        console.log('button was clicked!!');
|    };
|    this.eButton.addEventListener('click', this.eventListener);
|};
|
|// gets called once (assuming destroy hasn't been called first) when grid ready to insert the element
|MyCellRenderer.prototype.getGui = function() {
|    return this.eGui;
|};
|
|// gets called whenever the user gets the cell to refresh
|MyCellRenderer.prototype.refresh = function(params) {
|    // set value into cell again
|    this.eValue.innerHTML = params.valueFormatted ? params.valueFormatted : params.value;
|    // return true to tell the grid we refreshed successfully
|    return true;
|};
|
|// gets called when the cell is removed from the grid
|MyCellRenderer.prototype.destroy = function() {
|    // do cleanup, remove event listener from button
|    if (this.eButton) {
|        // check that the button element exists as destroy() can be called before getGui()
|        this.eButton.removeEventListener('click', this.eventListener);
|    }
|};
|```
