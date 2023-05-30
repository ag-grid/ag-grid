<framework-specific-section frameworks="javascript">
|
|Below is an example of a tool panel component:
</framework-specific-section>

<framework-specific-section frameworks="javascript">
<snippet transform={false}>
|class CustomStatsToolPanel {
|    init(params) {
|        this.eGui = document.createElement('div');
|        this.eGui.style.textAlign = "center";
|
|        // calculate stats when new rows loaded, i.e. onModelUpdated
|        const renderStats = () => {
|            this.eGui.innerHTML = this.calculateStats(params);
|        };
|        params.api.addEventListener('modelUpdated', renderStats);
|    }
|
|    getGui() {
|        return this.eGui;
|    }
|
|    calculateStats(params) {
|        let numGold = 0, numSilver = 0, numBronze = 0;
|        params.api.forEachNode(function (rowNode) {
|            const data = rowNode.data;
|            if (data.gold) numGold += data.gold;
|            if (data.silver) numSilver += data.silver;
|            if (data.bronze) numBronze += data.bronze;
|        });
|
|        return `
|        &lt;span>
|            &lt;h2>&lt;i class="fa fa-calculator">&lt;/i> Custom Stats&lt;/h2>
|            &lt;dl style="font-size: large; padding: 30px 40px 10px 30px">
|                &lt;dt style="padding-bottom: 15px">Total Medals: &lt;b>${numGold + numSilver + numBronze}&lt;/b>&lt;/dt>
|                &lt;dt style="padding-bottom: 15px">Total Gold: &lt;b>${numGold}&lt;/b>&lt;/dt>&lt;dt style="padding-bottom: 15px">Total Silver: &lt;b>${numSilver}&lt;/b>&lt;/dt>
|                &lt;dt style="padding-bottom: 15px">Total Bronze: &lt;b>${numBronze}&lt;/b>&lt;/dt>
|            &lt;/dl>
|        &lt;/span>`;
|    }
|}
</snippet>
</framework-specific-section>