# AI contributions

OpenAI Codex assisted with the DynamoDB player-feature implementation on branch `feature/dynamodb-player-stats`.

AI-authored work includes Express GET/POST/PUT endpoints, AWS SDK v3 table/GSI initialization and conditional updates, React name lookup/profile creation and optimistic statistics, Docker Compose services, unit and integration tests, a browser demo, a Postman collection, and setup documentation. The original README also attributed the initial game scaffolding to ChatGPT.

Design choices included UUID primary keys, a normalized-name GSI (Query rather than Scan), explicit selection of same-name profiles, versioned updates, and blocking new games while saves are pending. Name-only login is a demo feature, not authentication.

Verification and remaining manual steps are recorded in `VALIDATION.md`. The student should review the implementation, run the documented commands, use the Postman desktop collection, complete the instructor-required screen share, and accurately describe their own work. AI assistance does not establish that the student performed those steps.
