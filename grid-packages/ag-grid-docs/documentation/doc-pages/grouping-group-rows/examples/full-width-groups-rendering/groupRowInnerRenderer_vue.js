export default {
    template: `
      <div style="display: inline-block">
      <img v-if="flagCodeImg" class="flag" border="0" width="20" height="15" :src="flagCodeImg"/>
      <span class="groupTitle">{{ key }}</span>
      <span class="medal gold" v-bind:aria-label="key + ' - ' + gold + ' gold medals'"><i class="fas fa-medal"></i>
        {{ gold }}</span>
      <span class="medal silver" v-bind:aria-label="key + ' - ' + silver + ' silver medals'"><i class="fas fa-medal"></i>
        {{ silver }}</span>
      <span class="medal bronze" v-bind:aria-label="key + ' - ' + bronze + ' bronze medals'"><i class="fas fa-medal"></i>
        {{ bronze }}</span>
      </div>
    `,
    data: function () {
        return {
            flagCodeImg: '',
            key: null,
            gold: null,
            silver: null,
            bronze: null,
        };
    },
    beforeMount() {
        this.params.api.addEventListener('cellValueChanged', this.updateGui);
        this.params.api.addEventListener('filterChanged', this.updateGui);

        this.updateGui();
    }, methods: {
        updateGui() {
            const flagCode = this.params.flagCodes[this.params.node.key];
            this.flagCodeImg = flagCode ? `https://flags.fmcdn.net/data/flags/mini/${flagCode}.png` : null;

            this.key = this.params.node.key;
            this.gold = this.params.node.aggData.gold;
            this.silver = this.params.node.aggData.silver;
            this.bronze = this.params.node.aggData.bronze;
        }
    }
};
