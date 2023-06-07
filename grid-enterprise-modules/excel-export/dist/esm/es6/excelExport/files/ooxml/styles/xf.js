import alignmentFactory from './alignment';
import protectionFactory from './protection';
const xfFactory = {
    getTemplate(xf) {
        const { alignment, borderId, fillId, fontId, numFmtId, protection, xfId } = xf;
        const children = [];
        if (alignment) {
            children.push(alignmentFactory.getTemplate(alignment));
        }
        if (protection) {
            children.push(protectionFactory.getTemplate(protection));
        }
        return {
            name: "xf",
            properties: {
                rawMap: {
                    applyAlignment: alignment ? 1 : undefined,
                    applyProtection: protection ? 1 : undefined,
                    applyBorder: borderId ? 1 : undefined,
                    applyFill: fillId ? 1 : undefined,
                    borderId,
                    fillId,
                    applyFont: fontId ? 1 : undefined,
                    fontId,
                    applyNumberFormat: numFmtId ? 1 : undefined,
                    numFmtId,
                    xfId
                }
            },
            children: children.length ? children : undefined
        };
    }
};
export default xfFactory;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoieGYuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvZXhjZWxFeHBvcnQvZmlsZXMvb294bWwvc3R5bGVzL3hmLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUNBLE9BQU8sZ0JBQWdCLE1BQU0sYUFBYSxDQUFDO0FBQzNDLE9BQU8saUJBQWlCLE1BQU0sY0FBYyxDQUFDO0FBRTdDLE1BQU0sU0FBUyxHQUF1QjtJQUNsQyxXQUFXLENBQUMsRUFBTTtRQUNkLE1BQU0sRUFBQyxTQUFTLEVBQUUsUUFBUSxFQUFFLE1BQU0sRUFBRSxNQUFNLEVBQUUsUUFBUSxFQUFFLFVBQVUsRUFBRSxJQUFJLEVBQUMsR0FBRyxFQUFFLENBQUM7UUFDN0UsTUFBTSxRQUFRLEdBQWlCLEVBQUUsQ0FBQztRQUNsQyxJQUFJLFNBQVMsRUFBRTtZQUNYLFFBQVEsQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsV0FBVyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUM7U0FDMUQ7UUFFRCxJQUFJLFVBQVUsRUFBRTtZQUNaLFFBQVEsQ0FBQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsV0FBVyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUM7U0FDNUQ7UUFFRCxPQUFPO1lBQ0gsSUFBSSxFQUFFLElBQUk7WUFDVixVQUFVLEVBQUU7Z0JBQ1IsTUFBTSxFQUFFO29CQUNKLGNBQWMsRUFBRSxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUztvQkFDekMsZUFBZSxFQUFFLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTO29CQUMzQyxXQUFXLEVBQUUsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVM7b0JBQ3JDLFNBQVMsRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUztvQkFDakMsUUFBUTtvQkFDUixNQUFNO29CQUNOLFNBQVMsRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUztvQkFDakMsTUFBTTtvQkFDTixpQkFBaUIsRUFBRSxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUztvQkFDM0MsUUFBUTtvQkFDUixJQUFJO2lCQUNQO2FBQ0o7WUFDRCxRQUFRLEVBQUUsUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxTQUFTO1NBQ25ELENBQUM7SUFDTixDQUFDO0NBQ0osQ0FBQztBQUVGLGVBQWUsU0FBUyxDQUFDIn0=