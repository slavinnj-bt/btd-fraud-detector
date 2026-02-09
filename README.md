# 🛡️ BTD Fraud Detector

A production-ready AI-powered fraud detection system built with **Mastra**, **Claude**, and **Braintrust**. This demo application showcases how to build, evaluate, and deploy an intelligent agent for detecting fraudulent payment transactions.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D22.0.0-brightgreen.svg)
![Mastra](https://img.shields.io/badge/mastra-v1.2-purple.svg)

## 🌟 Features

- **AI-Powered Fraud Detection**: Leverages Claude 3.5 Sonnet for intelligent transaction analysis
- **Three-Tier Decision System**: ALLOW, BLOCK, or ESCALATE decisions with confidence scores
- **Human-in-the-Loop**: Automated escalation with email notifications for uncertain cases
- **Real-Time Analysis**: Fast transaction processing with detailed risk assessment
- **Modern UI**: Sleek SvelteKit interface for testing and visualization
- **Production-Ready**: AWS Lambda deployment with Docker containerization
- **Observability**: Full tracing and evaluation with Braintrust integration
- **Comprehensive Testing**: Includes test dataset and automated evaluation suite

## 🏗️ Architecture

```
┌─────────────────┐
│   SvelteKit UI  │
│   (Frontend)    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  API Routes     │
│  (/api/analyze) │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────────┐
│      Mastra Agent Framework         │
│  ┌──────────────────────────────┐  │
│  │   Fraud Detection Agent      │  │
│  │   (Claude 3.5 Sonnet)        │  │
│  └──────────┬───────────────────┘  │
│             │                       │
│             ▼                       │
│  ┌──────────────────────────────┐  │
│  │  Escalation Tool             │  │
│  │  (Email Notifications)       │  │
│  └──────────────────────────────┘  │
└─────────────────────────────────────┘
         │
         ▼
┌─────────────────┐
│   Braintrust    │
│  (Observability)│
└─────────────────┘
```

## 🚀 Quick Start

### Prerequisites

- Node.js v22.13.0 or later
- npm, pnpm, or yarn
- API key from Anthropic (Claude) or OpenAI
- (Optional) Braintrust API key for observability
- (Optional) AWS account for Lambda deployment

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/slavinnj-bt/btd-fraud-detector.git
   cd btd-fraud-detector
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```

   Edit `.env` and add your API keys:
   ```env
   ANTHROPIC_API_KEY=your_anthropic_api_key_here
   BRAINTRUST_API_KEY=your_braintrust_api_key_here
   ESCALATION_EMAIL=fraud-team@example.com
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:5173`

## 📊 Usage

### Web Interface

The web interface provides an interactive way to test fraud detection:

1. **Load Sample Transactions**: Use the quick-load buttons to populate the input with pre-configured scenarios:
   - **Legitimate**: Low-risk, verified customer transactions
   - **Borderline**: Mixed signals requiring escalation
   - **Fraud**: High-risk transactions with multiple red flags

2. **Analyze Transactions**: Click "Analyze Transaction" to process the data through the fraud detection agent

3. **Review Results**: View the decision (ALLOW/BLOCK/ESCALATE), confidence score, risk factors, and detailed reasoning

### Transaction Structure

Submit transaction data in the following JSON format:

```json
{
  "alert_id": "a-2026-0001",
  "ingest_ts": "2026-02-10T14:12:05Z",
  "transaction": {
    "tx_id": "tx-9001",
    "amount": 1299.95,
    "currency": "USD",
    "timestamp": "2026-02-10T14:10:30Z",
    "payment_method": "card",
    "card_last4": "4242"
  },
  "merchant": {
    "merchant_id": "m-550",
    "name": "QuickGadgets Inc",
    "merchant_risk": "high",
    "country": "US"
  },
  "customer": {
    "customer_id": "c-77",
    "account_age_days": 12,
    "kyc_status": "unverified",
    "chargeback_rate": 0.00
  },
  "signals": {
    "ip_country": "NG",
    "device_fingerprint": "dev-3f2b",
    "velocity": {
      "tx_last_1h": 4,
      "tx_last_24h": 7,
      "amount_last_24h": 2400.50
    },
    "fraud_score_third_party": 0.78
  },
  "rule_engine_flags": ["velocity_rule", "high_amount_threshold"],
  "supporting_context": {
    "recent_events": ["new_card_added","login_from_new_country"],
    "prior_disputes": 0,
    "notes": "Customer profile shows recent email change 2 days ago."
  }
}
```

### API Integration

You can integrate the fraud detection API into your own applications:

```bash
curl -X POST http://localhost:5173/api/analyze \
  -H "Content-Type: application/json" \
  -d @test-data/transactions.json
```

Response:
```json
{
  "alert_id": "a-2026-0001",
  "decision": {
    "decision": "BLOCK",
    "confidence": 0.9,
    "reasoning": "Multiple high-risk indicators present...",
    "risk_score": 0.85,
    "key_factors": [
      "Unverified KYC status",
      "High fraud score (0.78)",
      "IP country mismatch (NG vs US)"
    ],
    "recommendation": "Block this transaction"
  },
  "processing_time_ms": 1250,
  "timestamp": "2026-02-10T14:12:06Z"
}
```

## 🧪 Testing

### Automated Testing

Run the test suite against all sample transactions:

```bash
# Start the dev server first
npm run dev

# In another terminal, run tests
npm run test:agent
```

The test suite will:
- Load all transactions from `test-data/transactions.json`
- Send each to the fraud detection agent
- Compare actual decisions against expected decisions
- Display a summary report with pass/fail rates

### Test Dataset

The repository includes 8 diverse test cases covering:
- Clear fraud cases (multiple red flags)
- Legitimate transactions (verified customers)
- Borderline cases (mixed signals)
- Card testing patterns
- First-time high-value purchases
- Regular business transactions

See [`test-data/transactions.json`](test-data/transactions.json) for the complete dataset.

## 🧠 Agent Logic

The fraud detection agent analyzes transactions using a sophisticated risk assessment framework:

### Decision Criteria

**ALLOW** - Process the transaction
- No high-risk indicators
- Maximum 1-2 medium-risk indicators
- Strong low-risk signals (verified KYC, established account)
- Consistent with customer history

**BLOCK** - Reject the transaction
- 3+ high-risk indicators
- Unverified KYC + high amount (>$1000)
- Fraud score > 0.85
- Obvious fraud patterns

**ESCALATE** - Human review required
- Mixed signals (high-risk + low-risk factors)
- Borderline fraud score (0.65-0.80)
- High-value with moderate risk (>$2000)
- Uncertainty about decision

### Risk Indicators

**High-Risk**:
- Unverified/rejected KYC
- New account (<7 days) + high value
- IP country mismatch with high-risk country
- High merchant risk
- Fraud score > 0.75
- High transaction velocity

**Medium-Risk**:
- Account age 7-30 days
- Fraud score 0.50-0.75
- Moderate velocity
- Medium merchant risk

**Low-Risk**:
- Verified KYC
- Established account (>90 days)
- Low chargeback rate
- Matching IP country
- Low fraud score (<0.30)

## 🔧 Development

### Project Structure

```
btd-fraud-detector/
├── src/
│   ├── mastra/
│   │   ├── index.ts              # Mastra configuration
│   │   ├── agents/
│   │   │   └── fraud-agent.ts    # Fraud detection agent
│   │   └── tools/
│   │       └── escalation-tool.ts # Email escalation tool
│   ├── routes/
│   │   ├── +page.svelte          # Main UI
│   │   └── api/
│   │       └── analyze/
│   │           └── +server.ts    # Analysis API endpoint
│   ├── lib/
│   │   └── types.ts              # TypeScript types
│   ├── app.html                  # HTML template
│   └── app.css                   # Global styles
├── test-data/
│   └── transactions.json         # Test dataset
├── scripts/
│   ├── test-agent.js             # Test runner
│   └── deploy-lambda.sh          # Lambda deployment script
├── Dockerfile                    # Lambda container config
└── package.json                  # Dependencies
```

### Adding New Risk Factors

To add new fraud detection rules:

1. Update the agent instructions in [`src/mastra/agents/fraud-agent.ts`](src/mastra/agents/fraud-agent.ts)
2. Add new fields to the `TransactionAlert` type in [`src/lib/types.ts`](src/lib/types.ts)
3. Update the API route to handle new fields in [`src/routes/api/analyze/+server.ts`](src/routes/api/analyze/+server.ts)
4. Add test cases to [`test-data/transactions.json`](test-data/transactions.json)

### Customizing the Agent

The fraud detection agent can be customized by modifying:
- **System Prompt**: Edit instructions in `fraud-agent.ts` to adjust decision criteria
- **Model**: Change the model provider/name (Claude, GPT-4, etc.)
- **Tools**: Add new tools for database lookups, external API calls, etc.
- **Risk Thresholds**: Adjust confidence and risk score thresholds

## 🚀 Deployment

### AWS Lambda Deployment

Deploy the application to AWS Lambda using the provided script:

1. **Set environment variables**
   ```bash
   export AWS_ACCOUNT_ID=your_account_id
   export AWS_REGION=us-east-1
   export PROJECT_NAME=btd-fraud-detector
   ```

2. **Run the deployment script**
   ```bash
   npm run lambda:deploy
   ```

   This script will:
   - Build the Docker image
   - Create an ECR repository
   - Push the image to ECR
   - Update/create the Lambda function

3. **Configure Lambda**
   In the AWS Console:
   - Set Memory: 512 MB (recommended)
   - Set Timeout: 30 seconds
   - Enable Function URL
   - Add environment variables (API keys)

4. **Test the deployment**
   ```bash
   curl -X POST https://your-function-url.lambda-url.us-east-1.on.aws/api/analyze \
     -H "Content-Type: application/json" \
     -d @test-data/transactions.json
   ```

### Other Deployment Options

The application can be deployed to:
- **Vercel**: `vercel deploy`
- **Docker**: `docker-compose up`
- **Kubernetes**: Use the provided Dockerfile
- **Any Node.js host**: Build with `npm run build` and run `node build`

## 📈 Monitoring & Observability

### Braintrust Integration

The application includes full Braintrust tracing for:
- Agent execution traces
- LLM call logging
- Performance metrics
- Cost tracking
- Error monitoring

View traces in the [Braintrust dashboard](https://www.braintrust.dev/):
- Navigate to the "btd-fraud-detector" project
- View individual transaction traces
- Analyze agent performance over time
- Debug issues with detailed logs

### Key Metrics

Monitor these metrics in production:
- **Decision Distribution**: ALLOW/BLOCK/ESCALATE ratios
- **Processing Time**: Latency percentiles (p50, p95, p99)
- **Confidence Scores**: Average confidence by decision type
- **Risk Scores**: Distribution of risk assessments
- **Escalation Rate**: Percentage of transactions requiring human review
- **False Positive Rate**: Legitimate transactions incorrectly blocked

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- **Mastra**: For the excellent agent framework
- **Anthropic**: For Claude AI capabilities
- **Braintrust**: For observability and evaluation tools
- **SvelteKit**: For the modern web framework

## 📞 Support

For questions or issues:
- Open an issue on GitHub
- Contact: [your-email@example.com]
- Documentation: [Mastra Docs](https://mastra.ai)

---

**Built with ❤️ using Mastra + Claude + Braintrust**
