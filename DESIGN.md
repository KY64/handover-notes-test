The design of the system prioritise functional over Enterprise SLA guarantee.

# Tech Stack

## Backend

- Language: Typescript
- API Framework: HonoJS
- Hosting: render.com
- Database: Render Postgres
- Cache: Render Redis

## Frontend

- Framework: SvelteKit Static Site
- Hosting: Render Static Site

# Architecture

## Web

The web application is used to view handover notes and add handover notes and update the task. The user will use this during handover.

## Backend API

The backend API runs in render and served the API to return list of handover notes, update the task, and add handover notes

## Database

Database is used to store all the handover notes which needs a persistent storage

## Cache

The Redis Cache is used to store rate-limit request to prevent abuse of the API since this service is a POC and billed with
real money.

## OpenRouter Provider

The OpenRouter here is needed to interact with AI models that helps summarise free-text notes and convert it into structured data like in the event logs.
It is also used to translate non-english language to english text.
