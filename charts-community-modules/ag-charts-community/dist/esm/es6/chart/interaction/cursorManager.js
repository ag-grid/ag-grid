/**
 * Manages the cursor styling for an element. Tracks the requested styling from distinct
 * dependents and handles conflicting styling requests.
 */
export class CursorManager {
    constructor(element) {
        this.states = {};
        this.element = element;
    }
    updateCursor(callerId, style) {
        delete this.states[callerId];
        if (style != null) {
            this.states[callerId] = { style };
        }
        this.applyStates();
    }
    applyStates() {
        let styleToApply = 'default';
        // Last added entry wins.
        Object.entries(this.states)
            .reverse()
            .slice(0, 1)
            .forEach(([_, { style }]) => (styleToApply = style));
        this.element.style.cursor = styleToApply;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3Vyc29yTWFuYWdlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy9jaGFydC9pbnRlcmFjdGlvbi9jdXJzb3JNYW5hZ2VyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUlBOzs7R0FHRztBQUNILE1BQU0sT0FBTyxhQUFhO0lBSXRCLFlBQW1CLE9BQW9CO1FBSHRCLFdBQU0sR0FBZ0MsRUFBRSxDQUFDO1FBSXRELElBQUksQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFDO0lBQzNCLENBQUM7SUFFTSxZQUFZLENBQUMsUUFBZ0IsRUFBRSxLQUFjO1FBQ2hELE9BQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUU3QixJQUFJLEtBQUssSUFBSSxJQUFJLEVBQUU7WUFDZixJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxHQUFHLEVBQUUsS0FBSyxFQUFFLENBQUM7U0FDckM7UUFFRCxJQUFJLENBQUMsV0FBVyxFQUFFLENBQUM7SUFDdkIsQ0FBQztJQUVPLFdBQVc7UUFDZixJQUFJLFlBQVksR0FBRyxTQUFTLENBQUM7UUFFN0IseUJBQXlCO1FBQ3pCLE1BQU0sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQzthQUN0QixPQUFPLEVBQUU7YUFDVCxLQUFLLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQzthQUNYLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsS0FBSyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxZQUFZLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQztRQUV6RCxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxNQUFNLEdBQUcsWUFBWSxDQUFDO0lBQzdDLENBQUM7Q0FDSiJ9