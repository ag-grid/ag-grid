export default {
    template: `<span>{{ displayValue }}</span>`,
    data: function () {
        return {
            displayValue: ''
        };
    },
    beforeMount() {
        this.displayValue = new Array(parseInt(this.params.value, 10)).fill('#').join('');
    },
};
