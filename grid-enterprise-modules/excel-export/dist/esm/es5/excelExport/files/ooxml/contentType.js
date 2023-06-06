var contentTypeFactory = {
    getTemplate: function (config) {
        var name = config.name, ContentType = config.ContentType, Extension = config.Extension, PartName = config.PartName;
        return {
            name: name,
            properties: {
                rawMap: {
                    Extension: Extension,
                    PartName: PartName,
                    ContentType: ContentType
                }
            }
        };
    }
};
export default contentTypeFactory;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29udGVudFR5cGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvZXhjZWxFeHBvcnQvZmlsZXMvb294bWwvY29udGVudFR5cGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBRUEsSUFBTSxrQkFBa0IsR0FBdUI7SUFDM0MsV0FBVyxFQUFYLFVBQVksTUFBd0I7UUFDekIsSUFBQSxJQUFJLEdBQXNDLE1BQU0sS0FBNUMsRUFBRSxXQUFXLEdBQXlCLE1BQU0sWUFBL0IsRUFBRSxTQUFTLEdBQWMsTUFBTSxVQUFwQixFQUFFLFFBQVEsR0FBSSxNQUFNLFNBQVYsQ0FBVztRQUV4RCxPQUFPO1lBQ0gsSUFBSSxNQUFBO1lBQ0osVUFBVSxFQUFFO2dCQUNSLE1BQU0sRUFBRTtvQkFDSixTQUFTLFdBQUE7b0JBQ1QsUUFBUSxVQUFBO29CQUNSLFdBQVcsYUFBQTtpQkFDZDthQUNKO1NBQ0osQ0FBQztJQUNOLENBQUM7Q0FDSixDQUFDO0FBRUYsZUFBZSxrQkFBa0IsQ0FBQyJ9