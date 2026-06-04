import { createRoot } from "react-dom/client";
import { scan } from "react-scan";
import { DomRenderer } from "../framework/dom-renderer";
import { renderComponent } from "../framework/react-renderer";
import { ReorderDemo } from "./ReorderDemo";
import "./style.css";

// Create container for side-by-side layout
const wrapper = document.createElement("div");
wrapper.className = "demo-wrapper";
document.body.appendChild(wrapper);

// DOM version
const domContainer = document.createElement("div");
domContainer.className = "demo-panel";
wrapper.appendChild(domContainer);
const domApp = new ReorderDemo("DOM Renderer");
new DomRenderer(domApp).mountRoot(domContainer);

// React version
const reactContainer = document.createElement("div");
reactContainer.className = "demo-panel";
wrapper.appendChild(reactContainer);
const reactApp = new ReorderDemo("React Renderer");

// Enable react-scan for debugging when ?debug is in URL
if (window.location.search.includes("debug")) {
  scan({ enabled: true });
}

const root = createRoot(reactContainer);
root.render(renderComponent(reactApp));
