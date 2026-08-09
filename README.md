
# dom-native - DOM-native library for typed native Web Component development

The main `dom-native` library is in the [dom-native/](dom-native/) directory.

The `dom-native` approach uses the browser as its component framework, with native Web Components (`customElements` with optional Shadow DOM), plus a small set of utilities to streamline application code. The library is less than 7 KB minified.

The [@dom-native/ui](dom-native-ui/) directory also contains templates for UI element primitives, such as inputs, checkboxes, and selects. See the base [`d-base-field.ts`](dnui/src/d-base-field.ts) component.

## Usage

- Dependency: `"dom-native": "^0.13.0"` (now include dnd for draggables / drop)

- Decorators: `experimental` (a long story, but currently the most portable option)

```typescript
import { BaseHTMLElement, customElement, onEvent, OnEvent } from "dom-native";

@customElement("simple-element")
class SimpleElement extends BaseHTMLElement {
  init() {
    this.innerHTML = `
      Hello from SimpleElement!
      <button>Click me</button>
    `;
  }

  @onEvent("click", "button")
  onClick(evt: MouseEvent & OnEvent) {
    const button = evt.selectTarget as HTMLButtonElement;
    button.textContent = "Clicked!";
  }
}
```

```html
<simple-element></simple-element>
```

## Dev / Demo

To build the assets:

```sh
npm install
# For dom-native/
cd dom-native && npm install && cd ..
# For dnui/
cd dnui && npm install && cd ..

# Build the demo
npm run demo-build
```


Then, serve the repository with a local web server and open `demo/web-content/index.html` in your browser.


---

[This Repo](https://github.com/dom-native/dom-native)


