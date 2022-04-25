export default {
  template: `
      <span>
        <img :src="imageSource">{{ value }}
      </span>
    `,
  data: function () {
    return {
      imageSource: null,
      value: ''
    };
  },
  beforeMount() {
    this.image = this.params.value === 'Male' ? 'male.png' : 'female.png';
    this.imageSource = `https://www.ag-grid.com/example-assets/genders/${this.image}`;
    this.value = this.params.value;
  }
};
