/* eslint-disable linebreak-style */

function setNumCutEdges(json_response) {
  let str = json_response["cut_edges"]; // this is a string
  // "{(12, 17), (2, 42).... (19, 56)}"
  // Convert from Python format to Javascript
  str = str.replace("{", "[");
  str = str.replace("}", "]");
  str = str.replaceAll("(", "[");
  str = str.replaceAll(")", "]");
  let cut_edges = JSON.parse(str);

  /*
  cut_edges_str = cut_edges_str.slice(1, cut_edges_str.length - 1);
  console.log(cut_edges_str);

  let cut_edges = cut_edges_str.split(",");
  console.log(cut_edges);
  */

  document.querySelector("#num-cut-edges").innerText = cut_edges.length;
  // document.querySelector("#cut-edges").innerText = cut_edges;

  const cs = document.querySelector("#cut_edges_distrib_canvas");
  // naturalHeight is the intrinsic height of the image in CSS pixels
  const nh = document.querySelector("#cut_edges_distrib_img").naturalHeight;
  const nw = document.querySelector("#cut_edges_distrib_img").naturalWidth;
  // height/width is the rendered height/width of the image in CSS pixels
  const w = document.querySelector("#cut_edges_distrib_canvas").width;
  const h = document.querySelector("#cut_edges_distrib_canvas").height;

  const start_x = 20;
  const end_x = 80;

  // TODO
  const num_cut_edges = cut_edges.length;
  let line_position; // this is going to be a value between 0 and w

  if (num_cut_edges <= start_x) {
    line_position = 0;
  } else if (num_cut_edges >= end_x) {
    line_position = w;
  } else {
    line_position = ((num_cut_edges - start_x) / (end_x - start_x)) * w;
  }

  console.log("Line position:", line_position);
  const ctx = cs.getContext("2d");
  ctx.clearRect(0, 0, w, h);
  ctx.lineWidth = 2;
  ctx.strokeStyle = "red";
  ctx.beginPath();
  ctx.moveTo(line_position, 0);
  ctx.lineTo(line_position, h);
  ctx.closePath();
  ctx.stroke();

  console.log(nh, nw, w);
}

function setContiguityStatus(contiguity_object, dnum) {
  let contiguous = contiguity_object["contiguity"];
  console.log(contiguous);
  document.querySelector("#contiguity-status").innerText = !contiguous
    ? "Districts may have contiguity gaps"
    : "Any districts are contiguous";
}

// This makes a POST request to a PythonAnywhere server
// with the assignment in the request body.
// The server will return a response with the
// 1. contiguity status and
// 2. number of cut edges
// and this function then calls two other functions (defined above)
// that modify the innerHTML of the file
export default function ContiguityChecker(state, brush) {
  if (!state.contiguity) {
    state.contiguity = {};
  }

  const updater = (state, colorsAffected) => {
    let saveplan = state.serialize();
    if (["iowa", "texas"].includes(state.place.id)) {
      console.log("making request");
      const GERRYCHAIN_URL = "//mggg.pythonanywhere.com";
      fetch(GERRYCHAIN_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(saveplan),
      })
        .then((res) => res.json())
        .catch((e) => console.error(e))
        .then((data) => {
          console.log(data);
          setContiguityStatus(data, -999);
          setNumCutEdges(data);
          return data;
        });
    }
    return;
  };

  let allDistricts = [],
    i = 0;
  while (i < state.problem.numberOfParts) {
    allDistricts.push(i);
    i++;
  }
  updater(state, allDistricts);
  return updater;
}
