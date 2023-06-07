import fontFactory from './font';
const fontsFactory = {
    getTemplate(fonts) {
        return {
            name: "fonts",
            properties: {
                rawMap: {
                    count: fonts.length
                }
            },
            children: fonts.map(font => fontFactory.getTemplate(font))
        };
    }
};
export default fontsFactory;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZm9udHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvZXhjZWxFeHBvcnQvZmlsZXMvb294bWwvc3R5bGVzL2ZvbnRzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUVBLE9BQU8sV0FBVyxNQUFNLFFBQVEsQ0FBQztBQUVqQyxNQUFNLFlBQVksR0FBdUI7SUFDckMsV0FBVyxDQUFDLEtBQXVCO1FBQy9CLE9BQU87WUFDSCxJQUFJLEVBQUUsT0FBTztZQUNiLFVBQVUsRUFBRTtnQkFDUixNQUFNLEVBQUU7b0JBQ0osS0FBSyxFQUFFLEtBQUssQ0FBQyxNQUFNO2lCQUN0QjthQUNKO1lBQ0QsUUFBUSxFQUFFLEtBQUssQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxXQUFXLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxDQUFDO1NBQzdELENBQUM7SUFDTixDQUFDO0NBQ0osQ0FBQztBQUVGLGVBQWUsWUFBWSxDQUFDIn0=