import { CodeDoc, SpecView }  from '../infra/index';
import { customElement, first } from 'dom-native';


@customElement('spec-d-textarea')
export class SpecMTextView extends SpecView {
	name = 'spec-d-textarea'
	doc = spec_input_doc

	postDisplay() {
		// get the first input and set focus
		const firstMInput = first(this, 'd-textarea');
		firstMInput?.focus();
	}
}


const spec_input_doc: CodeDoc = {
	title: 'Spec for d-textarea',
	groups: [
		{
			items: [
				{
					title: 'd-textarea standard (label, value)',
					html: '<d-textarea label="Label">Value...</d-textarea>',
					css: 'tall'
				},
				{
					title: 'd-textarea empty (no placeholder)',
					html: '<d-textarea label="Label"></d-textarea>'
				},
				{
					title: 'd-textarea Leading Icon',
					html: '<d-textarea icon-lead="d-ico-star" label="Label" value="Value from attr">Some \nmulti line\nanother one.</d-textarea>'
				},
				{
					title: 'd-textarea Empty Leading Icon',
					html: '<d-textarea icon-lead="d-ico-star" label="Label"></d-textarea>'
				},
				{
					title: 'd-textarea Trailing Icon',
					html: '<d-textarea icon-trail="d-ico-visible" label="Label" value="Value from attr"> </d-textarea>'
				},
				{
					title: 'd-textarea placeholder',
					html: '<d-textarea label="Label" placeholder="Placeholder"></d-textarea>'
				},
				{
					title: 'd-textarea disabled',
					html: '<d-textarea label="Label" value="Value" disabled></d-textarea>	'
				},
				{
					title: 'd-textarea empty and disabled',
					html: '<d-textarea label="Label" disabled></d-textarea>'
				}
			]
		},
		{
			items: [
				{
					title: 'd-textarea no label',
					html: '<d-textarea value="value"></d-textarea>'
				},
				{
					title: 'd-textarea placeholder no label',
					html: '<d-textarea placeholder="Placeholder"></d-textarea>'
				}
			]
		}
	]
}