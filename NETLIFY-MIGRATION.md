# Netlify production migration

Production: https://closet.cozcos.com
Netlify project: coz-cos-closet (f084c632-7093-46eb-a3e6-2619c97fc4be).
Published deployment: 6adb2cd9826270a36a3c9d51.
Completed checks: 2026-10-23 (Asia/Taipei).

## Data and authentication

- PostgreSQL and site-scoped Netlify Blobs replace Railway SQLite / disk in production. Local development retains the SQLite backend.
- Imported 36 listings (35 public, one hidden), 205 original photo files, five users, two bookings, four sessions, moderation and audit records.
- A final source snapshot was taken while SQLite writes were locked. Users, listings, prices, deposits, bookings and audit history matched exactly after import.
- All 205 photo objects passed SHA-256 verification; all 102 public display images passed HTTP checks. Hidden photos remained inaccessible to anonymous visitors.
- Google / LINE credentials and all four administrator emails match the previous production configuration. SITE_URL remains https://closet.cozcos.com.
- Production OAuth start routes return 303 to the correct providers with Secure / HttpOnly state cookies and canonical callback URLs. Invalid callbacks are rejected. A full interactive provider login was not completed because the browser verification tool timed out.
- CLOSET_STORAGE=netlify; CLOSET_READ_ONLY=0. Temporary personal-token database write access was disabled and verified read-only after import.

## Domain and source retirement

- Name.com closet CNAME targets coz-cos-closet.netlify.app. Netlify DNS has matching NETLIFY / NETLIFYv6 records. The root website and other records were preserved.
- TLS certificate issued for closet.cozcos.com. Production visibility is Public; deploy previews remain Private.
- Railway deployment 5d009a03-0cd2-45aa-b1d4-956c8260d03e was stopped. The old deployment, service and data volume were retained for recovery; no source data was deleted.
- The temporary Railway SSH key was revoked; the registered-key list was empty, and only the temporary local key files were removed.
- Private snapshots and detailed integrity reports remain in the approved work-tools directory outside the application repository and source exports.

## Deploy future updates

Use Node 24 and the full Next.js adapter build:

```sh
npx netlify-cli deploy --build --prod --context production --site f084c632-7093-46eb-a3e6-2619c97fc4be
```

Do not deploy the raw .next directory with --no-build: it contains internal server files. The Netlify adapter must package the public assets and server function.

## Platform limit

Netlify buffered function requests are limited to 6 MB, approximately 4.5 MB for binary uploads after Base64 overhead. Existing imported photos are unaffected. The existing multi-photo form still advertises its earlier 20 MB aggregate / 5 MB per-file limit; large new uploads require a separate direct or chunked upload implementation. Until then, keep each submitted form's photo total below 4 MB.
Reference: https://docs.netlify.com/build/functions/configuration/
