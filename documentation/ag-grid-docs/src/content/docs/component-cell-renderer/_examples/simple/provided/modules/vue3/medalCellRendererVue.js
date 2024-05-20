export default {
    template: `<span>{{ displayValue }}</span>`,
    setup(props) {
        const displayValue = new Array(parseInt(props.params.value, 10)).fill('#').join('');
        return {
            displayValue,
        };
    },
};
