define([], function() {

    function ColModel(columnDefs) {

        // wrap all the provided col defs
        this.colDefWrappers = [];
        var that = this;
        if (columnDefs) {
            columnDefs.forEach( function (colDef, index) {
                var newColDefWrapper = new ColDefWrapper(colDef);
                that.colDefWrappers.push(newColDefWrapper, index);
            });
        }
    }

    function ColDefWrapper(colDef, index) {
        this.colDef = colDef;
        this.index = index;
    }

    return ColModel;

});