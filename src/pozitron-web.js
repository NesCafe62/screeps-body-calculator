import { subscribe, _getListener } from 'pozitron-js';
import { $TRACK, unwrap } from './pozitron-store';

function Comment() {
	return document.createComment('');
}

const emptyItem = {};
const noopFn = () => {};
const identityFn = (el) => el;

function createFragment(items, renderFn = identityFn) {
	const el = document.createDocumentFragment();
	const elements = items.map(renderFn);
	for (const element of elements) {
		el.appendChild(element);
	}
	return el;
}

export function StaticFor(props) {
	const renderItem = props.children[0];
	return createFragment(props.each, renderItem);
	// return h('', null, props.each.map(renderItem));
}

function mapElement(value, renderFn, ref = noopFn) {
	if (typeof value !== 'function') {
		const node = renderFn(value);
		ref(node);
		return node;
	}

	let node, currentValue = NaN;
	subscribe(value, (value) => {
		if (value === currentValue) {
			return;
		}
		const newNode = renderFn(currentValue = value);
		node && node.replaceWith(newNode);
		ref(node = newNode);
	});
	return node;
}

export function Dynamic(props) {
	return mapElement(props.value, props.children[0], props.ref);
}

export function Switch(props) {
	const cases = props.children[0];

	const nodes = new Map();
	function renderFn(value) {
		const caseFn = cases[value];
		if (!caseFn) {
			return Comment();
		}
		let node = nodes.get(value);
		if (!node) {
			nodes.set(value, node = caseFn());
		}
		return node;
	}
	
	return mapElement(props.of, renderFn, props.ref);

	/* const of = props.of;
	const cases = props.children[0];
	const ref = props.ref || noopFn;

	const nodes = new Map();

	let node, value;
	function renderFn(value) {
		const caseFn = cases[value];
		if (!caseFn) {
			return Comment();
		}
		let node = nodes.get(value);
		if (!node) {
			nodes.set(value, node = caseFn());
		}
		ref(node);
		return node;
	}

	if (typeof of === 'function') {
		subscribe(of, (value) => {
			const newNode = renderFn(value);
			node.replaceWith(newNode);
			node = newNode;
		}, {defer: true});
		value = of();
	} else {
		value = of;
	}

	node = renderFn(value);
	return node; */
}

export function If(props) {
	const child = props.children[0];

	let renderThen, renderElse;
	if (typeof child === 'function') {
		renderThen = child;
		renderElse = Comment;
	} else if (Array.isArray(child)) {
		[renderThen, renderElse] = child;
	} else {
		// condition must be static for non-function children elements. todo: check and throw error
		const children = props.children;
		renderThen = children.length > 1
			? () => createFragment(children)
			: () => child;
		renderElse = Comment;
	}

	let nodeThen, nodeElse;
	function renderFn(isConditionTrue) {
		if (isConditionTrue) {
			return nodeThen || (nodeThen = renderThen());
		} else {
			return nodeElse || (nodeElse = renderElse());
		}
	}

	return mapElement(props.condition, renderFn, props.ref);

	/* const condition = props.condition;
	const child = props.children[0];
	const ref = props.ref || noopFn;

	let renderThen, renderElse;
	if (typeof child === 'function') {
		renderThen = child;
		renderElse = Comment;
	} else {
		[renderThen, renderElse] = child;
	}

	let nodeThen, nodeElse, node;

	function renderFn(isConditionTrue) {
		if (isConditionTrue) {
			return nodeThen || (nodeThen = renderThen());
		} else {
			return nodeElse || (nodeElse = renderElse());
		}
	}

	let isConditionTrue;
	if (typeof condition === 'function') {
		subscribe(condition, (value) => {
			const newIsTrue = Boolean(value);
			if (newIsTrue !== isConditionTrue) {
				isConditionTrue = newIsTrue;
				const newNode = renderFn(isConditionTrue);
				node.replaceWith(newNode);
				node = newNode;
				ref(node);
			}
		}, {defer: true});
		isConditionTrue = condition();
	} else {
		isConditionTrue = condition;
	}

	node = renderFn(isConditionTrue);
	ref(node);
	return node; */

	/* function renderFn(isConditionTrue) {
		if (isConditionTrue) {
			return renderThen();
		} else {
			return renderElse ? renderElse() : Comment();
		}
	}

	let node;
	let isConditionTrue;
	if (typeof condition === 'function') {
		subscribe(condition, (value) => {
			const newIsTrue = Boolean(value);
			if (newIsTrue !== isConditionTrue) {
				isConditionTrue = newIsTrue;
				node = render(() => renderFn(isConditionTrue), node);
				props.ref && props.ref(node);
				/ * if (nodeUpdatedFn) {
					nodeUpdatedFn(node);
				} * /
			}
		}, {defer: true});
		isConditionTrue = condition();
	} else {
		isConditionTrue = condition;
	}
	node = renderFn(isConditionTrue);
	props.ref && props.ref(node);
	/ * if (nodeUpdatedFn) {
		nodeUpdatedFn(node);
	} * /
	return node; */
}

export function Index(props) {
	const { each, key } = props;
	const getter = typeof each === 'function'
		? each
		: () => each;
	const keyFn = typeof key === 'string'
		? (item) => item[key]
		: (key || identityFn);
	const ref = props.ref || noopFn;
	const renderFn = props.children[0];
	const items = getter(); // todo: untrack(getter)
	let unwrappedItems = unwrap(items);
	const isNotStore = (unwrappedItems === items);
	let prevItems, elements;
	subscribe(
		() => {
			const items = getter();
            items[$TRACK];
			return items;
		},
		(items) => {
			// for the case when elements is not store and keys are used, because getter generates new array each update
			if (isNotStore) {
				unwrappedItems = items;
			}
			let length = unwrappedItems.length;
			const prevLength = prevItems.length;
			const parentEl = elements[0].parentNode;

			// for the case when parent element has no other children except this <Index>
			if (
				length <= 1 &&
				parentEl.firstChild === elements[0] &&
				parentEl.lastChild === elements[prevLength - 1]
			) {
				let newEl;
				if (length > 0) {
					if (keyFn(unwrappedItems[0]) === keyFn(prevItems[0])) {
						return;
					}
					newEl = renderFn(items[0], 0);
					prevItems = [unwrappedItems[0]];
				} else {
					newEl = Comment();
					prevItems = [emptyItem];
				}
				// todo: dispose reactive nodes for unmounted elements
				parentEl.textContent = ''; // clear all children
				parentEl.appendChild(newEl);
				elements = [newEl];
				ref(length > 0 ? elements : []);
				return;
			}

			if (length === 0) {
				length = 1;
				const newEl = Comment();
				elements[0].replaceWith(newEl);
				// todo: dispose reactive nodes for unmounted element
				elements[0] = newEl;
			} else {
				if (length > prevLength) {
					elements.length = length;
				}
				for (let i = 0; i < length; i++) {
					const prevItem = prevItems[i];
					if (!prevItem || keyFn(unwrappedItems[i]) !== keyFn(prevItem)) {
						const newEl = renderFn(items[i], i);
						if (!prevItem) {
							parentEl.insertBefore(newEl, elements[i - 1].nextSibling);
						} else {
							elements[i].replaceWith(newEl);
							// todo: dispose reactive nodes for unmounted element
						}
						elements[i] = newEl;
					}
				}
			}
			if (prevLength > length) {
				for (let i = prevLength - 1; i >= length; i--) {
					elements[i].remove();
					// todo: dispose reactive nodes for unmounted element
				}
				elements.splice(length);
			}

			prevItems = (unwrappedItems.length > 0)
				? unwrappedItems.slice(0)
				: [emptyItem];
			
			ref(length > 0 ? elements : []);

			/* const length = elements.length;
			const anchor = elements[0];
			for (let i = length - 1; i > 0; i--) {
				elements[i].remove();
			}
			elements = generateElements(items, renderFn);
			anchor.replaceWith(
				(elements.length > 1)
					? h('', null, elements)
					: elements[0]
			); */
		},
		{defer: true}
	);
	const length = unwrappedItems.length;
	if (length > 0) {
		prevItems = unwrappedItems.slice(0);
		const el = document.createDocumentFragment();
		/* elements = Array.from({ length });
		for (let i = 0; i < length; i++) {
			el.appendChild(elements[i] = renderFn(items[i]));
		} */
		elements = items.map(renderFn);
		for (const element of elements) {
			el.appendChild(element);
		}
		ref(elements);
		return el;
	} else {
		prevItems = [emptyItem];
		elements = [Comment()];
		ref([]);
		return elements[0];
	}
	/* if (unwrappedItems.length > 0) {
		prevItems = unwrappedItems.slice(0);
		elements = items.map(renderFn);
	} else {
		prevItems = [emptyItem];
		elements = [Comment()];
	}
	return h('', null, elements);  */
}

const itemsMap = new Map();

export function For(props) {
	const { each, key } = props;
	const getter = typeof each === 'function'
		? each
		: () => each;
	const keyFn = typeof key === 'string'
		? (item) => item[key]
		: (key || identityFn);
	const ref = props.ref || noopFn;
	const renderFn = props.children[0];
	const items = getter(); // todo: untrack(getter)
	let unwrappedItems = unwrap(items);
	const isNotStore = (unwrappedItems === items);
	let prevItems, elements;
	subscribe(
		() => {
			const items = getter();
            items[$TRACK];
			return items;
		},
		(items) => {
			// for the case when elements is not store and keys are used, because getter generates new array each update
			if (isNotStore) {
				unwrappedItems = items;
			}
			let length = unwrappedItems.length;
			const prevLength = prevItems.length;
			const parentEl = elements[0].parentNode;

			// for the case when parent element has no other children except this <For>
			if (
				length <= 1 &&
				parentEl.firstChild === elements[0] &&
				parentEl.lastChild === elements[prevLength - 1]
			) {
				let newEl;
				if (length > 0) {
					if (keyFn(unwrappedItems[0]) === keyFn(prevItems[0])) {
						return;
					}
					newEl = renderFn(items[0]);
					// console.log('render', unwrappedItems[0]);
					prevItems = [unwrappedItems[0]];
				} else {
					newEl = Comment();
					prevItems = [emptyItem];
				}
				// todo: dispose reactive nodes for unmounted element
				parentEl.textContent = ''; // clear all children
				// console.log('clear all children');
				parentEl.appendChild(newEl);
				elements = [newEl];
				ref(length > 0 ? elements : []);
				return;
			}

			if (length === 0) {
				// length = 1;
				const newEl = Comment();
				elements[0].replaceWith(newEl);

				for (let i = prevLength - 1; i >= 1; i--) {
					elements[i].remove();
					// console.log('delete', prevItems[i], elements[i].textContent);
					// todo: dispose reactive nodes for unmounted element
				}

				elements = [newEl];
			} else {
				let start = 0;
				const minLength = Math.min(length, prevLength);
				while (start < minLength && keyFn(prevItems[start]) === keyFn(unwrappedItems[start])) {
					start++;
				}

				// all elements are equal
				if (start >= length && length >= prevLength) {
					return;
				}

				let end = length;
				let prevEnd = prevLength;
				while (end > start && prevEnd > start && keyFn(prevItems[prevEnd - 1]) === keyFn(unwrappedItems[end - 1])) {
					end--;
					prevEnd--;
				}
				
				// 0 0 1
				// 0 1 2

				// |---common head---|----prev diff range----|---common tail---|
				// ^                 ^                       ^                 ^
				// 0               start                  prevEnd         prevLength
				// 
				// |---common head---|--new diff range--|---common tail---|
				// ^                 ^                  ^                 ^
				// 0               start               end              length

				const needInsert = (end > start); // [new diff range] not empty
				const prevDiffLength = prevEnd - start;
				let anchorEl = undefined;
				if (needInsert) {
					anchorEl = prevEnd > 0
						? elements[prevEnd - 1].nextSibling
						: elements[prevEnd];
				}

				let prevDiffElements;
				// detach elements of [prev diff range]
				if (needInsert && prevDiffLength > 0) {
					// copying [prev diff range] because elements will be overwritten
					prevDiffElements = elements.slice(start, prevEnd);
					for (let i = prevEnd - 1; i >= start; i--) {
						elements[i].remove();
						// console.log('detach', prevItems[i], elements[i].textContent);
						itemsMap.set(keyFn(prevItems[i]), i - start);
					}
				} else {
					for (let i = prevEnd - 1; i >= start; i--) {
						elements[i].remove();
						// console.log('delete', prevItems[i], elements[i].textContent);
						// dispose elements[i];
					}
				}
				if (prevLength > length) { // [new diff range] is shorter
					// shorten [prev diff range] to match new length
					// [common tail] will become starting from index 'end'
					elements.splice(end, prevLength - length);
				}

				if (needInsert) {
					if (prevLength < length) { // [new diff range] is larger
						elements.length = length; // increase length
						// copy [common tail] towards the end of new length
						elements.copyWithin(end, prevEnd, prevLength);
					}
					const insertFragment = document.createDocumentFragment();
					for (let i = start; i < end; i++) {
						// const prevItem = prevItems[i];
						const itemKey = keyFn(unwrappedItems[i]);
						let newEl; //, prevIndex;
						if (prevDiffLength > 0 && itemsMap.has(itemKey)) {
							const prevIndex = itemsMap.get(itemKey);
							newEl = prevDiffElements[prevIndex];
							prevDiffElements[prevIndex] = undefined;
							if (!newEl) {
								throw new Error('For duplicate key detected: ' + JSON.stringify(itemKey));
							}
						} else {
							newEl = renderFn(items[i]);
							// console.log('render', item);
						}
						insertFragment.appendChild(newEl);
						elements[i] = newEl;
					}
					// todo: dispose reactive nodes for unmounted element
					for (let i = 0; i < prevDiffLength; i++) {
						if (!prevDiffElements[i]) { // element was not reinserted
							// dispose prevDiffElements[i];
						}
					}
					parentEl.insertBefore(insertFragment, anchorEl);
					if (prevDiffLength > 0) {
						itemsMap.clear();
					}
				}
			}

			prevItems = (unwrappedItems.length > 0)
				? unwrappedItems.slice(0)
				: [emptyItem];

			ref(length > 0 ? elements : []);

			/* const length = elements.length;
			const anchor = elements[0];
			for (let i = length - 1; i > 0; i--) {
				elements[i].remove();
			}
			elements = generateElements(items, renderFn);
			anchor.replaceWith(
				(elements.length > 1)
					? h('', null, elements)
					: elements[0]
			); */
		},
		{defer: true}
	);
	const length = unwrappedItems.length;
	if (length > 0) {
		prevItems = unwrappedItems.slice(0);
		const el = document.createDocumentFragment();
		/* elements = Array.from({ length });
		for (let i = 0; i < length; i++) {
			el.appendChild(elements[i] = renderFn(items[i]));
		} */
		elements = items.map(renderFn);
		for (const element of elements) {
			el.appendChild(element);
		}
		ref(elements);
		return el;
	} else {
		prevItems = [emptyItem];
		elements = [Comment()];
		ref([]);
		return elements[0];
	}
	/* if (unwrappedItems.length > 0) {
		prevItems = unwrappedItems.slice(0);
		elements = items.map(renderFn);
	} else {
		prevItems = [emptyItem];
		elements = [Comment()];
	}
	return h('', null, elements); */
}