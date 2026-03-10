import { elem, getFirst, Pos, position } from 'dom-native';

const GAP = 8;

const POS_NAMES = ['TL', 'TC', 'TR', 'CL', 'CC', 'CR', 'BL', 'BC', 'BR'] as const;

export function showMouseFollow() {
  const testCtn = getFirst(".test-content-position")!;

  // To be outside the mouse, we align the opposite side of the element
  const poses = ["BC", "TC", "CL", "CR"] as const;
	const items: { el: HTMLElement, pos: Pos }[] = poses.map(pos => { return { el: append_pos_el(pos, testCtn), pos } });

	// NOTE: needs to be in next frame, because, otherwise testCtn have the wrong height
	requestAnimationFrame(() => {
	  const h_el = append_pos_el("H", testCtn);
		position(h_el, testCtn, { pos: "CC", refPos: "BC"});

	  const v_el = append_pos_el("V", testCtn);
	  position(v_el, testCtn, { pos: "CC", refPos: "CL" });

	  const f_el = append_pos_el("F", testCtn);
	  position(f_el, testCtn, { pos: "CC", refPos: "CC" });

	  // The 4 els following the mouse
	  document.addEventListener("pointermove", function (evt) {
	    const point = { x: evt.clientX, y: evt.clientY };
	    for (const { el, pos } of items) {
	      position(el, point, { pos, gap: 24, constrain: testCtn });
	    }

	    position(h_el, point, { pos: "CC", y: false, constrain: testCtn });
	    position(v_el, point, { pos: "CL", x: false, constrain: testCtn });

	    position(f_el, point, { pos: "CC", hGap: -100 });
	  });
	})





}

export function showRefPositions() {
  const testCtn = getFirst(".test-content-position")!;

  // create the reference box
  const refEl = testCtn.appendChild(elem("div", { "class": "pos-ctn" }));

  append_dots(refEl, testCtn);

  // display the dots and labes
  for (const refPos of POS_NAMES) {
    // display the corresponding label
    const labelEl = append_pos_label(refPos, testCtn);
    const [ref_v, ref_h] = refPos;

    // To keep labels outside, we align the opposite side of the label
    const pos_v = (ref_v == "T") ? "B" : (ref_v == "B") ? "T" : "C";
    const pos_h = (ref_h == "L") ? "R" : (ref_h == "R") ? "L" : "C";
    let pos = (pos_v + pos_h) as Pos;

    if (refPos == "CC") {
      pos = "BC"; // Put label above the center dot
      labelEl.style.color = "black";
    }

    position(labelEl, refEl, { refPos, pos, gap: 8 });
  }

}

export function showElsPositions() {

  const testCtn = getFirst(".test-content-position")!;

  // create the reference box
  const refEl = testCtn.appendChild(elem("div", { "class": "pos-ctn" }));

  append_dots(refEl, testCtn);

  // Top Right - Ls&Rs
  for (const el_pos of POS_NAMES) {
    if (!el_pos.includes("C")) {
      // Mapping to show how to use alignment to get directional behavior
      // (e.g., to be Top-Right of a point, align element's Bottom-Left)
      const map: Record<Pos, Pos> = { "TL": "BR", "TR": "BL", "BL": "TR", "BR": "TL" } as any;
      const pos = map[el_pos];
      const el = append_pos_el(pos, testCtn);
      position(el, refEl, { refPos: 'TR', pos, gap: GAP });
    }
  }

  // Bottom Right - CC
  {
    const pos = "CC";
    const el = append_pos_el(pos, testCtn);
    position(el, refEl, { refPos: 'BR', pos, gap: 100 });
  }

  // Top Left - TC & BC
  {
    const poses = ["BC", "TC"] as Pos[]; // BC is above, TC is below
    for (const pos of poses) {
      const el = append_pos_el(pos, testCtn);
      position(el, refEl, { refPos: 'TL', pos, gap: GAP });
    }
  }

  // Bottom Left
  {
    const poses = ["CR", "CL"] as Pos[]; // CR is left, CL is right
    for (const pos of poses) {
      const el = append_pos_el(pos, testCtn);
      position(el, refEl, { refPos: 'BL', pos, gap: GAP });
    }
  }
}


// #region    --- Utils
function append_dots(refEl: HTMLElement, parent: HTMLElement) {
  // display the dots and labes
  for (const ref_pos of POS_NAMES) {
    // display the dot
    const dotEl = append_pos_dot(parent);
    position(dotEl, refEl, { refPos: ref_pos, pos: "CC" });
  }
}

function append_pos_el(textContent: string, parent: HTMLElement) {
  const el = elem('div', { class: "pos-el", $: { textContent } });
  parent.appendChild(el);
  return el;
}

function append_pos_dot(parent: HTMLElement) {
  const el = elem('div', { class: "pos-dot" });
  parent.appendChild(el);
  return el;
}

function append_pos_label(textContent: string, parent: HTMLElement) {
  const el = elem('div', { class: "pos-label", $: { textContent } });
  parent.appendChild(el);
  return el;
}
// #endregion --- Utils

