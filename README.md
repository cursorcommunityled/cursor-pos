<p align="center">
  <img src="public/CUBE_2D_LIGHT.svg" alt="Cursor logo" width="140" />
</p>

<h1 align="center">Cursor POS</h1>

<p align="center">
  Browser-based thermal ticket printing for Cursor events.<br />
  QR check-in, WiFi details, photo tickets, and live preview. No desktop app required.
</p>

<p align="center">
  <a href="https://cursor-pos.vercel.app"><strong>Live app</strong></a>
  ·
  <a href="https://cursor-pos.vercel.app/docs"><strong>Documentation</strong></a>
  ·
  <a href="https://github.com/cursorcommunityled/cursor-pos"><strong>GitHub</strong></a>
</p>

---

## What is Cursor POS?

**Cursor POS** is a web app to print **58 mm thermal tickets** directly from **Chrome or Edge** using **Web Serial**. Built for meetups, check-in desks, and event handouts where you need receipts with QR codes, names, WiFi info, or attendee photos.

Printing runs **in the browser on each machine**. The Vercel deployment serves the UI; your printer connects locally via Bluetooth Serial.

## Features

### Event ticket
- Cursor logo on every receipt
- Custom QR code (Luma, check-in links, etc.)
- Business name, event type, action label
- Attendee name and optional extra line
- WiFi network and password block
- Full timestamp with seconds
- Save default field values in the browser

### Photo ticket
- Capture from camera or upload an image
- 3, 2, 1 countdown before capture
- Review, retake, or confirm before printing
- Switch between front/back cameras when available
- Name, extra line, timestamp, and Cursor logo on the ticket
- Great for building a **photo wall / mural** after the event

### General
- Large live preview (58 mm and 80 mm paper)
- Direct print over Web Serial (ESC/POS)
- Download raw ESC/POS file as backup
- English and Spanish UI
- Full setup guide at [/docs](https://cursor-pos.vercel.app/docs)

## Recommended printer

Tested with **GOOJPRT PT-210** (portable, Bluetooth, 58 mm thermal paper).

| Spec | Detail |
| --- | --- |
| Model | GOOJPRT PT-210 |
| Paper | 58 mm thermal |
| Connection | Bluetooth (virtual COM / Serial) |
| Protocol | ESC/POS |
| Recommended baud | **9600** |

It should also work with other **58 mm Bluetooth thermal printers** that expose a **Serial (COM) port** and support ESC/POS, including many portable models similar to MTP-2.

## Quick start (printing)

1. Pair the printer via **Bluetooth** in your OS settings.
2. Open [cursor-pos.vercel.app](https://cursor-pos.vercel.app) in **Chrome** or **Edge** (HTTPS required).
3. Click **Connect Serial** and select the paired printer port.
4. Set baud rate to **9600**.
5. Fill in the ticket fields and click **Print ticket** or **Print photo**.

See the full guide: [cursor-pos.vercel.app/docs](https://cursor-pos.vercel.app/docs)

## Requirements

- **Browser:** Chrome or Edge (Web Serial)
- **HTTPS** or `localhost` (required for camera and printer APIs)
- **Printer:** 58 mm thermal (80 mm optional in settings)
- **Windows:** use Serial over Bluetooth; WebUSB is blocked by drivers on most setups

## Development

```bash
git clone https://github.com/cursorcommunityled/cursor-pos.git
cd cursor-pos
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run start` | Run production server |
| `npm run lint` | ESLint |

### Stack

- [Next.js 16](https://nextjs.org) (App Router)
- [React 19](https://react.dev)
- [@point-of-sale/receipt-printer-encoder](https://www.npmjs.com/package/@point-of-sale/receipt-printer-encoder) for ESC/POS
- [Web Serial](https://developer.mozilla.org/en-US/docs/Web/API/Web_Serial_API) for browser printing
- [Tailwind CSS 4](https://tailwindcss.com)
- Deployed on [Vercel](https://vercel.com)

## Project structure

```
src/
  app/              Next.js routes (/, /docs, API)
  components/       UI (PosApp, camera, previews)
  hooks/            Browser printer hook
  lib/              Receipt builders, images, i18n
public/
  CUBE_2D_LIGHT.svg Official Cursor logo asset
```

## Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/cursorcommunityled/cursor-pos)

Or connect your fork to Vercel. No server-side printer access is needed for the main workflow.

## Feedback

Found a bug or have an idea? Open an [issue](https://github.com/cursorcommunityled/cursor-pos/issues) or try the app at your next event and share feedback.

## Author

Built by **[cbiux](https://linktr.ee/cbiux)** for Cursor community events.

Pura Vida
