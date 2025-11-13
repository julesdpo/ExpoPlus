async function loadEvents() {
  try {
    const res = await fetch("/api/events");
    const events = await res.json();

    const container = document.getElementById("events");
    container.innerHTML = "";

    events.forEach(e => {
      const div = document.createElement("div");
      div.className = "event-card";

      div.innerHTML = `
        <h2>${e.title}</h2>
        <p><strong>Lieu :</strong> ${e.venue_name || "Non indiqué"}</p>
        <p><strong>Ville :</strong> ${e.city || "?"}</p>
        <p><strong>Début :</strong> ${e.start_date || "?"}</p>
        <p><strong>Fin :</strong> ${e.end_date || "?"}</p>
      `;

      container.appendChild(div);
    });
  
  } catch (err) {
    console.error("Erreur chargement events:", err);
  }
}

loadEvents();
