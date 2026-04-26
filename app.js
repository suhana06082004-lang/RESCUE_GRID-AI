// -- OFF-GRID TACTICAL SYSTEM --
const GEMINI_API_KEY = "AIzaSyBY32CwFIzHYZXKmW8UQCAw8T-XdM_OC5s";
let MAP_CENTER = [37.7749, -122.4194];
let HQ_LOC = [37.7600, -122.4300];

// -- INITIALIZE MAPS --
const map = L.map('map', { zoomControl: false }).setView(MAP_CENTER, 13);
// Google Maps Hybrid (Satellite + Labels)
L.tileLayer('https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}', { maxZoom: 20 }).addTo(map);

// Phase 5 Weather Radar
const radarLayer = L.tileLayer.wms("https://mesonet.agron.iastate.edu/cgi-bin/wms/nexrad/n0r.cgi", {
    layers: 'nexrad-n0r-900913', format: 'image/png', transparent: true, opacity: 0.6
});
let radarActive = false;

// Drone Map
const droneMap = L.map('drone-map', { zoomControl: false, attributionControl: false, dragging: false, scrollWheelZoom: false }).setView(MAP_CENTER, 15);
// Google Maps Satellite (No labels for drone view)
L.tileLayer('https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', { maxZoom: 20 }).addTo(droneMap);
setInterval(() => { document.getElementById('drone-telemetry').innerText = `ALT: ${Math.floor(Math.random() * 200 + 1000)}FT | TGT: LOCK | SENSOR: THERMAL_IV`; }, 2000);

let heatData = [];
const heatLayer = L.heatLayer(heatData, { radius: 35, blur: 25, gradient: { 0.4: 'cyan', 0.6: 'orange', 1: 'red' } }).addTo(map);

const hqIcon = L.divIcon({ className: 'hq-marker', html: "", iconSize: [30, 30] });
let hqMarker = L.marker(HQ_LOC, { icon: hqIcon }).addTo(map).bindPopup("<b>DISPATCH HQ</b>");

// Phase 6 Permanent Safe Zones
const hospIcon = L.divIcon({ className: 'hospital-marker', html: "", iconSize: [20, 20] });
const safeZoneA = L.marker([HQ_LOC[0] + 0.02, HQ_LOC[1] + 0.03], { icon: hospIcon }).addTo(map).bindPopup("<b>SAFE ZONE ALPHA : HOSPITAL</b>");
const safeZoneB = L.marker([HQ_LOC[0] - 0.03, HQ_LOC[1] - 0.01], { icon: hospIcon }).addTo(map).bindPopup("<b>SAFE ZONE BETA : HOSPITAL</b>");

const markers = {
    critical: L.divIcon({ className: 'radar-marker pulse', html: "", iconSize: [24, 24] }),
    high: L.divIcon({ className: 'radar-marker pulse', html: "", iconSize: [20, 20] }),
    medium: L.divIcon({ className: 'radar-marker pulse', html: "", iconSize: [16, 16] }),
    low: L.divIcon({ className: 'radar-marker', html: "", iconSize: [12, 12] }),
};

// -- STATE & EXPORT DATA --
let stats = { critical: 0, high: 0, total: 0 };
let incidentLog = [];

// Squad Management
let squads = [
    { id: 'Alpha', available: true, baseBpm: 68, fuel: 100 }, { id: 'Bravo', available: true, baseBpm: 72, fuel: 100 },
    { id: 'Charlie', available: true, baseBpm: 65, fuel: 100 }, { id: 'Delta', available: true, baseBpm: 74, fuel: 100 }, { id: 'Echo', available: true, baseBpm: 70, fuel: 100 }
];

// Feature 1: Biometrics & Fuel
setInterval(() => {
    squads.forEach(sq => {
        const sCard = document.querySelector(`.squad-card[data-squad="${sq.id}"]`);
        if (!sCard) return;
        const bpmDisplay = sCard.querySelector('.bpm-display');
        const fuelBar = sCard.querySelector('.fuel-bar');
        if (!bpmDisplay) return;

        let currentBpm = sq.available ? (sq.baseBpm + Math.floor(Math.random() * 6 - 3)) : (135 + Math.floor(Math.random() * 20));
        bpmDisplay.innerText = `${currentBpm} BPM`;

        if (!sq.available) {
            bpmDisplay.classList.add('text-red');
            bpmDisplay.classList.remove('text-dim');
            sq.fuel = Math.max(0, sq.fuel - 0.5);
            if (fuelBar) fuelBar.style.width = `${sq.fuel}%`;
        } else {
            bpmDisplay.classList.remove('text-red');
            sq.fuel = Math.min(100, sq.fuel + 1);
            if (fuelBar) fuelBar.style.width = `${sq.fuel}%`;
        }
    });
}, 1000);

// Feature 3: Resource Logistics Matrix
let resources = { water: 100, med: 100, evac: 100 };
function drainResources(severity) {
    const drain = severity === 'critical' ? 12 : severity === 'high' ? 7 : 3;
    resources.water = Math.max(0, resources.water - (drain + Math.random() * 3));
    resources.med = Math.max(0, resources.med - (drain + Math.random() * 5));
    resources.evac = Math.max(0, resources.evac - (drain + Math.random() * 8));

    document.getElementById('res-water').innerText = `${Math.floor(resources.water)}%`;
    document.getElementById('bar-water').style.width = `${Math.floor(resources.water)}%`;
    document.getElementById('res-med').innerText = `${Math.floor(resources.med)}%`;
    document.getElementById('bar-med').style.width = `${Math.floor(resources.med)}%`;
    document.getElementById('res-evac').innerText = `${Math.floor(resources.evac)}%`;
    document.getElementById('bar-evac').style.width = `${Math.floor(resources.evac)}%`;
}

const aidaCore = document.getElementById('aida-core');
const aidaMsg = document.getElementById('aida-status-msg');
const threatIndicator = document.getElementById('threat-indicator');
setInterval(() => { document.getElementById('sys-time').innerText = new Date().toLocaleTimeString('en-US', { hour12: false }) + ' LCL'; }, 1000);

// -- A.I.D.A. VOICE SYSTEM --
function setAIDAStatus(text) {
    aidaMsg.innerText = ""; let i = 0;
    const typer = setInterval(() => { if (i < text.length) aidaMsg.innerText += text.charAt(i++); else clearInterval(typer); }, 20);
}
function speakAIDA(message) {
    setAIDAStatus(message);
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance(message);
        const voices = window.speechSynthesis.getVoices();
        const techVoice = voices.find(v => v.name.includes("Google") || v.name.includes("Zira")) || voices[0];
        if (techVoice) u.voice = techVoice;
        u.pitch = 0.8; u.rate = 1.1;
        u.onstart = () => aidaCore.classList.add('speaking');
        u.onend = () => aidaCore.classList.remove('speaking');
        window.speechSynthesis.speak(u);
    } else {
        aidaCore.classList.add('speaking');
        setTimeout(() => aidaCore.classList.remove('speaking'), 2000);
    }
}
window.speechSynthesis.onvoiceschanged = () => window.speechSynthesis.getVoices();

// -- UI ELEMENTS --
const inputField = document.getElementById('crisis-input');
const submitBtn = document.getElementById('submit-btn');
const micBtn = document.getElementById('mic-btn');
const micIcon = document.getElementById('mic-icon');
const chaosBtn = document.getElementById('chaos-btn');
const exportBtn = document.getElementById('export-btn');
const gpsBtn = document.getElementById('gps-btn');
const droneBtn = document.getElementById('drone-btn');
const droneModal = document.getElementById('drone-modal');
const quarantineBtn = document.getElementById('quarantine-btn');
const hudModeBtn = document.getElementById('hud-mode-btn');

const forecastBtn = document.getElementById('forecast-btn');
const radarBtn = document.getElementById('radar-btn');
const exhaustionAlert = document.getElementById('exhaustion-alert');

// P6 UI ELEMENTS
const cameraBtn = document.getElementById('camera-btn');
const panicBtn = document.getElementById('panic-btn');
const chatToggleBtn = document.getElementById('chat-toggle-btn');
const chatModal = document.getElementById('chatbot-modal');
const chatInput = document.getElementById('chat-input');
const chatSendBtn = document.getElementById('chat-send-btn');
const chatHistory = document.getElementById('chat-history');
const chatMicBtn = document.getElementById('chat-mic-btn');
const chatMicIcon = document.getElementById('chat-mic-icon');
const callDroneBtn = document.getElementById('call-drone-btn');

// -- PHASE 6 LOGIC --

// 1-Tap Offline SOS
panicBtn.addEventListener('click', () => {
    panicBtn.disabled = true;
    speakAIDA("Panic Button Actuated. Injecting raw GPS telemetry into offline SMS fallback.");
    const msg = `CRITICAL EMERGENCY! Immediate help required. Automated Location Payload: LAT ${MAP_CENTER[0].toFixed(4)}, LNG ${MAP_CENTER[1].toFixed(4)}`;
    window.location.href = `sms:?body=${encodeURIComponent(msg)}`;
    setTimeout(() => { panicBtn.disabled = false; }, 3000);
});

// Med-Bot First Aid
chatToggleBtn.addEventListener('click', () => chatModal.classList.toggle('hidden'));
chatSendBtn.addEventListener('click', handleChat);
chatInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') handleChat(); });
async function handleChat() {
    const text = chatInput.value.trim();
    if (!text) return;
    chatHistory.innerHTML += `<div class="user-msg">${text}</div>`;
    chatInput.value = '';
    chatHistory.scrollTop = chatHistory.scrollHeight;
    
    const typingId = "typing-" + Date.now();
    chatHistory.innerHTML += `<div class="ai-msg blink-cyan" id="${typingId}">A.I.D.A generating specific survival protocol...</div>`;
    chatHistory.scrollTop = chatHistory.scrollHeight;

    try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;
        const prompt = `You are A.I.D.A., a highly intelligent disaster survival AI. Provide a specific, 2-sentence tactical physical survival instruction for ONLY this EXACT problem: "${text}". DO NOT give generic advice. DO NOT output markdown, asterisks, or formatting. Plain text only. Answer in the same language provided.`;
        const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }) });
        const data = await res.json();
        let resp = data.candidates[0].content.parts[0].text;
        
        document.getElementById(typingId).remove();
        chatHistory.innerHTML += `<div class="ai-msg">${resp}</div>`;
        chatHistory.scrollTop = chatHistory.scrollHeight;
        
        // Massive Feature: Make A.I.D.A literally speak the protocol out loud!
        speakAIDA(resp);
    } catch(e) {
        document.getElementById(typingId).remove();
        chatHistory.innerHTML += `<div class="ai-msg">[SYS_ERR] Neural Net offline. Apply standard survival protocols.</div>`;
    }
}

// Vision API Scanner Simulator
cameraBtn.addEventListener('click', () => {
    cameraBtn.classList.add('scanning');
    speakAIDA("Computer Vision API Initialized. Scanning structural layout...");

    const visualThreats = [
        "VISUAL_CONFIRMATION: Large Structure Fire detected. Building integrity failing. Multiple casualties likely.",
        "VISUAL_CONFIRMATION: Massive Earthquake damage. Collapsed highway overpass detected.",
        "VISUAL_CONFIRMATION: Severe Flooding. Water levels exceeding 3 meters in residential zone.",
        "VISUAL_CONFIRMATION: Tsunami wave encroaching shoreline. Immediate high-ground evacuation required.",
        "VISUAL_CONFIRMATION: Vehicular pile-up detected on main arterial road. Medical dispatch required."
    ];
    const rawThreat = visualThreats[Math.floor(Math.random() * visualThreats.length)];

    setTimeout(() => {
        cameraBtn.classList.remove('scanning');
        inputField.value = `${rawThreat} Sector ` + Math.floor(Math.random() * 99);
        speakAIDA("Scan complete. Threat analyzed. Ready for routing.");
    }, 2500);
});

// Feature 4: Civilian Evacuation Pathing & Swarm AI
function deployVolunteers(lat, lng) {
    const volIcon = L.divIcon({ className: 'volunteer-dot', html: "", iconSize: [6, 6] });

    // Nearest Safe Zone
    const dA = Math.hypot(lat - safeZoneA.getLatLng().lat, lng - safeZoneA.getLatLng().lng);
    const dB = Math.hypot(lat - safeZoneB.getLatLng().lat, lng - safeZoneB.getLatLng().lng);
    const targetZone = dA < dB ? safeZoneA.getLatLng() : safeZoneB.getLatLng();

    for (let i = 0; i < 8; i++) {
        const vLat = lat + (Math.random() * 0.015 - 0.0075);
        const vLng = lng + (Math.random() * 0.015 - 0.0075);
        const vMarker = L.marker([vLat, vLng], { icon: volIcon }).addTo(map);

        let ticks = 0; const maxTicks = 90 + Math.floor(Math.random() * 30);
        const latStep = (targetZone.lat - vLat) / maxTicks;
        const lngStep = (targetZone.lng - vLng) / maxTicks;

        const drive = setInterval(() => {
            if (ticks >= maxTicks) { clearInterval(drive); map.removeLayer(vMarker); }
            else {
                // FEATURE 1: Quarantine Check
                if (typeof activeQuarantinePoly !== 'undefined' && activeQuarantinePoly !== null) {
                    if (activeQuarantinePoly.getBounds().contains(vMarker.getLatLng())) {
                        vMarker.setOpacity(Math.random() < 0.5 ? 0.3 : 1.0); // Flicker trapped state
                        return; // Halt Movement
                    } else { vMarker.setOpacity(1.0); }
                }
                vMarker.setLatLng([vLat + (latStep * ticks), vLng + (lngStep * ticks)]);
                ticks++;
            }
        }, 40);
    }
}

// Feature 2: Intercepted OSINT Social Media Intel Feed
setInterval(() => {
    if (Math.random() < 0.7) return; // 30% chance every 15s
    const osintTags = ["#Trapped", "#Earthquake", "#Evacuate", "#Chaos", "#HelpNeeded", "#Darkness"];
    const osintSources = ["TWITTER_RELAY", "MESH_NET_NODE", "CIVILIAN_RADIO", "DARK_WEB_SCRAPER"];
    const osintMessages = ["I hear sirens but no one is coming yet. Pls help.", "Building shaking, structural damage near Sector 4.", "Water rising too fast. Cannot reach roof.", "Fires spreading from the main conduit.", "Multiple hurt, bleeding, need Medics!"];

    const osintMsg = osintMessages[Math.floor(Math.random() * osintMessages.length)];
    const source = osintSources[Math.floor(Math.random() * osintSources.length)];
    const tag = osintTags[Math.floor(Math.random() * osintTags.length)];
    const timestamp = new Date().toLocaleTimeString('en-US', { hour12: false });
    const logId = `OSINT_${Math.floor(Math.random() * 9000) + 1000}`;

    const cardId = 'osint-' + Math.floor(Math.random() * 9000);
    const card = `<div class="report-card osint-report"><div class="card-header"><span>[${logId}]</span> <span>${timestamp}</span></div><div class="card-type">OSINT_INTERCEPT // ${source}</div><div class="card-desc" id="${cardId}">> DECRYPTING...</div><div class="card-footer" style="margin-top:6px;"><span>${tag}</span> | <span>UNVERIFIED</span></div></div>`;

    const crisisFeed = document.getElementById('crisis-feed');
    crisisFeed.insertAdjacentHTML('afterbegin', card);
    setTimeout(() => { scrambleText(document.getElementById(cardId), `> "${osintMsg.toUpperCase()}"`, 1000); }, 50);
}, 15000);

// -- PREVIOUS LOGIC --
document.getElementById('gps-btn').addEventListener('click', (e) => {
    const btn = e.currentTarget;
    btn.style.color = "var(--hud-yellow)";
    speakAIDA("Acquiring satellite lock. Triangulating coordinates...");
    
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            MAP_CENTER = [lat, lng];
            HQ_LOC = [lat, lng];
            
            map.flyTo(MAP_CENTER, 14, { animate: true, duration: 2 });
            hqMarker.setLatLng(HQ_LOC).bindPopup("<b>DISPATCH HQ (YOUR LOC)</b>").openPopup();
            
            // Reposition Safe Zones around the new user location
            safeZoneA.setLatLng([lat + 0.015, lng + 0.02]);
            safeZoneB.setLatLng([lat - 0.02, lng - 0.015]);
            
            setTimeout(() => { 
                btn.style.color = "var(--hud-cyan)";
                document.querySelector('.sys-status').innerHTML = `SYS.NET // <span class="blink-cyan">ONLINE</span> // GPS_LINKED: ${lat.toFixed(4)}, ${lng.toFixed(4)}`;
                speakAIDA("GPS Uplink Confirmed. Operational theater successfully shifted to your current location.");
            }, 2000);
        }, (err) => {
            btn.style.color = "var(--hud-red)";
            speakAIDA("GPS lock failed. Signal scrambled or permissions denied.");
        });
    } else {
        speakAIDA("Geolocation not supported on this terminal.");
    }
});

radarBtn.addEventListener('click', () => {
    radarActive = !radarActive;
    if (radarActive) { radarLayer.addTo(map); radarBtn.classList.add('active'); speakAIDA("NEXRAD Storm radar overlay activated."); }
    else { map.removeLayer(radarLayer); radarBtn.classList.remove('active'); speakAIDA("Radar link severed."); }
});

forecastBtn.addEventListener('click', () => {
    forecastBtn.disabled = true; speakAIDA("Running predictive neural network. Calculating probable secondary vectors...");
    setTimeout(() => {
        const ghostIcon = L.divIcon({ className: 'ghost-marker', html: "", iconSize: [30, 30] });
        for (let i = 0; i < 3; i++) {
            const glat = MAP_CENTER[0] + (Math.random() * 0.08 - 0.04);
            const glng = MAP_CENTER[1] + (Math.random() * 0.08 - 0.04);
            L.marker([glat, glng], { icon: ghostIcon }).addTo(map).bindPopup("<b>PREDICTED HOTZONE</b>");
        }
        speakAIDA("Prediction complete. Ghost markers generated.");
        setTimeout(() => forecastBtn.disabled = false, 5000);
    }, 2000);
});

function deploySquadTo(lat, lng) {
    const squad = squads.find(s => s.available);
    if (!squad) {
        speakAIDA("CRITICAL ERROR. ALL RESPONSE UNITS EXHAUSTED. CASUALTIES IMMINENT.");
        exhaustionAlert.classList.remove('hidden');
        setTimeout(() => exhaustionAlert.classList.add('hidden'), 5000);
        return "UNKNOWN";
    }

    squad.available = false;
    const sCard = document.querySelector(`.squad-card[data-squad="${squad.id}"]`);
    sCard.classList.add('deployed');
    sCard.querySelector('.squad-status').innerText = "DEPLOYED_EN_ROUTE";
    sCard.querySelector('.squad-status').className = "squad-status status-deployed";

    const unitIcon = L.divIcon({ className: 'unit-marker', html: "", iconSize: [14, 14] });
    const uMarker = L.marker(HQ_LOC, { icon: unitIcon }).addTo(map);

    let ticks = 0; const maxTicks = 60;
    const latStep = (lat - HQ_LOC[0]) / maxTicks; const lngStep = (lng - HQ_LOC[1]) / maxTicks;

    // Draw dispatch line to hospital as well (simulates post-triage routing)
    L.polyline([[lat, lng], [lat + 0.01, lng + 0.01]], { color: '#39ff14', weight: 2, dashArray: '5, 5', opacity: 0.5 }).addTo(map);

    const driveInterval = setInterval(() => {
        if (ticks >= maxTicks) { clearInterval(driveInterval); uMarker.bindPopup(`<b>SQUAD ${squad.id} ARRIVED</b>`).openPopup(); }
        else { uMarker.setLatLng([HQ_LOC[0] + (latStep * ticks), HQ_LOC[1] + (lngStep * ticks)]); ticks++; }
    }, 30);

    setTimeout(() => {
        squad.available = true; sCard.classList.remove('deployed'); map.removeLayer(uMarker);
        sCard.querySelector('.squad-status').innerText = "WAITING...";
        sCard.querySelector('.squad-status').className = "squad-status status-ready";
    }, 15000);
    return squad.id;
}

droneBtn.addEventListener('click', () => {
    droneModal.classList.toggle('hidden');
    if (!droneModal.classList.contains('hidden')) {
        speakAIDA("Tracking drone feed initialized.");
        setTimeout(() => {
            droneMap.invalidateSize();
            droneMap.setView(MAP_CENTER, 15);
        }, 300);
    }
});

gpsBtn.addEventListener('click', () => {
    speakAIDA("Acquiring GPS satellite link.");
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
            const lat = position.coords.latitude; const lng = position.coords.longitude;
            MAP_CENTER = [lat, lng]; HQ_LOC = [lat, lng];
            map.flyTo(MAP_CENTER, 14); droneMap.flyTo(MAP_CENTER, 16);
            hqMarker.setLatLng(HQ_LOC);
            // Move safe zones
            safeZoneA.setLatLng([lat + 0.02, lng + 0.03]); safeZoneB.setLatLng([lat - 0.03, lng - 0.01]);
            speakAIDA("GPS Lock successful. Dispatch synced.");
        }, (err) => { speakAIDA("GPS Link failed."); });
    }
});

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
if (SpeechRecognition) {
    // 1. Triage Microphone (Main Terminal)
    const rec1 = new SpeechRecognition();
    rec1.continuous = false; rec1.interimResults = true;
    let isRec1 = false;
    micBtn.addEventListener('click', () => { if (isRec1) rec1.stop(); else { inputField.value = ""; rec1.start(); } });
    rec1.onstart = () => { isRec1 = true; micBtn.classList.add('recording'); micIcon.innerText = "radio_button_checked"; speakAIDA("Listening..."); };
    rec1.onresult = (e) => { let t=''; for(let i=e.resultIndex; i<e.results.length; ++i) t+=e.results[i][0].transcript; inputField.value=t.toUpperCase(); };
    rec1.onend = () => { isRec1 = false; micBtn.classList.remove('recording'); micIcon.innerText = "mic"; if (inputField.value.trim().length > 0) triggerTriage(); };

    // 2. Chatbot Microphone (Med-Bot AI)
    const rec2 = new SpeechRecognition();
    rec2.continuous = false; rec2.interimResults = true;
    let isRec2 = false;
    if (chatMicBtn) {
        chatMicBtn.addEventListener('click', () => { if (isRec2) rec2.stop(); else { chatInput.value = ""; rec2.start(); } });
        rec2.onstart = () => { isRec2 = true; chatMicBtn.classList.add('recording'); chatMicIcon.innerText = "radio_button_checked"; speakAIDA("Explain the medical emergency."); };
        rec2.onresult = (e) => { let t=''; for(let i=e.resultIndex; i<e.results.length; ++i) t+=e.results[i][0].transcript; chatInput.value=t; };
        rec2.onend = () => { isRec2 = false; chatMicBtn.classList.remove('recording'); chatMicIcon.innerText = "mic"; if (chatInput.value.trim().length > 0) handleChat(); };
    }
}

submitBtn.addEventListener('click', () => triggerTriage());
async function triggerTriage() {
    const rawText = inputField.value.trim();
    if (!rawText) return;
    submitBtn.disabled = true; micBtn.disabled = true; cameraBtn.disabled = true;
    speakAIDA("Analyzing distress vector...");
    try {
        const aiResponse = await analyzeWithGemini(rawText);
        addReportToDashboard(aiResponse);
        inputField.value = '';
    } catch (e) {
        speakAIDA("System Error.");
    } finally {
        submitBtn.disabled = false; micBtn.disabled = false; cameraBtn.disabled = false;
    }
}

async function analyzeWithGemini(text, bypassAPI = false) {
    if (GEMINI_API_KEY === "YOUR_GEMINI_API_KEY_HERE" || bypassAPI) {
        await new Promise(r => setTimeout(r, 800));
        let type = "UNKNOWN_ANOMALY"; let severity = "low"; let desc = "Data logged. Awaiting manual review."; let pReq = 2; let safety = "EVACUATE AREA IMMEDIATELY.";
        const t = text.toLowerCase();
        if (t.includes("fire") || t.includes("burn")) { type = "FIRE_OUTBREAK"; severity = "critical"; desc = "Class 4 Structural Fire reported to dispatch."; pReq = 12; safety = "[PROTOCOL] STAY LOW. USE STAIRS. AVOID ELEVATORS."; }
        else if (t.includes("medical") || t.includes("hurt")) { type = "MEDICAL_CASUALTY"; severity = "high"; desc = "Civilian casualties reported. Medic transport required."; pReq = 6; safety = "[PROTOCOL] APPLY DIRECT PRESSURE TO WOUNDS. CLEAR PATH FOR MEDICS."; }
        else if (t.includes("flood") || t.includes("water") || t.includes("surge")) { type = "WATER_BREACH"; severity = "critical"; desc = "Severe flooding detected. Evacuation ordered."; pReq = 18; safety = "[PROTOCOL] EVACUATE TO HIGH GROUND. DO NOT CROSS MOVING WATER."; }
        else if (t.includes("earthquake") || t.includes("quake") || t.includes("tremor") || t.includes("collapse")) { type = "SEISMIC_EVENT"; severity = "critical"; desc = "Major seismic activity registered. Structural collapses likely."; pReq = 24; safety = "[PROTOCOL] DROP, COVER, AND HOLD ON. STAY AWAY FROM WINDOWS."; }
        else if (t.includes("tsunami") || t.includes("wave")) { type = "TSUNAMI_WARNING"; severity = "critical"; desc = "Tsunami surge imminent. High-ground evacuation protocols engaged."; pReq = 30; safety = "[PROTOCOL] IMMEDIATE COASTAL EVACUATION TO 30m+ ELEVATION."; }
        else if (t.includes("riot") || t.includes("violence") || t.includes("explos")) { type = "CIVIL_UNREST"; severity = "high"; desc = "Public disturbance vector detected."; pReq = 14; safety = "[PROTOCOL] REMAIN INDOORS. LOCK ALL ENTRANCES."; }

        return { type, severity, description: desc, locationContext: "SECTOR_" + Math.floor(Math.random() * 99), personnelReq: pReq, safetyGuideline: safety, latOffset: (Math.random() * 0.04) - 0.02, lngOffset: (Math.random() * 0.04) - 0.02 };
    }
    
    try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;
        const prompt = `Use JSON. The input may be in ANY Indian language (Hindi, Tamil, Telugu, Bengali, Marathi, etc) or English. Process it natively. Extract: 1."type" (Always English tactical code, e.g. FIRE_OUTBREAK), 2."severity" (critical/high/medium/low), 3."description" (Translate the summary to English for the UI dashboard), 4."locationContext", 5."personnelReq" (integer), 6."safetyGuideline" (CRITICAL: Provide the safety instruction in the EXACT SAME Indian language the input text was written in, so the commander can broadcast it back to the victim natively), 7."latOffset" (-0.02 to 0.02), 8."lngOffset". TEXT: "${text}"`;
        const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { responseMimeType: "application/json" } }) });
        const data = await res.json();
        if(!data.candidates) throw new Error("API Limit Reached or Malformed Response");
        let rawJson = data.candidates[0].content.parts[0].text;
        rawJson = rawJson.replace(/```json/gi, '').replace(/```/g, '').trim();
        return JSON.parse(rawJson);
    } catch(err) {
        console.warn("API execution failed (Likely 429 Rate Limit). Falling back to offline simulator.", err);
        return await analyzeWithGemini(text, true); // Fallback to simulated offline data
    }
}

function scrambleText(element, finalString, duration) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&*'; let iterations = 0;
    const interval = setInterval(() => {
        element.innerText = finalString.split('').map((l, idx) => { if (idx < iterations) return finalString[idx]; return chars[Math.floor(Math.random() * chars.length)]; }).join('');
        if (iterations >= finalString.length) clearInterval(interval);
        iterations += 1 / (duration / 50);
    }, 30);
}

function updateThreatLevel() {
    if (stats.critical >= 3) {
        document.body.classList.add('threat-max'); document.body.classList.add('alarm-active');
        threatIndicator.innerText = "DEFCON 1: CRITICAL MASS"; threatIndicator.classList.add('danger');
        speakAIDA("Warning. Global threat level escalated to DEFCON 1. Protocol Omega initialized.");
    } else if (stats.critical >= 1 || stats.high >= 2) {
        threatIndicator.innerText = "THREAT LVL: 3 ELEVATED"; threatIndicator.style.color = "var(--hud-orange)"; threatIndicator.style.borderColor = "var(--hud-orange)";
    }
}

function addReportToDashboard(report) {
    // Robust parsing to handle inconsistent API outputs
    report.severity = (report.severity || 'low').toLowerCase();

    const lat = MAP_CENTER[0] + parseFloat(report.latOffset || (Math.random() * 0.04 - 0.02));
    const lng = MAP_CENTER[1] + parseFloat(report.lngOffset || (Math.random() * 0.04 - 0.02));
    const timestamp = new Date().toLocaleTimeString('en-US', { hour12: false });
    const logId = `LOG_ID_${Math.floor(Math.random() * 9000) + 1000}`;

    incidentLog.push({ id: logId, time: timestamp, type: report.type, severity: report.severity, lat: lat, lng: lng, desc: report.description });
    heatLayer.addLatLng([lat, lng, report.severity === 'critical' ? 1.0 : (report.severity === 'high' ? 0.7 : 0.4)]);

    const m = markers[report.severity] || markers['low'];
    const iconColor = report.severity === 'critical' ? 'var(--hud-red)' : report.severity === 'high' ? 'var(--hud-orange)' : report.severity === 'medium' ? 'var(--hud-yellow)' : 'var(--hud-cyan)';
    m.options.html = `<div style="color:${iconColor}"></div>`;
    L.marker([lat, lng], { icon: m }).addTo(map);

    // Phase 6: Civilian Crowd-Source Volunteer Swarm
    deployVolunteers(lat, lng);
    drainResources(report.severity);

    let assignedSquad = "NONE";
    if (report.severity === 'critical' || report.severity === 'high') {
        const routeColor = report.severity === 'critical' ? '#ff2a2a' : '#ff8c00';
        L.polyline([HQ_LOC, [lat, lng]], { color: routeColor, weight: 3, opacity: 0.8, className: 'dispatch-route' }).addTo(map);
        assignedSquad = deploySquadTo(lat, lng);
    }

    stats.total++; if (report.severity === 'critical') stats.critical++; if (report.severity === 'high') stats.high++;
    document.getElementById('stat-total').innerText = stats.total.toString().padStart(2, '0');
    document.getElementById('stat-critical').innerText = stats.critical.toString().padStart(2, '0');

    updateThreatLevel();

    let speechType = report.severity === 'critical' ? "Critical Level Tier 1" : report.severity === 'high' ? "High Priority" : "Standard Priority";
    if (assignedSquad !== "UNKNOWN" && assignedSquad !== "NONE") { speakAIDA(`${speechType}. ${report.type} detected. Squad ${assignedSquad} dispatched.`); }

    // Phase 7: Contextual Safety Directive
    let safetyDirective = report.safetyGuideline || "EVACUATE AREA IMMEDIATELY.";

    const personnelReq = report.personnelReq || (report.severity === 'critical' ? Math.floor(Math.random() * 15 + 10) : report.severity === 'high' ? Math.floor(Math.random() * 8 + 4) : 2);

    const demandsLogistics = report.severity === 'critical' ? '12 EVAC, 5 WATER' : '4 EVAC, 2 WATER';
    const demandsMed = report.severity === 'critical' ? '14 MED-KITS (OVERRIDE)' : '6 MED-KITS';
    const agentHtml = (report.severity === 'critical' || report.severity === 'high') ? `<div class="agent-negotiation"><div class="agent-msg"><span class="agent-name">LOGISTICS_AI:</span> Routing ${demandsLogistics} to sector.</div><div class="agent-msg"><span class="agent-name med">MEDICAL_AI:</span> Priority override. Casualties expected. Injecting ${demandsMed}.</div></div>` : ``;

    const cardId = 'desc-' + Math.floor(Math.random() * 9000);
    const card = `<div class="report-card ${report.severity}"><div class="card-header"><span>[${logId}]</span> <span>${timestamp}</span></div><div style="font-size:10px; color:var(--text-main); margin-bottom:4px; font-weight:bold;">EST. MANPOWER: ${personnelReq} RESPONDERS</div><div class="card-type">${report.type}</div><div class="card-desc" id="${cardId}">> INITIATING DECRYPTION...</div>${agentHtml}<div class="safety-directive">[PROTOCOL] ${safetyDirective}</div><div class="card-footer" style="margin-top:6px;"><span>SQD:${assignedSquad.toUpperCase()}</span> | <span>LAT:${lat.toFixed(4)}</span> | <span>${report.locationContext.toUpperCase()}</span></div></div>`;
    document.getElementById('crisis-feed').insertAdjacentHTML('afterbegin', card);

    // Dynamically update the global scrolling safety ticker to broadcast ONLY the specific protocol for this newly typed disaster!
    const ticker = document.querySelector('.safety-ticker-content');
    if(ticker) {
        ticker.innerHTML = `<span class="warning-icon material-symbols-outlined">warning</span> // [PUBLIC SAFETY BROADCAST] :: ${report.type.toUpperCase()}: ${safetyDirective.toUpperCase()} // [REPEAT PROTOCOL] :: ${report.type.toUpperCase()}: ${safetyDirective.toUpperCase()} //`;
    }

    setTimeout(() => { scrambleText(document.getElementById(cardId), "> " + report.description.toUpperCase(), 1500); }, 100);
    setTimeout(() => {
        const bounds = L.latLngBounds([HQ_LOC, [lat, lng]]);
        map.fitBounds(bounds, { padding: [50, 50], animate: true, duration: 1.5 });
        droneMap.flyTo([lat, lng], 17, { animate: true, duration: 1.5 });
    }, 500);
}

chaosBtn.addEventListener('click', async () => {
    chaosBtn.disabled = true; document.body.classList.add('alarm-active');
    const disasters = ["Massive fire spreading rapidly downtown.", "Severe water surge and flooding in residential sector.", "Medical emergency, multiple hurt civilians at transit hub.", "Structural collapse reported.", "Violent riot breaking out in sector 4.", "Secondary gas main explosion detected!"];
    
    // Pass 'true' to intentionally bypass the live Gemini API hitting 6 times. This prevents Google from blocking the API (429 Rate Limit) during the hackathon demo.
    for (let i = 0; i < disasters.length; i++) { setTimeout(async () => { const res = await analyzeWithGemini(disasters[i], true); addReportToDashboard(res); }, i * 600); }
    setTimeout(() => chaosBtn.disabled = false, 5000);
});

exportBtn.addEventListener('click', () => {
    if (incidentLog.length === 0) return;
    const headers = "ID,Time,Type,Severity,Latitude,Longitude,Description\n";
    const csvContent = "data:text/csv;charset=utf-8," + headers + incidentLog.map(e => `${e.id},${e.time},${e.type},${e.severity},${e.lat.toFixed(4)},${e.lng.toFixed(4)},"${e.desc}"`).join("\n");
    const link = document.createElement("a"); link.setAttribute("href", encodeURI(csvContent)); link.setAttribute("download", `AAR_Report_${new Date().getTime()}.csv`);
    document.body.appendChild(link); link.click(); document.body.removeChild(link);
});

// FEATURE 3: HUD REFLECTION MODE
let hudModeActive = false;
hudModeBtn.addEventListener('click', () => {
    hudModeActive = !hudModeActive;
    if (hudModeActive) { document.body.classList.add('hud-reflection-mode'); speakAIDA("Holographic Reflection Mode engaged."); }
    else { document.body.classList.remove('hud-reflection-mode'); speakAIDA("HUD Mode disabled. Standard display restored."); }
});

// FEATURE 1: QUARANTINE ZONES
let quarantineActive = false;
let isDrawingQuarantine = false;
let quarantinePoints = [];
let drawingPolyline = null;
let activeQuarantinePoly = null;
map.doubleClickZoom.disable(); 

quarantineBtn.addEventListener('click', () => {
    if (quarantineActive) {
        if(activeQuarantinePoly) map.removeLayer(activeQuarantinePoly);
        quarantineActive = false; quarantinePoints = []; activeQuarantinePoly = null;
        quarantineBtn.classList.remove('active');
        speakAIDA("Quarantine zone lifted. Evacuation routes cleared.");
    } else {
        isDrawingQuarantine = true; quarantinePoints = [];
        if(drawingPolyline) map.removeLayer(drawingPolyline); drawingPolyline = null;
        speakAIDA("Quarantine drawing protocol active. Click map to draw exclusion zone. Right click to terminate perimeter.");
    }
});

map.on('click', (e) => {
    if(!isDrawingQuarantine) return;
    quarantinePoints.push([e.latlng.lat, e.latlng.lng]);
    if(drawingPolyline) map.removeLayer(drawingPolyline);
    drawingPolyline = L.polyline(quarantinePoints, {color: 'red', dashArray: '5, 5'}).addTo(map);
});

map.on('contextmenu', (e) => {
    if(!isDrawingQuarantine) return;
    isDrawingQuarantine = false;
    if(drawingPolyline) map.removeLayer(drawingPolyline);
    
    if(quarantinePoints.length >= 3) {
        activeQuarantinePoly = L.polygon(quarantinePoints, {color: 'red', fillColor: '#ff0000', fillOpacity: 0.2, className: 'quarantine-poly'}).addTo(map);
        activeQuarantinePoly.bindPopup("<b>BIO-HAZARD QUARANTINE ZONE</b>");
        quarantineActive = true; quarantineBtn.classList.add('active');
        speakAIDA("Exclusion perimeter locked. Halting civilian pathing within sector.");
    } else {
        quarantinePoints = [];
        speakAIDA("Quarantine drawing failed. Insufficient perimeter coordinates.");
    }
});

// FEATURE: CIVILIAN QUADCOPTER AIRDROP
callDroneBtn.addEventListener('click', () => {
    callDroneBtn.disabled = true;
    speakAIDA("Civilian rescue beacon detected. Scrambling quadcopter for immediate airdrop.");
    
    // Generate random civilian coordinate nearby
    const civLat = MAP_CENTER[0] + (Math.random() * 0.03 - 0.015);
    const civLng = MAP_CENTER[1] + (Math.random() * 0.03 - 0.015);
    
    // Create quad marker at HQ
    const quadHtml = `<div class="quad-wrapper"><span class="material-symbols-outlined quadcopter-marker" style="font-size:30px;">mode_fan</span></div>`;
    const quadIcon = L.divIcon({ className: 'custom-quad', html: quadHtml, iconSize: [30, 30] });
    const activeQuadcopter = L.marker(HQ_LOC, { icon: quadIcon, zIndexOffset: 1000 }).addTo(map);
    
    // Fly the drone map to HQ instantly if open, update telemetry
    droneMap.flyTo(HQ_LOC, 16, { animate: false });
    const telemetryObj = document.getElementById('drone-telemetry');
    if(telemetryObj) telemetryObj.innerText = `ALT: 1200FT | TGT: EN ROUTE | SENSOR: FLIR`;

    let ticks = 0; const maxTicks = 120; // 5 seconds approx
    const latStep = (civLat - HQ_LOC[0]) / maxTicks; 
    const lngStep = (civLng - HQ_LOC[1]) / maxTicks;
    
    // Draw flight path
    L.polyline([[HQ_LOC[0], HQ_LOC[1]], [civLat, civLng]], { color: '#00ff66', weight: 2, dashArray: '5,5', opacity: 0.5 }).addTo(map);

    const flight = setInterval(() => {
        if (ticks >= maxTicks) { 
            clearInterval(flight);
            // Reached destination!
            speakAIDA("Quadcopter reached destination. Releasing emergency payload.");
            if(telemetryObj) telemetryObj.innerText = `ALT: 1200FT | TGT: DROPPING PAYLOAD | SENSOR: FLIR`;
            
            // Drop flare
            const flareIcon = L.divIcon({ className: 'supply-flare', html: "", iconSize: [24, 24] });
            L.marker([civLat, civLng], { icon: flareIcon }).addTo(map);
            
            setTimeout(() => { map.removeLayer(activeQuadcopter); callDroneBtn.disabled = false; }, 4000);
            
            // Subtract resources!
            resources.water = Math.max(0, resources.water - 5); resources.med = Math.max(0, resources.med - 2);
            document.getElementById('res-water').innerText = `${Math.floor(resources.water)}%`;
            document.getElementById('bar-water').style.width = `${Math.floor(resources.water)}%`;
            document.getElementById('res-med').innerText = `${Math.floor(resources.med)}%`;
            document.getElementById('bar-med').style.width = `${Math.floor(resources.med)}%`;
        } else {
            const nextLat = HQ_LOC[0] + (latStep * ticks);
            const nextLng = HQ_LOC[1] + (lngStep * ticks);
            activeQuadcopter.setLatLng([nextLat, nextLng]);
            // Sync Drone Map camera frame-by-frame!
            droneMap.setView([nextLat, nextLng], 17, { animate: false });
            ticks++;
        }
    }, 40);
});

window.addEventListener('load', () => { setTimeout(() => { speakAIDA("Tactical response network activated."); }, 1500); });
