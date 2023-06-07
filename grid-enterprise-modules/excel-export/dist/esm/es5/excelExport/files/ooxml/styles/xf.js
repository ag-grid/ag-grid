import alignmentFactory from './alignment';
import protectionFactory from './protection';
var xfFactory = {
    getTemplate: function (xf) {
        var alignment = xf.alignment, borderId = xf.borderId, fillId = xf.fillId, fontId = xf.fontId, numFmtId = xf.numFmtId, protection = xf.protection, xfId = xf.xfId;
        var children = [];
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
                    borderId: borderId,
                    fillId: fillId,
                    applyFont: fontId ? 1 : undefined,
                    fontId: fontId,
                    applyNumberFormat: numFmtId ? 1 : undefined,
                    numFmtId: numFmtId,
                    xfId: xfId
                }
            },
            children: children.length ? children : undefined
        };
    }
};
export default xfFactory;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoieGYuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvZXhjZWxFeHBvcnQvZmlsZXMvb294bWwvc3R5bGVzL3hmLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUNBLE9BQU8sZ0JBQWdCLE1BQU0sYUFBYSxDQUFDO0FBQzNDLE9BQU8saUJBQWlCLE1BQU0sY0FBYyxDQUFDO0FBRTdDLElBQU0sU0FBUyxHQUF1QjtJQUNsQyxXQUFXLEVBQVgsVUFBWSxFQUFNO1FBQ1AsSUFBQSxTQUFTLEdBQTBELEVBQUUsVUFBNUQsRUFBRSxRQUFRLEdBQWdELEVBQUUsU0FBbEQsRUFBRSxNQUFNLEdBQXdDLEVBQUUsT0FBMUMsRUFBRSxNQUFNLEdBQWdDLEVBQUUsT0FBbEMsRUFBRSxRQUFRLEdBQXNCLEVBQUUsU0FBeEIsRUFBRSxVQUFVLEdBQVUsRUFBRSxXQUFaLEVBQUUsSUFBSSxHQUFJLEVBQUUsS0FBTixDQUFPO1FBQzdFLElBQU0sUUFBUSxHQUFpQixFQUFFLENBQUM7UUFDbEMsSUFBSSxTQUFTLEVBQUU7WUFDWCxRQUFRLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLFdBQVcsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDO1NBQzFEO1FBRUQsSUFBSSxVQUFVLEVBQUU7WUFDWixRQUFRLENBQUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLFdBQVcsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDO1NBQzVEO1FBRUQsT0FBTztZQUNILElBQUksRUFBRSxJQUFJO1lBQ1YsVUFBVSxFQUFFO2dCQUNSLE1BQU0sRUFBRTtvQkFDSixjQUFjLEVBQUUsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVM7b0JBQ3pDLGVBQWUsRUFBRSxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUztvQkFDM0MsV0FBVyxFQUFFLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTO29CQUNyQyxTQUFTLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVM7b0JBQ2pDLFFBQVEsVUFBQTtvQkFDUixNQUFNLFFBQUE7b0JBQ04sU0FBUyxFQUFFLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTO29CQUNqQyxNQUFNLFFBQUE7b0JBQ04saUJBQWlCLEVBQUUsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVM7b0JBQzNDLFFBQVEsVUFBQTtvQkFDUixJQUFJLE1BQUE7aUJBQ1A7YUFDSjtZQUNELFFBQVEsRUFBRSxRQUFRLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLFNBQVM7U0FDbkQsQ0FBQztJQUNOLENBQUM7Q0FDSixDQUFDO0FBRUYsZUFBZSxTQUFTLENBQUMifQ==