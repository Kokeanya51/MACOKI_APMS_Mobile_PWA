# MaCoKi Patient Management System — Mobile PWA

This project converts the MaCoKi APMS concept into an installable Progressive Web App.

## Included
- Mobile-first dashboard
- Patient registration
- Clinical visit records
- Follow-up scheduling/completion
- Basic reports
- Role selector for Super Admin, Pharmacist, Lab Staff and Reception
- Local browser persistence for demonstration
- PWA manifest + service worker
- Android installable standalone experience

## Important
This is a frontend/PWA demonstration layer. It does **not** yet connect to a production patient database.

For the MaCoKi production architecture, connect this frontend to:
**React + TypeScript + Vite → Django REST Framework → PostgreSQL**
with authentication, protected routes, audit logs and role-based permissions.

## Run
```bash
npm install
npm run dev
```

## Build
```bash
npm run build
```

Deploy the `dist` folder to an HTTPS host such as Netlify. Then open the URL in Chrome on Android and choose **Install App / Add to Home screen**.

The uploaded Week 4 course material specifically identifies `manifest.json`, a service worker and HTTPS as the three core PWA requirements, and recommends Netlify/Vercel/GitHub Pages/Render for deployment.
