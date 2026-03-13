import { CodeDoc, simplePull, SpecView } from '../infra/index';
import { customElement } from 'dom-native';


@customElement('spec-d-radio')
export class SpecMRadio extends SpecView {
	name = 'spec-d-radio'
	doc = SPEC_DOC

	preDisplay() {

	}
}

const SPEC_DOC: CodeDoc = {
	title: 'Spec for d-radio',
	groups: [
		{
			items: [
				{
					title: 'd-radio checked',
					html: `<d-radio name="nameA" label="Val 1" value="val-1"></d-radio>\n<d-radio name="nameA" label="Val 2" value="val-2" checked></d-radio>`,
					js: simplePull
				},
				{
					title: 'd-radio none checked',
					html: `<d-radio name="nameA" label="Val 1" value="val-1"></d-radio>\n<d-radio name="nameA" label="Val 2" value="val-2"></d-radio>`,
					js: simplePull
				},
				{
					title: 'd-radio with value',
					html: `<d-radio name="mood" label="Label" \n\tvalue="happy">\n</d-radio>`,
					js: simplePull
				}
			]
		},
		{
			items: [
				{
					title: 'd-radio disabled',
					html: `<d-radio name="nameA" label="Val 1" label="Label" checked disabled></d-radio>\n<d-radio name="nameA" label="Val 2" label="Label" disabled></d-radio>`
				},
				{
					title: 'd-radio readonly',
					html: `<d-radio name="nameA" label="Val 1" label="Label" checked readonly></d-radio>\n<d-radio name="nameA" label="Val 2" label="Label" readonly></d-radio>`
				}
			]
		}
	]
}