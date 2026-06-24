# URL Shortener

[![CI](https://github.com/Throughthenev3r/dropZero/actions/workflows/ci.yml/badge.svg)](https://github.com/Throughthenev3r/dropZero/actions/workflows/ci.yml)

Short links, redirects, and click stats. Runs on AWS (Lambda + API Gateway + DynamoDB) or locally with Express.

**Live:** https://ypqno7gs03.execute-api.us-east-1.amazonaws.com/health

## Stack

Node.js · Express · AWS Lambda · API Gateway · DynamoDB · Terraform · GitHub Actions · Playwright

## API

| Method | Path | Body / notes |
|--------|------|----------------|
| `GET` | `/health` | — |
| `POST` | `/api/shorten` | `{ "url": "https://..." }` |
| `GET` | `/{code}` | redirect |
| `GET` | `/api/stats/{code}` | clicks, uniques, by day |
| `DELETE` | `/api/links/{code}` | remove link + events |

Rows expire via DynamoDB TTL (`LINK_TTL_DAYS`, default 30).

## Local setup

Needs Node.js 22 and Docker.

```bash
cp .env.example .env
npm install
npm run db:up
npm run dev
```

http://localhost:3000

```bash
npm run lint
npm test
```

## Deploy

AWS account, Terraform, and an S3 bucket for remote state.

```bash
# .env — AWS keys, DYNAMODB_ENDPOINT commented out
cd infra
terraform init \
  -backend-config="bucket=YOUR_TF_STATE_BUCKET" \
  -backend-config="key=url-shortener/terraform.tfstate" \
  -backend-config="region=us-east-1"
terraform apply -var="aws_region=us-east-1"
```

### GitHub Actions secrets

| Secret | Value |
|--------|-------|
| `AWS_ACCESS_KEY_ID` | IAM key |
| `AWS_SECRET_ACCESS_KEY` | IAM secret |
| `TF_STATE_BUCKET` | state bucket name |

Push to `main` → tests, deploy, smoke against live API. PRs run tests only.

## Teardown

```bash
cd infra
terraform destroy -var="aws_region=us-east-1"
```

## License

MIT
