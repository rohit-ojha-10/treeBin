const nodes = document.querySelector(".nodes");
const connections = document.querySelector(".connections");
let takenPositions = new Map(); // hashmap to store positions , to check whether a node is overlapping or not

// .................................................creation functions................................................
// creates a text element , used for adding text in the node, takes in x , y , value and id
const createTextElement = (cx, cy, value, id) => {
  const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
  // setting x and y
  text.setAttribute("x", cx);
  text.setAttribute("y", cy);

  // centering text
  text.setAttribute("text-anchor", "middle");
  text.setAttribute("dominant-baseline", "middle");

  // text styling
  text.setAttribute("fill", "#000");
  text.setAttribute("id", `t-${id}`);

  text.setAttribute("class", "node-text");
  text.textContent = `${value}`;

  return text;
};
// creates a node with value using createTextElement
const createNode = (cx, cy, value, id, r) => {
  const node = document.createElementNS("http://www.w3.org/2000/svg", "circle");
  // setting x and y

  node.setAttribute("cx", cx);
  node.setAttribute("cy", cy);

  // setting radius

  node.setAttribute("r", r);

  // setting border

  node.setAttribute("stroke", "black");
  node.setAttribute("stroke-width", 2);

  // node styling

  node.setAttribute("fill", "white");
  node.setAttribute("id", `${id}`);
  node.setAttribute("class", "node");

  // creating text

  const text = createTextElement(cx, cy, value, id);

  //   console.log("text recieved", text);
  return { node: node, text: text };
};

// adds a node , when the user clicks on any option node , replaces the option node , with the child node and connects the parent and child
const addNode = ({ parent, id, showOptions, updateLine }) => {
  const currentNode = document.getElementById(`${id}`); // current option node (+)
  const currentText = document.getElementById(`t-${id}`); // current option text "+"

  const currentCx = parseFloat(currentNode.getAttribute("cx"));
  const currentCy = parseFloat(currentNode.getAttribute("cy"));

  const { node, text } = createNode(currentCx, currentCy, id, id, 30); // new node

  takenPositions.set(JSON.stringify([currentCx, currentCy]), id); // adding the position to the hashmap
  currentNode.remove(); // removes previous option node present here
  currentText.remove(); // removes previous option text  present here

  node.setAttribute("class", "node");
  text.setAttribute("class", "node-text");

  nodes.appendChild(node);
  nodes.appendChild(text);

  updateLine(parent, node); // connects tot the parent

  const line2 = document.getElementById(`line-${id}`); // current line
  const allLines = Array.from(document.getElementsByClassName("line")); // accessing all lines
  // checks if by adding this node , it's line intersects with any other node's line , if it does , it repositions with their lca
  console.log(allLines);
  allLines.forEach((line) => {
    const lineID = line.getAttribute("id");
    const numID = Number(lineID.split("-")[1]);

    if (
      `line-${id}` !== lineID && // should not be the same line
      Math.floor(id / 2) !== Math.floor(numID / 2) && // should not have the same parent
      Math.floor(id / 4) !== Math.floor(numID / 2) && // current node's parent's parent should not be equal to the other's immediate parent
      isIntersecting(line, line2) // check intersection
    ) {
      console.log(id, lineID);
      let lca = findLCA(1, id, numID);
      let collisions = [];
      reposition(lca, collisions); // reposition
      // console.log("collisions",collisions)
      removeCollisions(collisions); // settle overlaps due to this reposition
    }
  });
  function showOptionsCall() {
    showOptions(id);
  }

  node.addEventListener("click", showOptionsCall);
};
// ..............removing option nodes of the nodes which are not in focus anymore..........
const removeOptionNodes = (className = "option-node") => {
  const optionNodes = document.getElementsByClassName(`${className}`); // returns document object
  const elementsArray = Array.from(optionNodes); // coverting it to an array

  elementsArray.forEach((element) => {
    element.remove(); // removing each option node seperately (only two can exist at one time)
  });
};

const resetNodes = () => {
  const nodes = document.getElementsByClassName(`node`); // returns document object
  const elementsArray = Array.from(nodes); // coverting it to an array
  const traversalArray = document.getElementsByClassName(`traversal-array`); // returns document object
  let traversalArrayelements = Array.from(traversalArray); // coverting it to an array
  arr = []; // resetting array
  traversalArrayelements[0].innerHTML="" // removing previous traversal
  // const header = document.querySelector(".sticky-header");
  // const array = document.createElement("span");
  // array.setAttribute("class", "traversal-array");

  // header.appendChild(array); // appending the span again because it won't be appended on every traversal now

  elementsArray.forEach((element) => {
    element.setAttribute("fill", "white");
    const idx = element.getAttribute("id");
    const text = document.getElementById(`t-${idx}`);
    text.setAttribute("fill", "black");
  });
};
// .........................Reposition related functions below..................
const repositionTree = (id) => {
  reposition(id);
};

// takes in the lca as ind and then repositions its children by expanding the distance of the children and moving children's subtree accordingly
// uses collisions to store other overlaps that might take place while repositioning this lca and this collision gets dealed with later in the
// removecollisions function, the remove collision function is called in addLeftOptionNode and addRightOptionNode

const reposition = (ind, collisions = [], dir = 0) => {
  let q = new Queue(); // making a queue for iterative dfs
  q.push({ id: ind, dir: 0 }); // dir is 0 for the lca (root) node , so it stays fixed

  while (q.length()) {
    let { id, dir } = q.front();

    q.pop();

    const node = document.getElementById(`${id}`);
    const text = document.getElementById(`t-${id}`);
    const parentNode = document.getElementById(`${Math.floor(id / 2)}`);

    console.log("repositioning", "id=", id, "dir=", dir);

    const cx = Number(node.getAttribute("cx"));
    const cy = Number(node.getAttribute("cy"));

    let position = JSON.stringify([cx, cy]);
    // dir = 1 means left subtree
    if (dir === 1) {
      // if it overlaps with a previous position
      if (takenPositions.has(JSON.stringify([cx - 100, cy]))) {
        //collision detected
        console.log(
          "spreaded1: ",
          takenPositions.get(JSON.stringify([cx - 100, cy])),
          id
        );
        const sibling = takenPositions.get(JSON.stringify([cx - 100, cy])); // getting the node it's getting overlapped with
        const lca = findLCA(1, id, sibling); // lca
        if (Math.floor(id / 2) !== lca && lca !== id) collisions.push(lca); // collision's lca pushed
      }

      node.setAttribute("cx", cx - 100);
      text.setAttribute("x", cx - 100);

      takenPositions.delete(position); // previous position removed from hashmap
      takenPositions.set(JSON.stringify([cx - 100, cy]), id); // current new position added
    }
    // dir = 2 means right subtree
    else if (dir === 2) {
      //collision detected
      if (takenPositions.has(JSON.stringify([cx + 100, cy]))) {
        console.log(
          "spreaded2: ",
          takenPositions.get(JSON.stringify([cx + 100, cy])),
          id
        );

        const sibling = takenPositions.get(JSON.stringify([cx + 100, cy])); // getting the node it's getting overlapped with
        const lca = findLCA(1, id, sibling);

        if (Math.floor(id / 2) !== lca && lca !== id) collisions.push(lca); // collision's lca pushed
      }

      node.setAttribute("cx", cx + 100);
      text.setAttribute("x", cx + 100);

      takenPositions.delete(position); // previous position removed from hashmap
      takenPositions.set(JSON.stringify([cx + 100, cy]), id); // current new position added
    }

    if (dir !== 0 && text.textContent !== "+")
      updateLine(parentNode, node, "reposition"); // readjusts the line if the child is not an option node

    let leftChild = document.getElementById(`${2 * id}`);
    let rightChild = document.getElementById(`${2 * id + 1}`);

    if (leftChild) q.push({ id: 2 * id, dir: dir === 0 ? 1 : dir });
    if (rightChild) q.push({ id: 2 * id + 1, dir: dir === 0 ? 2 : dir });
  }
};

const removeCollisions = (collisions) => {
  // console.log("banti", collisions);
  let currpos = 0;
  // settle all collisions by respositioning
  while (collisions.length - currpos > 0) {
    let len = collisions.length;
    for (let i = currpos; i < len; i++) {
      reposition(collisions[i], collisions);
      currpos++;
    }
  }
};

// To find the lowest common ancestor of p and q ,memo need not be passed while calling it
function findLCA(root, p, q, memo = new Map()) {
  const node = document.getElementById(`${root}`);
  if (!node) return null;

  if (root === p || root === q) {
    return root;
  }

  const memoKey = `${root}-${p}-${q}`;

  if (memo.has(memoKey)) {
    return memo.get(memoKey);
  }

  const leftLCA = findLCA(2 * root, p, q, memo);
  const rightLCA = findLCA(2 * root + 1, p, q, memo);

  if (leftLCA && rightLCA) {
    memo.set(memoKey, root);
    return root;
  }

  const lca = leftLCA || rightLCA;
  memo.set(memoKey, lca);
  return lca;
}
// ........................Line related functions here .........................

// .................to add a line between two circles,circles are document object svgs.................
function updateLine(circle1, circle2, variant = "default") {
  const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
  if (variant === "reposition") {
    const prevLine = document.getElementById(
      `line-${circle2.getAttribute("id")}`
    );
    if (prevLine) prevLine.remove();
  }
  const x1 = parseFloat(circle1.getAttribute("cx"));
  const y1 = parseFloat(circle1.getAttribute("cy"));

  const x2 = parseFloat(circle2.getAttribute("cx"));
  const y2 = parseFloat(circle2.getAttribute("cy"));

  line.setAttribute("x1", x1);
  line.setAttribute("y1", y1);

  line.setAttribute("x2", x2);
  line.setAttribute("y2", y2);

  line.setAttribute("class", "line");
  line.setAttribute("id", `line-${circle2.getAttribute("id")}`);

  line.setAttribute("stroke", "#000");
  line.setAttribute("stroke-width", "2");

  connections.appendChild(line);
}

// .............................To check if two lines interset each other..................................
const isIntersecting = (line1, line2) => {
  const line1X1 = parseFloat(line1.getAttribute("x1"));
  const line1Y1 = parseFloat(line1.getAttribute("y1"));
  const line1X2 = parseFloat(line1.getAttribute("x2"));
  const line1Y2 = parseFloat(line1.getAttribute("y2"));

  const line2X1 = parseFloat(line2.getAttribute("x1"));
  const line2Y1 = parseFloat(line2.getAttribute("y1"));
  const line2X2 = parseFloat(line2.getAttribute("x2"));
  const line2Y2 = parseFloat(line2.getAttribute("y2"));

  // Calculate the slopes of the lines
  const slope1 = (line1Y2 - line1Y1) / (line1X2 - line1X1);
  const slope2 = (line2Y2 - line2Y1) / (line2X2 - line2X1);

  // Calculate the intersection point
  const intersectionX =
    (slope1 * line1X1 - slope2 * line2X1 + line2Y1 - line1Y1) /
    (slope1 - slope2);
  const intersectionY = slope1 * (intersectionX - line1X1) + line1Y1;

  // Check if the intersection point lies within the bounds of both lines
  const isIntersecting =
    intersectionX >= Math.min(line1X1, line1X2) &&
    intersectionX <= Math.max(line1X1, line1X2) &&
    intersectionY >= Math.min(line1Y1, line1Y2) &&
    intersectionY <= Math.max(line1Y1, line1Y2) &&
    intersectionX >= Math.min(line2X1, line2X2) &&
    intersectionX <= Math.max(line2X1, line2X2) &&
    intersectionY >= Math.min(line2Y1, line2Y2) &&
    intersectionY <= Math.max(line2Y1, line2Y2);

  if (isIntersecting) {
    return true;
  } else {
    return false;
  }
};
const delay = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
}; // function to delay , added in traversals , returns a promise , so await could be used

const markNode = (node, text, c1, c2) => {
  node.setAttribute("fill", c1);
  text.setAttribute("fill", c2);
};
