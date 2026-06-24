# URL Shortener

Pet project I built to practice cloud and backend basics. It shortens links, redirects users, and tracks click stats.

Deployed on AWS as a serverless app (Lambda + API Gateway + DynamoDB). You can also run it locally with Express and DynamoDB Local.

**Live API:** `https://ypqno7gs03.execute-api.us-east-1.amazonaws.com`

## What it does

- create a short link from a long URL
- redirect `GET /{code}` to the original URL
- show stats (clicks, unique visitors, clicks by day)
- delete a link manually
- old data expires on its own via DynamoDB TTL (no cron job)

## Stack

- **Runtime:** Node.js 22, ES modules
- **Local API:** Express 5
- **Cloud:** AWS Lambda, API Gateway (HTTP API), DynamoDB
- **IaC:** Terraform (S3 remote state)
- **Tests:** Node test runner (unit), Playwright (E2E + smoke)
- **CI/CD:** GitHub Actions — lint, tests, deploy, smoke tests
- **Local DB:** DynamoDB Local in Docker

## Project layout

```
src/
  handlers/     # Lambda entry points (one per route)
  controllers/  # Express handlers (local dev)
  services/     # business logic
  db/           # DynamoDB client
infra/          # Terraform for AWS
tests/          # unit tests
e2e/            # Playwright tests
```

Handlers and controllers both call the same `services` — only the HTTP wrapper changes.

## API

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | health check |
| POST | `/api/shorten` | body: `{ "url": "https://..." }` |
| GET | `/{code}` | redirect |
| GET | `/api/stats/{code}` | click statistics |
| DELETE | `/api/links/{code}` | delete link + its events |

## Auto cleanup (TTL)

I didn't want orphaned rows sitting in DynamoDB forever.

When a link is saved, it gets an `expires_at` timestamp (Unix seconds). DynamoDB TTL deletes the row automatically after that time. Click events get their own `expires_at` too (a bit longer than the link TTL by default).

Env vars:

- `LINK_TTL_DAYS` — link lifetime (default: 30)
- `CLICK_EVENT_TTL_DAYS` — event lifetime (default: link TTL + 7 days)

Locally (DynamoDB Local) TTL does not actually delete items — that only happens in real AWS.

## Local development

**Requirements:** Node.js 22, Docker (for DynamoDB Local)

```bash
cp .env.example .env
npm install
npm run db:up
npm run dev
```

Server: `http://localhost:3000`

**Tests:**

```bash
npm run db:up
npm run lint
npm test
```

**Smoke tests against deployed API:**

```bash
BASE_URL=https://your-api.execute-api.us-east-1.amazonaws.com npm run test:smoke
```

## Deploy to AWS

**Requirements:** AWS account, IAM user with enough permissions, Terraform

1. Put AWS keys in `.env` (never commit this file)
2. Comment out `DYNAMODB_ENDPOINT` in `.env` for deploy
3. One-time: create S3 bucket for Terraform state (replace account id):

```bash
aws s3 mb s3://url-shortener-tfstate-YOUR_ACCOUNT_ID --region us-east-1
```

4. Migrate local state to S3 (only once, if you already deployed locally):

```bash
cd infra
terraform init \
  -backend-config="bucket=url-shortener-tfstate-YOUR_ACCOUNT_ID" \
  -backend-config="key=url-shortener/terraform.tfstate" \
  -backend-config="region=us-east-1"
# type yes when asked to migrate existing state
```

5. Apply:

```bash
terraform apply -var="aws_region=us-east-1"
```

Copy `api_url` from the output and test:

```bash
curl https://YOUR_API_URL/health
```

## Keep it running for resume / portfolio

If the project is on your resume, **leave it deployed**. On free tier the cost is usually very low (often close to $0 for light traffic).

What helps:

- live URL in README (recruiters can click `/health`)
- GitHub Actions green checkmarks
- don't run `terraform destroy` unless you really want to shut it down

## GitHub Actions secrets (for CI/CD deploy)

Repo → **Settings** → **Secrets and variables** → **Actions** → add:

| Secret | Value |
|--------|-------|
| `AWS_ACCESS_KEY_ID` | IAM access key |
| `AWS_SECRET_ACCESS_KEY` | IAM secret key |
| `TF_STATE_BUCKET` | S3 bucket name for terraform state |

On every push to `main`:

1. lint + unit tests + local E2E
2. `terraform apply` to AWS
3. smoke E2E against the live API URL

PRs only run tests (no deploy).

## Turn it off when you are done

When you no longer need the live API (not needed while it's on your resume):

```bash
cd infra
terraform destroy -var="aws_region=us-east-1"
```

Type `yes` when asked. That deletes Lambda, API Gateway, DynamoDB tables, etc.

## Notes

- `.env` is gitignored — use `.env.example` as a template
- `infra/*.tfstate` stays local until you migrate to S3 — do not commit state files
- commit `infra/.terraform.lock.hcl` so CI uses the same provider versions
- if `terraform init` fails to download providers, retry or use VPN (network/CDN issue)
