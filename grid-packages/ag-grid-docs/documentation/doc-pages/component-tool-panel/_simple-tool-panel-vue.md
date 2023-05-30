<framework-specific-section frameworks="vue">
|Below is an example of an a tool panel component:
</framework-specific-section>

<framework-specific-section frameworks="vue">
<snippet transform={false}>
|const MyToolPanelComponent = {
|    template: `
|        &lt;div style="text-align: center">
|            &lt;span>
|                &lt;h2>&lt;i class="fa fa-calculator">&lt;/i> Custom Stats&lt;/h2>
|                &lt;dl style="font-size: large; padding: 30px 40px 10px 30px">
|                    &lt;dt style="padding-bottom: 15px">Total Medals: &lt;b>{{ numGold + numSilver + numBronze }}&lt;/b>&lt;/dt>
|                    &lt;dt style="padding-bottom: 15px">Total Gold: &lt;b>{{ numGold }}&lt;/b>&lt;/dt>
|                    &lt;dt style="padding-bottom: 15px">Total Silver: &lt;b>{{ numSilver }}&lt;/b>&lt;/dt>
|                    &lt;dt style="padding-bottom: 15px">Total Bronze: &lt;b>{{ numBronze }}&lt;/b>&lt;/dt>
|                &lt;/dl>
|            &lt;/span>
|        &lt;/div>
|    `,
|    data() {
|        return {
|            numGold: 0,
|            numSilver: 0,
|            numBronze: 0
|        };
|    },
|    methods: {
|        renderStats() {
|            this.params.api.forEachNode((rowNode) => {
|                const data = rowNode.data;
|                if (data.gold) this.numGold += data.gold;
|                if (data.silver) this.numSilver += data.silver;
|                if (data.bronze) this.numBronze += data.bronze;
|            });
|        }
|    },
|    created() {
|        this.params.api.addEventListener('modelUpdated', this.renderStats.bind(this));
|    }
|}
</snippet>
</framework-specific-section>