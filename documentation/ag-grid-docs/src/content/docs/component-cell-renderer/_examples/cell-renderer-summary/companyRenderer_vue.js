export default {
  template: `
    <a :href="parsedValue" target="_blank">{{ value }}</a>
  `,
  data: function () {
    return {
        parsedValue: '',
        value: '',
    };
  },
  beforeMount() {
      this.updateDisplay(this.params);
  },
  methods: {
      refresh(params) {
          this.updateDisplay(params);
      },
      updateDisplay(params) {
        this.value = params.value;
        this.parsedValue = `https://en.wikipedia.org/wiki/${params.value}`;
      },
  },
};