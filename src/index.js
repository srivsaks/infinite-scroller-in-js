import "./styles.css";

const input = document.querySelector("input");
const divs = document.querySelector(".result");
let value = "";
let controller = new AbortController();

function observerCB(entries) {
  if (entries[0].isIntersecting) {
    observer.unobserve(entries[0].target);

    const loading = document.createElement("div");
    loading.textContent = "loading....";
    divs.appendChild(loading);
    onInput(value);
  }
}

const observer = new IntersectionObserver(observerCB);

let ans = [];

let page = 1;

function updateItems() {
  divs.innerHTML = `
  ${ans
    .map((item) => {
      return `<div>${item}</div>`;
    })
    .join("")}
  `;

  const last = divs.children[divs.children.length - 1];
  observer.observe(last);
  console.log(last);
}

function makeAPICAll(val) {
  console.log("i was called", page);
  fetch(`https://openlibrary.org/search.json?q=${val}&page=${page}`, {
    signal: controller.signal
  })
    .then((res) => {
      res.json().then((res2) => {
        const newItems = res2.docs.map((item) => item.title);
        console.log(newItems);
        ans = ans.concat(newItems);
        page++;
        //console.log(ans);
        updateItems();
      });
    })
    .catch((err) => {
      console.log(err);
    });
}

function debounce(fn, delay) {
  let timer = null;
  return (...args) => {
    // console.log("i was cleared");

    clearTimeout(timer);

    if (controller) controller.abort();
    controller = new AbortController();

    timer = setTimeout(() => {
      fn(...args);
    }, delay);
  };
}

const onInput = debounce(makeAPICAll, 1000);

input.addEventListener("input", (e) => {
  value = e.target.value;
  onInput(e.target.value);
});
