export default {
    template: `
      <div class="container" v-if="visible">
      <div>
          <span class="component">Status Bar Component&nbsp;
            <input type="button" v-on:click="onClick" value="Click Me"/>
            {{ text }}
          </span>
      </div>
      </div>
    `,
    data: function () {
        return {
            text: '',
            visible: true,
        };
    },
    methods: {
        onClick() {
            this.text = this.params.api.getSelectedRows().length + ' selected';
        },
        setVisible(visible) {
            this.visible = visible;
        },
        isVisible() {
            return this.visible;
        },
    },
};
