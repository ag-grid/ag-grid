export default {
    template: `
      <span>
        &gt; <input v-bind:style="{ borderColor: params.color, width: '30px' }" type="number" min="0" v-model="currentValue"
             v-on:input="onInputBoxChanged()"/>
      </span>
    `,
    data: function () {
        return {
            currentValue: '',
        };
    },
    methods: {
        onInputBoxChanged() {
            const newValue = this.currentValue;
            this.params.onModelChange(newValue === '' ? null : Number(newValue));
        },

        refresh(params) {
            // if the update is from the floating filter, we don't need to update the UI
            if (params.source !== 'ui') {
                const model = params.model;
                this.currentValue = model == null ? '' : String(model);
            }
        },
    },
    mounted: function () {
        this.refresh(this.params);
    },
};
