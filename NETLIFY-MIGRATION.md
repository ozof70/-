# Netlify migration status

Target: `coz-cos-closet` (site ID `f084c632-7093-46eb-a3e6-2619c97fc4be`).
Production domain remains `https://closet.cozcos.com` on Railway until cutover verification.

## Prepared

- Netlify site and database provisioned in the existing Netlify account.
- `CLOSET_STORAGE=netlify` selects Postgres and Netlify Blobs; unset retains the existing SQLite / disk backend.
- Native Netlify migration defines the schema. Credentials remain server-side site variables.
- Existing parameterized SQL and atomic administrator audit transactions retained.
- Photos retain their existing URLs and access checks; private photos must remain private.

## Required before cutover

1. Renew Railway login, export a consistent current SQLite snapshot and all upload files; retain backups outside the public repository.
2. Apply the Postgres schema through Netlify's deployment migration lifecycle.
3. Import original IDs, users, sessions, items, bookings, moderation and audit records; preserve prices, pending status and image order.
4. Upload every photo to the `closet-photos` site store with the existing object key, verifying hashes and dimensions.
5. Transfer current Google / LINE credentials and the complete administrator allowlist securely; keep `SITE_URL=https://closet.cozcos.com`.
6. Verify isolated data import, authentication, administrator edits, bookings, photo permissions, responsive layouts and SEO on the Netlify deployment.
7. Briefly prevent source writes for a final synchronized import; switch only `closet.cozcos.com` DNS once the new deployment passes checks.
8. Verify the custom domain's TLS and both login callbacks. Keep a rollback deployment and source backup until stability is confirmed.

Latest checkpoint (2026-10-23): Railway authorization restored. A private snapshot contains 36 items, 205 photo files, 5 users and 2 bookings, with session, moderation and audit data retained. Google / LINE credentials and the four-administrator allowlist have been transferred securely. Deployment 6adae328acf81a84f38246ca is published successfully with API-level maintenance guards. Database health passes when accessed through the existing team login. All 205 photo objects were uploaded. Row import rolled back completely because the API database role is netlifydb_readonly; enabling temporary PAT write access awaits explicit confirmation. Production visibility remains private pending confirmation to publish production while retaining private previews. Data import and final synchronized cutover remain pending. Production remains on Railway; no source data has been removed. DNS edits require the pending explicit approval because mixed Name.com / Netlify name servers were detected.
