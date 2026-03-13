import { CodeDoc, SpecView } from '../infra/index';
import { SelectDataSender, SelectOption } from '@dom-native/ui';
import { customElement, onEvent, OnEvent } from 'dom-native';
import { wait } from 'utils-min';


@customElement('spec-d-select')
export class SpecMSelectView extends SpecView {
	name = 'spec-d-select'
	doc = SPEC_DOC

	@onEvent('D-DATA')
	async onSelectData(evt: OnEvent<SelectDataSender>) {
		await wait(2000);
		evt.detail(OPTIONS_LOADED);
	}
}

const OPTIONS_LOADED: SelectOption[] = [{ value: 'one', content: "One" }, { value: 'two', content: "Two" }];

const OPTIONS_DEFAULT = `
  <option>None</option>
  <option value="one">value one</option>
  <option value="G">value G</option>
`;

const SPEC_DOC: CodeDoc = {
	title: 'Spec for d-select',
	groups: [
		{
			items: [
				{
					title: 'd-select standard (label, value)',
					html: `<d-select label="Label" value="one">${OPTIONS_DEFAULT}</d-select>`
				},
				{
					title: 'd-select empty (no placeholder)',
					html: `<d-select label="Label">${OPTIONS_DEFAULT}</d-select>`
				},
				{
					title: 'd-select load data',
					html: `<d-select class="load-example" label="Label" value="one">Some stuff</d-select>`
				},
				{
					title: 'd-select leading ico',
					html: `<d-select ico-lead='d-ico-star' label="Label" value="one">${OPTIONS_DEFAULT}</d-select>`
				},
				{
					title: 'd-select placeholder',
					html: `<d-select label="Label" placeholder="Placeholder">${OPTIONS_DEFAULT}</d-select>`
				}
			]
		},
		{
			items: [
				{
					title: 'd-select disabled',
					html: `<d-select label="Label" value="Value" disabled>${OPTIONS_DEFAULT}</d-select>	`
				},
				{
					title: 'd-select empty and disabled',
					html: `<d-select label="Label" disabled>${OPTIONS_DEFAULT}</d-select>`
				},
				{
					title: 'd-select no label',
					html: `<d-select value="value">${OPTIONS_DEFAULT}</d-select>`
				},
				{
					title: 'd-select placeholder no label',
					html: `<d-select placeholder="Placeholder">${OPTIONS_DEFAULT}</d-select>`
				}
			]
		}
	]
}