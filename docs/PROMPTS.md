# Custom Agents for Development Flow

I am creating Custom Agents for the development flow of this repo. The Custom Agents must be created according to this documentation: https://code.visualstudio.com/docs/copilot/customization/custom-agents #fetch 

Update the Agents files below according to requirements of each one. Each Agent hand off to the next Agent.

The flow of Agents is:
1) #file:ProductOwner.agent.md  : creates a feature request under the /docs/specs/{SEQ NUMBER 000}_{Max 15 chars short description of the feature}/REQUIREMENTS.md. Propose a pattern on the format of the specification, also containing the acceptance criteria.
2) #file:TechnicalSpecialist.agent.md : breaks down the feature into Tasks to implement it. Propose a pattern on the pattern of the tasks. They must be trackable (for ex.: check file TASKS.md) - and they must have the testing criteria, including egdge cases. Also, each task must have the UI testing using the Playwright.
3) #file:FrontendDeveloper.agent.md : Implements the Tasks of a Task file. Consider the best practices for implementing changes on the context of this repository. Use the #file:implement_frontend.prompt.md as base for this agent.
4) #file:FrontendTester.agent.md : Creates the Playwright E2E tests for this specific feature.
5) #file:TechnicalWriter.agent.md : Updates the documentation of the project that is impacted by the changes performed by this Tasks,

---

# Creation of the TASKS.md file

You are a Senior Technical Specialist, breakdown this specification into a new doc on MD format with a Task list to implement these functionallities. The requirements are on #file:SPECIFICATIONS.md  Create the tasks per priority. Tasks must be on a format that they can be tracked for implementation. Create a file named TASKS.md

Important:

- After implementation of each step, the UI changes must be validate using Playwright MCP server
- Focus on first creating the UI and the functionalities and later integrating with the backend API.
- Use Mock data, for that. Set this as a dropdown on the UI - so users can use either, the Mock Data or the API
- Use Alpha Vantage as the backend API - this is a change on requirement.


---

# Request features:

- [ProductOwner] Create the requirements for this feature: Currently the Aplha Vantage API key is hardcoded only - it must be possible to set it on the UI, and store it on localStorage. If no API key is set / loaded from environment variable, create a textbox on the UI to set it. User must also be able to change it later. User also must be able to test if the API key is valid or not (by testing a sample request to the API).

---

# Research New Feature Web Agent

/research_new_feature_web Currently the technical indicators don't have any parameters as input - for ex.: the SMA has a fixed range - other tools provide a range in days that the indicator is calculated - ex.: 10, 50 or 200 days.