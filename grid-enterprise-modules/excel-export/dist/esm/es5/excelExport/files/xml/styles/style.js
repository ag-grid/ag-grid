var style = {
    getTemplate: function (styleProperties) {
        var id = styleProperties.id, name = styleProperties.name;
        return {
            name: 'Style',
            properties: {
                prefixedAttributes: [{
                        prefix: "ss:",
                        map: {
                            ID: id,
                            Name: name ? name : id
                        }
                    }]
            }
        };
    }
};
export default style;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3R5bGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvZXhjZWxFeHBvcnQvZmlsZXMveG1sL3N0eWxlcy9zdHlsZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFFQSxJQUFNLEtBQUssR0FBcUI7SUFDNUIsV0FBVyxFQUFYLFVBQVksZUFBMkI7UUFDM0IsSUFBQSxFQUFFLEdBQVcsZUFBZSxHQUExQixFQUFFLElBQUksR0FBSyxlQUFlLEtBQXBCLENBQXFCO1FBQ3JDLE9BQU87WUFDSCxJQUFJLEVBQUUsT0FBTztZQUNiLFVBQVUsRUFBRTtnQkFDUixrQkFBa0IsRUFBQyxDQUFDO3dCQUNoQixNQUFNLEVBQUUsS0FBSzt3QkFDYixHQUFHLEVBQUU7NEJBQ0QsRUFBRSxFQUFFLEVBQUU7NEJBQ04sSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFO3lCQUMxQjtxQkFDSixDQUFDO2FBQ0w7U0FDSixDQUFDO0lBQ04sQ0FBQztDQUNKLENBQUM7QUFFRixlQUFlLEtBQUssQ0FBQyJ9