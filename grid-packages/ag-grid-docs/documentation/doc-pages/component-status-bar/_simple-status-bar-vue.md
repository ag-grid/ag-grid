<framework-specific-section frameworks="vue">
|Below is an example of an a status bar component:
</framework-specific-section>

<framework-specific-section frameworks="vue">
<snippet transform={false}>
|const MyStatusBarComponent = {
|    template: `&lt;input style="padding: 5px; margin: 5px" type="button" v-on:click="onClick" value="Click Me For Selected Row Count"/>`,
|    methods: {
|        onClick() {
|            alert('Selected Row Count: ' + this.params.api.getSelectedRows().length)
|        }
|    }
|}
</snippet>
</framework-specific-section>