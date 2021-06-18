export default {
    template: `<span>{{ displayValue }}</span>`,
    data: function () {
        return {
            displayValue: ''
        };
    },
    beforeMount() {
        this.displayValue = new Array(this.params.value).fill('#').join('');
    },
};
