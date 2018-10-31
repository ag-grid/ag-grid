import Vue from "vue";

export default Vue.extend({
    template: `
        <div style="text-align: center">
            <span>
               <h2><i class="fa fa-calculator"></i> Custom Stats</h2>
               <dl style="font-size: large; padding: 30px 40px 10px 30px">
                 <dt style="padding-bottom: 15px">Total Medals: <b>{{numGold + numSilver + numBronze}}</b></dt>
                 <dt style="padding-bottom: 15px">Total Gold: <b>{{numGold}}</b></dt>
                 <dt style="padding-bottom: 15px">Total Silver: <b>{{numSilver}}</b></dt>
                 <dt style="padding-bottom: 15px">Total Bronze: <b>{{numBronze}}</b></dt>          
               </dl>
            </span>
        </div>
    `,
    data() {
        return {
            numGold: 0,
            numSilver: 0,
            numBronze: 0
        }
    },
    methods: {
        renderStats() {
            this.params.api.forEachNode((rowNode) => {
                const data = rowNode.data;
                if (data.gold) this.numGold += data.gold;
                if (data.silver) this.numSilver += data.silver;
                if (data.bronze) this.numBronze += data.bronze;
            });
        }
    },
    created() {
        this.params.api.addEventListener('modelUpdated', this.renderStats.bind(this));
    }
})
