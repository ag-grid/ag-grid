export default {
    data() {
        return {
            color: null
        }
    },
    template: `
        <span :style="{ backgroundColor: color }" style="padding: 2px">{{params.value}}</span>
    `,
    beforeMount() {
        this.color = this.params.node.group ? 'coral' : 'lightgreen'
    }
};
