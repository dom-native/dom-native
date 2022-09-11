
/**
 * Position an `position: absolute;` element in body based on a `refEl`. 
 * 
 * Pos is of format "_v_h" : _v for vertical, _h for horizontal
 * - _v: T: Top, C: Center, B: Bottom
 * - _h: L: Left, C: Center, R: Right
 */
export type Pos = 'TL' | 'TC' | 'TR' | 'CL' | 'CC' | 'CR' | 'BL' | 'BC' | 'BR';

const DEFAULT = { pos: 'TL', refPos: 'BR', gap: 0, x: true, y: true } as const;

type Point = { x: number, y: number };

export interface PositionOptions {
  /** The el position based on the reference point. */
  pos?: Pos,

  /** 
   * Vertical and Horizontal gap.
   * 
   * Note: To follow the most common intent, 'gap' will not be applied to axes 
   *       that are centered (i.e. "C" position).
   *       So, for a CC position, gap will have no effect. 
   *       For full control/overwrite, use vGap and hGap.
   **/
  gap?: number;

  /** Vertical gap. Take precedence over gap. */
  vGap?: number,

  /** Horizontal gap. Take precedence over gap.*/
  hGap?: number,

  /** 
   * Define the xAxis behavior
   *   - if false, x will not be changed. (default true)
   *   - if number, this will become the fixed x.
   **/
  x?: boolean | number,

  /**
   * Define the xAxis behavior
   *   - if false, y will not be changed. (default true)
   *   - if number, this will become the fixed y.
   **/
  y?: boolean | number,

  /**
   * Constrain HTMLElement.
   *  By default, window when constrainOver is defined.
   */
  constrain?: HTMLElement
}

type Rect = { x: number, y: number, bottom: number, right: number };

export interface RefPositionOptions extends PositionOptions {
  /** The refEl reference point position. */
  refPos?: Pos,
}

export function position(el: HTMLElement, refEl: HTMLElement, opts?: RefPositionOptions): void;
export function position(el: HTMLElement, point: { x: number, y: number }, opts?: PositionOptions): void;

export function position(el: HTMLElement, refElOrPoint: HTMLElement | { x: number, y: number }, opts?: PositionOptions | RefPositionOptions): void {
  const _opts = { ...DEFAULT, ...opts } as RefPositionOptions & typeof DEFAULT; // helping TS
  const { refPos: ref_pos, pos: el_pos, gap, vGap: _vGap, hGap: _hGap, x: axis_x, y: axis_y, constrain: con_el } = _opts;

  // Note: When no vGap or hGap given, 
  //       The value of the commong 'gap' property 
  //       is taken on if the axis is not centered (not "C")
  const vGap = _vGap ?? ((el_pos[0] != 'C') ? gap : 0);
  const hGap = _hGap ?? ((el_pos[1] != 'C') ? gap : 0);

  // --- Extract the eventual constrain
  let con_rec: Rect | null = null;
  if (con_el) {
    con_rec = con_el?.getBoundingClientRect() ?? { x: 0, y: 0, right: window.innerWidth, bottom: window.innerHeight };
  }

  // --- Compute the ref point
  let ref_point: Point;
  if (refElOrPoint instanceof Element) {
    const ref_rec = refElOrPoint.getBoundingClientRect();
    ref_point = compute_ref_point(ref_rec, ref_pos);
  } else {
    ref_point = refElOrPoint;
  }

  // --- Compute the el position
  const el_rec = el.getBoundingClientRect();
  let pos_x = (typeof axis_x == 'number') ? axis_x : ((axis_x === true) ? compute_pos_x(ref_pos, ref_point, el_pos, el_rec, hGap) : el_rec.x);
  if (con_rec) {
    if (pos_x < con_rec.x) {
      pos_x = con_rec.x;
    } else if (pos_x + el_rec.width > con_rec.right) {
      pos_x = con_rec.right - el_rec.width;
    }
  }

  let pos_y = (typeof axis_y == 'number') ? axis_y : ((axis_y === true) ? compute_pos_y(ref_pos, ref_point, el_pos, el_rec, vGap) : el_rec.y);
  if (con_rec) {
    if (pos_y < con_rec.y) {
      pos_y = con_rec.y;
    } else if (pos_y + el_rec.height > con_rec.bottom) {
      pos_y = con_rec.bottom - el_rec.height;
    }
  }

  // Future - Will if overlap and execute overlap strategy

  // Note - We always on top left, because otherwise create uncessary dislodge on window resize.
  el.style.top = `${pos_y}px`;
  el.style.left = `${pos_x}px`;
}

function compute_ref_point(rec: DOMRect, pos: Pos): { x: number, y: number } {
  let [pos_v, pos_h] = pos;
  let x = 0, y = 0;

  // x
  if (pos_h == 'L') {
    x = rec.left;
  } else if (pos_h == 'C') {
    x = rec.left + rec.width / 2;
  } else if (pos_h == 'R') {
    x = rec.right;
  }

  // ref_y
  if (pos_v == 'T') {
    y = rec.top;
  } else if (pos_v == 'C') {
    y = rec.top + rec.height / 2;
  } else if (pos_v == 'B') {
    y = rec.bottom;
  }

  return { x, y };
}

function compute_pos_x(ref: Pos, ref_point: Point, pos: Pos, el_rec: DOMRect, gap: number): number {
  const ref_x = ref_point.x;

  let pos_x = 0;
  let pos_h = pos[1];

  // pos_x
  if (pos_h == 'L') {
    pos_x = ref_x - el_rec.width - gap;
  } else if (pos_h == 'C') {
    pos_x = ref_x - el_rec.width / 2 - gap;
  } else if (pos_h == 'R') {
    pos_x = ref_x + gap;
  }

  return pos_x;
}

function compute_pos_y(ref: Pos, ref_point: Point, pos: Pos, el_rec: DOMRect, gap: number): number {
  const ref_y = ref_point.y;
  let ref_v = ref[0];

  let pos_y = 0;
  let pos_v = pos[0];

  // pos_y
  if (pos_v == 'T') {
    pos_y = ref_y - el_rec.height - gap;
  } else if (pos_v == 'C') {
    pos_y = ref_y - el_rec.height / 2 - gap;
  } else if (pos_v == 'B') {
    pos_y = ref_y + gap;
  }

  return pos_y

}
