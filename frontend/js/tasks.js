const user = JSON.parse(localStorage.getItem("user"));

fetch(`http://localhost:3000/api/tasks/${user.id}`)
  .then(res => res.json())
  .then(tasks => {
    taskList.innerHTML = "";
    tasks.forEach(task => {
      taskList.innerHTML += `
        <div>
          <h4>${task.title}</h4>
          <p>${task.description}</p>
          <button onclick="respond(${task.id}, 'Accepted')">Accept</button>
          <button onclick="respond(${task.id}, 'Declined')">Decline</button>
        </div>
      `;
    });
  });

function respond(taskId, status) {
  const reason = prompt("Reason:");
  fetch("http://localhost:3000/api/tasks/respond", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ taskId, status, reason })
  }).then(() => location.reload());
}
