import { voidSignal, _getListener } from 'pozitron-js';

const $PROXY = Symbol('pozitron-proxy');
const $NODE = Symbol('pozitron-node');
const $RAW = Symbol('pozitron-raw');
export const $TRACK = Symbol('pozitron-track');

function isWrappable(value) {
	return (
		value !== null &&
		typeof value === 'object'
	);
}

function getDataNodes(target) {
	let nodes = target[$NODE];
	if (!nodes) {
		Object.defineProperty(target, $NODE, {
			value: (nodes = new Map()),
		});
	}
	return nodes;
}

function trackProperty(target, property) {
	const nodes = getDataNodes(target);
	let track = nodes.get(property);
	if (!track) {
		const [s, notifyS] = voidSignal();
		s.$notify = notifyS;
		nodes.set(property, s);
		track = s;
	}
	track();
}

function notifyProperty(nodes, property) {
	const track = nodes.get(property);
	if (track) {
		track.$notify();
	}
}

const proxyHandlers = {
	get: function(target, property, receiver) {
		if (property === $TRACK) {
			if (_getListener()) {
				trackProperty(target, $TRACK);
			}
			return receiver;
		}
		if (property === $RAW) {
			return target;
		}
		let value = target[property];
		if (
			property === '__proto__' ||
			typeof value === 'function'
		) {
			return value;
		}
		if (_getListener()) {
			trackProperty(target, property);
		}
		return isWrappable(value) ? store(value) : value;
	},

	has: function(target, property) {
		if (
			property === $TRACK ||
			property === $RAW ||
			property === '__proto__'
		) {
			return true;
		}
		this.get(target, property, target);
		return property in target;
	},

	set: function(target, property, value, receiver) {
		const val = unwrap(value);
		if (target[property] === val) {
			return true;
		}
		target[property] = val;
		const nodes = target[$NODE]; // getDataNodes(target);
		if (nodes) {
			notifyProperty(nodes, property);
			notifyProperty(nodes, $TRACK);
		}
		return true;
	},

	deleteProperty: function (target, property) {
		if (!(property in target)) {
			return true;
		}
		delete target[property];
		const nodes = target[$NODE]; // getDataNodes(target);
		if (nodes) {
			notifyProperty(nodes, property);
			notifyProperty(nodes, $TRACK);
		}
		return true;
	},

	ownKeys: function (target) {
		if (_getListener()) {
			trackProperty(target, $TRACK);
		}
		return Reflect.ownKeys(target);
	},

	/* proxyDescriptor: function(target, property) {
		return Reflect.getOwnPropertyDescriptor(target, property);
	}, */
};

const proxyHandlersShallow = {
	get: function(target, property, receiver) {
		if (property === $TRACK) {
			if (_getListener()) {
				trackProperty(target, $TRACK);
			}
			return receiver;
		}
		if (property === $RAW) {
			return target;
		}
		let value = target[property];
		if (
			property === '__proto__' ||
			typeof value === 'function'
		) {
			return value;
		}
		if (_getListener()) {
			trackProperty(target, property);
		}
		return value;
	},
	has: proxyHandlers.has,

	set: proxyHandlers.set,
	deleteProperty: proxyHandlers.deleteProperty,
	ownKeys: proxyHandlers.ownKeys,
};

const proxyHandlersArray = {

	get: proxyHandlers.get,
	has: proxyHandlers.has,

	set: function(target, property, value, receiver) {
		const val = unwrap(value);
		if (target[property] === val) {
			return true;
		}
		const prevLength = target.length;
		target[property] = val;
		const nodes = target[$NODE]; // getDataNodes(target);
		if (nodes) {
			notifyProperty(nodes, property);
			if (target.length !== prevLength) {
				for (let i = target.length; i < prevLength; i++) {
					notifyProperty(nodes, i);
				}
				notifyProperty(nodes, 'length');
			}
			notifyProperty(nodes, $TRACK);
		}
		return true;
	},

	deleteProperty: function(target, property) {
		if (!(property in target)) {
			return true;
		}
		const prevLength = target.length;
		delete target[property];
		const nodes = target[$NODE]; // getDataNodes(target);
		if (nodes) {
			notifyProperty(nodes, property);
			if (target.length !== prevLength) {
				for (let i = target.length; i < prevLength; i++) {
					notifyProperty(nodes, i);
				}
				notifyProperty(nodes, 'length');
			}
			notifyProperty(nodes, $TRACK);
		}
		return true;
	},

	ownKeys: proxyHandlers.ownKeys,

	// proxyDescriptor: proxyHandlers.proxyDescriptor,

};

const proxyHandlersShallowArray = {
	
	get: proxyHandlersShallow.get,
	has: proxyHandlers.has,

	set: proxyHandlersArray.set,
	deleteProperty: proxyHandlersArray.deleteProperty,
	ownKeys: proxyHandlersArray.ownKeys,

};

function wrap(value) {
	const handlers = Array.isArray(value) ? proxyHandlersArray : proxyHandlers;
	const proxy = new Proxy(value, handlers);
	Object.defineProperty(value, $PROXY, {value: proxy});
	return proxy;
}

function wrapShallow(value) {
	const handlers = Array.isArray(value) ? proxyHandlersShallowArray : proxyHandlersShallow;
	const proxy = new Proxy(value, handlers);
	Object.defineProperty(value, $PROXY, {value: proxy});
	return proxy;
}

export function unwrap(value) {
	if (!isWrappable(value)) {
		return value;
	}
	return value[$RAW] || value;
}

export function shallowStore(value) {
	return value[$PROXY] || wrapShallow(value);
}

export function store(value, options = {}) {
	if (options.shallow) {
		return shallowStore(value);
	}
	return value[$PROXY] || wrap(value);
}

export function notifiableStore(fn) {
	const [track, notify] = voidSignal();
	return [fn(track), notify, track];
}