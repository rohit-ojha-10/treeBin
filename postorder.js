
const highlight = async (node, text, root) => {
  // animation function , marks current green and marks it white ,when it moves to the next node
  const left = document.getElementById(`${2 * root}`);
  const right = document.getElementById(`${2 * root + 1}`);
  if (left || right) await delay(700);
  // mark the current white after delay and move on to next node
  markNode(node, text, "white", "black");
  if (left) {
    await postorder(2 * root);
    // mark this green again when it returns to explore the right subtree
    markNode(node, text, "green", "white");
    await delay(700);
    markNode(node, text, "white", "black");
  }
  // mark it white , when it moves on to explore right subtree after delay
  if (right) {
    await postorder(2 * root + 1);
    markNode(node, text, "green", "white");
    await delay(700);
    markNode(node, text, "white", "black");
  }

  arr.push(text.textContent);
  array.style.backgroundColor = "white";
  array.textContent = `{ ${arr.map((a) => `${a}`)} }`;
  console.log(root);
};
const postorder = async (root = 1) => {
  const node = document.getElementById(`${root}`);
  const text = document.getElementById(`t-${root}`);
  if (!node) return;
  // console.log(root);
  // mark the current green
  markNode(node, text, "green", "white");

  await highlight(node, text, root);

  const left = document.getElementById(`${2 * root}`);
  const right = document.getElementById(`${2 * root + 1}`);

  if (!left && !right) {
    markNode(node, text, "green", "white");
    await delay(700);
  }
  // after exploring left and right mark it visited and explored
  markNode(node, text, "#3C486B", "white");
};
