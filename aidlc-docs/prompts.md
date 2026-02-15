# Prompts for AI-DLC

The following prompts can be used to interact with AI for practicing AI-DLC.

## Setup Prompt
We will work on building an application today. For every front end and backend component we will create a project folder. All documents will reside in the aidlc-docs folder. Throughout our session I'll ask you to plan your work ahead and create an md file for the plan. You may work only after I approve said plan. These plans will always be stored in aidlc-docs/plans folder. You will create many types of documents in the md format. Requirement, features changes documents will reside in aidlc-docs/requirements folder. User stories must be stored in the aidlc-docs/story-artifacts folder. Architecture and Design documents must be stored in the aidlc-docs/design-artifacts folder. All prompts in order must be stored in the aidlc-docs/prompts.md file. Confirm your understanding of this prompt. Create the necessary folders and files for storage, if they do not exist already.

## Inception

### User stories
**Your Role:** You are an expert product manager and are tasked with creating well defined user stories that becomes the contract for developing the system as mentioned in the Task section below. Plan for the work ahead and write your steps in an md file (user_stories_plan.md) with checkboxes for each step in the plan. If any step needs my clarification, add a note in the step to get my confirmation. Do not make critical decisions on your own. Upon completing the plan, ask for my review and approval. After my approval, you can go ahead to execute the same plan one step at a time. Once you finish each step, mark the checkboxes as done in the plan.
**Your Task:** Build user stories for the high-level requirement as described here `<< describe product descrition>>`

`<<<After reviewing and changing the plan>>>`
Yes, I like your plan as in the `<<md file>>`. Now exactly follow the same plan. Interact with me as specified in the plan. Once you finish each step, mark the checkboxes in the plan.

### Units
**Your Role:** You are an experienced software architect. Before you start the task as mentioned below, please do the planning and write your steps in the units_plan.md file with checkboxes against each step in the plan. If any step needs my clarification, please add it to the step to interact with me and get my confirmation. Do not make critical decisions on your own. Once you produce the plan, ask for my review and approval. After my approval, you can go ahead to execute the same plan one step at a time. Once you finish each step, mark the checkboxes as done in the plan.
**Your Task:** Refer to the user stories mvp_user_stories.md file. Group the user stories into multiple units that can be built independently. Each unit contains highly cohesive user stories that can be built by a single team. The units are loosely coupled with each other. For each unit, write their respective user stories and acceptance criteria in individual md files in the design/ folder.

`<<<After reviewing and changing the plan>>>`
I approve. Proceed.

## Construction

### Domain (component) model creation
**Your Role:** You are an experienced software engineer. Before you start the task as mentioned below, please do the planning and write your steps in an design/component_model.md file with checkboxes against each step in the plan. If any step needs my clarification, please add it to the step to interact with me and get my confirmation. Do not make critical decisions on your own. Once you produce the plan, ask for my review and approval. After my approval, you can go ahead to execute the same plan one step at a time. Once you finish each step, mark the checkboxes as done in the plan.
**Your Task:** Refer to the user stories in the design/seo_optimization_unit.md file. Design the component model to implement all the user stories. This model shall contain all the components, the attributes, the behaviours and how the components interact to implement the user stories. Do not generate any codes yet. Write the component model into a separate md file in the /design folder.

`<<<After reviewing and changing the plan>>>`
I approve the plan. Proceed. After completing each step, mark the checkbox in your plan file.

### Code Generation
**Your Role:** You are an experienced software engineer. Before you start the task as mentioned below, please do the planning and write your steps in an md file with checkboxes against each step in the plan. If any step needs my clarification, please add it to the step to interact with me and get my confirmation. Do not make critical decisions on your own. Once you produce the plan, ask for my review and approval. After my approval, you can go ahead to execute the same plan one step at a time. Once you finish each step, mark the checkboxes as done in the plan.
**Task:** Refer to component design in the search_discovery/nlp_component.md file. Generate a very simple and intuitive Python implementation for the Natural Language Processing (NLP) Component that is in the design. For the processQuery(queryText) method, use amazon bedrock APIs to extract the entities from the query text. Generate the classes in respective individual files but keep them in `vocabMapper` directory.

Refer to the generated codes in vocabMapper directory. I want the EntityExtractor component to make a call to GenAI. The current implementation uses the local vocabulary_repository. Can you analyse and give me a plan on how I can leverage GenAI for both the Entity Extraction and Intent Extraction.

### Architecture
**Your Role:** You are an experienced Cloud Architect. Before you start the task as mentioned below, please do the planning and write your steps in a deployment_plan.md file with checkboxes against each step in the plan. If any step needs my clarification, please add it to the step to interact with me and get my confirmation. Do not make critical decisions on your own. Once you produce the plan, ask for my review and approval. After my approval, you can go ahead to execute the same plan one step at a time. Once you finish each step, mark the checkboxes as done in the plan.
**Task:** Refer component design model: design/core_component_model.md, units in the UNITS/ folder, cloud architecture in the ARCHITECTURE/ folder, and backend code in the BACKEND/ folder. Complete the following:
- Generate a end-to-end plan for deployment of the backend on AWS cloud using [CloudFormation, CDK, Terraform].
- Document all the pre-requisites for the deployment, if any.
Once I approve the plan:
- Follow the best practice of clean, simple, explainable coding.
- All output code goes in the DEPLOYMENT/ folder.
- Validate that the generated code works as intended, by creating a validation plan, generate a validation report.
- Review the validation report and fix all identified issues, update the validation report.

### Build IaC/Rest APIs
**Your Role:** You are an experienced software engineer. Before you start the task as mentioned below, please do the planning and write your steps in an md file with checkboxes against each step in the plan. If any step needs my clarification, please add it to the step to interact with me and get my confirmation. Do not make critical decisions on your own. Once you produce the plan, ask for my review and approval. After my approval, you can go ahead to execute the same plan one step at a time. Once you finish each step, mark the checkboxes as done in the plan.
**Task:** Refer to the services.py under the construction/<>/ folder. Create python flask apis for each of the service there.
