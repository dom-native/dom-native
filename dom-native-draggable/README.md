
# NOW part of `dom-native`

So, exact same API, under the `dnd` namespace, from the `dom-native` core library. 

```ts
import { dnd } from "dom-native";

dnd.draggable(rootEl, ".drag-me", { drag: "ghost" }); //

rootEl.addEventListener("DROP", (evt: any) => {
	const clone = evt.detail.source.cloneNode(true); //

	// No matter where it is dropped, add it to the show-zone for this example
	first(rootEl, ".show-zone")!.append(clone);
}); //

```