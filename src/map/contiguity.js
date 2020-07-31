/* eslint-disable linebreak-style */
function setNumCutEdges(json_response) {
  let cut_edges_str = json_response["cut_edges"]; // this is a string
  cut_edges_str = cut_edges_str.slice(1, cut_edges_str.length - 1);
  console.log(cut_edges_str);

  let cut_edges = cut_edges_str.split(",");
  console.log(cut_edges);

  document.querySelector("#num-cut-edges").innerText = cut_edges.length;
  document.querySelector("#cut-edges").innerText = cut_edges;

  const cs = document.querySelector("#cut_edges_distrib_canvas");
  // naturalHeight is the intrinsic height of the image in CSS pixels
  const nh = document.querySelector("#cut_edges_distrib_img").naturalHeight;
  const nw = document.querySelector("#cut_edges_distrib_img").naturalWidth;
  // height/width is the rendered height/width of the image in CSS pixels
  const h = document.querySelector("#cut_edges_distrib_img").height;
  const w = document.querySelector("#cut_edges_distrib_img").width;

  const h_scale = h / nh;
  const w_scale = w / nw;

  const start_x = 20;
  const end_x = 100;
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
      const GERRYCHAIN_URL = "//lieu.pythonanywhere.com";
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
