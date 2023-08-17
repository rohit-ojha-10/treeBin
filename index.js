window.addEventListener("load", function () {
  const nodes = document.querySelector(".nodes"); // container with all the nodes / circles(svgs)
  const connections = document.querySelector(".connections"); // container with all the connectors / lines(svgs)

  let activeNode; // used to set the node which is in focus right now
  let currValue;
  //__________________ adds a left option node_______________________________
  const addLeftOptionNode = (parentLevel) => {
    const parent = document.getElementById(`${parentLevel}`); // accessing parent element

    const parentCx = parseFloat(parent.getAttribute("cx"));
    const parentCy = parseFloat(parent.getAttribute("cy"));

    const left = 2 * parentLevel;

    const { node, text } = createNode(
      parentCx - 100,
      parentCy + 100,
      "+",
      left,
      20
    ); // creating option node using createNode() ,written in utils.js
    nodes.appendChild(node);
    nodes.appendChild(text);
    const position = JSON.stringify([parentCx - 100, parentCy + 100]); // position to be assigned to this option node
    // console.log(JSON.parse(position));
    if (takenPositions.has(position)) {
      // if the position is overlapping , reposotion using their (current node and the one it's overlapping with) lca
      let parentID = takenPositions.get(position);
      console.log("here", parentID);
      if (parentID) {
        let lca = findLCA(1, parentID, parentLevel);
        let collisions = [];
        reposition(lca, collisions); // repositioning
        console.log("collisions", collisions);
        removeCollisions(collisions); // settling errors occured due to repositioning
      }
    }
    node.setAttribute("class", "option-node");
    text.setAttribute("class", "option-node");

    // console.log(node, text);

    node.addEventListener("click", () =>
      addNode({ parent: parent, id: left, showOptions, updateLine })
    ); // event listener for adding this node to the tree / connecting it to it's parent
  };

  //__________________ adds a right option node_______________________________
  const addRightOptionNode = (parentLevel) => {
    const parent = document.getElementById(`${parentLevel}`); // accessing parent element

    const parentCx = parseFloat(parent.getAttribute("cx"));
    const parentCy = parseFloat(parent.getAttribute("cy"));

    const right = 2 * parentLevel + 1;

    const { node, text } = createNode(
      parentCx + 100,
      parentCy + 100,
      "+",
      right,
      20
    ); // creating option node using createNode() ,written in utils.js
    nodes.appendChild(node);
    nodes.appendChild(text);
    const position = JSON.stringify([parentCx + 100, parentCy + 100]); // position to be assigned to this option node
    // console.log(JSON.parse(position));
    if (takenPositions.has(position)) {
      // if the position is overlapping , reposotion using their (current node and the one it's overlapping with) lca

      let parentID = takenPositions.get(position);

      if (parentID) {
        let lca = findLCA(1, parentID, parentLevel);
        let collisions = [];
        reposition(lca, collisions); // repositioning
        console.log("collisions", collisions);
        removeCollisions(collisions); // settling errors occured due to repositioning
      }
      console.log(takenPositions);
    }
    node.setAttribute("class", "option-node");
    text.setAttribute("class", "option-node");

    // console.log(node, text);

    node.addEventListener("click", () =>
      addNode({ parent: parent, id: right, showOptions, updateLine })
    ); // event listener for adding this node to the tree / connecting it to it's parent
  };

  //__________________ displays option nodes on the screen , displays -> (+)left (+)right for the node_______________________________
  const showOptions = (parentLevel) => {
    removeOptionNodes(); // removes option nodes of any other node , to put this one on focus

    let prevBox = document.getElementById("change-value"); // get previous input box of previous node if it exists
    if (prevBox) prevBox.remove(); // remove previous input box

    let currentNode = document.getElementById(`${activeNode}`); // accessing the current active node
    let currentNodeText = document.getElementById(`t-${activeNode}`); // accessing the current active node's text

    let boxForInputandButton = document.createElement("div"); // creating div which will contain input element and button to save
    boxForInputandButton.setAttribute("id", "change-value");
    let changeValueInput = document.createElement("INPUT"); // creating input

    let changeValueButton = document.createElement("div"); // save button
    changeValueButton.setAttribute("class", "button-like-div");
    changeValueButton.textContent = "Save";
    const header = document.querySelector(".sticky-header");
    if (activeNode == parentLevel) {
      // if the current active node == the node clicked right now , deselect this node
      currentNode = document.getElementById(`${activeNode}`);

      if (currentNode) {
        currentNode.setAttribute("stroke", "black");
        currentNode.setAttribute("stroke-width", "2");
      }

      activeNode = 0; // no active node

      removeOptionNodes();
    } else {
      // different node is put to focus
      currentNode = document.getElementById(`${activeNode}`);

      if (currentNode) {
        // putting the previous node out of focus
        currentNode.setAttribute("stroke", "black");
        currentNode.setAttribute("stroke-width", "2");
      }

      activeNode = parentLevel; // assigning new active node

      const leftChild = document.getElementById(`${2 * parentLevel}`) !== null;
      const rightChild =
        document.getElementById(`${2 * parentLevel + 1}`) !== null;

      // add left and right options accoedingly
      if (!rightChild) addRightOptionNode(parentLevel);
      if (!leftChild) addLeftOptionNode(parentLevel);
    }

    currentNode = document.getElementById(`${activeNode}`);
    currentNodeText = document.getElementById(`t-${activeNode}`); // accessing the current active node
    // putting new active node in focus
    if (currentNode) {
      currentNode.setAttribute("stroke", "blue");
      currentNode.setAttribute("stroke-width", "5"); // style to show current active node in focus

      changeValueInput.setAttribute("class", "styled-input");
      changeValueInput.setAttribute(
        "placeholder",
        "Set New value of this node"
      );

      changeValueButton.addEventListener("click", () => {
        // console.log("here", changeValueInput);
        currValue = changeValueInput.value;
        currentNodeText.textContent = currValue;
      }); // to change the value in the node

      boxForInputandButton.appendChild(changeValueInput); // appending input
      boxForInputandButton.appendChild(changeValueButton); // appending save button
      header.appendChild(boxForInputandButton); // appending them as whole
    }
  };

  //__________________ adds the root node of the tree_______________________________
  const addFirstNode = () => {
    const { node, text } = createNode(9440, 5380, 1, 1, 30); // creates the first node

    // console.log(node, text);
    var element = document.getElementById("1");
    if (!element) {
      nodes.appendChild(node);
      nodes.appendChild(text);
    }
    element = document.getElementById("1");

    if (element) {
      // Scroll to the element's coordinates
      if (element) {
        element.scrollIntoView({
          behavior: "auto",
          block: "center",
          inline: "center",
        });
      }
    }

    function showOptionsCall() {
      showOptions(1);
    } // calls show options , displays -> (+)left (+)right for the node
    const addNodeButton = document.querySelector(".button-like-div");
    addNodeButton.textContent = "Reposition to root";
    node.addEventListener("click", showOptionsCall);
  };

  document
    .querySelector(".button-like-div")
    .addEventListener("click", addFirstNode);
  // ________________________________________________________________to add the dragging effect_______________________________________________
  const container = document.querySelector(".main-container");
  let startY;
  let startX;
  let scrollLeft;
  let scrollTop;
  let isDown;

  container.addEventListener("mousedown", (e) => mouseIsDown(e));
  container.addEventListener("mouseup", (e) => mouseUp(e));
  container.addEventListener("mouseleave", (e) => mouseLeave(e));
  container.addEventListener("mousemove", (e) => mouseMove(e));

  function mouseIsDown(e) {
    isDown = true;
    startY = e.pageY - container.offsetTop;
    startX = e.pageX - container.offsetLeft;
    scrollLeft = container.scrollLeft;
    scrollTop = container.scrollTop;
  }
  function mouseUp(e) {
    isDown = false;
  }
  function mouseLeave(e) {
    isDown = false;
  }
  function mouseMove(e) {
    if (isDown) {
      e.preventDefault();
      //Move vertcally
      const y = e.pageY - container.offsetTop;
      const walkY = y - startY;
      container.scrollTop = scrollTop - walkY;

      //Move Horizontally
      const x = e.pageX - container.offsetLeft;
      const walkX = x - startX;
      container.scrollLeft = scrollLeft - walkX;
    }
  }

  // script.js

  const copyButton = document.getElementById("copyButton");
  const textToCopy = document.getElementById("textToCopy");

  copyButton.addEventListener("click", function () {
    const text = textToCopy.textContent;

    const textarea = document.createElement("textarea");
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();

    try {
      document.execCommand("copy");
      copyButton.textContent = "Copied!";
      setTimeout(() => {
        copyButton.textContent = "Copy";
      }, 2000); // Reset button text after 2 seconds
    } catch (err) {
      console.error("Failed to copy: ", err);
    }

    document.body.removeChild(textarea);
  });
});

// Function to handle zooming
let currentZoom = 100; // Initial zoom level

function handleZoom(event) {
  if (event.deltaY !== 0) {
    // Zoom in or out vertically
    currentZoom += event.deltaY > 0 ? -10 : 10;
  }

  if (event.deltaX !== 0) {
    // Zoom in or out horizontally
    currentZoom += event.deltaX > 0 ? -10 : 10;
  }

  // Limit zoom level to a certain range
  currentZoom = Math.max(50, Math.min(200, currentZoom));

  // Apply zoom to the content
  document.querySelector(".main-container").style.zoom = `${currentZoom}%`;

  // Prevent default scrolling behavior
  event.preventDefault();
}

// Add the zoom event listener to the content
document.querySelector(".main-container").addEventListener("wheel", handleZoom);
