import fontFactory from './font';
var fontsFactory = {
    getTemplate: function (fonts) {
        return {
            name: "fonts",
            properties: {
                rawMap: {
                    count: fonts.length
                }
            },
            children: fonts.map(function (font) { return fontFactory.getTemplate(font); })
        };
    }
};
export default fontsFactory;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZm9udHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvZXhjZWxFeHBvcnQvZmlsZXMvb294bWwvc3R5bGVzL2ZvbnRzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUVBLE9BQU8sV0FBVyxNQUFNLFFBQVEsQ0FBQztBQUVqQyxJQUFNLFlBQVksR0FBdUI7SUFDckMsV0FBVyxFQUFYLFVBQVksS0FBdUI7UUFDL0IsT0FBTztZQUNILElBQUksRUFBRSxPQUFPO1lBQ2IsVUFBVSxFQUFFO2dCQUNSLE1BQU0sRUFBRTtvQkFDSixLQUFLLEVBQUUsS0FBSyxDQUFDLE1BQU07aUJBQ3RCO2FBQ0o7WUFDRCxRQUFRLEVBQUUsS0FBSyxDQUFDLEdBQUcsQ0FBQyxVQUFBLElBQUksSUFBSSxPQUFBLFdBQVcsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLEVBQTdCLENBQTZCLENBQUM7U0FDN0QsQ0FBQztJQUNOLENBQUM7Q0FDSixDQUFDO0FBRUYsZUFBZSxZQUFZLENBQUMifQ==