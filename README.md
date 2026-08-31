# Gold Rate App

A full-stack app: **Expo (React Native)** frontend + **Node.js / Express / MongoDB** backend.

## Screens
- **Splash** — shown for ~2 seconds on launch, then goes to Welcome.
- **Welcome** — choose **Default** (tracks all 5 purities) or **Custom** (checkboxes for 24K / 22K / 20K / 18K / 14K).
- **Home** — shows gold rates for the selected purities. Hamburger icon (top-left) opens the drawer menu.
- **Device Connect** — WiFi/IoT display device scan & connect screen (reachable from the drawer menu). Currently uses mock devices — wire up real discovery/connection logic where marked `TODO`.

Currently the backend serves **mock/dummy gold rate data** so the app works immediately without needing a live rate feed. Swap in a real API later inside `backend/routes/goldRate.js`.

## Project structure
```
gold-rate-app/
  backend/    -> Node.js + Express + MongoDB API
  frontend/   -> Expo React Native app
```

## Backend setup
```bash
cd backend
npm install
cp .env.example .env
npm start
```
Server runs on `http://localhost:5000` by default.
`.env` has `USE_MOCK_DATA=true` by default — the API returns mock rates without needing MongoDB running at all. Set it to `false` and provide a real `MONGO_URI` once you're ready to use a live database (you'll then need to seed the `GoldRate` collection yourself, since the mock fallback only kicks in when the collection is empty).

## Frontend setup
```bash
cd frontend
npm install
npx expo start
```
Scan the QR code with the **Expo Go** app on your phone, or press `a`/`i` for an emulator/simulator.

**Important:** in `frontend/src/api/goldRateApi.js`, `BASE_URL` is set to `http://localhost:5000`. That only works for web or an emulator running on the same machine as the backend. For a real device, replace it with your computer's LAN IP, e.g. `http://192.168.1.10:5000` (find it with `ipconfig`/`ifconfig`), and make sure your phone is on the same WiFi network.

## Next steps to make it production-ready
- Replace mock gold rate data with a real gold price API or your own data source.
- Implement real WiFi/IoT device discovery and connection logic in `DeviceConnectScreen.js`.
- Add real splash/app icons in `frontend/assets/` (currently referenced in `app.json` but not included).
- Add error/loading states, and persist the user's Default/Custom choice (e.g. with `AsyncStorage`) so Welcome doesn't reappear every launch.
