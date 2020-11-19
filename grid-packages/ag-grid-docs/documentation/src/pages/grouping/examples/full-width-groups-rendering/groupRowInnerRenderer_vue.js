import Vue from "vue";

export default Vue.extend({
    template: `
        <div style="display: inline-block">
            <img v-if="flagCodeImg" class="flag" border="0" width="20" height="15" :src="flagCodeImg" />
            <span class="groupTitle">{{this.node.key}}</span>
            <span class="medal gold" v-bind:aria-label="this.node.key + ' - ' + this.node.aggData.gold + ' gold medals'"><i class="fas fa-medal"></i>{{this.node.aggData.gold}}</span>
            <span class="medal silver" v-bind:aria-label="this.node.key + ' - ' + this.node.aggData.silver + ' silver medals'"><i class="fas fa-medal"></i>{{this.node.aggData.silver}}</span>
            <span class="medal bronze" v-bind:aria-label="this.node.key + ' - ' + this.node.aggData.bronze + ' bronze medals'"><i class="fas fa-medal"></i>{{this.node.aggData.bronze}}</span>
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

        const flagCode = this.params.flagCodes[this.node.key];
        this.flagCodeImg = flagCode ? `https://flags.fmcdn.net/data/flags/mini/${flagCode}.png` : null;
    },
    mounted() {
    },
    methods: {
    }
});