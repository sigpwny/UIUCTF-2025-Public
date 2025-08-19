import { escapeHTML } from "bun";

export function render(element: any): string {
  if (typeof element === "string" || typeof element === "number") {
    return escapeHTML(element);
  }

  if (!element || typeof element !== "object" || !element.type) {
    return "";
  }

  const { type, props } = element;

  if (typeof type === "function") {
    return render(type(props));
  }

  let children = "";
  if (props && props.children) {
    if (Array.isArray(props.children)) {
      children = props.children.map(render).join("");
    } else {
      children = render(props.children);
    }
  }

  const propString = props
    ? Object.entries(props)
        .filter(([key]) => key !== "children")
        .map(([key, value]) => {
          if (typeof value === "boolean") {
            return value ? key : "";
          }
          return `${key}="${String(value).replace('"', "&quot;")}"`;
        })
        .filter(Boolean)
        .join(" ")
    : "";

  const openTag = propString ? `<${type} ${propString}>` : `<${type}>`;

  return `${openTag}${children}</${type}>`;
}
