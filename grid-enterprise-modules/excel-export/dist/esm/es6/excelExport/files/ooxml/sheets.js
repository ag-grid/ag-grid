import sheetFactory from './sheet';
const sheetsFactory = {
    getTemplate(names) {
        return {
            name: "sheets",
            children: names.map((sheet, idx) => sheetFactory.getTemplate(sheet, idx))
        };
    }
};
export default sheetsFactory;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2hlZXRzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL2V4Y2VsRXhwb3J0L2ZpbGVzL29veG1sL3NoZWV0cy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFDQSxPQUFPLFlBQVksTUFBTSxTQUFTLENBQUM7QUFFbkMsTUFBTSxhQUFhLEdBQXVCO0lBQ3RDLFdBQVcsQ0FBQyxLQUFlO1FBQ3ZCLE9BQU87WUFDSCxJQUFJLEVBQUUsUUFBUTtZQUNkLFFBQVEsRUFBRSxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsS0FBSyxFQUFFLEdBQUcsRUFBRSxFQUFFLENBQUMsWUFBWSxDQUFDLFdBQVcsQ0FBQyxLQUFLLEVBQUUsR0FBRyxDQUFDLENBQUM7U0FDNUUsQ0FBQztJQUNOLENBQUM7Q0FDSixDQUFDO0FBRUYsZUFBZSxhQUFhLENBQUMifQ==