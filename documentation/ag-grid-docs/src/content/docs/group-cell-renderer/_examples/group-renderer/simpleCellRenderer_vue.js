export default {
    data() {
        return {
            color: null,
        };
    },
    template: `
        <span :style="{backgroundColor: color, padding: 2x}">{params.value}</span>
    `,
    beforeMount() {
        this.color = this.params.node.group ? '#CC222244' : '#33CC3344';
    },
};
