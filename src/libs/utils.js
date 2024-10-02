export function delegateEvent(containerEl, selector, eventType, fn) {
	containerEl.addEventListener(eventType, function(event) {
		const el = event.target.closest(selector);
		if (el) {
			fn(el, event);
		}
	});
}

export function clamp(value, min, max) {
	if (value < min) {
		return min;
	}
	if (value > max) {
		return max;
	}
	return value;
}

function bindProps(el, props) {
	for (let prop in props) {
		if (prop === 'children') {
			continue;
		}
		const value = props[prop];
		(typeof value === 'function')
			? $bindAttr(el, prop, value)
			: el.setAttribute(prop, value);
	}
}

export function Svg(props) {
	const children = props.children || [];
	const el = document.createElementNS('http://www.w3.org/2000/svg', props.tag || 'svg');
	bindProps(el, props);
	for (const child of children) {
		el.appendChild(child);
	}
	return el;
}