// =======================
// LOAD STATIONS FROM JSON
// =======================
function loadStations() {
    let from = document.getElementById("from");
    let to = document.getElementById("to");

    from.innerHTML = "";
    to.innerHTML = "";

    metroData.forEach(station => {
        let name = station["Station Name (English)"].trim();

        let option1 = document.createElement("option");
        option1.value = name;
        option1.text = name;

        let option2 = option1.cloneNode(true);

        from.appendChild(option1);
        to.appendChild(option2);
    });
}
loadStations();


// =======================
// STATION COORDINATES (TEMP)
// =======================
let stations = {
    "Baiyappanahalli": [12.9908, 77.6537],
    "Indiranagar": [12.9784, 77.6408],
    "MG Road": [12.9756, 77.6067],
    "Majestic": [12.9785, 77.5720],
    "Attiguppe": [12.9710, 77.5360],
    "Peenya": [13.0285, 77.5190]
};


// =======================
// CREATE GRAPH FROM JSON
// =======================
let lines = {};

metroData.forEach(station => {
    let name = station["Station Name (English)"].trim();
    let line = station["Line"];

    if (!lines[line]) lines[line] = [];
    lines[line].push(name);
});

let graph = {};

for (let line in lines) {
    let list = lines[line];

    for (let i = 0; i < list.length; i++) {
        let curr = list[i];

        if (!graph[curr]) graph[curr] = {};

        if (i > 0) graph[curr][list[i - 1]] = 1;
        if (i < list.length - 1) graph[curr][list[i + 1]] = 1;
    }
}


// =======================
// DIJKSTRA ALGORITHM
// =======================
function dijkstra(start, end) {
    let dist = {};
    let prev = {};
    let visited = new Set();

    for (let node in graph) dist[node] = Infinity;
    dist[start] = 0;

    while (true) {
        let closest = null;

        for (let node in dist) {
            if (!visited.has(node) &&
                (closest === null || dist[node] < dist[closest])) {
                closest = node;
            }
        }

        if (closest === null || closest === end) break;

        visited.add(closest);

        for (let neighbor in graph[closest]) {
            let newDist = dist[closest] + graph[closest][neighbor];

            if (newDist < dist[neighbor]) {
                dist[neighbor] = newDist;
                prev[neighbor] = closest;
            }
        }
    }

    let path = [];
    let curr = end;

    while (curr) {
        path.unshift(curr);
        curr = prev[curr];
    }

    return path;
}


// =======================
// DISTANCE FUNCTIONS
// =======================
function calculateDistance(c1, c2) {
    let R = 6371;

    let lat1 = c1[0] * Math.PI / 180;
    let lat2 = c2[0] * Math.PI / 180;
    let dLat = lat2 - lat1;
    let dLon = (c2[1] - c1[1]) * Math.PI / 180;

    let a = Math.sin(dLat/2) ** 2 +
            Math.cos(lat1) * Math.cos(lat2) *
            Math.sin(dLon/2) ** 2;

    let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

function getTotalDistance(path) {
    let total = 0;
    let validSegments = 0;

    for (let i = 0; i < path.length - 1; i++) {
        let c1 = stations[path[i]];
        let c2 = stations[path[i + 1]];

        if (c1 && c2) {
            total += calculateDistance(c1, c2);
            validSegments++;
        }
    }

    // ✅ If no coordinates available → fallback
    if (validSegments === 0) {
        return (path.length * 1.2).toFixed(2); // approx distance
    }

    return total.toFixed(2);
}


// =======================
// CALCULATE FARE (UPDATED)
// =======================
function calculateFare() {
    let from = document.getElementById("from").value;
    let to = document.getElementById("to").value;

    if (from === to) {
        document.getElementById("result").innerHTML = "Same station selected!";
        return;
    }

    let path = dijkstra(from, to);
    let distance = getTotalDistance(path);

    let fromData = metroData.find(s => s["Station Name (English)"].trim() === from);
    let toData = metroData.find(s => s["Station Name (English)"].trim() === to);

    document.getElementById("result").innerHTML =
        "✅ Ticket Details <br><br>" +
        "Route: " + path.join(" → ") + "<br>" +
        "Distance: " + distance + " km<br>" +
        "From Line: " + (fromData?.Line || "-") + "<br>" +
        "To Line: " + (toData?.Line || "-");

    drawRoute(path);
}


// =======================
// MAP INITIALIZATION
// =======================
var map = L.map('map').setView([12.9716, 77.5946], 12);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap'
}).addTo(map);


// =======================
// DRAW ROUTE (UPDATED)
// =======================
function drawRoute(path) {
    let coords = [];

    path.forEach(station => {
        if (stations[station]) {
            coords.push(stations[station]);
        }
    });

    if (coords.length > 0) {
        let route = L.polyline(coords, {
            color: 'red',
            weight: 6
        }).addTo(map);

        map.fitBounds(route.getBounds());
    }
}


// =======================
// LOCATION + NEAREST
// =======================
map.locate({setView: true, maxZoom: 16});

map.on('locationfound', function(e) {
    let nearest = findNearestStation(e.latitude, e.longitude);

    L.marker([e.latitude, e.longitude])
        .addTo(map)
        .bindPopup("📍 You are here<br>Nearest: " + nearest)
        .openPopup();

    document.getElementById("from").value = nearest;
});


// =======================
// NEAREST STATION
// =======================
function findNearestStation(lat, lng) {
    let min = Infinity;
    let nearest = null;

    for (let s in stations) {
        let [x, y] = stations[s];
        let d = Math.sqrt((x - lat)**2 + (y - lng)**2);

        if (d < min) {
            min = d;
            nearest = s;
        }
    }

    return nearest;
}


// =======================
// UTIL FUNCTIONS
// =======================
function swapStations() {
    let from = document.getElementById("from");
    let to = document.getElementById("to");

    let temp = from.value;
    from.value = to.value;
    to.value = temp;
}

function clearData() {
    document.getElementById("result").innerHTML = "";
}

// PLAY AUDIO ON LOAD
window.onload = function () {
    let audio = document.getElementById("welcomeAudio");
    audio.play();
};

function playWelcome() {
    let audio = document.getElementById("welcomeAudio");
    audio.play();
}