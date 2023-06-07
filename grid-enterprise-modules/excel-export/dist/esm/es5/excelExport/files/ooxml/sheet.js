var sheetFactory = {
    getTemplate: function (name, idx) {
        var sheetId = (idx + 1).toString();
        return {
            name: "sheet",
            properties: {
                rawMap: {
                    "name": name,
                    "sheetId": sheetId,
                    "r:id": "rId" + sheetId
                }
            }
        };
    }
};
export default sheetFactory;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2hlZXQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvZXhjZWxFeHBvcnQvZmlsZXMvb294bWwvc2hlZXQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBRUEsSUFBTSxZQUFZLEdBQXVCO0lBQ3JDLFdBQVcsRUFBWCxVQUFZLElBQVksRUFBRSxHQUFXO1FBQ2pDLElBQU0sT0FBTyxHQUFHLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDO1FBQ3JDLE9BQU87WUFDSCxJQUFJLEVBQUUsT0FBTztZQUNiLFVBQVUsRUFBRTtnQkFDUixNQUFNLEVBQUU7b0JBQ0osTUFBTSxFQUFFLElBQUk7b0JBQ1osU0FBUyxFQUFFLE9BQU87b0JBQ2xCLE1BQU0sRUFBRSxRQUFNLE9BQVM7aUJBQzFCO2FBQ0o7U0FDSixDQUFDO0lBQ04sQ0FBQztDQUNKLENBQUM7QUFFRixlQUFlLFlBQVksQ0FBQyJ9