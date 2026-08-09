# CSS Best Practices

## Purpose

Organize application CSS so that global foundations, design tokens, shared UI controls, and custom elements remain easy to find and maintain.

Use one `main.css` file as the stylesheet entry point. Keep reusable values in variable files, keep global element rules in `base.css`, and keep component styles in files owned by the corresponding component.

## Recommended file structure

A typical application stylesheet directory can use this structure:

```text
css/
  main.css
  var-colors.css
  var-fonts.css
  var-elev.css
  base.css
  dui.css
  dialog.css
  views/
    header-view.css
    main-view.css
  panels/
    settings-panel.css
```

Use the files as follows:

- `main.css` is the single stylesheet entry point and contains only `@import` statements.
- `var-colors.css` contains color variables and related visual tokens such as surfaces, borders, and text colors.
- `var-fonts.css` contains font imports, `@font-face` declarations when needed, and font family variables.
- `var-elev.css` contains elevation variables, including shadows for dialogs, menus, cards, and other raised elements.
- `base.css` contains foundational rules for `html`, `body`, common elements, and shared document defaults.
- `dui.css` contains related small UI elements that are intentionally maintained together.
- `dialog.css` contains shared dialog styling or the styles for a dialog component.
- View and panel files contain the styles for their corresponding custom elements. Their paths mirror the TypeScript source structure and filenames. For example, `src/views/header-view.ts` maps to `css/views/header-view.css`.

Use lowercase file names and separate multiple words with hyphens.

## Main stylesheet entry point

`main.css` is the only stylesheet that the application imports directly. It should contain only `@import` statements, with no selectors, declarations, variables, or component rules.

```css
@import "./var-colors.css";
@import "./var-fonts.css";
@import "./var-elev.css";
@import "./base.css";
@import "./dui.css";
@import "./dialog.css";
@import "./views/header-view.css";
@import "./views/main-view.css";
```

Keep imports ordered by responsibility:

- Load color, font, and elevation variables first.
- Load global base styles next.
- Load shared UI and dialog styles after the foundation.
- Load view and panel styles last.

Component styles should not import `main.css`. The application should process the stylesheet graph from this single entry point.

## Variable files

Variable files define values that are shared across the application. Keep values in the file that matches their responsibility instead of placing them in component stylesheets.

### Colors

Use `var-colors.css` for the color palette and semantic color tokens.

```css
:root {
	--clr-white: #fff;
	--clr-black: #000;
	--clr-text: #333;
	--clr-text-muted: #777;
	--clr-surface: #fff;
	--clr-surface-muted: #f5f5f5;
	--clr-border: #ddd;
	--clr-primary: #336699;
}
```

Prefer semantic variables such as `--clr-surface` and `--clr-text` in component styles. This allows the palette to change without rewriting each component.

### Fonts

Use `var-fonts.css` for font imports and font-related variables.

```css
@import url("https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap");

:root {
	--font-body: "Roboto", sans-serif;
	--font-monospace: monospace;
}
```

Keep font imports in `var-fonts.css`, not in individual component files or in `main.css`.

### Elevations

Use `var-elev.css` for reusable shadow definitions.

```css
:root {
	--elev-dialog: 0 8px 24px rgba(0, 0, 0, 0.2);
	--elev-menu: 0 4px 12px rgba(0, 0, 0, 0.16);
	--elev-card: 0 2px 8px rgba(0, 0, 0, 0.12);
}
```

Components should consume elevation variables instead of duplicating shadow values.

## Base styles

Use `base.css` for document-wide defaults and common HTML element behavior.

```css
html {
	box-sizing: border-box;
}

*,
*::before,
*::after {
	box-sizing: inherit;
}

html,
body {
	margin: 0;
	padding: 0;

	background: var(--clr-surface);
	color: var(--clr-text);

	font-family: var(--font-body);
}

body {
	min-height: 100vh;
}

p {
	margin: 0 0 1rem;
}

button,
input,
select,
textarea {
	font: inherit;
}
```

Keep `base.css` focused on common HTML types and document defaults. Do not put view-specific selectors, panel layouts, or custom element internals in this file.

## Custom element stylesheet boundaries

Give each view, panel, and larger custom element its own stylesheet.

For example:

- `css/views/main-view.css` owns `main-view`.
- `css/views/header-view.css` owns `header-view`.
- `css/panels/settings-panel.css` owns `settings-panel`.
- `css/dialog.css` owns shared dialog rules or a dialog custom element.

The custom element selector is the scope boundary. Start the stylesheet with the custom element selector instead of wrapping it in an ancestor selector.

```css
main-view {
	display: grid;
	grid-template-rows: auto 1fr;
	min-height: 100%;

	background: var(--clr-surface);
	color: var(--clr-text);

	font-family: var(--font-body);

	.content {
		min-width: 0;
	}

	&[busy] {
		opacity: 0.7;
	}
}
```

Keep `header-view` in `header-view.css` as its own root selector:

```css
header-view {
	display: grid;
	grid-template-columns: auto 1fr auto;
	align-items: center;
	gap: 1rem;
	padding: 1rem;

	background: var(--clr-surface);
	border-bottom: solid 1px var(--clr-border);

	color: var(--clr-text);
}
```

Do not make the component dependent on an ancestor selector such as `main-view header-view`. A custom element should own its base presentation wherever it is used. Parent views may still apply intentional layout overrides when the application requires them.

## CSS nesting

Use the standard CSS nesting capability supported by modern browsers. Do not rely on preprocessor-specific nesting syntax.

Nest internal classes, state selectors, pseudo-classes, and media queries inside the custom element root.

```css
main-view {
	display: grid;
	grid-template-rows: auto 1fr;
	gap: 1rem;
	padding: 1rem;

	background: var(--clr-surface);
	color: var(--clr-text);

	font-size: 1rem;

	.toolbar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.5rem;
	}

	&:focus-within {
		outline: solid 2px var(--clr-primary);
	}

	&[compact] {
		gap: 0.5rem;
		padding: 0.5rem;
	}

	@media (min-width: 48rem) {
		grid-template-columns: 16rem 1fr;
	}
}
```

Avoid deeply nesting through unrelated ancestors. The preferred structure is a custom element root followed by its owned internal classes and states.

## Grouping small UI elements

Small `dui` elements and related controls can be grouped in one stylesheet when they share a responsibility and are maintained together. This follows the existing UI stylesheet pattern.

For example, related checkbox and radio controls can share a stylesheet:

```css
d-check,
d-radio {
	display: grid;
	grid-template-columns: 1.5rem 0.5rem 1fr;
	min-height: 1.5rem;
	cursor: pointer;
	user-select: none;

	color: var(--clr-text);

	font-size: 1rem;

	&[disabled] {
		opacity: 0.5;
		filter: grayscale(100%);
	}
}
```

Group related small controls, icons, and shared UI primitives. Do not group unrelated views or panels simply because they are used on the same page.

Even in a grouped stylesheet, keep each element selector explicit. Avoid broad selectors that unintentionally affect application content.

## Prefer grid layout

Favor CSS Grid for page, view, panel, form, and two-dimensional component layouts.

Use grid to express:

- page rows and columns
- form labels and controls
- toolbars with fixed and flexible regions
- panels with stable areas
- repeated card or tile layouts

Use Flexbox for one-dimensional alignment where it is the clearer choice, such as a row of buttons or vertically centered content.

```css
settings-panel {
	display: grid;
	grid-template-columns: 12rem minmax(0, 1fr);
	grid-template-rows: auto 1fr;
	gap: 1rem;
	padding: 1rem;

	background: var(--clr-surface);
	color: var(--clr-text);
}
```

Prefer `minmax(0, 1fr)` for flexible grid tracks that contain content which must be allowed to shrink.

## Property grouping

Within a selector, group declarations by responsibility and separate each group with one empty line.

Use this order:

- Layout and box model.
- Color and visual appearance.
- Typography.
- Interaction, animation, and other behavior.

```css
dialog {
	position: fixed;
	inset: 50% auto auto 50%;
	width: min(32rem, calc(100vw - 2rem));
	max-width: 100%;
	padding: 1.5rem;
	transform: translate(-50%, -50%);

	background: var(--clr-surface);
	border: solid 1px var(--clr-border);
	box-shadow: var(--elev-dialog);
	color: var(--clr-text);

	font-family: var(--font-body);
	font-size: 1rem;
	line-height: 1.5;

	overflow: auto;
}
```

Keep nested state rules after the base declarations:

```css
main-view {
	display: grid;
	grid-template-rows: auto 1fr;

	background: var(--clr-surface);
	color: var(--clr-text);

	font-size: 1rem;

	cursor: default;

	&.is-loading {
		opacity: 0.7;
		pointer-events: none;
	}
}
```

This ordering makes the layout, visual, typography, and behavior of a selector easy to scan.

## Practical rules

- Import `main.css` from the application build as the single CSS entry point.
- Keep `main.css` limited to `@import` statements.
- Put shared values in the appropriate variable file.
- Keep global HTML defaults in `base.css`.
- Give each larger custom element its own stylesheet, with component and view stylesheet paths mirroring the corresponding source directories and filenames.
- Use the custom element selector as the root scope of that stylesheet.
- Nest internal classes and states with standard CSS nesting.
- Group related small `dui` elements when they share a responsibility.
- Favor Grid for two-dimensional layouts.
- Group declarations by layout, visual appearance, typography, and behavior.
- Keep component styles independent from unrelated ancestor selectors.
