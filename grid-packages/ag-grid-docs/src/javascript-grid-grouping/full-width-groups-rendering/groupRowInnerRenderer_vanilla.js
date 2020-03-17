function GroupRowInnerRenderer () {}

GroupRowInnerRenderer.prototype.init = function(params) {
    this.eGui = document.createElement('div');
    this.eGui.style.display = "inline-block";
    this.params = params;
    this.refreshGui();

    var that = this;
    this.dataChangedListener = function() {
        that.refreshGui();
    };

    params.api.addEventListener('cellValueChanged', this.dataChangedListener);
    params.api.addEventListener('filterChanged', this.dataChangedListener);
};

GroupRowInnerRenderer.prototype.refreshGui = function() {

    var flagCode = this.params.flagCodes[this.params.node.key];

    var html = '';
    if (flagCode) {
        html += '<img class="flag" border="0" width="20" height="15" src="https://flags.fmcdn.net/data/flags/mini/' + flagCode + '.png">';
    }

    var node = this.params.node;
    var aggData = node.aggData;

    html += '<span class="groupTitle"> COUNTRY_NAME</span>'.replace('COUNTRY_NAME', node.key);
    html += '<span class="medal gold"> Gold: GOLD_COUNT</span>'.replace('GOLD_COUNT', aggData.gold);
    html += '<span class="medal silver"> Silver: SILVER_COUNT</span>'.replace('SILVER_COUNT', aggData.silver);
    html += '<span class="medal bronze"> Bronze: BRONZE_COUNT</span>'.replace('BRONZE_COUNT', aggData.bronze);

    this.eGui.innerHTML = html;
};

GroupRowInnerRenderer.prototype.destroy = function() {
    this.params.api.removeEventListener('cellValueChanged', this.dataChangedListener);
    this.params.api.removeEventListener('filterChanged', this.dataChangedListener);
};

GroupRowInnerRenderer.prototype.getGui = function() {
    return this.eGui;
};