function NumericCellEditor() {
}

// gets called once before the renderer is used
NumericCellEditor.prototype.init = function(params) {
    // create the cell
    this.eInput = document.createElement('input');

    if (isCharNumeric(params.charPress)) {
        this.eInput.value = params.charPress;
    } else {
        if (params.value !== undefined && params.value !== null) {
            this.eInput.value = params.value;
        }
    }

    var that = this;
    this.eInput.addEventListener('keypress', function(event) {
        if (!isKeyPressedNumeric(event)) {
            that.eInput.focus();
            if (event.preventDefault) event.preventDefault();
        } else if (that.isKeyPressedNavigation(event)) {
            event.stopPropagation();
        }
    });

    // only start edit if key pressed is a number, not a letter
    var charPressIsNotANumber = params.charPress && ('1234567890'.indexOf(params.charPress) < 0);
    this.cancelBeforeStart = charPressIsNotANumber;
};

NumericCellEditor.prototype.isKeyPressedNavigation = function(event) {
    return event.keyCode === 39
        || event.keyCode === 37;
};


// gets called once when grid ready to insert the element
NumericCellEditor.prototype.getGui = function() {
    return this.eInput;
};

// focus and select can be done after the gui is attached
NumericCellEditor.prototype.afterGuiAttached = function() {
    this.eInput.focus();
};

// returns the new value after editing
NumericCellEditor.prototype.isCancelBeforeStart = function() {
    return this.cancelBeforeStart;
};

// example - will reject the number if it contains the value 007
// - not very practical, but demonstrates the method.
NumericCellEditor.prototype.isCancelAfterEnd = function() {
    var value = this.getValue();
    return value.indexOf('007') >= 0;
};

// returns the new value after editing
NumericCellEditor.prototype.getValue = function() {
    return this.eInput.value;
};

// any cleanup we need to be done here
NumericCellEditor.prototype.destroy = function() {
    // but this example is simple, no cleanup, we could  even leave this method out as it's optional
};

// if true, then this editor will appear in a popup
NumericCellEditor.prototype.isPopup = function() {
    // and we could leave this method out also, false is the default
    return false;
};