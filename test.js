fetch("http://localhost:5000/api/cases/invalid/claims", {
  method: "POST",
  body: JSON.stringify({
    title: "Test",
    evidence: [{ title: "Ev", type: "IMAGE", relationship: "SUPPORTS" }],
    sources: [{ title: "Src", sourceLocation: "", sourceDate: "", externalSourceType: "সংবাদ", externalSourceName: "Test", externalLinks: [], relationship: "SUPPORTS" }]
  }),
  headers: { "Content-Type": "application/json" }
}).then(r => r.json()).then(console.log);
