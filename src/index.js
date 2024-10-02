/* @refresh reload */
import App from "./App";

if (document.readyState === "loading") {
	document.addEventListener('DOMContentLoaded', App);
} else {
	App();
}

/* const root = document.getElementById('app');

if (import.meta.env.DEV && !(root instanceof HTMLElement)) {
	throw new Error('#app element not found');
}

render(App, root); */