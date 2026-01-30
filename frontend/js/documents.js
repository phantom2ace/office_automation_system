document.getElementById("docForm").addEventListener("submit", e => {
  e.preventDefault();
  const formData = new FormData(e.target);

  fetch("/api/documents/upload", {
    method: "POST",
    body: formData
  }).then(() => alert("Uploaded"));
});
