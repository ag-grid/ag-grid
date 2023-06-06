import fillFactory from './fill';
var fillsFactory = {
    getTemplate: function (fills) {
        return {
            name: "fills",
            properties: {
                rawMap: {
                    count: fills.length
                }
            },
            children: fills.map(function (fill) { return fillFactory.getTemplate(fill); })
        };
    }
};
export default fillsFactory;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmlsbHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvZXhjZWxFeHBvcnQvZmlsZXMvb294bWwvc3R5bGVzL2ZpbGxzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUVBLE9BQU8sV0FBVyxNQUFNLFFBQVEsQ0FBQztBQUVqQyxJQUFNLFlBQVksR0FBdUI7SUFDckMsV0FBVyxFQUFYLFVBQVksS0FBYTtRQUNyQixPQUFPO1lBQ0gsSUFBSSxFQUFFLE9BQU87WUFDYixVQUFVLEVBQUU7Z0JBQ1IsTUFBTSxFQUFFO29CQUNKLEtBQUssRUFBRSxLQUFLLENBQUMsTUFBTTtpQkFDdEI7YUFDSjtZQUNELFFBQVEsRUFBRSxLQUFLLENBQUMsR0FBRyxDQUFDLFVBQUEsSUFBSSxJQUFJLE9BQUEsV0FBVyxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsRUFBN0IsQ0FBNkIsQ0FBQztTQUM3RCxDQUFDO0lBQ04sQ0FBQztDQUNKLENBQUM7QUFFRixlQUFlLFlBQVksQ0FBQyJ9