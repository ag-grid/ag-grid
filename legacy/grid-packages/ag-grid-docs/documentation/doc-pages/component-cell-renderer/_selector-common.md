<framework-specific-section frameworks="javascript,angular,react">
<snippet transform={false}>
|cellRendererSelector: params => {
|    return {
|        component: GenderCellRenderer,
|        params: {values: ['Male', 'Female']}
|    };
|}
</snippet>

However a selector only makes sense when a selection is made. The following demonstrates selecting between Mood and Gender Cell Renderers:

<snippet transform={false}>
|cellRendererSelector: params => {
|
|    const type = params.data.type;
|
|    if (type === 'gender') {
|        return {
|            component: GenderCellRenderer,
|            params: {values: ['Male', 'Female']}
|        };
|    }
|
|    if (type === 'mood') {
|        return {
|            component: MoodCellRenderer
|        };
|    }
|
|    return undefined;
|}
</snippet>
</framework-specific-section>