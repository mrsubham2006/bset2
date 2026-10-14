# 🏛️ CIVIC NEXUS AI
### The AI Nervous System for a Self-Healing Smart City & Destination Discovery Platform
**Team:** CODE BLAZE  
**Event:** BCET ODYSSEY 2026  
**Track:** Smart City AI & Emergency Governance Track

---

## 🌟 Overview

**CIVIC NEXUS AI** is an intelligent, multi-portal civic operating system engineered for modern urban governance, real-time emergency response, unified citizen collaboration, and smart tourism discovery. Built with a localized focus on Odisha (Bhubaneswar and Balasore District), it provides an end-to-end synchronized digital nervous system connecting citizens, field workers, municipal administrators, city commanders, emergency services, and tourists in real time.

---

## 🚀 Key Modules & Architecture

### 1. 📹 AI Emergency Video Intelligence & Automatic SOS Alert System
* **Multi-Hazard Computer Vision Engine**: Decodes real video streams and camera feeds to identify critical emergencies:
  - 🚑 **Ambulances in Transit** (108 Lifeline + 1-Click Green Corridor preemption to AIIMS Bhubaneswar)
  - 🚒 **Fire Engines & Heavy Tenders** (101 Emergency Services)
  - 🔥 **Visible Flames, Dense Smoke & Thermal Plumes**
  - 💥 **Road Accidents, High-Kinetic Crashes & Lane Blockages**
  - 👥 **Abnormal Crowd Density & Bottleneck Surges**
  - ⚠️ **Physical Altercations & Public Safety Hazards**
  - 🚔 **Police PCR / SWAT Interceptors**
* **Temporal Tracking & Evidence HUD**: Highlights emergency candidates with bounding boxes, confidence tags (>90%), and frame timestamps.
* **Instant Multi-Tier SOS Broadcast**: Automatically creates canonical incidents, alerts City Command Center, sounds prioritized dashboard sirens, and streams real-time updates via Server-Sent Events (SSE).

### 2. 🧭 Smart Tourism & Destination Discovery Platform (Balasore District)
* **Interactive Cartographic Map (`BalasoreTouristMap`)**: Leaflet-powered GIS mapping centered on Balasore (`21.4927° N, 86.9315° E`) with category-colored pins, popups, and turn-by-turn routing.
* **Verified Destinations Directory**: 8 verified heritage & nature sites including Chandipur Beach, Panchalingeswar Temple, Kuldiha Wildlife Sanctuary, Remuna Khirachora Gopinath Temple, Talsari Beach, Nilagiri Heritage Town, Budhabalanga River Estuary, and Bhushandeshwar Shiva Temple.
* **Hotels & OTDC Panthanivas**: Verified accommodations registry including OTDC Panthanivas Chandipur/Talsari, Arpita Beach Resort, Hotel Nocci Residency, and Nilagiri Forest Camp with direct phone dialers and booking links.
* **Authentic Odia Cuisine & Seafood Hubs**: Dedicated guide to Balaramgadi seafood, famous Remuna Khira bhog pots, and iconic Balasore Mudhi Mansa (puffed rice with spiced mutton).
* **Live Tidal Telemetry & Travel Conditions**: Real-time observatory for Chandipur's "disappearing sea" phenomenon (low tide ~4.8 km recession), coastal swell reports, and highway corridor transit statuses (NH-16, SH-19, SH-516).
* **24x7 Tourist Safety & SOS Desk**: Direct helplines for Tourist Police (112), Chandipur Marine Police, DHH Hospital (108), ODRAF Rescue (101), and instant emergency SOS dispatch form with tracking reference codes.
* **Gemini AI Trip Planner & AI Companion**: Customized hazard-aware itineraries and multilingual Odia/English support.

### 3. 🚨 City Command Center & CCTV Telemetry
* Real-time spatial map with live camera feeds across major junctions (Rasulgarh, Vani Vihar, Khandagiri, Master Canteen).
* Cross-agency incident triaging, active telemetry, and coordinated resource dispatching.

### 4. 👥 Unified Citizen Portal
* Multilingual (English & Odia - ଓଡ଼ିଆ) complaint registration with photo uploads and AI auto-categorization.
* Transparent lifecycle tracking, Sambalpuri Ikat and Konark wheel motifs, and instant push notifications.

### 5. 🏢 Municipal Department Operations
* Workload distribution across Drainage & Flood Control, Sanitation, Roads, Electricity, and Healthcare.
* Verification workflows, supervisor approvals, and field technician dispatch controls.

### 6. 📱 Field Worker Mobile Panel
* Task assignment, location-aware job routing, before/after photographic proof submission, and work completion verification.

### 7. 🔐 Unified Role-Based Governance & Auth
* Isolated role security: `CITIZEN`, `FIELD_WORKER`, `MUNICIPAL_OFFICER`, `CITY_COMMANDER`, `EMERGENCY_COORDINATOR`, and `SUPER_ADMIN`.
* Comprehensive audit logging and persistent system health diagnostics.

---

## 🛠️ Technology Stack

* **Frontend**: React 19, TypeScript, Tailwind CSS, Lucide Icons, Leaflet GIS Maps, HTML5 Canvas Video HUD
* **Backend & API**: Express.js, TypeScript, SSE (Server-Sent Events), Node.js
* **AI & Vision Pipeline**: NexusVision Multi-Hazard Vision Heuristics, Google Gemini 2.5 Flash Vision integration
* **Testing & QA**: End-to-End Automated Synchronization Suite (`tests/e2e-sync-test.ts` & `tests/tourism-integration-test.ts`)

---

## ⚡ Quick Start & Installation

### Prerequisites
* **Node.js**: v18.0.0 or higher
* **npm** or **bun**

### 1. Clone the Repository
```bash
git clone https://github.com/The-Odyssey-2026/Code_Blaze.git
cd Code_Blaze
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Copy `.env.example` to `.env`:
```env
PORT=3000
GEMINI_API_KEY="your-gemini-api-key-here"
WEATHER_API_KEY="your-open-weather-api-key-here"
```

### 4. Run Development Server
```bash
npm run dev
```
The application will launch at: **`http://localhost:3000`**

### 5. Run Automated Tests
Execute the complete 18-step automated test suite (11/11 cross-portal sync tests + 7/7 smart tourism integration tests):
```bash
npm test
```

---

## 👥 Team: CODE BLAZE
* Built for **BCET ODYSSEY 2026**
* Smart City AI & Emergency Governance Track
