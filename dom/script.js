// const container = document.querySelector("#container");

// const content = document.createElement("div");
// content.classList.add("content");
// content.textContent = "This is the glorious text-content!";

// container.appendChild(content);

const container = document.querySelector('#container')
const contentRed = document.createElement('div');
const header = document.createElement('h3');
const containerPink = document.createElement('div');
const headerPink = document.createElement('h1');
const para = document.createElement('p');

containerPink.appendChild(headerPink);
containerPink.appendChild(para);

contentRed.style.color = "red";
contentRed.textContent = "Hey I'm red";
header.style.color = "blue";
header.textContent = "I'm a blue h3";
containerPink.style.backgroundColor = "pink";
containerPink.style.borderStyle = "solid";
containerPink.style.borderColor = "black";
headerPink.textContent = "I'm in a div";
para.textContent = "ME TOO!";

container.appendChild(contentRed);
container.appendChild(header);
container.appendChild(containerPink);

const btn = document.querySelector("#btn");
btn.onclick = () => alert("Hello World2");

const btn2 = document.querySelector("#btn2");
btn2.addEventListener("click", (e) => {
//   alert("Hello World3");
//   console.log(e.target);
e.target.style.background = "blue";
});

// buttons is a node list. It looks and acts much like an array.
const buttons = document.querySelectorAll("button");

// we use the .forEach method to iterate through each button
buttons.forEach((button) => {
  // and for each one we add a 'click' listener
  button.addEventListener("click", () => {
    alert(button.id);
  });
});
