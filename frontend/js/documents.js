document.getElementById("docForm").addEventListener("submit", e => {
  e.preventDefault();
  const formData = new FormData(e.target);

  fetch("http://localhost:3000/api/documents/upload", {
    method: "POST",
    body: formData
  }).then(() => alert("Uploaded"));
});
