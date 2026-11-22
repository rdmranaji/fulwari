# Fulwari: website and online shop

Next.js 15 (App Router, React 19) · TypeScript · React Three Fiber · Framer Motion · PostgreSQL with Drizzle ORM · Razorpay-ready

Built by Global Web Guru for Fulwari, plant growers in Anand, Gujarat.

**Live preview:** https://rdmranaji.github.io/fulwari/ (static version, published from `main` by GitHub Actions)

## What makes it different

- **Procedural 3D plants that grow.** Every plant is generated in the browser from botanical growth rules (`components/three/plantGen.ts`). Twelve species branch, leaf out, flower and fruit by season, starting from a 1 July (monsoon) sowing.
- **Seasons are modelled.**
  - Gulmohar drops its leaves in late winter and flowers scarlet from April to June.
  - Kesar mango flowers in January and fruits from April to June.
  - Rain falls in the monsoon months, and the ground colour tracks the season.
- **Home page story.** Scrolling grows a gulmohar from seed, in its nursery bag, to a flowering four-year tree.
- **Grow Lab (`/grow-lab`).** Pick any species and fast-forward from 1 day/s to 1 season/s. Scrub the timeline, orbit the plant, and see day and night at 1 day/s.
- **Shop cards are live 3D.** A single WebGL canvas drives every product card through drei `<View>`. Hovering a card replays that plant's growth.
- **Product viewer projects growth.** Shows how big the plant will be 1, 3 and 5 years after delivery.
- **Two buying paths.**
  - Gujarat retail: cart, checkout, delivery and optional planting, pay on delivery or online.
  - B2B: bulk quote and dealer enquiries, from ₹1 lakh.
- **English and Hindi switch.** Remembered per visitor.
- **WhatsApp everywhere.** Every order and enquiry also produces a ready WhatsApp message to Fulwari.

## Stack and structure

```
app/                     routes: /, /shop, /shop/[slug], /grow-lab, /bulk, /about, /contact, /checkout, /admin
app/api/orders           POST: validates, prices from the database (never from the browser), stores order + items
app/api/enquiries        POST: bulk / visit / dealer enquiries
app/api/payments/verify  POST: Razorpay signature check, marks order PAID
app/api/admin            GET: orders + enquiries (Bearer ADMIN_TOKEN)
components/three/        species.ts (growth parameters), plantGen.ts (generator), PlantMesh.tsx (instanced renderer),
                         GrowScene.tsx (sky, seasons, rain, camera), CardViews.tsx (one canvas, many cards)
db/                      Drizzle schema, client, seed, SQL migrations
lib/                     catalogue, pricing rules, validation (zod), i18n, cart store (zustand), WhatsApp messages
```

## Photos

The site uses freely licensed photographs from Wikimedia Commons until Fulwari's own shoot. `npm run photos` (also run by the GitHub Pages build) picks photos for each slot in `lib/photos.ts`, keeps only CC BY / BY-SA / CC0 / public-domain files, saves them to `public/photos/` and writes the credits to `lib/photos.generated.json`, which feeds the `/credits` page. To use Fulwari's own photos, drop them into `public/photos/` and point the slot entries in `lib/photos.generated.json` at them.

## Run locally

```bash
cp .env.example .env            # set DATABASE_URL and ADMIN_TOKEN
npm install
npm run db:migrate              # applies db/migrations to PostgreSQL
npm run db:seed                 # loads the 12-product sample catalogue
npm run photos                  # downloads the photos (needs internet)
npm run dev                     # http://localhost:3000
```

The orders dashboard is at `/admin`; sign in with `ADMIN_TOKEN`.

## Deploy

- **Vercel or any Node host:** set `DATABASE_URL` (Neon, Supabase, RDS or self-hosted Postgres 14+), `ADMIN_TOKEN`, and optionally `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET`. Then run `npm run build && npm start`.
- **Prices:** catalogue pages revalidate from the database every 5 minutes. Checkout always charges current database prices.
- **Online payments:** leave the Razorpay keys empty to run pay-on-delivery / UPI-on-confirmation only. With keys set, "Pay online" opens Razorpay Checkout, and `/api/payments/verify` confirms the signature.

## Static preview

```bash
npm run export     # writes ./out; API routes are set aside, orders become WhatsApp messages
```

## Before launch: confirm with Fulwari

- **Catalogue (`lib/catalog.ts`):** retail prices, sizes, stock and the variety list are samples.
- **Delivery and planting:** the delivery fee (₹299, free over ₹5,000) and planting fee (₹40 per plant) in `lib/pricing.ts` are samples.
- **Policies:** whether they deliver and plant across Gujarat, and accept online payment.
- **Photos:** real photos from the shoot for the About and Bulk pages; the 3D plants cover the shop.
- **Domain:** the domain in `lib/site.ts` (`SITE.url`) is a placeholder for sitemap and SEO.
