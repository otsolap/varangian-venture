# Varangian Venture

Personal portfolio of [Otso Lappalainen](https://varangianventure.com).

The public site is [varangianventure.com](https://varangianventure.com). It presents Otso and the work he offers: design, websites, training, and hosting.

Page copy, navigation, and SEO text live in `src/data`. Layout and blocks come from the [`varangian-theme`](https://github.com/otsolap/varangian-theme) package. Do not copy theme files into this repo. Do not edit files under `node_modules/varangian-theme`.

## Stack

- [Astro](https://astro.build) 7
- Cloudflare Workers through `@astrojs/cloudflare`
- `varangian-theme` (private git dependency)
- Node.js 22.12.0 or newer

## Pages

| Route | Page |
| :---- | :--- |
| `/` | Home |
| `/about` | About |
| `/services` | Services |
| `/contact` | Contact. This page renders on each request. |
| `/legal` | Privacy policy |

The contact form posts to `/api/contact`. The newsletter form posts to `/api/subscribe`.

## Project structure

```text
/
├── public/
├── src/
│   ├── assets/images/   # site images
│   ├── data/            # page copy, navigation, and SEO text
│   ├── layouts/         # site layout (wraps the theme layout)
│   ├── lib/             # SEO helpers
│   └── pages/           # routes and API endpoints
├── astro.config.mjs
├── package.json
└── wrangler.jsonc
```

## Commands

Run these from the project root.

| Command | Action |
| :---------------- | :--------------------------------------------- |
| `npm install` | Install dependencies. GitHub SSH access is required for the theme. |
| `npm run dev` | Start the local server at `http://localhost:4321` |
| `npm run build` | Build the production site into `./dist/` |
| `npm run preview` | Preview the production build locally |
| `npx wrangler deploy` | Deploy the Worker after a build |

## Forms

Contact and subscribe need Worker secrets in Cloudflare. They are not stored in this repo.

Required: `CONVERTKIT_API_KEY`, `CONVERTKIT_FORM_ID`, and `CONTACT_TO`.

Optional: `CONVERTKIT_SECRET_KEY` and `CONTACT_FROM`.
