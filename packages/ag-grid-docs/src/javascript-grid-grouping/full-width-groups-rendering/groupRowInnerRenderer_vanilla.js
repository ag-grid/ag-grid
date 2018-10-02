function GroupRowInnerRenderer () {}

GroupRowInnerRenderer.prototype.init = function(params) {
    this.eGui = document.createElement('div');
    this.eGui.style.display = "inline-block";

    var flagCode = params.flagCodes[params.node.key];

    var html = '';
    if (flagCode) {
        html += '<img class="flag" border="0" width="20" height="15" src="https://flags.fmcdn.net/data/flags/mini/' + flagCode + '.png">';
    }

    var node = params.node;
    var aggData = node.aggData;

    html += '<span class="groupTitle"> COUNTRY_NAME</span>'.replace('COUNTRY_NAME', node.key);
    html += '<span class="medal gold"> Gold: GOLD_COUNT</span>'.replace('GOLD_COUNT', aggData.gold);
    html += '<span class="medal silver"> Silver: SILVER_COUNT</span>'.replace('SILVER_COUNT', aggData.silver);
    html += '<span class="medal bronze"> Bronze: BRONZE_COUNT</span>'.replace('BRONZE_COUNT', aggData.bronze);

    this.eGui.innerHTML = html;
};

GroupRowInnerRenderer.prototype.getGui = function() {
    return this.eGui;
};