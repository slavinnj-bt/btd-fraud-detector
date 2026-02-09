import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { mastra } from '$lib/../mastra';
import type { TransactionAlert, AnalysisResult } from '$lib/types';

export const POST: RequestHandler = async ({ request }) => {
  try {
    const startTime = Date.now();
    const transactionData: TransactionAlert = await request.json();

    // Validate required fields
    if (!transactionData.alert_id || !transactionData.transaction) {
      return json(
        { error: 'Invalid transaction data: missing required fields' },
        { status: 400 }
      );
    }

    // Create a detailed prompt for the fraud agent
    const prompt = `Analyze the following transaction for fraud and provide your decision:

ALERT ID: ${transactionData.alert_id}
INGESTED: ${transactionData.ingest_ts}

TRANSACTION DETAILS:
- Transaction ID: ${transactionData.transaction.tx_id}
- Amount: ${transactionData.transaction.currency} ${transactionData.transaction.amount.toFixed(2)}
- Timestamp: ${transactionData.transaction.timestamp}
- Payment Method: ${transactionData.transaction.payment_method}
- Card Last 4: ${transactionData.transaction.card_last4}

MERCHANT:
- Merchant ID: ${transactionData.merchant.merchant_id}
- Name: ${transactionData.merchant.name}
- Risk Level: ${transactionData.merchant.merchant_risk}
- Country: ${transactionData.merchant.country}

CUSTOMER:
- Customer ID: ${transactionData.customer.customer_id}
- Account Age: ${transactionData.customer.account_age_days} days
- KYC Status: ${transactionData.customer.kyc_status}
- Chargeback Rate: ${(transactionData.customer.chargeback_rate * 100).toFixed(2)}%

FRAUD SIGNALS:
- IP Country: ${transactionData.signals.ip_country}
- Device Fingerprint: ${transactionData.signals.device_fingerprint}
- Transactions (last 1h): ${transactionData.signals.velocity.tx_last_1h}
- Transactions (last 24h): ${transactionData.signals.velocity.tx_last_24h}
- Amount (last 24h): ${transactionData.transaction.currency} ${transactionData.signals.velocity.amount_last_24h.toFixed(2)}
- Third-party Fraud Score: ${transactionData.signals.fraud_score_third_party}

RULE ENGINE FLAGS: ${transactionData.rule_engine_flags.length > 0 ? transactionData.rule_engine_flags.join(', ') : 'None'}

SUPPORTING CONTEXT:
- Recent Events: ${transactionData.supporting_context.recent_events.join(', ')}
- Prior Disputes: ${transactionData.supporting_context.prior_disputes}
- Notes: ${transactionData.supporting_context.notes}

Please analyze this transaction and respond with your decision in the specified JSON format.`;

    // Call the Mastra fraud agent
    const agent = await mastra.getAgent('fraudDetective');
    const result = await agent.generate(prompt);

    const processingTime = Date.now() - startTime;

    // Parse the agent's response to extract the decision
    let decision;
    try {
      // Try to extract JSON from the response
      const jsonMatch = result.text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        decision = JSON.parse(jsonMatch[0]);
      } else {
        // Fallback: analyze the text response
        const text = result.text.toLowerCase();
        if (text.includes('decision') && text.includes('allow')) {
          decision = {
            decision: 'ALLOW',
            confidence: 0.7,
            reasoning: result.text,
            risk_score: 0.3,
            key_factors: ['Agent analysis'],
            recommendation: 'Process transaction'
          };
        } else if (text.includes('decision') && text.includes('block')) {
          decision = {
            decision: 'BLOCK',
            confidence: 0.8,
            reasoning: result.text,
            risk_score: 0.8,
            key_factors: ['Agent analysis'],
            recommendation: 'Block transaction'
          };
        } else {
          decision = {
            decision: 'ESCALATE',
            confidence: 0.5,
            reasoning: result.text,
            risk_score: 0.6,
            key_factors: ['Agent analysis'],
            recommendation: 'Escalate for human review'
          };
        }
      }
    } catch (parseError) {
      console.error('Error parsing agent response:', parseError);
      decision = {
        decision: 'ESCALATE',
        confidence: 0.5,
        reasoning: result.text,
        risk_score: 0.6,
        key_factors: ['Unable to parse response'],
        recommendation: 'Escalate due to parsing error'
      };
    }

    const analysisResult: AnalysisResult = {
      alert_id: transactionData.alert_id,
      decision,
      processing_time_ms: processingTime,
      timestamp: new Date().toISOString(),
      agent_response: result.text
    };

    return json(analysisResult);
  } catch (error) {
    console.error('Error analyzing transaction:', error);
    return json(
      {
        error: 'Failed to analyze transaction',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
};
