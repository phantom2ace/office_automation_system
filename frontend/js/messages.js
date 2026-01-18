const user = JSON.parse(localStorage.getItem("user"));

function sendMessage() {
  fetch("http://localhost:3000/api/messages/send", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      senderId: user.id,
      receiverId: receiverId.value,
      content: messageText.value
    })
  }).then(() => alert("Message sent"));
}

fetch(`http://localhost:3000/api/messages/${user.id}`)
  .then(res => res.json())
  .then(messages => {
    inbox.innerHTML = "";
    messages.forEach(msg => {
      inbox.innerHTML += `<p>${msg.content}</p>`;
    });
  });
