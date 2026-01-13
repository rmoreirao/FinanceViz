---
agent: agent
tools: ['vscode', 'execute', 'read', 'edit', 'search', 'web', 'gitkraken/*', 'playwright-mcp/*', 'agent', 'todo']
---
1) Implement the selected Tasks on the tasks file.
2) After implementing each individual task, perform a build on the frontend app: cd src/frontend && npm run build
3) Check for any errors during the build process and fix them if necessary.
4) If the build is successful, and the changes are impacting the UI, run the app locally: cd src/frontend && npm run dev
4.1) Verify that the UI changes are functioning as expected using the #playwright-mcp tools. Don't take screenshots.
5) Update the document marking the task as completed
6) Generate a concise summary of the changes made and commit them to the repository with a meaningful commit message.