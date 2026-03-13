import { CodeDoc, SpecView }  from '../infra/index';
import { customElement, first } from 'dom-native';


@customElement('spec-d-input')
export class SpecMInputView extends SpecView {
	name = 'spec-d-input'
	doc = spec_input_doc

	postDisplay() {
		// get the first input and set focus
		const firstMInput = first(this, 'd-input');
		firstMInput?.focus();
	}
}


const spec_input_doc: CodeDoc = {
	title: 'Spec for d-input',
	groups: [
		{
			items: [
				{
					title: 'd-input standard (label, value)',
					html: '<d-input label="Label" value="Value"></d-input>'
				},
				{
					title: 'd-input empty (no placeholder)',
					html: '<d-input label="Label"></d-input>'
				},
				{
					title: 'd-input Leading Icon and Trailing Label',
					html: '<d-input icon-lead="d-ico-star" label-trail="Trail Label" label="Label" value="Value">\n</d-input>'
				},
				{
					title: 'd-input Empty Leading Icon',
					html: '<d-input icon-lead="d-ico-star" label="Label"></d-input>'
				},
				{
					title: 'd-input Trailing Icon',
					html: '<d-input icon-trail="d-ico-visible" label="Label" value="Value"></d-input>'
				},
				{
					title: 'd-input placeholder',
					html: '<d-input label="Label" placeholder="Placeholder"></d-input>'
				},
				{
					title: 'd-input disabled',
					html: '<d-input label="Label" value="Value" disabled></d-input>	'
				},
				{
					title: 'd-input empty and disabled',
					html: '<d-input label="Label" disabled></d-input>'
				}
			]
		},
		{
			items: [
				{
					title: 'd-input no label',
					html: '<d-input value="value"></d-input>'
				},
				{
					title: 'd-input placeholder no label',
					html: '<d-input placeholder="Placeholder"></d-input>'
				},
				{
					title: 'd-input trail text',
					html: '<d-input label="label" text-trail="CM"></d-input>'
				}
			]
		}
	]
}