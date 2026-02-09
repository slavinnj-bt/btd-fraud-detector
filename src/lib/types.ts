export interface TransactionAlert {
  alert_id: string;
  ingest_ts: string;
  transaction: {
    tx_id: string;
    amount: number;
    currency: string;
    timestamp: string;
    payment_method: string;
    card_last4: string;
  };
  merchant: {
    merchant_id: string;
    name: string;
    merchant_risk: 'low' | 'medium' | 'high';
    country: string;
  };
  customer: {
    customer_id: string;
    account_age_days: number;
    kyc_status: 'verified' | 'unverified' | 'pending' | 'rejected';
    chargeback_rate: number;
  };
  signals: {
    ip_country: string;
    device_fingerprint: string;
    velocity: {
      tx_last_1h: number;
      tx_last_24h: number;
      amount_last_24h: number;
    };
    fraud_score_third_party: number;
  };
  rule_engine_flags: string[];
  supporting_context: {
    recent_events: string[];
    prior_disputes: number;
    notes: string;
  };
}

export interface FraudDecision {
  decision: 'ALLOW' | 'BLOCK' | 'ESCALATE';
  confidence: number;
  reasoning: string;
  risk_score: number;
  key_factors: string[];
  recommendation: string;
}

export interface AnalysisResult {
  alert_id: string;
  decision: FraudDecision;
  processing_time_ms: number;
  timestamp: string;
  agent_response?: string;
}
