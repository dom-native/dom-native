import { CodeDoc, SpecView }  from '../infra/index';
import { customElement } from 'dom-native';


@customElement('spec-d-options')
export class SpecDOptionsView extends SpecView {
	name = 'spec-d-options'
	doc = SPEC_DOC
}


const OPTIONS_DEFAULT = `
  <option>None</option>
  <option value="one">value one</option>
  <option value="G">value G</option>
`;

const SPEC_DOC: CodeDoc = {
	title: 'Spec for d-options',
	groups: [
		{
			items: [
				{
					title: 'd-options standard',
					html: `
<d-options name="state"
           options="1:Open, 0:Close, 2: Both" value="0" style="width: 10rem">\n</d-options>`
				}
			]
		}
	]
}