
import { hub, Hub } from '../../src/index';
import { equal } from './utils';

let hub1: Hub;
let out: string[] = [];
const customObj = { name: "customA" };

export function _init() {
	hub1 = hub("hub1");

	// subscribe to a simple topic
	hub1.sub("HUB1_TOPIC_1", function (data, info) {
		out.push("HUB1_TOPIC_1" + " >> " + info.topic + "-" + info.label + "-" + data);
	}, { ns: "ns1" });

	// subscribe to a topic and label
	hub1.sub("HUB1_TOPIC_1", "hub1_label_1", function (data, info) {
		out.push("HUB1_TOPIC_1; hub1_label_1" + " >> " + info.topic + "-" + info.label + "-" + data);
	});

	var hub2 = hub("hub2");

	hub2.sub("HUB1_TOPIC_1", function (data, info) {

	}, { ns: "ns2", ctx: customObj });
}

export function _beforeEach() {
	out = [];
}

export function pubHub1Topic1() {
	hub1.pub("HUB1_TOPIC_1", "sendHub1Topic1");
	equal(["HUB1_TOPIC_1 >> HUB1_TOPIC_1-undefined-sendHub1Topic1"], out);
}

export function pubHub1Topic1Label1() {
	hub1.pub("HUB1_TOPIC_1", "hub1_label_1", "sendHub1Topic1Label1");
	equal(["HUB1_TOPIC_1; hub1_label_1 >> HUB1_TOPIC_1-hub1_label_1-sendHub1Topic1Label1",
		"HUB1_TOPIC_1 >> HUB1_TOPIC_1-hub1_label_1-sendHub1Topic1Label1"], out);
}

export function unsubNs1() {
	// we unbind the topic only binding, should have no event
	hub1.unsub({ ns: "ns1" });
	hub1.pub("HUB1_TOPIC_1", "sendHub1Topic1");
	equal(out, []);

	// but the label_1 binding should still be active (as it was not in the namespace)
	hub1.pub("HUB1_TOPIC_1", "hub1_label_1", "offns1");
	equal(out, ["HUB1_TOPIC_1; hub1_label_1 >> HUB1_TOPIC_1-hub1_label_1-offns1"]);
}
