let element = null;
export function sanitizeHtml(text) {
    element = element !== null && element !== void 0 ? element : document.createElement('div');
    if (!text) {
        return '';
    }
    element.textContent = text;
    return element.innerHTML;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2FuaXRpemUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvdXRpbC9zYW5pdGl6ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxJQUFJLE9BQU8sR0FBdUIsSUFBSSxDQUFDO0FBRXZDLE1BQU0sVUFBVSxZQUFZLENBQUMsSUFBYTtJQUN0QyxPQUFPLEdBQUcsT0FBTyxhQUFQLE9BQU8sY0FBUCxPQUFPLEdBQUksUUFBUSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUNuRCxJQUFJLENBQUMsSUFBSSxFQUFFO1FBQ1AsT0FBTyxFQUFFLENBQUM7S0FDYjtJQUNELE9BQU8sQ0FBQyxXQUFXLEdBQUcsSUFBSSxDQUFDO0lBQzNCLE9BQU8sT0FBTyxDQUFDLFNBQVMsQ0FBQztBQUM3QixDQUFDIn0=