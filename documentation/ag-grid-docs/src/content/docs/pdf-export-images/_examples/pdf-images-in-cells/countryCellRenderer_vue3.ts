export default {
    template: `
        <div>
            <img
                :alt="params.data.country + ' flag'"
                class="country-flag"
                :src="'data:image/png;base64,' + params.context.flagImages[params.data.countryCode]"
            />
            {{ params.value }}
        </div>
    `,
};
