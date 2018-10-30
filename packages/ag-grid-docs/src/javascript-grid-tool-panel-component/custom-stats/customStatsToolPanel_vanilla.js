function CustomStatsToolPanel() {
}

CustomStatsToolPanel.prototype.init = function (params) {
    this.eGui = document.createElement('div');
    this.eGui.style.textAlign = "center";

    // calculate stats when new rows loaded, i.e. onModelUpdated
    var renderStats = () => this.eGui.innerHTML = calculateStats(params);
    params.api.addEventListener('modelUpdated', renderStats);
};

CustomStatsToolPanel.prototype.getGui = function () {
    return this.eGui;
};

function calculateStats(params) {
    var numGold = 0, numSilver = 0, numBronze = 0;
    params.api.forEachNode(function (rowNode) {
        var data = rowNode.data;
        if (data.gold) numGold += data.gold;
        if (data.silver) numSilver += data.silver;
        if (data.bronze) numBronze += data.bronze;
    });

    return `<span>
               <h2><i class="fa fa-calculator"></i> Custom Stats</h2>
               <dl style="font-size: large; padding: 30px 40px 10px 30px">
                 <dt style="padding-bottom: 15px">Total Medals: <b>${numGold + numSilver + numBronze}</b></dt>
                 <dt style="padding-bottom: 15px">Total Gold: <b>${numGold}</b></dt>
                 <dt style="padding-bottom: 15px">Total Silver: <b>${numSilver}</b></dt>
                 <dt style="padding-bottom: 15px">Total Bronze: <b>${numBronze}</b></dt>          
               </dl>
            </span>`;
}