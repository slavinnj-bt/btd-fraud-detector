# Quick Start Guide

Get the BTD Fraud Detector up and running in less than 5 minutes!

## Prerequisites

- Node.js v22 or later
- An Anthropic API key (get one at https://console.anthropic.com/)

## Setup Steps

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Create a `.env` file:

```bash
cp .env.example .env
```

Edit `.env` and add your API key:

```env
ANTHROPIC_API_KEY=your_key_here
```

### 3. Start the Development Server

```bash
npm run dev
```

### 4. Open the Application

Navigate to http://localhost:5173

## Testing the Agent

### Option 1: Use the Web UI

1. Click one of the sample buttons:
   - **Load Legitimate** - See how the agent handles low-risk transactions
   - **Load Borderline** - See escalation in action
   - **Load Fraud** - See how high-risk transactions are blocked

2. Click "Analyze Transaction"

3. Review the decision, confidence score, and reasoning

### Option 2: Test with the CLI

Start the dev server in one terminal:
```bash
npm run dev
```

In another terminal, run the test suite:
```bash
npm run test:agent
```

This will test all 8 sample transactions and show pass/fail results.

### Option 3: Test with cURL

```bash
curl -X POST http://localhost:5173/api/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "alert_id": "test-001",
    "ingest_ts": "2026-02-10T14:12:05Z",
    "transaction": {
      "tx_id": "tx-test",
      "amount": 49.99,
      "currency": "USD",
      "timestamp": "2026-02-10T14:10:30Z",
      "payment_method": "card",
      "card_last4": "1234"
    },
    "merchant": {
      "merchant_id": "m-100",
      "name": "Amazon.com",
      "merchant_risk": "low",
      "country": "US"
    },
    "customer": {
      "customer_id": "c-500",
      "account_age_days": 365,
      "kyc_status": "verified",
      "chargeback_rate": 0.00
    },
    "signals": {
      "ip_country": "US",
      "device_fingerprint": "dev-known",
      "velocity": {
        "tx_last_1h": 1,
        "tx_last_24h": 2,
        "amount_last_24h": 89.98
      },
      "fraud_score_third_party": 0.12
    },
    "rule_engine_flags": [],
    "supporting_context": {
      "recent_events": [],
      "prior_disputes": 0,
      "notes": "Regular customer"
    }
  }'
```

## Understanding the Results

### Decision Types

- **ALLOW** ✓ - Transaction approved for processing
- **BLOCK** ✗ - Transaction rejected as fraudulent
- **ESCALATE** ⚠ - Requires human review

### Key Metrics

- **Risk Score**: 0.0 (safe) to 1.0 (high risk)
- **Confidence**: How certain the agent is about the decision
- **Processing Time**: How long the analysis took

### Risk Factors

The agent analyzes multiple signals:
- Customer KYC status and account age
- Transaction amount and velocity
- IP country vs customer location
- Merchant risk level
- Third-party fraud scores
- Recent suspicious events

## Next Steps

### Add Braintrust Tracing

1. Get a Braintrust API key from https://www.braintrust.dev/
2. Add to your `.env`:
   ```env
   BRAINTRUST_API_KEY=your_braintrust_key
   ```
3. View traces at https://www.braintrust.dev/

### Customize the Agent

Edit [`src/mastra/agents/fraud-agent.ts`](src/mastra/agents/fraud-agent.ts) to:
- Adjust risk thresholds
- Add new risk factors
- Change decision criteria
- Modify the system prompt

### Deploy to Production

See the [README](README.md#-deployment) for deployment options:
- AWS Lambda
- Docker
- Vercel
- Any Node.js host

## Troubleshooting

### "Module not found" errors

Run `npm install` to ensure all dependencies are installed.

### API key errors

Make sure your `.env` file has a valid `ANTHROPIC_API_KEY`.

### Port 5173 already in use

Change the port in `vite.config.ts` or stop the conflicting process.

### Agent not responding

Check that:
1. The dev server is running
2. Your API key is valid and has credits
3. You have internet connectivity

## Support

- Check the [README](README.md) for detailed documentation
- Review [test-data/transactions.json](test-data/transactions.json) for examples
- Open an issue on GitHub for bugs or questions

---

**Happy fraud detecting! 🛡️**
