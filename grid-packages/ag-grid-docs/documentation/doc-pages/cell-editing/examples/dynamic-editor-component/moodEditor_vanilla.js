function MoodEditor() {
    this.defaultImgStyle = 'padding-left:10px; padding-right:10px;  border: 1px solid transparent; padding: 4px;';
    this.selectedImgStyle = 'padding-left:10px; padding-right:10px; border: 1px solid lightgreen; padding: 4px;';
}

MoodEditor.prototype.onKeyDown = function(event) {
    var key = event.which || event.keyCode;
    if (key == 37 ||  // left
        key == 39) {  // right
        this.toggleMood();
        event.stopPropagation();
    }
};

MoodEditor.prototype.toggleMood = function() {
    this.selectMood(this.mood === 'Happy' ? 'Sad' : 'Happy');
};

MoodEditor.prototype.init = function(params) {
    this.container = document.createElement('div');
    this.container.style = "border-radius: 15px; border: 1px solid grey;background: #e6e6e6;padding: 15px; text-align:center;display:inline-block;outline:none";
    this.container.tabIndex = "0";                // to allow the div to capture keypresses

    this.happyImg = document.createElement('img');
    this.happyImg.src = 'https://www.ag-grid.com/example-assets/smileys/happy.png';
    this.happyImg.style = this.defaultImgStyle;

    this.sadImg = document.createElement('img');
    this.sadImg.src = 'https://www.ag-grid.com/example-assets/smileys/sad.png';
    this.sadImg.style = this.defaultImgStyle;

    this.container.appendChild(this.happyImg);
    this.container.appendChild(this.sadImg);

    var that = this;
    this.happyImg.addEventListener('click', function(event) {
        that.selectMood('Happy');
        params.stopEditing();
    });
    this.sadImg.addEventListener('click', function(event) {
        that.selectMood('Sad');
        params.stopEditing();
    });
    this.container.addEventListener('keydown', function(event) {
        that.onKeyDown(event);
    });

    this.selectMood(params.value);
};

MoodEditor.prototype.selectMood = function(mood) {
    this.mood = mood;
    this.happyImg.style = (mood === 'Happy') ? this.selectedImgStyle : this.defaultImgStyle;
    this.sadImg.style = (mood === 'Sad') ? this.selectedImgStyle : this.defaultImgStyle;
};

// gets called once when grid ready to insert the element
MoodEditor.prototype.getGui = function() {
    return this.container;
};

MoodEditor.prototype.afterGuiAttached = function() {
    this.container.focus();
};

MoodEditor.prototype.getValue = function() {
    return this.mood;
};

// any cleanup we need to be done here
MoodEditor.prototype.destroy = function() {
};

MoodEditor.prototype.isPopup = function() {
    return true;
};
