function MyHeaderRenderer() {}

MyHeaderRenderer.prototype.init = function(params) {
    this.id = params.column.getId();
    console.log('MyHeaderRenderer.init  ' + this.id);
    this.eGui = document.createElement('div');
    this.eGui.innerHTML = 'Hello World!!!';
    this.params = params;
};

MyHeaderRenderer.prototype.getGui = function() {
    console.log('MyHeaderRenderer.getGui ' + this.id, this.params);
    return this.eGui;
};

MyHeaderRenderer.prototype.destroy = function() {
    console.log('MyHeaderRenderer.destroy ' + this.id, this.params);
    return this.eGui;
};
