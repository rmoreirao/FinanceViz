---
agent: agent
tools: ['playwright-mcp/*']
---
1) Implement the selected Tasks on the tasks file.
2) After implementing each individual task, perform a build on the frontend app: cd src/frontend && npm run build
3) Check for any errors during the build process and fix them if necessary.
4) If the build is successful, and the changes are impacting the UI, run the app locally: cd src/frontend && npm run dev
4.1) Verify that the UI changes are functioning as expected using the #playwright-mcp tools.
5) Update the document marking the task as completed