export default {
    template: `<span :style="{color: color, fontWeight: fontWeight}">{{prefix}} {{cellValue}}</span>`,
    data: function () {
        return {
            cellValue: null,
            color: null,
            fontWeight: null,
            prefix: null
        };
    },
    beforeMount() {
        this.cellValue = this.params.value;
        this.color = this.params.node.footer ? 'navy' : '';
        this.fontWeight = (this.params.node.footer && this.params.node.level === -1) ? 'bold' : '';
        if (this.params.node.footer) {
            this.prefix = (this.params.node.level === -1) ? 'Grand Total' : 'Sub Total';
        }

    },
    methods: {}
};
