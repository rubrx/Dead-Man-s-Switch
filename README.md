# Dead Man's Switch

> If you go quiet, it sends.

A small, careful place to write a message that only gets delivered if you stop
checking in. A letter to future-you. The server password your team will need if
you ever disappear. The goodbye you'd never write.

You set a recipient, write the message, pick an interval. We hold the message
encrypted, remind you 7 days and 1 day before the deadline, and only deliver if
you never check in.

## Stack

- **Next.js 16** (App Router) + React 19
- **Neon Postgres** via Drizzle ORM
- **Nodemailer + Gmail SMTP** for transactional email
- **jose** for signed session cookies
- **AES-256-GCM** for message encryption at rest
- **Vercel Cron** for the dispatcher
- **Tailwind v4** + Instrument Serif / Geist for the editorial look

## Routes

```
/                          → landing
/sign-in                   → magic-link email
/dashboard                 → list of armed + archived switches
/dashboard/new             → create a switch
/checked-in                → confirmation after clicking a reminder link

/api/auth/request          → POST email → magic link
/api/auth/verify           → GET token → set session
/api/auth/signout          → POST destroy session
/api/switches              → POST create
/api/switches/[id]         → DELETE (cancel)
/api/switches/[id]/checkin → POST (dashboard check-in)
/api/checkin/[token]       → GET (one-click from reminder emails)
/api/cron/dispatch         → GET (Vercel Cron) — sends reminders + deliveries
```

## Local setup

```bash
pnpm install
cp .env.example .env.local
# fill in DATABASE_URL, SESSION_SECRET, ENCRYPTION_KEY,
# GMAIL_USER, GMAIL_APP_PASSWORD, CRON_SECRET, NEXT_PUBLIC_APP_URL
pnpm db:push
pnpm dev
```

Generate secrets:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Deploying to Vercel

1. Push the repo to GitHub, import into Vercel.
2. Add every var from `.env.example` to the Vercel project's environment.
3. Set `NEXT_PUBLIC_APP_URL` to the production URL.
4. The cron is configured in `vercel.json` to fire hourly. Vercel Hobby plan
   only allows daily; if you're on Hobby, change the schedule to
   `0 9 * * *` (daily at 9am UTC) or upgrade to Pro for hourly.
5. Email is sent via Gmail SMTP using `GMAIL_USER` + `GMAIL_APP_PASSWORD`.
   Generate the app password at https://myaccount.google.com/apppasswords
   (requires 2-Step Verification on the Google account). Free Gmail caps
   outbound at ~500 emails/day, which is plenty for this app.

## How the dispatcher decides

Every cron tick:

- For every `active` switch with `deadline <= now` → decrypt, send delivery to
  recipient, mark `sent`, clear the encrypted body.
- For every `active` switch with `deadline - now <= 1 day` and no `1_day`
  reminder logged → send the 1-day warning to the owner.
- For every `active` switch with `deadline - now <= 7 days` and no `7_day`
  reminder logged → send the 7-day warning.

Checking in resets the deadline and clears the reminder log for that switch.

## Security notes

- Message bodies are AES-256-GCM encrypted before insert; decrypted exactly
  once at delivery time and the row's ciphertext is wiped after send.
- Sessions are signed JWTs in HttpOnly, SameSite=Lax cookies.
- Cron route requires `Authorization: Bearer ${CRON_SECRET}`.
- Check-in tokens in email links are 32 random bytes, hex-encoded — guess-proof.

## License

MIT.
