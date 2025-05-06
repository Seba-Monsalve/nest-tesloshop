import { connect2server } from "./socket-client";
import "./style.css";

document.querySelector<HTMLDivElement>("#app")!.innerHTML = `
  <div>

<h1>Web socket</h1>


    
<input id="jwt-token" type="text">
<button id="btn-connect">Connect</button>
<br>
<span id='server-status'>disconected</span>

<ul id="client-list">
</ul>

<form action="" id="input-form">
<input type="text" id="input-text" placeholder="Enter text here">
</form>

    
<h3>Messages</h3>
<li id="messages"></li>


  </div>
  
`;

// connect2server();

const jwtToken = document.querySelector<HTMLInputElement>("#jwt-token")!;
const btnConnect = document.querySelector<HTMLButtonElement>("#btn-connect")!;

btnConnect.addEventListener("click", () => {
  if (jwtToken.value.trim().length <= 0) return;
  connect2server(jwtToken.value);
});
