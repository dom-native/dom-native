

dom-native libary family

- [dom-native](dom-native/) - library core 
- [@dom-native/draggable](https://github.com/dom-native/draggable) - draggrable extension (for internal drag & drop)

## Demo development workflow

The demo development flow is now driven from repository root.
This is the canonical way to develop and validate demo changes as file changes in this monorepo.

- Watch demo bundle during development:

```sh
npm run watch-demo
```

- Build demo bundle once:

```sh
npm run build-demo
```


### Demo output contract

Root demo build generates browser-ready assets used by `demo/web-content/index.html`:

- `demo/web-content/js/demo-bundle.js`
- `demo/web-content/css/demo-bundle.css`

### Typical demo dev loop

- Run `npm run watch-demo` from repository root.
- Edit sources under:
  - `demo/src`
  - `dom-native/src`
  - `draggable/src`
- Reload `demo/web-content/index.html` via a local static server to verify behavior.

## Dev

For this monorepo, install and run demo workflows from repository root.

```sh
npm install
```

### Root demo workflow

- Build full demo pipeline (code + js + css):

```sh
npm run build-demo
```

- Watch demo pipeline:

```sh
npm run watch-demo
```

### Folder ownership model

- Canonical demo source and generated snippets live under `demo/src`.
- Canonical demo build outputs live under `demo/web-content/js` and `demo/web-content/css`.
- Canonical demo build configuration lives at repository root:
  - `rolldown.config.js`
- Package-level scripts stay focused on package library build/publish workflows.

### Package library development

For [dom-native](dom-native/) library-specific build/watch:

```sh
cd dom-native
npm install
npm run build
npm run watch
```
