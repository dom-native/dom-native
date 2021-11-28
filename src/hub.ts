import { ensureArray, splitAndTrim } from './utils.js';

// TODO: need a common one for DOM and Hub Events (same structure)
interface NsObject {
	ns: string
};

interface HubOptions {
	ns?: string;
	ctx?: any;
}

//#region    ---------- Public Types ---------- 

export type HubListener = (data: any, info: HubEventInfo) => void;
export type HubListenerByFullSelector = { [selector: string]: HubListener };
export type HubListenerByHubNameBySelector = { [hubName: string]: { [selector: string]: HubListener } };

export type HubBindings = HubListenerByFullSelector | HubListenerByHubNameBySelector | (HubListenerByFullSelector | HubListenerByHubNameBySelector)[];

export interface HubEventInfo {
	topic: string;
	label: string;
}

export interface Hub {
	sub(topics: string, handler: HubListener, opts?: HubOptions): void;
	sub(topics: string, labels: string | undefined | null, handler: HubListener, opts?: HubOptions): void;

	/** Publish a message to a hub for a given topic  */
	pub(topic: string, message: any): void;
	/** Publish a message to a hub for a given topic and label  */
	pub(topic: string, label: string, message: any): void;

	unsub(ns: NsObject): void;
}

//#endregion ---------- /Public Types ---------- 

//#region    ---------- Public bindHubEvents ---------- 

export function addHubEvents(target: HubBindings | undefined, source: HubBindings) {
	const t: HubBindings = (target == null) ? [] : (target instanceof Array) ? target : [target];
	(source instanceof Array) ? t.push(...source) : t.push(source);
	return t;
}


export function bindHubEvents(bindings: HubBindings, opts?: HubOptions) {

	const bindingList = (bindings instanceof Array) ? bindings : [bindings];
	for (const bindings of bindingList) {

		const infoList = listHubInfos(bindings);

		infoList.forEach(function (info) {
			info.hub.sub(info.topics, info.labels, info.fun, opts);
		});
	}
}

/**
 * Unbinding a list of bindings. For now, MUST have nsObject.
 * @param bindings 
 * @param nsObject 
 */
export function unbindHubEvents(bindings: HubBindings, nsObject: NsObject) {
	const bindingList = (bindings instanceof Array) ? bindings : [bindings];
	bindingList.forEach(function (hubEvents) {
		const infoList = listHubInfos(hubEvents);
		infoList.forEach(function (info) {
			info.hub.unsub(nsObject);
		});
	});
}
//#endregion ---------- /Public bindHubEvents ----------

//#region    ---------- Private Helpers ---------- 

type ListHubInfo = { hub: Hub, topics: string, labels?: string, fun: HubListener };

/**
 * @param {*} hubEvents could be {"hubName; topics[; labels]": fn} 
 * 											or {hubName: {"topics[; labels]": fn}}
 * @returns {hub, topics, labels}[]
 */
function listHubInfos(hubEvents: HubListenerByFullSelector | HubListenerByHubNameBySelector): ListHubInfo[] {
	const infoList: ListHubInfo[] = []

	for (const key in hubEvents) {
		const val = hubEvents[key];

		// If we have FnBySelector, then, hub name is in the selector, getHubInfo will extract it
		// "hubName; topics[; labels]": fn}
		if (val instanceof Function) {
			infoList.push(getHubInfo(key, null, val));
		}
		// otherwise, if val is an object, then, thee key is the name of the hub, so get/create it.
		// {hubName: {"topics[; labels]": fn}}
		else {
			const _hub = hub(key);
			for (const key2 in val) {
				infoList.push(getHubInfo(key2, _hub, val[key2]));
			}
		}
	}
	return infoList;
}

// returns {hub, topics, labels}
// hub is optional, if not present, assume the name will be the first item will be in the str
function getHubInfo(str: string, _hub: Hub | null, fun: HubListener): ListHubInfo {
	const a = splitAndTrim(str, ";");
	// if no hub, then, assume it is in the str
	const topicIdx = (_hub) ? 0 : 1;
	_hub = (!_hub) ? hub(a[0]) : _hub;

	const info: ListHubInfo = {
		topics: a[topicIdx],
		fun: fun,
		hub: _hub
	};
	if (a.length > topicIdx + 1) {
		info.labels = a[topicIdx + 1];
	}
	return info;
}

//#endregion ---------- /Private Helpers ---------- 

//#region    ---------- Public Factory ---------- 
/** Singleton hub factory */
export function hub(name: string): Hub {
	if (name == null) {
		throw new Error('dom-native INVALID API CALLS: hub(name) require a name (no name was given).');
	}
	let hub = hubDic.get(name);
	// if it does not exist, we create and set it. 
	if (hub === undefined) {
		hub = new HubImpl(name);
		hubDic.set(name, hub);
		// create the hubData
		hubDataDic.set(name, new HubData(name));
	}
	return hub;
}
//#endregion ---------- /Public Factory ---------- 

// function hubDelete(name: string) {
// 	hubDic.delete(name);
// 	hubDataDic.delete(name);
// };

//#region    ---------- Hub Implementation ---------- 
interface HubRef {
	topic: string,
	fun: Function,
	ns?: string,
	ctx?: any,
	label?: string
}

// User Hub object exposing the public API
const hubDic = new Map<string, HubImpl>();

// Data for each hub (by name)
const hubDataDic = new Map<string, HubData>();
class HubImpl implements Hub {
	name: string;
	constructor(name: string) {
		this.name = name;
	}


	sub(topics: string, handler: HubListener, opts?: HubOptions): void;
	sub(topics: string, labels: string, handler: HubListener, opts?: HubOptions): void;
	sub(topics: string, labels_or_handler: string | HubListener, handler_or_opts?: HubListener | HubOptions, opts?: HubOptions) {

		//// Build the arguments
		let labels: string | null;
		let handler: HubListener;
		// if the first arg is function, then, no labels
		if (labels_or_handler instanceof Function) {
			labels = null;
			handler = labels_or_handler;
			opts = handler_or_opts as HubOptions | undefined;
		} else {
			labels = labels_or_handler;
			handler = handler_or_opts as HubListener;
			// opts = opts;
		}
		//// Normalize topic and label to arrays
		const topicArray = splitAndTrim(topics, ",");
		const labelArray = (labels != null) ? splitAndTrim(labels, ",") : null;

		//// make opts (always defined at least an emtpy object)
		opts = makeOpts(opts);

		//// add the event to the hubData
		const hubData = hubDataDic.get(this.name)!; // by hub(...) factory function, this is garanteed
		hubData.addEvent(topicArray, labelArray, handler, opts);
	}

	unsub(ns: NsObject) {
		const hubData = hubDataDic.get(this.name)!; // by factory contract, this always exist.
		hubData.removeRefsForNs(ns.ns);
	}

	/** Publish a message to a hub for a given topic  */
	pub(topic: string, message: any): void;
	/** Publish a message to a hub for a given topic and label  */
	pub(topic: string, label: string, message: any): void;
	pub(topics: string, labels?: string | null, data?: any) {
		// ARG SHIFTING: if data is undefined, we shift args to the RIGHT
		if (typeof data === "undefined") {
			data = labels;
			labels = null;
		}

		//// Normalize topic and label to arrays
		const topicArray = splitAndTrim(topics, ",");
		const labelArray = (labels != null) ? splitAndTrim(labels, ",") : null;

		const hubData = hubDataDic.get(this.name)!;

		const hasLabels = (labels != null && labels.length > 0);

		// if we have labels, then, we send the labels bound events first
		if (hasLabels) {
			hubData.getRefs(topicArray, labelArray).forEach(function (ref) {
				invokeRef(ref, data);
			});
		}

		// then, we send the topic only bound
		hubData.getRefs(topicArray, null).forEach(function (ref) {
			// if this send, has label, then, we make sure we invoke for each of this label
			if (hasLabels) {
				labelArray!.forEach(function (label) {
					invokeRef(ref, data, label);
				});
			}
			// if we do not have labels, then, just call it.
			else {
				invokeRef(ref, data);
			}
		});

	}

	deleteHub() {
		hubDic.delete(this.name);
		hubDataDic.delete(this.name);
	}
}

// TODO: This was maded to have it private to the hub. Now that we are using trypescript, we might want to use private and store it in the Hub. 
class HubData {
	name: string;
	refsByNs = new Map<string, HubRef[]>();
	refsByTopic = new Map<string, HubRef[]>();
	refsByTopicLabel = new Map();

	constructor(name: string) {
		this.name = name;
	}

	addEvent(topics: string[], labels: string[] | null, fun: Function, opts: HubOptions) {
		const refs = buildRefs(topics, labels, fun, opts);
		const refsByNs = this.refsByNs;
		const refsByTopic = this.refsByTopic;
		const refsByTopicLabel = this.refsByTopicLabel;
		refs.forEach(function (ref) {
			// add this ref to the ns dictionary
			// TODO: probably need to add an custom "ns"
			if (ref.ns != null) {
				ensureArray(refsByNs, ref.ns).push(ref);
			}
			// if we have a label, add this ref to the topicLabel dictionary
			if (ref.label != null) {
				ensureArray(refsByTopicLabel, buildTopicLabelKey(ref.topic, ref.label)).push(ref);
			}
			// Otherwise, add it to this ref this topic
			else {

				ensureArray(refsByTopic, ref.topic).push(ref);
			}
		});
	};

	getRefs(topics: string[], labels: string[] | null) {
		const refs: HubRef[] = [];
		const refsByTopic = this.refsByTopic;
		const refsByTopicLabel = this.refsByTopicLabel;

		topics.forEach(function (topic) {
			// if we do not have labels, then, just look in the topic dic
			if (labels == null || labels.length === 0) {
				const topicRefs = refsByTopic.get(topic);
				if (topicRefs) {
					refs.push.apply(refs, topicRefs);
				}
			}
			// if we have some labels, then, take those in accounts
			else {
				labels.forEach(function (label) {
					const topicLabelRefs = refsByTopicLabel.get(buildTopicLabelKey(topic, label));
					if (topicLabelRefs) {
						refs.push.apply(refs, topicLabelRefs);
					}
				});
			}
		});
		return refs;
	};

	removeRefsForNs(ns: string) {
		const refsByTopic = this.refsByTopic;
		const refsByTopicLabel = this.refsByTopicLabel;
		const refsByNs = this.refsByNs;

		const refs = this.refsByNs.get(ns);
		if (refs != null) {

			// we remove each ref from the corresponding dic
			refs.forEach(function (ref) {

				// First, we get the refs from the topic or topiclabel
				let refList;
				if (ref.label != null) {
					const topicLabelKey = buildTopicLabelKey(ref.topic, ref.label);
					refList = refsByTopicLabel.get(topicLabelKey);
				} else {
					refList = refsByTopic.get(ref.topic);
				}

				// Then, for the refList array, we remove the ones that match this object
				let idx;
				while ((idx = refList.indexOf(ref)) !== -1) {
					refList.splice(idx, 1);
				}
			});

			// we remove them all form the refsByNs
			refsByNs.delete(ns);
		}


	};
}

// static/private
function buildRefs(topics: string[], labels: null | string[], fun: Function, opts: HubOptions) {
	let refs: HubRef[] = [];
	topics.forEach(function (topic) {
		// if we do not have any labels, then, just add this topic
		if (labels == null || labels.length === 0) {
			refs.push({
				topic: topic,
				fun: fun,
				ns: opts.ns,
				ctx: opts.ctx
			});
		}
		// if we have one or more labels, then, we add for those label
		else {
			labels.forEach(function (label) {
				refs.push({
					topic: topic,
					label: label,
					fun: fun,
					ns: opts.ns,
					ctx: opts.ctx
				});
			});
		}

	});

	return refs;
}


// static/private: return a safe opts. If opts is a string, then, assume is it the {ns}
const emptyOpts = {};
function makeOpts(opts?: HubOptions): HubOptions {
	if (opts == null) {
		opts = emptyOpts;
	} else {
		if (typeof opts === "string") {
			opts = { ns: opts };
		}
	}
	return opts;
}

// static/private
function buildTopicLabelKey(topic: string, label: string) {
	return topic + "-!-" + label;
}

// static/private: call ref method (with optional label override)
function invokeRef(ref: HubRef, data: any, label?: string) {
	const info = {
		topic: ref.topic,
		label: ref.label || label,
		ns: ref.ns
	};
	ref.fun.call(ref.ctx, data, info);
}
//#endregion ---------- /Hub Implementation ----------


