import Vue from "vue";

export default Vue.extend({
    template: `
            <div style="display: inline-block">
                <img v-if="flagCodeImg" class="flag" border="0" width="20" height="15" :src="flagCodeImg" />
                <span class="groupTitle"> {{this.node.key}}</span>
                <span class="medal gold"> Gold: {{this.node.aggData.gold}}</span>
                <span class="medal silver"> Silver: {{this.node.aggData.silver}}</span>
                <span class="medal bronze"> Bronze: {{this.node.aggData.bronze}}</span>
            </div>
    `,
    data: function () {
        return {
            flagCodeImg: '',
            node: null
        };
    },
    beforeMount() {
        this.node = this.params.node;
        console.log(this.node.aggData.goldCount);

        let flagCode = this.params.flagCodes[this.node.key];
        this.flagCodeImg = flagCode ? `https://flags.fmcdn.net/data/flags/mini/${flagCode}.png` : null;
    },
    mounted() {
    },
    methods: {
    }
});