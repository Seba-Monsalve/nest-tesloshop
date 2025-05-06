// localhost:3000/socket.io/socket.io.js

import { Manager, Socket } from "socket.io-client";

export const connect2server = (jwt: string) => {
  const manager = new Manager("http://localhost:3000/socket.io", {
    extraHeaders: { authentication: jwt },
  });
  const socket = manager.socket("/");
  addListeners(socket);
};

const addListeners = (socket: Socket) => {
  const inputForm = document.querySelector("#input-form")!;
  const inputText = document.querySelector<HTMLInputElement>("#input-text")!;
  const clientList = document.querySelector<HTMLFormElement>("#client-list")!;
  const serverStatus = document.querySelector("#server-status")!;
  const messages = document.querySelector<HTMLUListElement>("#messages")!;

  socket.on("connect", () => {
    serverStatus.innerHTML = "connected";
  });
  socket.on("disconnect", () => {
    serverStatus.innerHTML = "disconnected";
  });

  socket.on("clients_updated", (clients: string[]) => {
    clientList.innerHTML = ""; // Clear the list before adding new items
    clients.forEach((client) => {
      let li = document.createElement("li");
      li.innerHTML = client;
      clientList.appendChild(li);
    });

    inputForm.addEventListener("submit", (e) => {
      e.preventDefault();
      if (inputText.value.trim().length <= 0) return;

      socket.emit("message", inputText.value);
      inputText.value = ""; // Clear the input field after sending the message
    });
  });

  socket.on(
    "message-from-server",
    (payload: { fullName: string; message: string }) => {
      messages.innerHTML += `<li>${payload.fullName}: ${payload.message}</li>`;
    }
  );
};
