<div align="center">
  <img src="https://img.shields.io/badge/A.I.D.A-TACTICAL_AI_DISPATCH-00f3ff?style=for-the-badge&logoColor=black" alt="Banner">
  <h1>A.I.D.A // RescueGrid Tactical Command HUD</h1>
  <p><strong>Next-Generation Serverless Crisis Management Platform powered by Google Gemini AI</strong></p>
</div>

<br />

## 📖 Overview
RescueGrid is a "Zero-Infrastructure" tactical web dashboard built for immediate deployment during catastrophic infrastructure failures. Relying strictly on edge-computing and the Google Gemini Neural Network, the platform bypasses the need for vulnerable backend databases. It ingests chaotic, multi-lingual distress data from civilians and instantly synthesizes it into live map deployments, automated civilian swarm pathing, and physical UAV drone dispatch.

This platform was built to solve the ultimate gap in emergency dispatch: **Turning unstructured human panic into structured tactical data.**

<br />

## 🚀 Key Innovation Highlights

### 🧠 1. Native Multi-Lingual Generative AI Triaging
Traditional dispatch relies on human operators translating languages and memorizing priority codes. RescueGrid routes raw inbound distress signals directly to **Gemini 2.5 Flash**. The AI natively processes any language (Hindi, Spanish, Bengali, etc.), standardizes the threat assessment, calculates squad manpower constraints, and outputs a highly specific survival protocol in the *exact language* the victim used.

### 🚁 2. Civilian UAV Interaction & Thermal Tracking
Built-in interaction allowing a civilian on a mobile endpoint to "ping" an emergency signal. The interface simulates a physical dispatch of an autonomous quadcopter from HQ. It recalculates intercept vectors and live-tracks the drone via a simulated **FLIR Thermal Satellite Uplink camera** to air-drop supplies, physically reducing operational logistics counters.

### 🎭 3. Holographic HUD Presentation Mode
Engineered directly into the CSS layer, the `[PROJECT HUD]` feature completely inverts the matrix presentation layer and color contrast. When a physical device is placed horizontally on a keyboard, it reflects perfectly onto the monitor, creating a physical 3D **Heads-Up Display (Pepper's Ghost Illusion)** mimicking military hardware.

### 🧱 4. Agentic Logistics Workflow
Showcasing a live Multi-Agent architecture. When a "Critical" incident hits the matrix, the dashboard instantiates a backend negotiation between two distinct sub-agents (`MEDICAL_AI` and `LOGISTICS_AI`), visualizing their conflict resolution over supply distribution before pushing the final data to the active event log.

### 🛑 5. Tactical Quarantine Geofencing
Commanders can physically draw high-risk exclusion geometry directly over the live world map. Escaping "Civilian" swarm pathing dots that wander into the polygon are instantly halted and locked, dynamically adjusting the physical simulation logic on the map interface.

<br />

## 💻 Tech Stack
* **Architecture:** 100% Serverless Edge Delivery (PWA)
* **Frontend:** Vanilla HTML5, Vanilla JavaScript, Custom Glassmorphism CSS3
* **AI Engine:** Google Generative AI (`gemini-2.5-flash`)
* **Mapping Engine:** Leaflet.js
* **Tileset:** Google Maps Hybrid & NEXRAD WMS Weather Radar

<br />

## ⚙️ Running Locally
1. Clone the repository.
2. Ensure you have a valid Gemini API key in `app.js` (`const GEMINI_API_KEY = "YOUR_KEY";`).
3. Open `index.html` in any modern web browser or serve via Live Server. No `npm install` or backend required.

<br />

> *"In chaos, latency equals casualties. We built a system that trades latency for intelligence."*
