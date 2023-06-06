import { Square } from './square';
import { Circle } from './circle';
import { Cross } from './cross';
import { Diamond } from './diamond';
import { Heart } from './heart';
import { Plus } from './plus';
import { Triangle } from './triangle';
// This function is in its own file because putting it into SeriesMarker makes the Legend
// suddenly aware of the series (it's an agnostic component), and putting it into Marker
// introduces circular dependencies.
export function getMarker(shape) {
    if (shape === void 0) { shape = Square; }
    if (typeof shape === 'string') {
        switch (shape) {
            case 'circle':
                return Circle;
            case 'cross':
                return Cross;
            case 'diamond':
                return Diamond;
            case 'heart':
                return Heart;
            case 'plus':
                return Plus;
            case 'triangle':
                return Triangle;
            default:
                return Square;
        }
    }
    if (typeof shape === 'function') {
        return shape;
    }
    return Square;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy9jaGFydC9tYXJrZXIvdXRpbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsTUFBTSxFQUFFLE1BQU0sVUFBVSxDQUFDO0FBQ2xDLE9BQU8sRUFBRSxNQUFNLEVBQUUsTUFBTSxVQUFVLENBQUM7QUFDbEMsT0FBTyxFQUFFLEtBQUssRUFBRSxNQUFNLFNBQVMsQ0FBQztBQUNoQyxPQUFPLEVBQUUsT0FBTyxFQUFFLE1BQU0sV0FBVyxDQUFDO0FBQ3BDLE9BQU8sRUFBRSxLQUFLLEVBQUUsTUFBTSxTQUFTLENBQUM7QUFDaEMsT0FBTyxFQUFFLElBQUksRUFBRSxNQUFNLFFBQVEsQ0FBQztBQUM5QixPQUFPLEVBQUUsUUFBUSxFQUFFLE1BQU0sWUFBWSxDQUFDO0FBR3RDLHlGQUF5RjtBQUN6Rix3RkFBd0Y7QUFDeEYsb0NBQW9DO0FBQ3BDLE1BQU0sVUFBVSxTQUFTLENBQUMsS0FBbUI7SUFBbkIsc0JBQUEsRUFBQSxjQUFtQjtJQUN6QyxJQUFJLE9BQU8sS0FBSyxLQUFLLFFBQVEsRUFBRTtRQUMzQixRQUFRLEtBQUssRUFBRTtZQUNYLEtBQUssUUFBUTtnQkFDVCxPQUFPLE1BQU0sQ0FBQztZQUNsQixLQUFLLE9BQU87Z0JBQ1IsT0FBTyxLQUFLLENBQUM7WUFDakIsS0FBSyxTQUFTO2dCQUNWLE9BQU8sT0FBTyxDQUFDO1lBQ25CLEtBQUssT0FBTztnQkFDUixPQUFPLEtBQUssQ0FBQztZQUNqQixLQUFLLE1BQU07Z0JBQ1AsT0FBTyxJQUFJLENBQUM7WUFDaEIsS0FBSyxVQUFVO2dCQUNYLE9BQU8sUUFBUSxDQUFDO1lBQ3BCO2dCQUNJLE9BQU8sTUFBTSxDQUFDO1NBQ3JCO0tBQ0o7SUFFRCxJQUFJLE9BQU8sS0FBSyxLQUFLLFVBQVUsRUFBRTtRQUM3QixPQUFPLEtBQUssQ0FBQztLQUNoQjtJQUVELE9BQU8sTUFBTSxDQUFDO0FBQ2xCLENBQUMifQ==