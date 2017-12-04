var columnDefs = [
    {field: 'a'},
    {field: 'b'},
    {field: 'c'}
];

var gridOptions = {
    components:{
        arrowsEditor: ArrowEditor
    },
    columnDefs: columnDefs,
    enableFilter: true,
    rowData:[
        {a:11, b:12, c:13},
        {a:21, b:22, c:23}
    ],
    defaultColDef:{
        cellEditor:'arrowsEditor',
        type: 'number',
        editable: true,
        suppressKeyboardEvent: function(event){
            console.log('suppressing event');
            console.log(event);

            if (event.editing) return true;
        }
    }
};


// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function() {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);

});

function ArrowEditor(){
}

ArrowEditor.prototype.init = function (params){
    console.log("Arrow editor params:");
    console.log(params);
    var inputWrapper = document.createElement('span');
    inputWrapper.innerHTML = '<input type="text"/>'
    this.gui = inputWrapper.children[0];
    this.setValue(params.value);

    var self = this;

    this.gui.addEventListener('keydown', function(event){
        switch (event.keyCode){
            case 38:
            case 39:
                self.setValue(self.value + 1);
                break;
            case 40:
            case 37:
                self.setValue(self.value - 1)
        }
    });

    this.params = params;
};

ArrowEditor.prototype.getGui = function (){
    return this.gui;
};

ArrowEditor.prototype.setValue = function (value){
    this.value = value;
    this.gui.value = this.value + '';
};

ArrowEditor.prototype.getValue = function (){
    return this.value;
};

ArrowEditor.prototype.afterGuiAttached = function (){
    return this.gui.focus();
};
