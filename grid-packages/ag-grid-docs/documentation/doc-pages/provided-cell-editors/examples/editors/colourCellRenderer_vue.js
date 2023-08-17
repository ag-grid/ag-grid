export default {
    template: `
        <div>
            <span :style="{paddingRight: '5px', borderLeft: '10px solid ' + params.value}"></span>
            {{params.value}}
        </div>
    `
};
