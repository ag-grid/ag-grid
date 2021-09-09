export default {
    template: `<span>{{ displayValue }}</span>`,
    setup(props) {
        const displayValue = new Array(props.params.value).fill('#').join('');
        return {
            displayValue
        }
    }
};
