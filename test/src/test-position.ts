import { elem, getFirst, Pos, position } from '#dom-native';

const GAP = 8;

const POS_NAMES = ['TL', 'TC', 'TR', 'CL', 'CC', 'CR', 'BL', 'BC', 'BR'] as const;

export function testShowMouseFollow() {
  const testCtn = getFirst(".test-content-position")!;

  const poses = ["TC", "BC", "CR", "CL"] as const;
  const items: { el: HTMLElement, pos: Pos }[] = poses.map(pos => { return { el: append_pos_el(pos), pos } });

  const h_el = append_pos_el("H");
  position(h_el, testCtn, { pos: "TC", refPos: "BL" });

  const v_el = append_pos_el("V");
  position(v_el, testCtn, { pos: "TR", refPos: "BL" });

  const f_el = append_pos_el("F");
  position(f_el, testCtn, { pos: "CC", refPos: "CC" });

  // The 4 els following the mouse
  document.addEventListener("pointermove", function (evt) {
    const point = { x: evt.clientX, y: evt.clientY };
    for (const { el, pos } of items) {
      position(el, point, { pos, gap: 24, constrain: testCtn });
    }

    position(h_el, point, { pos: "CC", y: false, constrain: testCtn });
    position(v_el, point, { pos: "CC", x: false, constrain: testCtn });

    position(f_el, point, { pos: "CC", x: 300 });
  });



}

export function testShowRefPositions() {
  const testCtn = getFirst(".test-content-position")!;

  // create the reference box
  const refEl = testCtn.appendChild(elem("div", { "class": "pos-ctn" }));

  append_dots(refEl);

  // display the dots and labes
  for (const refPos of POS_NAMES) {
    // display the corresponding label
    const labelEl = append_pos_label(refPos);
    const [ref_v, ref_h] = refPos;
    // for top rev_v T and CC, TC
    let pos: Pos = "TC";
    if (ref_v == "B") {
      pos = "BC";
    } else if (ref_v == "C" && ref_h != "C") {
      pos = ("C" + ref_h) as Pos;
    } else if (refPos == "CC") {
      pos = "TC";
      labelEl.style.color = "black";
    }

    position(labelEl, refEl, { refPos, pos, gap: 8 });
  }

}

export function testShowElsPositions() {

  const testCtn = getFirst(".test-content-position")!;

  // create the reference box
  const refEl = testCtn.appendChild(elem("div", { "class": "pos-ctn" }));

  append_dots(refEl);

  // Top Right - Ls&Rs
  for (const [idx, el_pos] of POS_NAMES.entries()) {
    if (!el_pos.includes("C")) {
      const el = append_pos_el(el_pos);
      position(el, refEl, { refPos: 'TR', pos: el_pos, gap: GAP });
    }
  }

  // Bottom Right - CC
  {
    const pos = "CC";
    const el = append_pos_el(pos);
    position(el, refEl, { refPos: 'BR', pos, gap: 100 });
  }

  // Top Left - TC & BC
  {
    const poses = ["TC", "BC"] as Pos[];
    for (const pos of poses) {
      const el = append_pos_el(pos);
      position(el, refEl, { refPos: 'TL', pos, gap: GAP });
    }
  }

  // Bottom Left 
  {
    const poses = ["CL", "CR"] as Pos[];
    for (const pos of poses) {
      const el = append_pos_el(pos);
      position(el, refEl, { refPos: 'BL', pos, gap: GAP });
    }
  }
}


// #region    --- Utils
function append_dots(refEl: HTMLElement) {
  // display the dots and labes
  for (const ref_pos of POS_NAMES) {
    // display the dot
    const dotEl = append_pos_dot();
    position(dotEl, refEl, { refPos: ref_pos, pos: "CC" });
  }
}

function append_pos_el(textContent: string) {
  const el = elem('div', { class: "pos-el", $: { textContent } });
  document.body.appendChild(el);
  return el;
}

function append_pos_dot() {
  const el = elem('div', { class: "pos-dot" });
  document.body.appendChild(el);
  return el;
}

function append_pos_label(textContent: string) {
  const el = elem('div', { class: "pos-label", $: { textContent } });
  document.body.appendChild(el);
  return el;
}
// #endregion --- Utils