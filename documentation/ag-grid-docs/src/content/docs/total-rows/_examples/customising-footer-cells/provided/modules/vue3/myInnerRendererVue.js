export default {
    template: `<span :style="{textDecoration: underline, fontWeight: fontWeight}">{{prefix}} {{cellValue}}</span>`,
    data: function () {
        return {
            cellValue: null,
            underline: null,
            fontWeight: null,
            prefix: null,
        };
    },
    beforeMount() {
        this.cellValue = this.params.value;
        this.underline = this.params.node.footer ? 'underline' : 'none';
        this.fontWeight = this.params.node.footer && this.params.node.level === -1 ? 'bold' : '';
        if (this.params.node.footer) {
            this.prefix = this.params.node.level === -1 ? 'Grand Total' : 'Sub Total';
        }
    },
    methods: {},
};
