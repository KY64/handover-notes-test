# Done

- Handover application task with feature
    - Simple Login/Signup before creating handover
    - Store handover task in the database
    - Sort handover task based on priority
    - Reconcile free-text to the structured handover note
    - Support threads on handover notes
    - Attach image on handover notes
    - Create/update a handover task

# Not Yet Done

- Support multiple images on reconcile text
- Support RBAC so manager can have full access (e.g. delete task), while staff can only add new threads and update status.
- AI to consider whether the reconcilliation has enough information or missing piece
- AI based suggestion on what is the risk and action to do
- Daily email notification for handover in case of buggy UI
- AI support to resolve task based on chat instead of going to web to click here and there
- Reconsider the UI workflow to be much simpler and filter based on priority or status.
- Find a good a format and template to add handover note. Template would help staff to write better.

# Reconcilliation

The reconcilliation is done by going to the site and copy paste the user text. Currently that is the simplest way.
The backend will call AI provider to process the text then consider to create handover task and add status which one resolve and unresolved.
The raw text is stored in DB for reference in case the AI omit the key information or not clear enough.
The reconcilliation will require inputting the shift date and time. It is simplified like `2022-02-02 night` instead of exact timestamp and
only focus on shift start time.

This approach may be lacking in this AI era. Ideally should be able to just integrate it in the chat platform used by the staff so they can just copy paste there
and interact with the AI to "convince" that they already provide enough information to handover. The AI will then create the handover note and store the raw response
in the DB in case needed for more context.

# Handling Contradictory Input

I'm currently lacking on this part. Ideally the input should be reviewed by shift manager, yet if shift manager is unavailable, we need a model to review each handover
task and alert if it is lacking convincing attachment (i.e. mismatch photo). This alert not necessarily reject handover note but label it if this is lacking and still
appear on handover task list.

The model would need tool to query log and db with read-only access. Let's say if the "threads" progress said certain guest already after staying overtime checkout but there is no log for checkout
or deposit is left without any status whether it is kept as penalty or returned to the guest. Then it will alert doubtful report to the manager.

# Where AI Helped The Most

- Planning to have better view of what will happen
- Building the apps of course
- Deploying

# Where AI Got In The Way

- Still require explicit requirements that the website is multi-page instead of all information crammed in one page. Yet with better prompt it fixed it.
- Somehow the test is not robust enough so I mostly do manual test. I believe this is because I didn't specify what to test and explain the user flow
clearly. I didn't spend time writing document too much in case suddenly it is not reading the docs and I need to prompt it again then waste my time.

# Next Steps

Just like what I have mentioned in "Not Yet Done", yet if I can redo this with enough time. I mostly write documents and specification.
So the structure would be like
- AGENTS.md = the agents guidance and entry to refer what documents to read in case it needs certain information
- BRIEF.md = dedicated to explain the problem and task
- ARCHITECTURE.md = how the architecture of the app will be including the stack and specifically mentioned the provider, service, specs.
- DESIGN.md = high level system design including the end-to-end workflow. Wonder if mermaid.js is better understood by the agents or plaintext.
- DEPLOYMENTS.md = how to deploy each service and what tools to use
- TESTING.md = Guidance how to test after building the apps.

This can be done by multiple agents.

# Surprised?

First time deploying infra with AI, hands off. Though problem that needs to be solved is deeper than just a simple handover task. Free-text is challenging here if the wording
is too short or cryptic. Multilanguage also not tested well, what if user write a typo like _"it was done since yesterday"_ but it suppose to be _"it was NOT done since yesterday"_?
Can AI notice it? Also handling contradict facts could be challenging. I'd need to spend more time to understand how to do that. Current system is just simply accept whatever handover note
is given. I was too focused on reconcilliation piece and feature to create notes and add threads. Yet not considering on handling the contradict facts.
