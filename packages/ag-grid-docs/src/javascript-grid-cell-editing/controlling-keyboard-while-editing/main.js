var columnDefs = [
    {field: 'a'},
    {field: 'b'},
    {field: 'c'}
];

var KEY_LEFT = 37;
var KEY_UP = 38;
var KEY_RIGHT = 39;
var KEY_DOWN = 40;

var gridOptions = {
    defaultColDef:{
        cellEditor:'arrowsEditor',
        type: 'number',
        editable: true,
        filter: true,
        suppressKeyboardEvent: function(params){

            if (!params.editing) {
                console.log(params.event.type + ' not editing so not suppressing event');
                return false;
            }

            var keyboardEvent = params.event;
            var key = keyboardEvent.which || keyboardEvent.keyCode;
            var suppressing = key === KEY_DOWN || key === KEY_LEFT || key === KEY_RIGHT || key === KEY_UP;

            console.log('event key code = ' + key + ', suppressing = '+ suppressing);

            return suppressing;
        }
    },
    components:{
        arrowsEditor: createActionEditor()
    },
    columnDefs: columnDefs,
    rowData:[
        {a:11, b:12, c:13},
        {a:21, b:22, c:23}
    ]
};

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function() {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);

});

function createActionEditor() {
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
                case KEY_UP:
                    self.setValue(self.value + 1);
                    event.preventDefault();
                    break;
                case KEY_DOWN:
                    self.setValue(self.value - 1)
                    event.preventDefault();
                    break;
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

    return ArrowEditor;
}