# Production Deployment Checklist (Platform-Agnostic)

## 1) Environment variables
Set these in your hosting platform (do not commit real values):
- `NODE_ENV=production`
- `PORT=5000` (platform may override)
- `APP_NAME=Knock Me Chat`
- `APP_URL=https://your-domain.com`
- `MONGODB_URI=your mongodb uri`
- `COOKIE_NAME=knock_chat`
- `COOKIE_SECRET=strong-random-secret`
- `JWT_SECRET=strong-random-secret`
- `JWT_EXPIRY=86400000` (milliseconds)

## 2) Security + network
- Use HTTPS in production.
- If behind a proxy/load balancer, `trust proxy` is enabled in `index.js`.
- Use a TURN server for reliable WebRTC in production (STUN only may fail in many networks).

## 3) Build/run
Install dependencies and run:
- `npm install`
- `npm run prod` or `npm start`

## 4) Health check
- `GET /healthz` returns `{ ok: true }` when running.

## 5) Logging/monitoring
- Stream stdout/stderr from the host platform.
- Add external monitoring if required by your provider.

## 6) Storage
- Ensure MongoDB is reachable from the host.
- Use managed MongoDB (Atlas) for production reliability.

## 7) Socket.IO/WebRTC
- Allow WebSocket upgrades on your platform.
- If using a reverse proxy (Nginx), enable `proxy_set_header Upgrade` and `Connection`.

## 8) Optional hardening
- Enable CORS if exposing APIs to other origins.
- Add rate limits per route if you expect high traffic.

