export default {
    template: `
      <div class="ag-status-name-value">
          <span>Status Bar Component&nbsp; 
            <input type="button" class="status-bar-input" v-on:click="onClick" value="Click Me"/>
            {{ text }}
          </span>
      </div>
    `,
    data: function () {
        return {
            text: '',
        };
    },
    methods: {
        onClick() {
            this.text = this.params.api.getSelectedRows().length + ' selected';
        },
    },
};
