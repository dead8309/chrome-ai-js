import "../style.css";

const session = await window.ai.createTextSession();

const chat = document.getElementById("chat");
const form = document.getElementById("form");
const send = document.getElementById("send");
/**
 * @param {KeyboardEvent} event
 */
form.onkeydown = (event) => {
  if (event.shiftKey) return;
  if (event.key === "Enter" && form) {
    event.preventDefault();
    form.dispatchEvent(new Event("submit"));
  }
};

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  send.disabled = true;
  const formData = new FormData(event.target);
  const prompt = formData.get("prompt");
  event.target.reset();

  await renderMessage({ data: prompt, sender: "user" });

  const response = session.promptStreaming(prompt);
  await renderMessage({ data: response, sender: "ai" });
  send.disabled = false;
});

async function renderMessage(message) {
  switch (message.sender) {
    case "ai":
      await renderAiMessage(message);
      break;
    case "user":
      renderUserMessage(message);
      break;
  }
}

export async function renderAiMessage(message) {
  const id = Math.random().toString(36).substring(2, 9);
  const time = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  });
  let lastTime = performance.now();
  let totalLatency = 0;
  let chunkCount = 0;
  let averageLatency = 0;

  const html = `
  <div class="grid w-fit max-w-xl gap-2 text-sm">
  <div class="flex items-center gap-2">
    <span class="relative flex shrink-0 overflow-hidden rounded-full w-8 h-8">
      <img class="aspect-square h-full w-full" alt="AI Assistant" src="/ai.webp" />
  </span>
      <div class="font-medium">Gemini</div>
      <div class="text-xs text-muted-foreground">${time}</div>
      <p id="latency-${id}"></p>
  </div>
  <div class="max-w-xl bg-card rounded-lg p-3">
      <p id="${id}">Thinking...</p>
  </div>
</div>
    `;
  chat.innerHTML += html;
  const chat_message = document.getElementById(id);
  const latency_element = document.getElementById(`latency-${id}`);
  for await (const chunk of message.data) {
    const currentTime = performance.now();
    const latency = currentTime - lastTime;
    totalLatency += latency;
    chunkCount++;

    averageLatency = totalLatency / chunkCount;

    console.log(`Chunk received: ${chunk}`);
    console.log(`Current Latency: ${latency.toFixed(2)} ms`);
    console.log(`Average Latency: ${averageLatency.toFixed(2)} ms`);

    lastTime = currentTime;
    chat_message.innerHTML = chunk;
    chat_message.scrollIntoView({ behavior: "smooth" });
    latency_element.className =
      "text-xs font-medium text-blue-600 bg-blue-200 px-2 rounded-full py-1";
    latency_element.innerHTML = `${averageLatency.toFixed(1)} ms`;
  }
}

export function renderUserMessage(message) {
  const time = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  });
  const html = `
    <div class="flex flex-col items-end gap-3 justify-end">
    <div class="grid gap-1 text-sm">
      <div class="flex items-center gap-2 justify-end">
        <div class="font-medium">You</div>
        <div class="text-xs text-muted-foreground">${time}</div>
        <span
      class="relative flex shrink-0 overflow-hidden rounded-full w-8 h-8"
    >
      <img
        class="aspect-square h-full w-full"
        src="/user.jpg"
      />
    </span>
      </div>
      <div
        class="bg-primary rounded-lg p-3 text-primary-foreground"
      >
        <p>
            ${message.data}
        </p>
      </div>
    </div>
  </div>`;
  chat.innerHTML += html;
}


