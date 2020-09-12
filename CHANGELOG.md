# CHANGELOG

> Legend: `.` minor; `+` addition; `^` enhancement, `*` major; `-` fix; `!` change; 


### v0.9.12 PENDING

- `+` adoptStyleSheet - adopt a `CSSObject` to a shadowRoot, using constructable stylesheets if supported or append style element if not.
- `!^` css - now css returns a `CSSObject` which is composable and can be used in `adoptStyleSheet`
- `-` @onHub - fix issue where @onHub was not unbound
- `!` c-base - remove attributeChangedCallback empty implementation (perf impact for little to no value)

### v0.9.11 Sep 9, 2020

- `+` css - added `css(string)` and css\` tag template to create `<style>` element
- `+` html - added `html(string)` and html\` tag template to create DocumentFragment (@deprecate `frag`)
- `^` event - refactor BaseHTMLElement bindings (performance update)


### v0.9.10 Sep 6, 2020

- `^` event - `@onEvent` binds to .shadowRoot when .shadowRoot exist after constructor.
- `+` escape - added `escapeHtml(string)` and `escapeAttr(string)` (using the DOM element to do the escaping)
- `.` demo - added `demo/` code sample see [DEMO (for live access)](https://demo.dom-native.org/core/index.html)
- `.` demo - added `perf`
- `.` build - changed build system and related scripts (still use rollup)


### v0.9.9 May 13, 2020

- Inital release from [mvdom](https://github.com/mvdom/mvdom)











