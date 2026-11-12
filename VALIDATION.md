# Validation record

Automated checks performed in the managed Linux environment:

- `npm test`: 12 passing tests (7 React UI, 5 API).
- `npm run build`: production Vite bundle generated successfully.
- `npm run test:integration`: real DynamoDB Local verified 404, UUID creation, duplicate-name lookup, win/loss persistence, stale updates, and invalid transition rejection.
- `tests/browser-demo.js`: Chromium completed player creation, a win, a loss, reload, and returning-player lookup; confirmed one win, one loss, and 50.0%. Screenshot and WebM recording generated under ignored `artifacts/`.
- Postman collection executed through Newman: all 6 requests and 6 response-status assertions passed. This is automated collection execution, separate from using the desktop app.
- Final rebuilt Docker Compose stack passed the real-database integration checks and full Chromium demo again.
- Docker Compose built Node images and ran DynamoDB, Express, and Vite; API health check passed. The managed proxy required a temporary build-secret override for its CA certificate; standard local Docker does not need that environment-specific override.

The Postman desktop app was downloaded from its official distribution and launch was attempted. It could not access the shared desktop X display; the computer-use tool independently returned `Browser runtime unavailable`. No successful API execution in the Postman desktop app or live screen share is claimed. Import the included collection and complete those instructor-required steps manually. The automated browser video is supplementary evidence.

Temporary build artifacts exhausted the environment's disk during a repeat Docker build. Only task-created app containers/images, build cache, and downloaded temporary files were removed before retrying; the DynamoDB volume was preserved.
