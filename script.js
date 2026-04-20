/* ==========================================
   MetroFare — Advanced JavaScript Logic
   Dijkstra · Fare Engine · Voice · PWA · Dashboard
   ========================================== */

"use strict";

// ==========================================
// PRELOADER
// ==========================================
window.addEventListener("load", () => {
  setTimeout(() => {
    const loader = document.getElementById("preloader");
    if (loader) loader.classList.add("hidden");
  }, 1800);
  setDefaultTime();
  loadStations();
  initMap();
  initClock();
  initScrollReveal();
  initNavScroll();
  initSearchBar();
  loadDashboard();
  simulateNextTrain();
  initTheme();
  registerServiceWorker();
  playWelcome();
});

// ==========================================
// THEME TOGGLE
// ==========================================
function initTheme() {
  const saved = localStorage.getItem("mf_theme") || "dark";
  document.documentElement.setAttribute("data-theme", saved);
  updateThemeIcon(saved);
}
document.getElementById("themeToggle").addEventListener("click", () => {
  const current = document.documentElement.getAttribute("data-theme");
  const next = current === "dark" ? "light" : "dark";
  document.documentElement.setAttribute("data-theme", next);
  localStorage.setItem("mf_theme", next);
  updateThemeIcon(next);
});
function updateThemeIcon(theme) {
  document.querySelector(".theme-icon").textContent = theme === "dark" ? "🌙" : "☀️";
}

// ==========================================
// HAMBURGER MENU
// ==========================================
document.getElementById("hamburger").addEventListener("click", () => {
  document.getElementById("navLinks").classList.toggle("open");
});
document.querySelectorAll(".nav-link").forEach(l => {
  l.addEventListener("click", () => document.getElementById("navLinks").classList.remove("open"));
});

// ==========================================
// CLOCK & NEXT TRAIN SIMULATION
// ==========================================
function initClock() {
  const update = () => {
    const now = new Date();
    const t = now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
    document.getElementById("currentTime").textContent = t;
  };
  update();
  setInterval(update, 30000);
}
function simulateNextTrain() {
  let mins = Math.floor(Math.random() * 8) + 2;
  const el = document.getElementById("nextTrainTime");
  const tick = setInterval(() => {
    el.textContent = mins + " min";
    mins--;
    if (mins < 0) {
      mins = Math.floor(Math.random() * 8) + 2;
      showToast("🚇 Train arriving at Majestic — Platform 2", "success");
    }
  }, 60000);
}
function setDefaultTime() {
  const now = new Date();
  const hh = String(now.getHours()).padStart(2, "0");
  const mm = String(now.getMinutes()).padStart(2, "0");
  document.getElementById("departureTime").value = `${hh}:${mm}`;
}

// ==========================================
// NAVBAR SCROLL EFFECT
// ==========================================
function initNavScroll() {
  const nav = document.getElementById("navbar");
  const links = document.querySelectorAll(".nav-link");
  window.addEventListener("scroll", () => {
    nav.classList.toggle("scrolled", window.scrollY > 50);
    // Active link
    const sections = ["home", "calculator", "map", "dashboard", "about"];
    for (const id of sections) {
      const el = document.getElementById(id);
      if (!el) continue;
      const rect = el.getBoundingClientRect();
      if (rect.top <= 100 && rect.bottom > 100) {
        links.forEach(l => l.classList.remove("active"));
        const match = document.querySelector(`.nav-link[href="#${id}"]`);
        if (match) match.classList.add("active");
      }
    }
  });
}

// ==========================================
// SCROLL REVEAL
// ==========================================
function initScrollReveal() {
  const els = document.querySelectorAll(".glass-card, .section-header, .feature-item, .about-text, .feature-list");
  els.forEach(el => el.classList.add("reveal"));
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add("visible"); });
  }, { threshold: 0.1 });
  document.querySelectorAll(".reveal").forEach(el => io.observe(el));
}

// ==========================================
// TABS
// ==========================================
document.querySelectorAll(".calc-tab").forEach(tab => {
  tab.addEventListener("click", () => {
    document.querySelectorAll(".calc-tab").forEach(t => t.classList.remove("active"));
    tab.classList.add("active");
    const name = tab.dataset.tab;
    document.getElementById("routeTab").classList.toggle("hidden", name !== "route");
    document.getElementById("ticketTab").classList.toggle("hidden", name !== "ticket");
  });
});

// ==========================================
// ROUTE OPTIONS
// ==========================================
document.querySelectorAll(".route-option").forEach(opt => {
  opt.addEventListener("click", () => {
    document.querySelectorAll(".route-option").forEach(o => o.classList.remove("active"));
    opt.classList.add("active");
  });
});

// ==========================================
// STATION DATA & DROPDOWNS
// ==========================================
let stationCoords = {};

function loadStations() {
  const fromEl = document.getElementById("from");
  const toEl = document.getElementById("to");
  fromEl.innerHTML = "";
  toEl.innerHTML = "";

  if (typeof metroData === "undefined") {
    // Fallback demo data if station.js not present
    window.metroData = [
      { "Station Name (English)": "Baiyappanahalli", Line: "Purple", Lat: 12.9908, Lng: 77.6537 },
      { "Station Name (English)": "Indiranagar", Line: "Purple", Lat: 12.9784, Lng: 77.6408 },
      { "Station Name (English)": "Halasuru", Line: "Purple", Lat: 12.9768, Lng: 77.6268 },
      { "Station Name (English)": "Trinity", Line: "Purple", Lat: 12.9756, Lng: 77.6145 },
      { "Station Name (English)": "MG Road", Line: "Purple", Lat: 12.9756, Lng: 77.6067 },
      { "Station Name (English)": "Cubbon Park", Line: "Purple", Lat: 12.9752, Lng: 77.5970 },
      { "Station Name (English)": "Vidhana Soudha", Line: "Purple", Lat: 12.9762, Lng: 77.5905 },
      { "Station Name (English)": "Sir M Visvesvaraya", Line: "Purple", Lat: 12.9770, Lng: 77.5835 },
      { "Station Name (English)": "Majestic", Line: "Purple", Lat: 12.9785, Lng: 77.5720 },
      { "Station Name (English)": "Majestic", Line: "Green", Lat: 12.9785, Lng: 77.5720 },
      { "Station Name (English)": "City Railway Station", Line: "Green", Lat: 12.9780, Lng: 77.5660 },
      { "Station Name (English)": "Magadi Road", Line: "Green", Lat: 12.9727, Lng: 77.5573 },
      { "Station Name (English)": "Hosahalli", Line: "Green", Lat: 12.9642, Lng: 77.5468 },
      { "Station Name (English)": "Vijayanagar", Line: "Green", Lat: 12.9604, Lng: 77.5396 },
      { "Station Name (English)": "Attiguppe", Line: "Green", Lat: 12.9601, Lng: 77.5307 },
      { "Station Name (English)": "Deepanjali Nagar", Line: "Green", Lat: 12.9617, Lng: 77.5218 },
      { "Station Name (English)": "Mysuru Road", Line: "Green", Lat: 12.9595, Lng: 77.5141 },
      { "Station Name (English)": "Peenya", Line: "Purple", Lat: 13.0285, Lng: 77.5190 },
      { "Station Name (English)": "Yeshwantpur", Line: "Purple", Lat: 13.0205, Lng: 77.5481 },
      { "Station Name (English)": "Sandal Soap Factory", Line: "Purple", Lat: 13.0173, Lng: 77.5549 },
      { "Station Name (English)": "Mahalakshmi", Line: "Purple", Lat: 13.0085, Lng: 77.5637 },
      { "Station Name (English)": "Rajajinagar", Line: "Purple", Lat: 12.9958, Lng: 77.5616 },
      { "Station Name (English)": "Kuvempu Road", Line: "Purple", Lat: 12.9896, Lng: 77.5646 },
      { "Station Name (English)": "Srirampura", Line: "Purple", Lat: 12.9851, Lng: 77.5658 },
      { "Station Name (English)": "Goraguntepalya", Line: "Purple", Lat: 12.9820, Lng: 77.5643 },
    ];
  }

  metroData.forEach(s => {
    const name = s["Station Name (English)"].trim();
    if (s.Lat && s.Lng) stationCoords[name] = [s.Lat, s.Lng];
    const o1 = new Option(name, name);
    const o2 = new Option(name, name);
    fromEl.add(o1);
    toEl.add(o2);
  });

  // Default different selection
  toEl.selectedIndex = Math.min(5, toEl.options.length - 1);
  buildGraph();
}

// ==========================================
// GRAPH BUILDER (WEIGHTED)
// ==========================================
let graph = {};
let interchangeStations = new Set();

function buildGraph() {
  const lines = {};
  metroData.forEach(s => {
    const name = s["Station Name (English)"].trim();
    const line = s.Line;
    if (!lines[line]) lines[line] = [];
    if (!lines[line].includes(name)) lines[line].push(name);
  });

  graph = {};
  // Count stations appearing on multiple lines → interchange
  const lineCount = {};
  metroData.forEach(s => {
    const name = s["Station Name (English)"].trim();
    if (!lineCount[name]) lineCount[name] = new Set();
    lineCount[name].add(s.Line);
  });
  for (const [name, lines] of Object.entries(lineCount)) {
    if (lines.size > 1) interchangeStations.add(name);
  }

  // Build adjacency with weights (time in minutes)
  for (const line in lines) {
    const list = lines[line];
    for (let i = 0; i < list.length; i++) {
      const curr = list[i];
      if (!graph[curr]) graph[curr] = {};
      const prev = list[i - 1];
      const next = list[i + 1];
      const travelTime = 2.5; // avg 2.5 min between stations
      if (prev) graph[curr][prev] = { time: travelTime, line };
      if (next) graph[curr][next] = { time: travelTime, line };
    }
  }
  // Interchange penalty
  interchangeStations.forEach(st => {
    if (graph[st]) {
      for (const nb in graph[st]) {
        graph[st][nb].time += 3; // 3 min transfer penalty
      }
    }
  });
}

// ==========================================
// DIJKSTRA (WEIGHTED, TIME-BASED)
// ==========================================
function dijkstra(start, end) {
  if (!graph[start] || !graph[end]) return { path: [], time: 0 };

  const dist = {}, prev = {}, visited = new Set();
  for (const n in graph) dist[n] = Infinity;
  dist[start] = 0;

  while (true) {
    let closest = null;
    for (const n in dist) {
      if (!visited.has(n) && (closest === null || dist[n] < dist[closest])) closest = n;
    }
    if (!closest || closest === end || dist[closest] === Infinity) break;
    visited.add(closest);
    for (const nb in graph[closest]) {
      const newDist = dist[closest] + (graph[closest][nb]?.time || 1);
      if (newDist < dist[nb]) {
        dist[nb] = newDist;
        prev[nb] = closest;
      }
    }
  }

  const path = [];
  let curr = end;
  while (curr) { path.unshift(curr); curr = prev[curr]; }
  return { path, time: dist[end] === Infinity ? 0 : dist[end] };
}

// ==========================================
// HAVERSINE DISTANCE
// ==========================================
function haversine(c1, c2) {
  const R = 6371;
  const [lat1, lon1] = c1.map(d => d * Math.PI / 180);
  const [lat2, lon2] = c2.map(d => d * Math.PI / 180);
  const a = Math.sin((lat2-lat1)/2)**2 + Math.cos(lat1)*Math.cos(lat2)*Math.sin((lon2-lon1)/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

function getRouteDistance(path) {
  let total = 0, validSegs = 0;
  for (let i = 0; i < path.length - 1; i++) {
    const c1 = stationCoords[path[i]], c2 = stationCoords[path[i+1]];
    if (c1 && c2) { total += haversine(c1, c2); validSegs++; }
  }
  return validSegs > 0 ? parseFloat(total.toFixed(2)) : parseFloat((path.length * 1.2).toFixed(2));
}

// ==========================================
// FARE CALCULATION ENGINE
// ==========================================
const FARE_TABLE = [
  { maxKm: 2,  fare: 10 },
  { maxKm: 4,  fare: 20 },
  { maxKm: 8,  fare: 30 },
  { maxKm: 12, fare: 40 },
  { maxKm: 18, fare: 50 },
  { maxKm: 24, fare: 60 },
  { maxKm: Infinity, fare: 70 },
];

function computeFare(distKm) {
  for (const tier of FARE_TABLE) {
    if (distKm <= tier.maxKm) return tier.fare;
  }
  return 70;
}

// ==========================================
// PASSENGER COUNT
// ==========================================
let passengers = 1;
function changePassengers(delta) {
  passengers = Math.max(1, Math.min(9, passengers + delta));
  document.getElementById("passengerCount").textContent = passengers;
}

// ==========================================
// MAIN CALCULATE FUNCTION
// ==========================================
function calculateFare() {
  const from = document.getElementById("from").value;
  const to = document.getElementById("to").value;

  if (!from || !to) { showToast("Please select both stations", "error"); return; }
  if (from === to) { showToast("Please select different stations", "error"); return; }
  if (!graph[from] || !graph[to]) {
    showToast("Route data unavailable for selected stations", "error");
    return;
  }

  const { path, time } = dijkstra(from, to);

  if (!path.length || path[0] !== from) {
    showToast("No route found between selected stations", "error");
    return;
  }

  const dist = getRouteDistance(path);
  const singleFare = computeFare(dist);
  const totalFare = singleFare * passengers;
  const stations = path.length;
  const interchanges = path.filter(s => interchangeStations.has(s)).length;
  const eta = computeETA(time);
  const fromData = metroData.find(s => s["Station Name (English)"].trim() === from);
  const toData = metroData.find(s => s["Station Name (English)"].trim() === to);
  const platform = Math.floor(Math.random() * 2) + 1;

  // Show result
  document.getElementById("resultPlaceholder").classList.add("hidden");
  const content = document.getElementById("resultContent");
  content.classList.remove("hidden");

  content.innerHTML = `
    <div class="result-header">
      <div class="result-title">${from} → ${to}</div>
      <div class="result-badge">${fromData?.Line || "?"} Line</div>
    </div>
    <div class="fare-display">
      <div class="fare-amount">₹${totalFare}</div>
      <div class="fare-label">${passengers > 1 ? `${passengers} passengers × ₹${singleFare}` : "Single journey fare"}</div>
    </div>
    <div class="route-meta">
      <div class="meta-item">
        <div class="meta-label">Distance</div>
        <div class="meta-value">${dist} km</div>
      </div>
      <div class="meta-item">
        <div class="meta-label">Travel Time</div>
        <div class="meta-value">~${Math.ceil(time)} min</div>
      </div>
      <div class="meta-item">
        <div class="meta-label">Stations</div>
        <div class="meta-value">${stations}</div>
      </div>
      <div class="meta-item">
        <div class="meta-label">Arrival ETA</div>
        <div class="meta-value">${eta}</div>
      </div>
    </div>
    ${interchanges > 0 ? `<div class="meta-item" style="margin-bottom:12px;border-left:3px solid var(--accent-amber)">
      <div class="meta-label">Interchanges</div>
      <div class="meta-value" style="color:var(--accent-amber)">${interchanges} interchange${interchanges>1?'s':''}</div>
    </div>` : ""}
    <div class="meta-item" style="margin-bottom:16px">
      <div class="meta-label">Board at Platform</div>
      <div class="meta-value">Platform ${platform}</div>
    </div>
    <div class="route-path">
      ${path.map((s, i) => `
        <span class="${interchangeStations.has(s) ? 'interchange-station' : 'route-station'}">${s}</span>
        ${i < path.length - 1 ? '<span class="route-arrow">→</span>' : ''}
      `).join('')}
    </div>
    <div class="result-actions">
      <button class="save-btn" onclick="saveRoute('${from}','${to}',${totalFare},${dist})">⭐ Save Route</button>
      <button class="save-btn" onclick="addToHistory('${from}','${to}',${totalFare},${dist})">📋 Add to History</button>
    </div>
  `;

  // Update ticket tab
  document.getElementById("ticketFrom").textContent = from;
  document.getElementById("ticketTo").textContent = to;
  document.getElementById("ticketFare").textContent = `₹${totalFare}`;

  // Draw map route
  drawRoute(path);

  // Draw timeline
  renderTimeline(path, time);

  showToast(`Route found: ${stations} stops, ₹${totalFare}`, "success");

  // Save to history automatically
  addToHistory(from, to, totalFare, dist, false);
}

// ==========================================
// ETA CALCULATOR
// ==========================================
function computeETA(minutes) {
  const depTimeEl = document.getElementById("departureTime");
  const base = depTimeEl.value || "";
  if (!base) return "—";
  const [hh, mm] = base.split(":").map(Number);
  const total = hh * 60 + mm + Math.ceil(minutes);
  return `${String(Math.floor(total / 60) % 24).padStart(2,"0")}:${String(total % 60).padStart(2,"0")}`;
}

// ==========================================
// ROUTE TIMELINE
// ==========================================
function renderTimeline(path, totalTime) {
  const viz = document.getElementById("routeViz");
  const tl = document.getElementById("routeTimeline");
  viz.classList.remove("hidden");
  const timePerStop = totalTime / Math.max(path.length - 1, 1);
  let elapsed = 0;
  const depTimeEl = document.getElementById("departureTime");
  const [bh, bm] = (depTimeEl.value || "00:00").split(":").map(Number);

  tl.innerHTML = path.map((stop, i) => {
    const mins = bh * 60 + bm + Math.round(elapsed);
    const label = `${String(Math.floor(mins/60)%24).padStart(2,"0")}:${String(mins%60).padStart(2,"0")}`;
    const dotClass = i === 0 ? "start" : i === path.length - 1 ? "end" : interchangeStations.has(stop) ? "interchange" : "";
    const out = `
      <div class="timeline-stop">
        ${i < path.length - 1 ? '<div class="timeline-line"></div>' : ''}
        <div class="timeline-dot ${dotClass}"></div>
        <div class="timeline-label">${stop}</div>
        <div class="timeline-time">${label}</div>
      </div>
    `;
    elapsed += timePerStop;
    return out;
  }).join('');
}

// ==========================================
// MAP
// ==========================================
let map, routeLayer;

function initMap() {
  map = L.map("mapEl").setView([12.9716, 77.5946], 12);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "© OpenStreetMap",
  }).addTo(map);

  // Plot all stations
  setTimeout(() => {
    if (typeof metroData !== "undefined") {
      metroData.forEach(s => {
        const name = s["Station Name (English)"].trim();
        const lat = s.Lat || stationCoords[name]?.[0];
        const lng = s.Lng || stationCoords[name]?.[1];
        if (!lat || !lng) return;
        const color = s.Line === "Purple" ? "#8b5cf6" : "#10d982";
        const marker = L.circleMarker([lat, lng], {
          radius: 5, color, fillColor: color,
          fillOpacity: 0.8, weight: 2
        }).addTo(map);
        marker.bindPopup(`
          <strong>${name}</strong><br>
          <span style="color:${color}">${s.Line} Line</span>
          ${interchangeStations.has(name) ? '<br><em>🔁 Interchange</em>' : ''}
        `);
      });
    }
  }, 500);

  // Geolocation
  map.locate({ setView: false, maxZoom: 14 });
  map.on("locationfound", e => {
    const nearest = findNearestStation(e.latlng.lat, e.latlng.lng);
    L.marker([e.latlng.lat, e.latlng.lng])
      .addTo(map)
      .bindPopup(`📍 You are here<br>Nearest: <strong>${nearest}</strong>`)
      .openPopup();
    if (nearest) {
      document.getElementById("from").value = nearest;
      showToast(`📍 Nearest station: ${nearest}`, "success");
    }
  });
}

function drawRoute(path) {
  if (routeLayer) { map.removeLayer(routeLayer); routeLayer = null; }
  const coords = path.map(s => stationCoords[s] || null).filter(Boolean);
  if (coords.length < 2) return;
  routeLayer = L.polyline(coords, { color: "#ef4444", weight: 5, opacity: 0.9 }).addTo(map);
  map.fitBounds(routeLayer.getBounds(), { padding: [40, 40] });
}

function findNearestStation(lat, lng) {
  let min = Infinity, nearest = null;
  for (const [name, [x, y]] of Object.entries(stationCoords)) {
    const d = Math.sqrt((x - lat)**2 + (y - lng)**2);
    if (d < min) { min = d; nearest = name; }
  }
  return nearest;
}

// ==========================================
// SEARCH BAR WITH AUTOCOMPLETE
// ==========================================
let allStationNames = [];

function initSearchBar() {
  const input = document.getElementById("globalSearch");
  const suggestions = document.getElementById("searchSuggestions");
  const clear = document.getElementById("searchClear");
  const container = document.getElementById("floatingSearch");

  // Keyboard shortcut: / to focus
  document.addEventListener("keydown", e => {
    if (e.key === "/" && document.activeElement.tagName !== "INPUT") {
      e.preventDefault();
      container.classList.add("active");
      input.focus();
    }
    if (e.key === "Escape") { container.classList.remove("active"); suggestions.innerHTML = ""; }
  });

  input.addEventListener("input", () => {
    const q = input.value.trim().toLowerCase();
    clear.style.display = q ? "block" : "none";
    if (!q) { suggestions.innerHTML = ""; return; }
    if (!allStationNames.length && typeof metroData !== "undefined") {
      allStationNames = [...new Set(metroData.map(s => s["Station Name (English)"].trim()))];
    }
    const matches = allStationNames.filter(n => n.toLowerCase().includes(q)).slice(0, 6);
    suggestions.innerHTML = matches.map(m => `
      <div class="suggestion-item" onclick="selectStation('${m}')">
        🚇 ${m}
        <span style="color:var(--text-muted);font-size:11px;float:right">
          ${metroData.find(s => s["Station Name (English)"].trim() === m)?.Line || ""}
        </span>
      </div>
    `).join("");
  });

  clear.addEventListener("click", () => {
    input.value = ""; suggestions.innerHTML = ""; clear.style.display = "none";
  });
}

function selectStation(name) {
  document.getElementById("from").value = name;
  document.getElementById("globalSearch").value = "";
  document.getElementById("searchSuggestions").innerHTML = "";
  document.getElementById("floatingSearch").classList.remove("active");
  document.getElementById("calculator").scrollIntoView({ behavior: "smooth" });
  showToast(`From station set: ${name}`, "success");
}

// ==========================================
// VOICE ASSISTANT
// ==========================================
document.getElementById("voiceBtn").addEventListener("click", startVoiceSearch);

function startVoiceSearch() {
  if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
    showToast("Voice search not supported in this browser", "error");
    return;
  }
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = new SR();
  recognition.lang = "en-IN";
  recognition.onstart = () => showToast("🎙️ Listening... Say a station name", "success");
  recognition.onresult = (e) => {
    const spoken = e.results[0][0].transcript.trim();
    showToast(`Heard: "${spoken}"`, "success");
    if (typeof metroData !== "undefined") {
      const match = metroData.find(s =>
        s["Station Name (English)"].toLowerCase().includes(spoken.toLowerCase())
      );
      if (match) {
        const name = match["Station Name (English)"].trim();
        document.getElementById("from").value = name;
        showToast(`✅ Set: ${name}`, "success");
      } else {
        showToast(`Station not found: "${spoken}"`, "error");
      }
    }
  };
  recognition.onerror = () => showToast("Voice recognition error", "error");
  recognition.start();
}

// ==========================================
// DASHBOARD — HISTORY & SAVED ROUTES
// ==========================================
function loadDashboard() {
  const history = getHistory();
  const favs = getFavs();
  renderHistory(history);
  renderFavs(favs);
  updateStats(history, favs);
}

function getHistory() {
  try { return JSON.parse(localStorage.getItem("mf_history") || "[]"); } catch { return []; }
}
function getFavs() {
  try { return JSON.parse(localStorage.getItem("mf_favs") || "[]"); } catch { return []; }
}

function addToHistory(from, to, fare, dist, showNotif = true) {
  const history = getHistory();
  history.unshift({ from, to, fare, dist, date: new Date().toLocaleString("en-IN") });
  if (history.length > 20) history.pop();
  localStorage.setItem("mf_history", JSON.stringify(history));
  renderHistory(history);
  updateStats(history, getFavs());
  if (showNotif) showToast("Added to history", "success");
}

function saveRoute(from, to, fare, dist) {
  const favs = getFavs();
  if (favs.find(f => f.from === from && f.to === to)) {
    showToast("Route already saved", "error"); return;
  }
  favs.unshift({ from, to, fare, dist });
  localStorage.setItem("mf_favs", JSON.stringify(favs));
  renderFavs(favs);
  updateStats(getHistory(), favs);
  showToast("⭐ Route saved!", "success");
}

function renderHistory(history) {
  const el = document.getElementById("journeyList");
  if (!history.length) { el.innerHTML = '<p class="empty-state">No journeys yet.</p>'; return; }
  el.innerHTML = history.slice(0, 5).map(h => `
    <div class="journey-item">
      <div>
        <div class="journey-route">${h.from} → ${h.to}</div>
        <div style="font-size:11px;color:var(--text-muted)">${h.date || ""}</div>
      </div>
      <div class="journey-fare">₹${h.fare}</div>
    </div>
  `).join('');
}

function renderFavs(favs) {
  const el = document.getElementById("favList");
  if (!favs.length) { el.innerHTML = '<p class="empty-state">No saved routes.</p>'; return; }
  el.innerHTML = favs.map(f => `
    <div class="fav-item">
      <div class="journey-route">${f.from} → ${f.to}</div>
      <div class="journey-fare">₹${f.fare}</div>
    </div>
  `).join('');
}

function updateStats(history, favs) {
  document.getElementById("totalTrips").textContent = history.length;
  const total = history.reduce((s, h) => s + (h.fare || 0), 0);
  document.getElementById("totalFare").textContent = `₹${total}`;
  const km = history.reduce((s, h) => s + (h.dist || 0), 0);
  document.getElementById("totalKm").textContent = km.toFixed(1);
  document.getElementById("savedRoutes").textContent = favs.length;
}

// ==========================================
// UTILS
// ==========================================
function swapStations() {
  const from = document.getElementById("from");
  const to = document.getElementById("to");
  [from.value, to.value] = [to.value, from.value];
  showToast("Stations swapped", "success");
}

function clearData() {
  document.getElementById("resultPlaceholder").classList.remove("hidden");
  document.getElementById("resultContent").classList.add("hidden");
  document.getElementById("routeViz").classList.add("hidden");
  if (routeLayer) { map.removeLayer(routeLayer); routeLayer = null; }
}

function playWelcome() {
  const a = document.getElementById("welcomeAudio");
  if (a) a.play().catch(() => {});
}

function showToast(msg, type = "") {
  const container = document.getElementById("toastContainer");
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.textContent = msg;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 3500);
}

// ==========================================
// PWA — SERVICE WORKER REGISTRATION
// ==========================================
function registerServiceWorker() {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("sw.js")
      .then(() => console.log("MetroFare SW registered"))
      .catch(err => console.log("SW error:", err));
  }
}
