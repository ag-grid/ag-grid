export default {
    template: `
        <span :style="{paddingLeft: '5px', borderLeft: '10px solid ' + params.value}">{{params.value}}</span>
    `
};
