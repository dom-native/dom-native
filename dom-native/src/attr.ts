// conditional typing
type AttrReturnType = string | null;
type AttrSetType = string | number | boolean | null;
type NameValMap = { [name: string]: AttrSetType };


// #region    --- getAttr
export function getAttr(el: Element, name: string): string | null;
export function getAttr(el: Element, ...names: string[]): (string | null)[];

export function getAttr(el: Element, ...names: string[]): AttrReturnType | AttrReturnType[] {
  if (names.length == 1) {
    return el.getAttribute(names[0]);
  } else {
    const vals: (string | null)[] = [];
    for (const name of names) {
      vals.push(el.getAttribute(name));
    }
    return vals;
  }
}
// #endregion --- getAttr


// #region    --- setAttr
/**
 * Set or remove an attribute value by name on a element. 
 * - If value type is text or number, string value is set. 
 * - If null or false, attribute is removed. 
 * - If true, attribute is set to empty string.
 * @return The Element given
 */
export function setAttr<E extends Element | HTMLElement>(el: E, name: string, val: string | number | boolean | null): E;

/**
 * Set or remove a set of attribute name:value for a given el. 
 * - If value type is text or number, string value is set. 
 * - If null or false, attribute is removed. 
 * - If true, attribute is set to empty string.
 * @return The Element given
 */
export function setAttr<E extends Element | HTMLElement>(el: E, nameValues: { [name: string]: string | number | boolean | null }): E;

// implementation
export function setAttr<E extends Element | HTMLElement>(el: E, name_or_map: string | NameValMap, val?: AttrSetType): E {

  const name = (typeof name_or_map == 'string') ? name_or_map : null;
  const map = (name === null) ? name_or_map : null;

  // if we have name, it's a solo setAttribute
  if (name !== null && val !== undefined) {
    _setAttribute(el, name, val);
  } else if (map != null && typeof map == 'object') {
    for (const [name, val] of Object.entries(map)) {
      _setAttribute(el, name, val);
    }
  } else {
    throw Error(`dom-native - setAttr call did not get the right arguments (el, ${name_or_map}, ${val})`);
  }

  return el;
}


function _setAttribute(el: HTMLElement | Element, name: string, val: AttrSetType) {
  // if it is a boolean, true will set the attribute empty, and false will set txtVal to null, which will remove it.
  let txtVal = (typeof val !== 'boolean') ? val : (val === true) ? '' : null;
  if (txtVal !== null) {
    if (typeof txtVal !== 'string') txtVal = '' + txtVal;
    el.setAttribute(name, txtVal);
  } else {
    el.removeAttribute(name);
  }
}

// #endregion --- setAttr