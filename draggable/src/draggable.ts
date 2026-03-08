import { closest, off, on, style } from 'dom-native';
import { clamp, findBelow, transform, Transform } from './utils.js';

/////////
// events (inspired from https://developer.mozilla.org/en-US/docs/Web/API/HTML_Drag_and_Drop_API)
// Uppercase to avoid any name conflict with real event names. 
//
// - DRAGSTART - the user starts dragging an item. (See Starting a Drag Operation.) (dnd - will be triggered on the drag source element)
// - DRAG - a dragged item (element or text selection) is dragged. (dnd - will be triggered on the drag source element)
// - DRAGEND - a drag operation ends(such as releasing a mouse button or hitting the Esc key; see Finishing a Drag.)
// - DRAGENTER - a dragged item enters a valid drop target. (See Specifying Drop Targets.)
// - DRAGLEAVE - a dragged item leaves a valid drop target.
// - DROP - an item is dropped on a valid drop target.
// - DRAGOVER - (only if controller.dragover === true) a dragged item is being dragged over a valid drop target, every few hundred milliseconds.
// - DRAGEXIT - an element is no longer the drag operation's immediate selection target.

const DEFAULT_DRAG_THRESHOLD_X = 5;
const DEFAULT_DRAG_THRESHOLD_Y = 5;

type DragEventName = 'DRAGSTART' | 'DRAG' | 'DRAGEND';
type DropEventName = 'DRAGENTER' | 'DRAGOVER' | 'DRAGLEAVE' | 'DROP';
type AllDragEventName = DragEventName | DropEventName;

const DRAG_MODE_TRANSLATE = 0;
const DRAG_MODE_ABSOLUTE = 1;
const DRAG_MODE_FIXED = 2;

const onDragFnByEventName: { [key in AllDragEventName]: keyof OnDragController } = {
	DRAGSTART: 'onDragStart',
	DRAG: 'onDrag',
	DRAGEND: 'onDragEnd',
	DRAGENTER: 'onDragEnter',
	DRAGOVER: 'onDragOver', // NOT IMPLEMENTED YET
	DRAGLEAVE: 'onDragLeave',
	DROP: 'onDrop'
}

//#region    ---------- Controller / Options Types ---------- 
export type DraggableEvent<D = any> = CustomEvent<DragEventDetail<D>>;
type OnDragFn<D = any> = (evt: DraggableEvent<D>) => void;

interface OnDragController {

	/** On drag start (when the candidate has been "promoted" to a drag) */
	onDragStart?: OnDragFn;

	onDrag?: OnDragFn;

	onDragEnd?: OnDragFn;

	onDragEnter?: OnDragFn;
	onDragOver?: OnDragFn;
	onDragLeave?: OnDragFn;
	onDrop?: OnDragFn;
}

export interface DragController extends OnDragController {

	/**
	 * The setPointerCapture target (by default source but can be overriden)
	 * Note: To receive pointerevent this element must be attached to the document
	 */
	pointerCapture?: HTMLElement,

	data?: any;

	/** The dragMode which defined which element to drag */
	drag?: 'ghost' | 'source' | 'none';

	constraints?: {
		/** (default: true) when false, lock the x axis */
		x?: boolean
		/** (default: true) when false, lock the y axis */
		y?: boolean // NOT IMPLEMENTED YET - false if cannot change y during drag
		/** Container that will be used to (if selector, containerEl = source.closest(...))  */
		container?: string | HTMLElement
		/** 
		 * How the dragEl will be constrained.
		 * - top-left: will contrain the top-left point of the dragged element
		 * - center: will constrain the center point of the dragged element
		 * - box: will constrain all side of the dragged element
		 * 
		 * Note: The dragged element could be the ghost or the source depening 
		 */
		hitbox?: 'top-left' | 'center' | 'box'
	},

	/** 
	 * Selector or function droppable first html element. 
	 * 
	 * - if string, then closest from over element
	 * - if false, then no drop event / lookup will be performed (TODO NOT supported yet)
	 * - if true (DEFAULT), then, will send drop events to any element below the drop
	 * - if function will be called with the "overEl" as first parameter, and should return the HTMLElement
	 * 
	 * Default: true, meaning will trigger drop events on any element below the ghost/cursor (TODO NOT supported yet)
	 **/
	droppable?: Boolean | string | ((target: HTMLElement) => HTMLElement | null);

	/**
	 * (default: false) Tell if the dragover even should be triggered on the droppable element 
	 * Note 1: the `controller.onDragOver` will be called if defined regardless of the this flag. 
	 * Note 2: If `controller.droppable === false` this flag will be ignored since no droppable will be computed
	 */
	dragover?: boolean;

	/** 
	 * Create the ghost div to be dragged. 
	 * If absent a clone and fixed width/height will be created.
	 */
	ghost?: GhostOptions;

	/** On the first create of the candidate (allow to be sure that the source is still attached to the document) */
	onCandidate?: (evt: DragCandidateEventDetail) => void;

}

type GhostGeneratorFn = (source: HTMLElement) => HTMLElement;

type GhostOptions = {
	/** (default true) Tell if the ghost should be deleted on dragEnd */
	deleteOnEnd?: boolean;

	/** (default true) Tell if the ghost should follow the pointer */
	followPointer?: boolean;
	create?: GhostGeneratorFn;
}

interface DragControllerInternal extends DragController {
	setData(data: any): void;
}
//#endregion ---------- /Controller / Options Types ---------- 


//#region    ---------- DragEvent Types ---------- 

export interface DragCandidateEventDetail {
	source: HTMLElement
	clientX: number
	clientY: number
	pointerEvent: PointerEvent
}

/**
 * The Drag Events are triggered on the drag source. 
 * 
 * Note: For performance reason, as of now, only start/end is triggered. To listen on each onDrag, pass the `onDrag` to the dragController
 *       when calling draggable(..,..,{onDrag: ...})
 * 
 * - DRAG-START when the drag start
 * - DRAG-END when the drag end (after an eventual DROP event)
 * 
 * CSS States: 
 *  - 'drag-source' Class added to the element that initiated the dragged
 *  - 'drag-ghost' Class added to the drag source clone element, which is the element dragged with the pointer
 */
export interface DragEventDetail<D = any> {
	data: D

	readonly source: HTMLElement
	readonly sourceOriginRect: DOMRect
	readonly sourceOriginTransform: Transform

	readonly ghost?: HTMLElement
	readonly ghostOriginRect?: DOMRect
	readonly ghostOriginTransform?: Transform

	readonly droppable?: HTMLElement
	readonly over: HTMLElement

	readonly originX: number // clientX on the first pointerdown or activeDrag
	readonly originY: number // clientX on the first pointerdown or activeDrag

	readonly clientX: number // the pointerEvent.clientX
	readonly clientY: number // the pointerEvent.clientY
	readonly pointerEvent: PointerEvent
}
//#endregion ---------- /DragEvent Types ---------- 



//#region    ---------- Activation & Start ---------- 
export function draggable(rootEl: HTMLElement, controller?: DragController): void;
export function draggable(rootEl: Document, selector: string, controller?: DragController): void;
export function draggable(rootEl: HTMLElement, selector: string, controller?: DragController): void;
export function draggable(rootEl: HTMLElement | Document, selector_or_controller?: string | DragController, controller?: DragController) {
	let selector: string | undefined;

	if (typeof selector_or_controller === 'string') {
		selector = selector_or_controller;
	} else {
		controller = selector_or_controller;
	}

	if (rootEl === document && selector == null) {
		throw new Error(`ERROR - draggable - draggable(doument,...) must have a selector, but none found in call.`);
	}

	on(rootEl, 'pointerdown', selector ?? null, function (evt) {
		const el = evt.selectTarget ?? rootEl;
		activateDrag(el, evt, controller);
	});

}

export function activateDrag(src: HTMLElement, evt: PointerEvent, controller?: DragController) {

	// create the controller with the default
	const ctlr: DragControllerInternal = {
		...(controller ?? {}),
		setData: (newData: any) => {
			data = newData
		}
	};

	let data = ctlr.data;

	// let data: any = ctlr.data;

	const pointerId = evt.pointerId;

	//#region    ---------- Initial States ---------- 

	//// for drag events
	const source = src;
	const captureTarget = ctlr.pointerCapture ?? source;
	const sourceOriginRect = source.getBoundingClientRect();;
	const sourceOriginTransform = transform(source);

	const dragTarget = ctlr.drag ?? 'source';
	const ghost = (dragTarget === 'ghost') ? createAndInitGhost(source, ctlr) : undefined;
	// NOTE: must be undefined first, as will get the rect on document on actuate drag
	let ghostOriginRect: DOMRect | undefined;
	const ghostOriginTransform = (ghost) ? transform(ghost) : undefined;
	const originX = evt.clientX;
	const originY = evt.clientY;

	const droppableOn = ctlr.droppable !== false;

	//// internal states
	const ghostFollowPointer = ctlr.ghost?.followPointer ?? true;
	const constraintContainer = ctlr.constraints?.container;
	const constraintEl = (typeof constraintContainer === 'string') ? source.closest(constraintContainer) : constraintContainer;
	const constraintRect = constraintEl?.getBoundingClientRect();

	// Those will be the base scroll x/y to calculate eventual offset when drag and scoll 
	//    this allow to have the draggable following the mouse on drag
	const scrollOriginX = window.scrollX;
	const scrollOriginY = window.scrollY;

	const hitboxSpec = parseHitboxSpec(ctlr);

	// dragEl info
	const [dragEl, dragOriginTransform] =
		(ghost && ghostFollowPointer) ? [ghost, ghostOriginTransform]
			: (dragTarget == 'source') ? [source, sourceOriginTransform] : [];

	// NOTE: can be set in move for ghost (so must be let)
	let dragOriginRect = (dragTarget == 'source') ? sourceOriginRect : undefined;
	let dragOriginOffsetTop = dragEl?.offsetTop ?? 0;
	let dragOriginOffsetLeft = dragEl?.offsetLeft ?? 0;


	const dragX = ctlr.constraints?.x ?? true;
	const dragY = ctlr.constraints?.y ?? true;
	// for now, ghost drag position (top/left)
	const dragPositionStr = (dragEl) ? (dragEl.style.position || window.getComputedStyle(dragEl).getPropertyValue('position')) : undefined;

	// const dragMode = (dragTarget === 'ghost') ? DRAG_MODE_POSITION : DRAG_MODE_TRANSLATE;
	const dragMode = (dragPositionStr === 'fixed') ? DRAG_MODE_FIXED :
		(dragPositionStr === 'absolute') ? DRAG_MODE_ABSOLUTE
			: DRAG_MODE_TRANSLATE;
	const ghostDeleteOnEnd = ctlr.ghost?.deleteOnEnd ?? true;
	const dispatchDragoverEvent = ctlr.dragover ?? false;

	// SAFARI - does not turn off the userSelect on drag and prevent default (and does not support standard userSelect)
	const originBodyWebkitUserSelect = document.body.style.webkitUserSelect;
	//#endregion ---------- /Initial States ---------- 



	//// bind events
	// send all further pointer event from this pointerId to source (until pointerup/cancel)
	captureTarget.setPointerCapture(pointerId);

	const eventNs = `${pointerId}`; // namespacing the event for simpler removal
	on(captureTarget, 'pointermove', processMove, { ns: eventNs });
	on(captureTarget, 'pointerup', processEnd, { ns: eventNs });
	on(captureTarget, 'pointercancel', processEnd, { ns: eventNs });

	//// mutable states
	let currentDroppable: HTMLElement | undefined;
	let dragActive = false;


	function makeDragEventDetail(opts: { pointerEvent: PointerEvent, over: HTMLElement, droppable?: HTMLElement }): DragEventDetail {
		const { pointerEvent, over, droppable } = opts;
		const { clientX, clientY } = pointerEvent;

		return {
			data,
			droppable,
			source,
			sourceOriginRect,
			sourceOriginTransform,
			ghost,
			ghostOriginRect,
			ghostOriginTransform,
			over,
			originX,
			originY,
			clientX,
			clientY,
			pointerEvent
		}
	}

	function processMove(pointerEvent: PointerEvent) {

		// IMPORTANT - make sure we process only the event from the start pointerId 
		//             (if does not match, it's ok, it means it is another drag session on the same source and it will be processed by the corresponding binding)
		if (pointerId != pointerEvent.pointerId) {
			return;
		}

		const { clientX, clientY } = pointerEvent;

		//#region    ---------- DRAGSTART if threshold  ---------- 
		// if we have a candidate, determine if it becomes a context
		if (!dragActive) {

			//// DRAGSTART - if above the drag threshold
			if (Math.abs(clientX - originX) > DEFAULT_DRAG_THRESHOLD_X ||
				Math.abs(clientY - originY) > DEFAULT_DRAG_THRESHOLD_Y) {

				const over = findBelow(clientX, clientY, dragEl);
				source.classList.add('drag-source');

				if (ghost) {
					document.body.append(ghost);
					ghostOriginRect = ghost.getBoundingClientRect();
					if (dragTarget === 'ghost') {
						dragOriginRect = ghostOriginRect;
						dragOriginOffsetTop = ghost.offsetTop;
						dragOriginOffsetLeft = ghost.offsetLeft;
					}
				}

				// call the on start
				triggerDragEvent('DRAGSTART', makeDragEventDetail({ pointerEvent, over }), ctlr);

				dragActive = true;
			}
		}
		//#endregion ---------- /DRAGSTART if threshold  ---------- 

		//#region    ---------- Process Drag ---------- 

		if (dragActive) {
			// SAFARI - to prevent select on drag
			document.body.style.webkitUserSelect = 'none';

			pointerEvent.preventDefault(); // TODO: check if se still need this (works as it for pc / mobile)
			pointerEvent.cancelBubble = true;

			// get the handle below
			const over = findBelow(clientX, clientY, dragEl);

			// make sure the cursor is always drag one
			document.body.classList.add('drag-cursor');

			//// Drag the dragEl (ghost or source) if defined
			if (dragEl && dragOriginTransform && dragOriginRect) {
				moveDraggable({ clientX, clientY });
			}

			let droppable: HTMLElement | undefined;
			// if controller droppable is not false, we process the droppable
			if (droppableOn) {
				// need to do the DRAGENTER/LEAVE work only if over changed
				droppable = findDroppable(clientX, clientY, over, ctlr);

				//// DRAGLEAVE
				if (currentDroppable && currentDroppable !== droppable) {
					// override the droppable with currentDroppable for DRAGLEAVE the currentDroppable
					triggerDropEvent('DRAGLEAVE', makeDragEventDetail({ pointerEvent, over, droppable: currentDroppable }), ctlr);
					deactuateDroppable(currentDroppable);
				}

				//// DRAGENTER - if new drop
				if (droppable) {
					if (currentDroppable !== droppable) {
						actuateDroppable(droppable);
						triggerDropEvent('DRAGENTER', makeDragEventDetail({ pointerEvent, over, droppable }), ctlr);
					}
					// DRAGOVER
					else {
						// here pass the "dispatchDragoverEvent" flag which will dispatch the DRAGOVER only if flag is set to true
						triggerDropEvent('DRAGOVER', makeDragEventDetail({ pointerEvent, over, droppable }), ctlr, dispatchDragoverEvent);
					}
				}


			}

			currentDroppable = droppable;

			//// DRAG
			triggerDragEvent('DRAG', makeDragEventDetail({ pointerEvent, over, droppable }), ctlr);

		}
		//#endregion ---------- /Process Drag ---------- 
	}

	function moveDraggable(opts: { clientX: number, clientY: number }) {
		if (dragEl == null || dragOriginTransform == null || dragOriginRect == null) {
			return;
		}
		const { clientX, clientY } = opts;
		const { translateX: originTx, translateY: originTy } = dragOriginTransform!;

		let dx: number, dy: number;

		if (dragMode === DRAG_MODE_TRANSLATE) {
			const scrollOffsetX = window.scrollX - scrollOriginX;
			const scrollOffsetY = window.scrollY - scrollOriginY;

			// the distance dragged from the pointerdown (origin) till now
			dx = (dragX) ? scrollOffsetX + clientX - originX : 0;
			dy = (dragY) ? scrollOffsetY + clientY - originY : 0;
		} else if (dragMode === DRAG_MODE_FIXED) {
			const offsetX = originX - dragOriginRect.left;
			const offsetY = originY - dragOriginRect.top;
			dx = (dragX) ? clientX - offsetX - dragOriginRect.left - scrollOriginX : 0;
			dy = (dragY) ? clientY - offsetY - dragOriginRect.top - scrollOriginY : 0;
		} else { // assume absolute
			const offsetX = originX - dragOriginRect.left;
			const offsetY = originY - dragOriginRect.top;
			dx = (dragX) ? clientX - offsetX - dragOriginRect.left : 0;
			dy = (dragY) ? clientY - offsetY - dragOriginRect.top : 0;
		}


		// if contained, need to clamp
		if (constraintRect) {
			const { top, left, width, height } = constraintRect;
			const bottom = top + height;

			const newX = dragOriginRect.left + dx;
			const newY = dragOriginRect.top + dy;

			const [constrainedX, constrainedY] = resolveHitbox(hitboxSpec, constraintRect, {
				top: newY,
				left: newX,
				width: dragOriginRect.width,
				height: dragOriginRect.height
			})

			if (dragX && constrainedX != newX) {
				// new dx = (constrainedX - dragOriginRect.left)
				dx = constrainedX - dragOriginRect.left;
			}

			if (dragY && constrainedY != newY) {
				dy = constrainedY - dragOriginRect.top;
			}

		}

		if (dragMode === DRAG_MODE_TRANSLATE) {
			// by default new tx/ty is the distance dragged + the eventual original translation
			const tx = dx + (originTx ?? 0);
			const ty = dy + (originTy ?? 0);
			// TODO: probably need to set as matrix to not remove other transform properties
			dragEl.style.transform = `translate(${tx}px, ${ty}px)`;

		} else { // assume fixed or absolute

			const newTop = dragOriginOffsetTop + dy;
			const newLeft = dragOriginOffsetLeft + dx;
			style(dragEl, {
				top: `${newTop}px`,
				left: `${newLeft}px`,
			});
		}
	}

	function processEnd(pointerEvent: PointerEvent) {

		// IMPORTANT - make sure we process only the event from the start pointerId 
		//             (if does not match, it's ok, it means it is another drag session on the same source and it will be processed by the corresponding binding)
		if (pointerId != pointerEvent.pointerId) {
			return;
		}


		if (dragActive) {
			const { clientX, clientY } = pointerEvent;

			const over = findBelow(clientX, clientY, dragEl);

			let droppable: HTMLElement | undefined;
			if (droppableOn) {
				const droppable = findDroppable(clientX, clientY, over, ctlr) ?? undefined;
				//// DROP
				if (droppable) {
					triggerDropEvent('DROP', makeDragEventDetail({ pointerEvent, over, droppable }), ctlr);
				}
				deactuateDroppable(droppable);
			}

			//// DRAGEND
			triggerDragEvent('DRAGEND', makeDragEventDetail({ pointerEvent, over, droppable }), ctlr);
		}

		// TODO: need to have a way to allow the event to set if the ghost should be remove or not.
		cleanup();

		function cleanup() {
			// reset body
			// SAFARI
			document.body.style.webkitUserSelect = originBodyWebkitUserSelect;

			// We remove the dragHandle
			if (ghostDeleteOnEnd) {
				ghost?.remove();
			}

			// regarless, cleanup the droppable(s) without triggering DRAGLEAVE event as it should not be fired in this case.
			document.body.classList.remove('drag-cursor');
			source.classList.remove('drag-source');
			deactuateDroppable(currentDroppable);


			// remove all of the event binding
			off(captureTarget, { ns: eventNs });
		}

	}

	//#endregion ---------- /Process End ---------- 
}


function defaultCreateGHostElement(source: HTMLElement) {
	const ghost = source.cloneNode(true) as HTMLElement;
	const rect = source.getBoundingClientRect();
	style(ghost, {
		width: `${rect.width}px`,
		height: `${rect.height}px`
	})
	return ghost;
}

function createAndInitGhost(source: HTMLElement, controller: DragControllerInternal) {
	const createFn = controller.ghost?.create;

	const ghost = (createFn) ? createFn(source) : defaultCreateGHostElement(source);

	ghost.classList.add('drag-ghost');

	const sourceRec = source.getBoundingClientRect();

	const cssStyle: Partial<CSSStyleDeclaration> = {
		position: 'fixed',
		left: sourceRec.left + window.scrollX + 'px',
		top: sourceRec.top + window.scrollY + 'px'
	};

	style(ghost, cssStyle);
	return ghost;
}

type HitboxSpec = {
	top: boolean
	right: boolean
	bottom: boolean
	left: boolean
	center: boolean // horizontal
	middle: boolean // vertical
};

function parseHitboxSpec(controller: DragController): HitboxSpec {
	const hitboxStr = controller.constraints?.hitbox;
	const hitbox = { top: false, right: false, bottom: false, left: false, center: false, middle: false };
	if (hitboxStr == null) { // default
		hitbox.top = true;
		hitbox.left = true;
	} else if (hitboxStr === 'center') {
		hitbox.center = true;
		hitbox.middle = true;
	} else if (hitboxStr === 'box') {
		hitbox.top = true;
		hitbox.left = true;
		hitbox.right = true;
		hitbox.bottom = true;
	} else {
		if (hitboxStr.includes('top')) {
			hitbox.top = true;
		}
		if (hitboxStr.includes('left')) {
			hitbox.left = true;
		}
		if (hitboxStr.includes('bottom')) {
			hitbox.bottom = true;
		}
		if (hitboxStr.includes('right')) {
			hitbox.right = true;
		}
		if (hitboxStr.includes('center')) {
			hitbox.center = true;
		}
		if (hitboxStr.includes('middle')) {
			hitbox.middle = true;
		}
	}

	return hitbox
}

type Rect = { left: number, top: number, width: number, height: number };

function resolveHitbox(spec: HitboxSpec, ctnRect: DOMRect, dragRect: Rect): [newX: number, newY: number] {
	const { left, top, width, height } = dragRect;
	const right = dragRect.left + dragRect.width;
	const bottom = dragRect.top + dragRect.height;
	const center = dragRect.left + width / 2;
	const middle = dragRect.top + height / 2;

	let newX = left;
	let newY = top;

	if (spec.left) {
		newX = clamp(newX, ctnRect.left, ctnRect.right);
	}
	if (spec.center) {
		newX = clamp(newX + width / 2, ctnRect.left, ctnRect.right) - width / 2;
	}
	if (spec.right) {
		newX = clamp(newX + width, ctnRect.left, ctnRect.right) - width;
	}

	if (spec.top) {
		newY = clamp(newY, ctnRect.top, ctnRect.bottom);
	}
	if (spec.center) {
		newY = clamp(newY + height / 2, ctnRect.top, ctnRect.bottom) - height / 2;
	}
	if (spec.bottom) {
		newY = clamp(newY + height, ctnRect.top, ctnRect.bottom) - height;
	}

	return [newX, newY];
}
//#endregion ---------- /Activation & Start ---------- 


//#region    ---------- Event Utils ---------- 
function actuateDroppable(droppable?: HTMLElement) {
	droppable?.classList.add('drag-over');
}
function deactuateDroppable(droppable?: HTMLElement) {
	droppable?.classList.remove('drag-over');
}

function triggerDragEvent(type: DragEventName, detail: DragEventDetail, controller: DragControllerInternal) {
	triggerEvent(type, detail, controller, detail.source)
}

function triggerDropEvent(type: DropEventName, detail: DragEventDetail, controller: DragControllerInternal, dispatchEvent = true) {
	if (detail.droppable) {
		triggerEvent(type, detail, controller, detail.droppable, dispatchEvent);
	}
}

const customEventInitBase = {
	bubbles: true,
	cancelable: true
};

function triggerEvent(type: AllDragEventName, detail: DragEventDetail, controller: DragControllerInternal, target: HTMLElement, dispatchEvent = true) {

	const onFn = onDragFnByEventName[type];

	if (onFn || dispatchEvent) {
		const evt = new CustomEvent(type, { ...customEventInitBase, detail });

		if (onFn && typeof controller[onFn] === 'function') {
			const _data = evt.detail.data;
			controller[onFn]!(evt); // TS-HELP - somehow can't infer that controller[onFn] cannot be undefined
			if (_data !== evt.detail.data) {
				controller.setData(evt.detail.data)
			}
		}
		if (dispatchEvent) {
			const _data = evt.detail.data;
			target.dispatchEvent(evt);
			if (_data !== evt.detail.data) {
				controller.setData(evt.detail.data)
			}
		}
	}
}

//#endregion ---------- /Event Utils ---------- 

function findDroppable(x: number, y: number, over: HTMLElement, controller: DragController): HTMLElement | undefined {
	const droppableQuery = controller.droppable ?? true;
	let droppable: HTMLElement | null = null;
	if (droppableQuery) {
		if (typeof droppableQuery === 'string') {
			droppable = closest(over, droppableQuery);
		} else if (typeof droppableQuery === 'function') {
			droppable = droppableQuery(over);
		} else if (droppableQuery === true) {
			droppable = over;
		}
	}
	return droppable ?? undefined;
}