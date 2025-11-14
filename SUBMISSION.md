# Submission checklist and email template

This file contains a recommended checklist and a copy-ready email template to reply-all when submitting the assignment.

## What to include in your submission

- A zip of the repository (exclude node_modules) OR a GitHub link + branch/tag.
- Short README with run steps and demo examples (included in `README.md`).
- Brief note about how you implemented LLM behavior and any limitations (included in `README.md`).
- If you integrated an LLM, confirm that keys are not committed.

## How to create a zip (PowerShell)

Run this from the project root to create a zip excluding `node_modules` and `.git`:

```powershell
$items = Get-ChildItem -Path . -Exclude node_modules,.git
Compress-Archive -LiteralPath $items -DestinationPath ..\journal-chat-app-submission.zip -Force
```

If `Compress-Archive` fails on very large projects, create a zip manually using your OS's file manager or use a specialized tool.

## Email template (copy & paste)

Subject: Submission — Thesys Software Dev Assignment — [Your Name]

Hi [Hiring Manager / Team],

Please find my completed assignment attached (or available at the GitHub link below):

Repository / ZIP:

- GitHub: https://github.com/your-username/journal-chat-app (branch: main)
- OR attached: journal-chat-app-submission.zip

Summary:

- Implemented a journaling chat UI with the ability to add entries and query the shopping list via natural language.
- The app includes a deterministic in-memory journaling service so it can run without an API key. The code also contains a sketch for using an LLM (Gemini) and I can wire the Vercel Generative UI SDK / OpenAI integration behind a server endpoint if you prefer (I will need an API key).
- Build & run:
  - npm install
  - npm run dev
  - Open http://localhost:3000/

Notes:

- Known limitations are documented in the project's README.
- If you want a live demo or a screen recording, I can provide one on request.

Thanks for the opportunity — happy to clarify or extend further.

Best,

[Your Name]
[Email] | [Phone] | [GitHub]
