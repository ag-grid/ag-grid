import { COUNTRY_CODES } from './countryCodes';

export default {
    template: `<div v-html="value"></div>`,
    data() {
        return {
            value: '',
        };
    },
    beforeMount() {
        const code = this.params.value ? COUNTRY_CODES[this.params.value] : undefined;
        const flag = code
            ? `<img class="flag" border="0" width="15" height="10" src="https://flags.fmcdn.net/data/flags/mini/${code}.png"> `
            : '';
        this.value = `${flag}${this.params.value ?? ''}`;
    },
};
