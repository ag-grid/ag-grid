const contentTypeFactory = {
    getTemplate(config) {
        const { name, ContentType, Extension, PartName } = config;
        return {
            name,
            properties: {
                rawMap: {
                    Extension,
                    PartName,
                    ContentType
                }
            }
        };
    }
};
export default contentTypeFactory;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29udGVudFR5cGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvZXhjZWxFeHBvcnQvZmlsZXMvb294bWwvY29udGVudFR5cGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBRUEsTUFBTSxrQkFBa0IsR0FBdUI7SUFDM0MsV0FBVyxDQUFDLE1BQXdCO1FBQ2hDLE1BQU0sRUFBQyxJQUFJLEVBQUUsV0FBVyxFQUFFLFNBQVMsRUFBRSxRQUFRLEVBQUMsR0FBRyxNQUFNLENBQUM7UUFFeEQsT0FBTztZQUNILElBQUk7WUFDSixVQUFVLEVBQUU7Z0JBQ1IsTUFBTSxFQUFFO29CQUNKLFNBQVM7b0JBQ1QsUUFBUTtvQkFDUixXQUFXO2lCQUNkO2FBQ0o7U0FDSixDQUFDO0lBQ04sQ0FBQztDQUNKLENBQUM7QUFFRixlQUFlLGtCQUFrQixDQUFDIn0=