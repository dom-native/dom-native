
## Making the DOM Scale (**< 5kb compressed**)

`dom-native` is a minimalistic DOM library that uses the DOM as the foundation for scalable MVC foundation rather than working against it. 

It can be used to build simple to rich Web and Mobile Web frontends. The key concept is that **Simple Scales Better.**

### Why: 

- **IT'S 2020** - Native Browser component model and support are exponentially better than in 2010ish.

- **Learn what matters** - Frameworks come and go, but Runtimes stay. 

- **THE DOM is THE FRAMEWORK** - With customElement / web component, the DOM has become a very scalable framework for future proof Application Programming. 


### Key features and approach:

- **ZERO IE TAX**! Only **target modern browsers** (e.g., modern Chrome, Edge Chromium, Firefox, and Safari). NO Polyfill or Shiming.

- **NO VIRTUAL DOM**! Fully embrace DOM native customElement and web component. **REAL DOM IS BACK!**

- **JUST A LIB** not a framework (**DOM is THE FRAMEWORK**). 

- **SMALL** **< 5kb gzipped** (< 13kb minimized) and **ZERO dependency**!

- **SIMPLE** `BaseHMLElement extends HTMLElement` base class providing expressive lifecycle by hooking to native DOM custom elements 
  - e.g.,`.init` `.preDisplay` `.postDisplay`. 

- **O(1) event binding** support by fully utilizing DOM event bubbling with optional namespacing
```ts
on(containerEl, 'pointerup', '.my-div', (evt) => { 
    console.log('clicked')
}, {ns: 'some_namespace'});
// or a la jquery: on(containerEl, 'pointerup.some_namespace', ...)

// ...

off(containerEl, {ns: 'some_namespace'});
```
 
- **TYPED** for expressiveness and robustness (big thanks to TypeScript) with some minimalistic but powerfull TS **decorators**
```ts 
import {customElement, BaseHTMLElement, onEvent} from 'dom-native';

@customElement('my-element') 
class MyElement extends BaseHTMLElement{
  @onEvent('pointerdown', '.big-button')
  bigButtonClick(evt: PointerEvent & {S})
}
```

- **LIGHT** and expressive** DOM API wrappers (e.g., `first(el, selector)` `all(el, selector)`)
  - e.g., `const itemsEl = first(el, 'ul.items'); all(itemsEl,'li').map(liEl => console.log(liEl))`

- **PUB/SUB** - Unleash state management with a Minimalistic pub/sub api (see below)

- **AGNOSTIC** - NO templating included. Feel free to use [template literals](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals), handlebars, or [lit-html](https://github.com/Polymer/lit-html, or even vuejs). 


> IN SHORT - **Simple Scales Better** - **Learn what matters** - **favor pattern over frameworks** - **The DOM is the Framework!** - **Real DOM is Back!!!**


\>>> [QUICK DEMO](https://demo.dom-native.org/core/index.html) <<< (under construction!)


## Hello World

```sh
npm install dom-native
```

`BaseHTMLElement` is a simple class that extends the browser native `HTMLElement` and provides expressive binding mechanisms and lifecycle methods. 

Here an example with some TypeScript decorators (can be used without TypeScript as well)

```ts
// main.ts
import { BaseHTMLElement, onEvent } from 'dom-native';

@customElement('hello-world') // no magic, just call customElement.register('hello-world',HelloComponent); 
class HelloComponent extends BaseHTMLElement{

  get name() { return this.getAttribute('name') || 'World'}

  @onEvent('click', 'strong') // bind a DOM event from this element instance with a selector
  onStrongClick(){
    console.log(`${this.name} has been clicked`);
  }

  // init() - will be called only once at first connectedCallback 
  init(){
    this.innerHTML = `Hello <strong>${this.name}</strong>`;
    // or shadowDom, DocumentFragment, ....
  }

  // called just before the first paint.
  preDisplay() {
    // put here thing job that needs to be performed just before rendering and could be in init.
  }

  // postDisplay() - will be called at the second requestFrameAnimation (after first paint)
  postDisplay(){
    // some async and UI update/refresh
  }
}

document.body.innerHTML = '<hello-world name="John"></hello-world>';
```

HTML will be:

```html
<body><hello-world name="John">Hello <strong>John</strong></hello-world></body>
```

> Fully based on **Native Web Component** (customElements) with a lightweight but powerful `BaseHTMLElement extends HTMLElement` base class with some simple and highly productive DOM APIs allowing to unparallel productivity to build simple to big Web frontends.

> **dom-native** is designed to scale from the get-go and, therefore, fully embrace TypeScript types and makes a lightweight, expressive, and optional use of TypeScript decorators (JS decorator standard is still way off). However, all functionalities are available in pure JS as well.


## Full BaseHTMLElement lifecycle and typescript decorators

dom-native [BaseHTMLElement](src/c-base.ts) is just a base class that extends DOM native custom element class `HTMLElement` and add some minimalistic but expressive lifecycle methods as well as few typescript decorators (or properties for pure JS) to allow safe event bindings (i.e., which will get unbound appropriately). 

```ts
// full component
import { BaseHTMLElement, onEvent, onDoc, onWin, onHub } from 'dom-native';

@customElement('full-component')
class FullComponent extends BaseHTMLElement{

  //// DOM Event Bindings
  // bind a method to an element DOM event with an optional selector
  @onEvent('click', 'strong') 
  onStrongClick(){
    console.log('World has been clicked');
  }

  // bind a method to an document DOM event with an optional selector
  // Note: will be correctly unbound when this element is removed from the Document
  @onDoc('click', '.logoff')
  onDocumentLogoff(){
    console.log('.logoff element was clicked somewhere in the document');
  }

  // bind a method to an window DOM event
  // Note: will be correctly unbound when this element is removed from the Document
  @onWin('resize')
  onDocumentLogoff(){
    console.log('Window was resized');
  }

  //// Hub Event Bindings
  @onHub('HUB_NAME', 'TOPIC_1', 'LABEL_A')
  onPubSubTopic1LabelAEvent(message: any, info: HubEventInfo){
    console.log(`hub event message: ${message}, for topic: ${info.topic}, label: ${info.label}`);
  }

  //// Lifecyle Methods
  // init() - will be called only once at first connectedCallback 
  init(){
    super.init(); // best practice, call parent
    this.innerHTML = 'Hello <strong>World</strong>'; // good place to set the innerHTML / appendChild
  }

  // preDisplay() - if defined, will be called once before first paint (i.e. first requestAnimationFrame)
  preDisplay(){ 
    console.log('before first paint');
    // Note: This function can be marked async, but the first paint won't wait until resolve. 
    //       More idiomatic to have async in postDisplay
  }

  // postDisplay() - if defined, will be called once after first paint, before second paint (i.e., second requestAnimationFrame)
  async postDisplay(){
    // good place to do some async and UI update/refresh
  }

  // Native custom element method on "remove". 
  disconnectedCallback(){
    super.disconnectedCallback(); // MUST CALL for bindings (i.e., @onDoc, @onWin, @onHub) cleanup
    // other cleanups as needed
  }

  // Native custome element method
  attributeChangedCallback(attrName: string, oldVal: any, newVal: any){
    // Implement when/as needed.
  }


}
```

## Understanding DOM customElement lifecycle

To fully understand the power of `BaseHTMLElement` it is important to understand the lifecycle of the DOM customElement elements. 

In very short, the customElement class get instantiated for its registered tag name by the DOM ONLY when the element is added to the main `document`. Before that point, the DOM element is just a generic DOM Element. 

`BaseHTMLElement` provides some convenient methods that enable to take full advantage of this lifecycle. Here is a simple example showing this lifecyle.


```ts
@customElement('my-component') // no magic, just call a customElement.register('my-component',MyComponent);
class MyComponent extends BaseHTMLElement{
  private _data?: string;

  set data(data: string){ this._data = data; }
  get data(){ return this._data }

  constructor(){
    super(); // MUST, by DOM customElement spec
    console.log('-- constructor', this.data);
  }
  init(){
    super.init(); // not necessary, but good best practice
    console.log('-- init ', this.data);
  }

  preDisplay(){
    console.log('-- preDisplay', this.data);
  }

  postDisplay(){
    console.log('-- postDisplay', this.data);
  }  
}

const el = document.createElement('my-component'); 
// NOTHING is printed, the element is not added to the dom. 
// DO NOT call `el.customData = 'test data'` MyComponent is not instantiated

document.body.appendChild(el);
// -- print --> '-- constructor undefined'
// -- print --> '-- init undefined'

// now 'el' has been upgraded to MyComponent instance
el.customData = 'test-data'; 

// this will ask the browser to do a call back before first paint, but it will do after preDisplay, because the myComponent instance was created before
requireAnimationFrame(function(){

  // -- print --> '-- preDisplay test-data'

  // this will ask the browser to register a callback for the upcoming paint (which is the one after this one).
  // Since MyComponent had a postDisplay, it was also registered with a double requireAnimationFrame and will be called before
  requireAnimationFrame(function(){

    // -- print --> '-- postDisplay test-data'

  });
});
```

### Best Practices

Here are three typical rendering scenarios:

#### 1) Attribute / Content Rendering

If the component can infer its content soly from its declaration (i.e., attributes and content), then, set the `innerHTML` or call `appendChild`  in the `init()` method. Favor `this.innerHTML` or one  `this.appendChild` call (e.g., using the convenient `frag('<some-html>text</some-html>)` dom-native DocumentFragment builder function)

```ts
@customElement('ami-happy') 
class AmIHappy extends BaseHTMLElement{
  init(){
    super.init(); // optional, but good best practice
    const happy = this.hasAttribute('happy');
    this.innerHTML = `I am ${happy ? '<strong>NOT</strong>' : ''} happy`;
  }
}
const el = document.createElement('ami-happy');
document.body.appendChild(el);

// -- display --> <ami-happy>I am <strong>NOT</strong> happy</ami-happy>
```

#### 2) Data Initialization Rendering

If the component needs more complex data structure to render itself, but those data do not require any async, adding the component to the document to instantiate the component, and then, calling the data initializers will allow the `preDisplay()` to render those data before first paint.

```ts
@customElement('whos-happy') 
class WhosHappy extends BaseHTMLElement{
  data?: {happy: string[], not: string[]}

  preDisplay(){
    if (this.data){
      this.innerHTML = `Happy people: ${this.happy.join(', ')} <br />
                      Not happy: ${this.not.join(', ')}`;
    }
  }
}

// create element and add it to the DOM
const el = document.createElement('whos-happy');
const whosHappyEl = document.body.appendChild(el) as WhosHappy;

whosHappyEl.data = {happy: ['John', 'Jen'], not: ['Mike']}; // <-- still before first paint, so NO flicker

// -- display --> <whos-happy>Happy people: John, Jen <br /> Not happy: Mike</whos-happy>

// Note: If we had done it at the init(), this.data would have been undefined.
```

#### 3) Async Rendering

When a component needs to get data asynchronously, then, `async postDisplay()` method is a good place to put this logic, and usually the component HTML structure gets assigned at the `init()` method.

```ts
@customElement('happy-message') 
class HappyMessage extends BaseHTMLElement{
  init(){
    super.init();
    this.innerHTML = '<c-ico>happy-face</c-ico><h1>loading...</h1><p>loading...</p>'; 
    // Tips: Layout this structure appropriately with css grid/flex-box to minimize layout reshuffling on data update.
  }

  async postDisplay(){
    const msg: {title: string, text: string} = await httpGet('/happy-message-of-the-day');
    first(this,'h1')!.textContent = msg.title;
    first(this,'p')!.textContent = msg.text;
    // Note: Can use fancier templating, such as handlebars, lit-html, ...
  }
}

const el = document.createElement('happy-message');

// -- display --> <happy-message><c-ico>happy-face</c-ico><h1>loading...</h1><p>loading...</p></happy-message>
// for first paint, and until httpGet gets resolved

// ... httpGet gets resolved

// -- display --> <happy-message><c-ico>happy-face</c-ico><h1>title from server</h1>
//                <p>text form server</p></happy-message>
```

> Note: `init()` and `preDisplay()` could be marked as `async` but it would not change the lifecycle of the component as async calls will always be resolved after first paint anyway. Use `init()` and `preDisplay()` synchronous component initialization, and have the async work done in the `postDisplay()`.

> `constructor()` v.s. `init()`: Many Web Component tutorials show how to create/attach `ShadowDom` at the constructor, but calling `this.innerHTML` at the constructor is not permitted. `init()` get called at the first `connectedCallback` and is a safe place to set `this.innerHTML` value. This allows to decouple the ShadowDom requirements from the component model, making it optional. 

> `ShadowDom` is a good concept. However, unfortunately the lack of effective ShadowDom styling (CSS piercing was removed, and CSS Shadow Parts is still not well supported by modern browsers) makes it not a very pragmatic choice for now ([#SelfInflictedComplexity](https://twitter.com/jeremychone/status/1170378327116222464)). The good news is that the key componentization model comes from the `customElement` API, which is very mature and well supported, and ShadowDom is mostly a component implementation detail that can be added later when fully ready. 


# APIs

## DOM Navigation & Manipulation APIs Overview


```ts
import {on, off, all, first, prev, next, append, frag, attr, style } from 'dom-native';

// --------- DOM Event Helpers --------- //

// NOTE: this is the underlying API, use @on(type, [selector]) when use @customElement Native Web Component

// register a listener for this event type on one or more elements
on(els, types, listener);
// register a listener for this type and selector on one or more elements (with event.selectTarget when selector).  
on(els, types, selector, listener); 
// register listener with optional namespace or ctx (this)
on(els, types, selector, listener, {ns,ctx});

// unregister a listener
off(els, type, [selector,] listener)
// unregister all listeners matching a type and eventual selector. 
off(els, type[, selector])
// unregister all listeners for a given namespace 'ns'
off(els, {ns})

// trigger a custom event on a given type by default 
trigger(els, "MyCustomEvent", {detail: "cool", cancelable: false});
// --------- DOM Event Helpers --------- //

// --------- DOM Query Shortcuts --------- //
const els = all(el, selector); // shortcut for el.querySelectorAll but HTMLElement[]
const els = all(selector); // shortcut for document.querySelectorAll from document

const el = first(el, selector); // shortcut for el.querySelector
const el = first(selector); // shortcut for document.querySelector from document
const el = first(el); // find firstElementChild (even for fragment for browsers that do not support it)

const el = next(el[, selector]); // shortcut to find the next sibling element matching an optional selector
const el = prev(el[, selector]); // shortcut to find the previous sibling element matching an optional selector
// --------- /DOM Query Shortcuts --------- //

// --------- DOM Helpers --------- //
// Append child, refEl interpreted as parnt
const newEl = append(refEl, newEl); // standard refEl.appendChild(newEl)
const newEl = append(refEl, newEl, "first"); // Insert newEl as first element of refEl.
const newEl = append(refEl, newEl, "last"); // Here for symmetry, refEl.appendChild(newEl)
const newEl = append(refEl, newEl, "empty"); // Will empty refEl before .appendChildrefEl.appendChild(newEL)

// Append sibling, refEl interpreted as sibling
const newEl = append(refEl, newEl, "after"); // Append newEl after the refEl, use appendChild if no next sibling
const newEl = append(refEl, newEl, "before"); // Here for symmetry, refEl.parentNode.insertBefore(newEl, refEl)

const frag = frag("<div>any</div><td>html</td>"); // Create document fragment (use 'template' with fallback )
// --------- /DOM Helpers --------- //

```

## Pub / Sub APIs overview

```ts
import { hub } from 'dom-native';

// --------- Hub (pub/sub) --------- //
const myHub = hub("myHub"); // create a new named hub, and returns the named hub. 

myHub.sub(topics, [labels,] handler[, opts]); // subscribe

myHub.pub(topic, [label,] data); // publish

myHub.unsub(opts.ns); // unsubscribe
// --------- /Hub (pub/sub) --------- //
```


## Dom Data eXchange (push/pull)

`push` and `pull` provides a simple and extensible way to extract or inject data from and to a DOM subtree. 

```ts
push(el, [selector,] data); // will set the data.property to the matching selector (default ".dx") elements
const data = pull(el[, selector]); // will extract the data from the matching elements (default selector ".dx")

// register custom pushers / pullers (default ones are for html form elements and simple div innerHTML)
pusher(selector, pusherFn(value){this /* dom element*/}); // pusher function set a value to a matching element
puller(selector, pullerFn(){this /* dom element*/}); // puller function returns the value from a matching element 
```

#### `push(el, [selector,] data);` 
Will inject data  to the matching selector (default ".dx") elements. By default, selector is ".dx". 

#### `pull(el[, selector]);` 
Will extract the data from the matching elements (default selector ".dx")


##### Example

```html
<div id="myEl">
  <fieldset>
    <input class="dx" name="firstName" value="Mike">
    <input class="dx" name="lastName" value="Donavan">
  </fieldset>
  <div>
    <div class="dx dx-address-street">123 Main Street</div>
    <div class="dx" data-dx="address.city">San Francisco</div>
  </div>
</div>
```

```ts
import {first, push, pull} from 'dom-native';


const myEl = first("#myEl"); // or document.getElementById

// Extract the data from the element. 
//   Will first do a ".dx" select, and for each element extract the property path and value from the element.
const data = pull(myEl); 
// data: {firstName: "Mike", lastName: "Donavan", 
//        address: {street: "123 Main Street", city: "San Francisco"}}

// Update the DOM with some data
const updateData = {address: {street: "124 Second Street"}};
push(myEl, updateData)
```


[changlogs](CHANGELOG.md)

## Other notes

> `dom-native` formerly named [mvdom](https://github.com/mvdom/mvdom) as been rename to `dom-native` as it came closer to 1.0 release. While a little longer, I felt it was punchier and more representative of the library's intent.
