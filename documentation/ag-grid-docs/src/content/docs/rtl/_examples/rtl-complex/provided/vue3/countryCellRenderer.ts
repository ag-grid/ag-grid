export default {
    template: `<div v-html="value"></div>`,
    data() {
        return {
            value: '',
        };
    },
    beforeMount() {
        const value = this.params.value;

        // No country to show (blank cell, or the set filter's "select all" row): render the raw value with no flag.
        if (value == null || value === '' || value === '(Select All)') {
            this.value = value;
            return;
        }

        // Flags are keyed by the English country name (see COUNTRY_CODES on the grid context). In Arabic/Hebrew
        // mode the localised names have no entry, so `code` is undefined and we render the country text with no
        // image - this guards against `undefined.png` 404s.
        const code = this.params.context.COUNTRY_CODES[value];
        if (code) {
            const flag = `<img class="flag" border="0" width="15" height="10" src="https://flags.fmcdn.net/data/flags/mini/${code}.png">`;
            this.value = `${flag} ${value}`;
        } else {
            this.value = value;
        }
    },
};
