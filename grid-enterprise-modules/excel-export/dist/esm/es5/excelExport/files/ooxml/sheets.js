import sheetFactory from './sheet';
var sheetsFactory = {
    getTemplate: function (names) {
        return {
            name: "sheets",
            children: names.map(function (sheet, idx) { return sheetFactory.getTemplate(sheet, idx); })
        };
    }
};
export default sheetsFactory;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2hlZXRzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL2V4Y2VsRXhwb3J0L2ZpbGVzL29veG1sL3NoZWV0cy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFDQSxPQUFPLFlBQVksTUFBTSxTQUFTLENBQUM7QUFFbkMsSUFBTSxhQUFhLEdBQXVCO0lBQ3RDLFdBQVcsRUFBWCxVQUFZLEtBQWU7UUFDdkIsT0FBTztZQUNILElBQUksRUFBRSxRQUFRO1lBQ2QsUUFBUSxFQUFFLEtBQUssQ0FBQyxHQUFHLENBQUMsVUFBQyxLQUFLLEVBQUUsR0FBRyxJQUFLLE9BQUEsWUFBWSxDQUFDLFdBQVcsQ0FBQyxLQUFLLEVBQUUsR0FBRyxDQUFDLEVBQXBDLENBQW9DLENBQUM7U0FDNUUsQ0FBQztJQUNOLENBQUM7Q0FDSixDQUFDO0FBRUYsZUFBZSxhQUFhLENBQUMifQ==