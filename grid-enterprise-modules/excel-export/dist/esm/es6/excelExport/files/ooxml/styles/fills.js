import fillFactory from './fill';
const fillsFactory = {
    getTemplate(fills) {
        return {
            name: "fills",
            properties: {
                rawMap: {
                    count: fills.length
                }
            },
            children: fills.map(fill => fillFactory.getTemplate(fill))
        };
    }
};
export default fillsFactory;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmlsbHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvZXhjZWxFeHBvcnQvZmlsZXMvb294bWwvc3R5bGVzL2ZpbGxzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUVBLE9BQU8sV0FBVyxNQUFNLFFBQVEsQ0FBQztBQUVqQyxNQUFNLFlBQVksR0FBdUI7SUFDckMsV0FBVyxDQUFDLEtBQWE7UUFDckIsT0FBTztZQUNILElBQUksRUFBRSxPQUFPO1lBQ2IsVUFBVSxFQUFFO2dCQUNSLE1BQU0sRUFBRTtvQkFDSixLQUFLLEVBQUUsS0FBSyxDQUFDLE1BQU07aUJBQ3RCO2FBQ0o7WUFDRCxRQUFRLEVBQUUsS0FBSyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLFdBQVcsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLENBQUM7U0FDN0QsQ0FBQztJQUNOLENBQUM7Q0FDSixDQUFDO0FBRUYsZUFBZSxZQUFZLENBQUMifQ==