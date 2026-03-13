import { CodeDoc, simplePull, SpecView } from '../infra/index';
import { customElement } from 'dom-native';
console.log(".....", "spec-d-check")
@customElement('spec-d-check')
export class SpecMCheckView extends SpecView {
	name = 'spec-d-check'
	doc = SPEC_DOC
}

const SPEC_DOC: CodeDoc = {
	title: 'Spec for d-check',
	groups: [
		{
			items: [
				{
					title: 'd-check checked',
					html: `<d-check name="nameA" label="Label" checked></d-check>`,
					js: simplePull
				},
				{
					title: 'd-check with value',
					html: `<d-check name="mood" label="Label" \n\tvalue="happy" checked>\n</d-check>`,
					js: simplePull
				},
				{
					title: 'd-check multiple',
					html: `<d-check name="nameA" label="Label A" checked></d-check>\n<d-check name="nameB" value="value-b" label="Label B"></d-check>\n<d-check name="nameC" value="value-c" label="Label C" checked></d-check>`,
					js: simplePull
				},
				{
					title: 'd-check no label',
					html: `<d-check checked></d-check>`
				}
			]
		},
		{
			items: [
				{
					title: 'd-check disabled checked',
					html: `<d-check label="Label" checked disabled></d-check>`
				},
				{
					title: 'd-check readonly checked',
					html: `<d-check label="Label" checked readonly></d-check>`
				}
			]
		}
	]
}
