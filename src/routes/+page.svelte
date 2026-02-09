<script lang="ts">
  import type { TransactionAlert, AnalysisResult } from '$lib/types';

  // Editable transaction data
  let alert = $state<TransactionAlert>({
    alert_id: 'a-2026-0001',
    ingest_ts: new Date().toISOString(),
    transaction: {
      tx_id: 'tx-9001',
      amount: 1299.95,
      currency: 'USD',
      timestamp: new Date().toISOString(),
      payment_method: 'card',
      card_last4: '4242'
    },
    merchant: {
      merchant_id: 'm-550',
      name: 'QuickGadgets Inc',
      merchant_risk: 'high',
      country: 'US'
    },
    customer: {
      customer_id: 'c-77',
      account_age_days: 12,
      kyc_status: 'unverified',
      chargeback_rate: 0.00
    },
    signals: {
      ip_country: 'NG',
      device_fingerprint: 'dev-3f2b',
      velocity: {
        tx_last_1h: 4,
        tx_last_24h: 7,
        amount_last_24h: 2400.50
      },
      fraud_score_third_party: 0.78
    },
    rule_engine_flags: ['velocity_rule', 'high_amount_threshold'],
    supporting_context: {
      recent_events: ['new_card_added', 'login_from_new_country'],
      prior_disputes: 0,
      notes: 'Customer profile shows recent email change 2 days ago.'
    }
  });

  let analyzing = $state(false);
  let result = $state<AnalysisResult | null>(null);
  let error = $state<string | null>(null);
  let editMode = $state(false);

  const formatTs = (ts: string) =>
    new Date(ts).toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });

  function getRiskBadgeClass(risk: string) {
    switch (risk) {
      case 'low': return 'badge-low';
      case 'medium': return 'badge-medium';
      case 'high': return 'badge-high';
      default: return 'badge-low';
    }
  }

  function getKycPillClass(status: string) {
    switch (status) {
      case 'verified': return 'pill-ok';
      case 'pending': return 'pill-warning';
      case 'unverified':
      case 'rejected': return 'pill-danger';
      default: return 'pill-ok';
    }
  }

  async function analyzeTransaction() {
    analyzing = true;
    error = null;
    result = null;

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(alert),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to analyze transaction');
      }

      result = await response.json();
    } catch (err) {
      error = err instanceof Error ? err.message : 'An unknown error occurred';
    } finally {
      analyzing = false;
    }
  }

  function loadSample(sampleType: 'fraud' | 'legitimate' | 'borderline') {
    if (sampleType === 'fraud') {
      alert = {
        alert_id: 'a-2026-0002',
        ingest_ts: new Date().toISOString(),
        transaction: {
          tx_id: 'tx-9002',
          amount: 2499.00,
          currency: 'USD',
          timestamp: new Date().toISOString(),
          payment_method: 'card',
          card_last4: '5678'
        },
        merchant: {
          merchant_id: 'm-999',
          name: 'FastElectronics Ltd',
          merchant_risk: 'high',
          country: 'CN'
        },
        customer: {
          customer_id: 'c-123',
          account_age_days: 2,
          kyc_status: 'unverified',
          chargeback_rate: 0.00
        },
        signals: {
          ip_country: 'RU',
          device_fingerprint: 'dev-unknown',
          velocity: {
            tx_last_1h: 6,
            tx_last_24h: 6,
            amount_last_24h: 8500.00
          },
          fraud_score_third_party: 0.92
        },
        rule_engine_flags: ['velocity_rule', 'high_amount_threshold', 'new_account_risk'],
        supporting_context: {
          recent_events: ['new_card_added', 'email_change', 'login_from_new_country'],
          prior_disputes: 0,
          notes: 'Account created 2 days ago. Multiple high-value transactions in short period.'
        }
      };
    } else if (sampleType === 'legitimate') {
      alert = {
        alert_id: 'a-2026-0003',
        ingest_ts: new Date().toISOString(),
        transaction: {
          tx_id: 'tx-9003',
          amount: 49.99,
          currency: 'USD',
          timestamp: new Date().toISOString(),
          payment_method: 'card',
          card_last4: '1234'
        },
        merchant: {
          merchant_id: 'm-100',
          name: 'Amazon.com',
          merchant_risk: 'low',
          country: 'US'
        },
        customer: {
          customer_id: 'c-500',
          account_age_days: 365,
          kyc_status: 'verified',
          chargeback_rate: 0.00
        },
        signals: {
          ip_country: 'US',
          device_fingerprint: 'dev-known-abc123',
          velocity: {
            tx_last_1h: 1,
            tx_last_24h: 2,
            amount_last_24h: 89.98
          },
          fraud_score_third_party: 0.12
        },
        rule_engine_flags: [],
        supporting_context: {
          recent_events: [],
          prior_disputes: 0,
          notes: 'Regular customer with established history.'
        }
      };
    } else {
      alert = {
        alert_id: 'a-2026-0004',
        ingest_ts: new Date().toISOString(),
        transaction: {
          tx_id: 'tx-9004',
          amount: 899.00,
          currency: 'USD',
          timestamp: new Date().toISOString(),
          payment_method: 'card',
          card_last4: '9876'
        },
        merchant: {
          merchant_id: 'm-350',
          name: 'BestBuy',
          merchant_risk: 'medium',
          country: 'US'
        },
        customer: {
          customer_id: 'c-250',
          account_age_days: 45,
          kyc_status: 'verified',
          chargeback_rate: 0.01
        },
        signals: {
          ip_country: 'CA',
          device_fingerprint: 'dev-mobile-xyz',
          velocity: {
            tx_last_1h: 2,
            tx_last_24h: 3,
            amount_last_24h: 1200.00
          },
          fraud_score_third_party: 0.62
        },
        rule_engine_flags: ['unusual_location'],
        supporting_context: {
          recent_events: ['login_from_new_location'],
          prior_disputes: 0,
          notes: 'Customer traveling. IP from Canada, typically US-based.'
        }
      };
    }
    result = null;
    error = null;
  }

  function getDecisionColor(decision: string) {
    switch (decision) {
      case 'ALLOW': return 'decision-allow';
      case 'BLOCK': return 'decision-block';
      case 'ESCALATE': return 'decision-escalate';
      default: return '';
    }
  }

  function getDecisionIcon(decision: string) {
    switch (decision) {
      case 'ALLOW': return '✓';
      case 'BLOCK': return '✗';
      case 'ESCALATE': return '⚠';
      default: return '?';
    }
  }
</script>

<svelte:head>
  <title>BTD Fraud Triage Console</title>
</svelte:head>

<div class="app-shell">
  <div class="bg-gradient"></div>

  <header class="top-bar">
    <div class="brand">
      <div class="logo">FT</div>
      <div>
        <h1>Fraud Triage Console</h1>
        <p>AI‑assisted transaction review powered by Mastra + Claude</p>
      </div>
    </div>
    <div class="alert-meta">
      <div>
        <span class="label">Alert ID</span>
        <span class="value">{alert.alert_id}</span>
      </div>
      <div>
        <span class="label">Ingested</span>
        <span class="value">{formatTs(alert.ingest_ts)}</span>
      </div>
      <button class="edit-toggle" onclick={() => editMode = !editMode}>
        {editMode ? '👁️ View' : '✏️ Edit'}
      </button>
    </div>
  </header>

  <main class="layout">
    <!-- Left: Current alert with editable fields -->
    <section class="column">
      <div class="card card-main">
        <div class="card-header">
          <h2>Current Alert</h2>
          <span class="badge {getRiskBadgeClass(alert.merchant.merchant_risk)}">
            {alert.merchant.merchant_risk} risk
          </span>
        </div>

        <div class="grid grid-2">
          <div class="block">
            <h3>Transaction</h3>
            <div class="kv">
              <span>Tx ID</span>
              {#if editMode}
                <input type="text" bind:value={alert.transaction.tx_id} class="inline-input" />
              {:else}
                <span>{alert.transaction.tx_id}</span>
              {/if}
            </div>
            <div class="kv highlight">
              <span>Amount</span>
              {#if editMode}
                <input type="number" step="0.01" bind:value={alert.transaction.amount} class="inline-input" />
              {:else}
                <span>
                  {alert.transaction.amount.toFixed(2)} {alert.transaction.currency}
                </span>
              {/if}
            </div>
            <div class="kv">
              <span>Currency</span>
              {#if editMode}
                <select bind:value={alert.transaction.currency} class="inline-select">
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                </select>
              {:else}
                <span>{alert.transaction.currency}</span>
              {/if}
            </div>
            <div class="kv">
              <span>Method</span>
              {#if editMode}
                <input type="text" bind:value={alert.transaction.payment_method} class="inline-input" />
              {:else}
                <span>
                  {alert.transaction.payment_method}
                  {alert.transaction.payment_method === 'card'
                    ? ` • •••• ${alert.transaction.card_last4}`
                    : ''}
                </span>
              {/if}
            </div>
            {#if editMode && alert.transaction.payment_method === 'card'}
              <div class="kv">
                <span>Card Last 4</span>
                <input type="text" maxlength="4" bind:value={alert.transaction.card_last4} class="inline-input" />
              </div>
            {/if}
          </div>

          <div class="block">
            <h3>Merchant</h3>
            <div class="kv">
              <span>Name</span>
              {#if editMode}
                <input type="text" bind:value={alert.merchant.name} class="inline-input" />
              {:else}
                <span>{alert.merchant.name}</span>
              {/if}
            </div>
            <div class="kv">
              <span>Merchant ID</span>
              {#if editMode}
                <input type="text" bind:value={alert.merchant.merchant_id} class="inline-input" />
              {:else}
                <span>{alert.merchant.merchant_id}</span>
              {/if}
            </div>
            <div class="kv">
              <span>Risk</span>
              {#if editMode}
                <select bind:value={alert.merchant.merchant_risk} class="inline-select">
                  <option value="low">low</option>
                  <option value="medium">medium</option>
                  <option value="high">high</option>
                </select>
              {:else}
                <span class="pill pill-{alert.merchant.merchant_risk}">{alert.merchant.merchant_risk}</span>
              {/if}
            </div>
            <div class="kv">
              <span>Country</span>
              {#if editMode}
                <input type="text" bind:value={alert.merchant.country} class="inline-input" />
              {:else}
                <span>{alert.merchant.country}</span>
              {/if}
            </div>
          </div>
        </div>

        <div class="grid grid-2">
          <div class="block">
            <h3>Customer</h3>
            <div class="kv">
              <span>Customer ID</span>
              {#if editMode}
                <input type="text" bind:value={alert.customer.customer_id} class="inline-input" />
              {:else}
                <span>{alert.customer.customer_id}</span>
              {/if}
            </div>
            <div class="kv">
              <span>Account age</span>
              {#if editMode}
                <input type="number" bind:value={alert.customer.account_age_days} class="inline-input" />
              {:else}
                <span>{alert.customer.account_age_days} days</span>
              {/if}
            </div>
            <div class="kv">
              <span>KYC status</span>
              {#if editMode}
                <select bind:value={alert.customer.kyc_status} class="inline-select">
                  <option value="verified">verified</option>
                  <option value="pending">pending</option>
                  <option value="unverified">unverified</option>
                  <option value="rejected">rejected</option>
                </select>
              {:else}
                <span class="pill {getKycPillClass(alert.customer.kyc_status)}">{alert.customer.kyc_status}</span>
              {/if}
            </div>
            <div class="kv">
              <span>Chargeback rate</span>
              {#if editMode}
                <input type="number" step="0.01" bind:value={alert.customer.chargeback_rate} class="inline-input" />
              {:else}
                <span>{(alert.customer.chargeback_rate * 100).toFixed(2)}%</span>
              {/if}
            </div>
          </div>

          <div class="block">
            <h3>Signals</h3>
            <div class="kv">
              <span>IP country</span>
              {#if editMode}
                <input type="text" bind:value={alert.signals.ip_country} class="inline-input" />
              {:else}
                <span>{alert.signals.ip_country}</span>
              {/if}
            </div>
            <div class="kv">
              <span>Device fingerprint</span>
              {#if editMode}
                <input type="text" bind:value={alert.signals.device_fingerprint} class="inline-input mono" />
              {:else}
                <span class="mono">{alert.signals.device_fingerprint}</span>
              {/if}
            </div>
            <div class="kv">
              <span>Velocity (1h / 24h)</span>
              {#if editMode}
                <div class="velocity-inputs">
                  <input type="number" bind:value={alert.signals.velocity.tx_last_1h} class="inline-input small" />
                  <span>/</span>
                  <input type="number" bind:value={alert.signals.velocity.tx_last_24h} class="inline-input small" />
                </div>
              {:else}
                <span>
                  {alert.signals.velocity.tx_last_1h} / {alert.signals.velocity.tx_last_24h} tx
                </span>
              {/if}
            </div>
            <div class="kv">
              <span>Amount last 24h</span>
              {#if editMode}
                <input type="number" step="0.01" bind:value={alert.signals.velocity.amount_last_24h} class="inline-input" />
              {:else}
                <span>{alert.signals.velocity.amount_last_24h.toFixed(2)} {alert.transaction.currency}</span>
              {/if}
            </div>
            <div class="kv">
              <span>3rd‑party fraud score</span>
              {#if editMode}
                <input type="number" step="0.01" min="0" max="1" bind:value={alert.signals.fraud_score_third_party} class="inline-input" />
              {:else}
                <span class="score-value">{(alert.signals.fraud_score_third_party * 100).toFixed(1)}%</span>
              {/if}
            </div>
          </div>
        </div>

        <div class="context-row">
          <div>
            <h3>Context</h3>
            {#if editMode}
              <textarea bind:value={alert.supporting_context.notes} class="inline-textarea" rows="2"></textarea>
            {:else}
              <p>{alert.supporting_context.notes}</p>
            {/if}
            {#if alert.supporting_context.recent_events.length > 0}
              <div class="events">
                <strong>Recent events:</strong>
                {#each alert.supporting_context.recent_events as event}
                  <span class="event-badge">{event.replace(/_/g, ' ')}</span>
                {/each}
              </div>
            {/if}
          </div>
          <div class="chips">
            <span class="chip">
              Prior disputes: <strong>{alert.supporting_context.prior_disputes}</strong>
            </span>
            <span class="chip">
              Rule flags: <strong>{alert.rule_engine_flags.length}</strong>
            </span>
          </div>
        </div>
      </div>
    </section>

    <!-- Right: Analysis & Results -->
    <section class="column">
      <div class="card">
        <div class="card-header">
          <h2>Analyze Transaction</h2>
          <p>Load samples or analyze current data</p>
        </div>

        <div class="sample-buttons">
          <button class="sample-btn sample-legitimate" onclick={() => loadSample('legitimate')}>
            <span class="icon">✓</span>
            Load Legitimate
          </button>
          <button class="sample-btn sample-borderline" onclick={() => loadSample('borderline')}>
            <span class="icon">⚠</span>
            Load Borderline
          </button>
          <button class="sample-btn sample-fraud" onclick={() => loadSample('fraud')}>
            <span class="icon">✗</span>
            Load Fraud
          </button>
        </div>

        <div class="actions">
          <button
            class="primary"
            onclick={analyzeTransaction}
            disabled={analyzing}
          >
            {#if analyzing}
              <span class="spinner"></span>
              Analyzing...
            {:else}
              🚀 Analyze with AI Agent
            {/if}
          </button>
        </div>
      </div>

      {#if result}
        <div class="card result-card">
          <div class="card-header">
            <h2>AI Decision</h2>
            <div class="decision-badge {getDecisionColor(result.decision.decision)}">
              <span class="decision-icon">{getDecisionIcon(result.decision.decision)}</span>
              {result.decision.decision}
            </div>
          </div>

          <div class="metrics-grid">
            <div class="metric">
              <span class="metric-label">Risk Score</span>
              <span class="metric-value risk">{(result.decision.risk_score * 100).toFixed(0)}%</span>
            </div>
            <div class="metric">
              <span class="metric-label">Confidence</span>
              <span class="metric-value conf">{(result.decision.confidence * 100).toFixed(0)}%</span>
            </div>
            <div class="metric">
              <span class="metric-label">Processing Time</span>
              <span class="metric-value time">{result.processing_time_ms}ms</span>
            </div>
          </div>

          <div class="result-section">
            <h3>Reasoning</h3>
            <p class="reasoning">{result.decision.reasoning}</p>
          </div>

          <div class="result-section">
            <h3>Key Risk Factors</h3>
            <ul class="factors-list">
              {#each result.decision.key_factors as factor}
                <li>{factor}</li>
              {/each}
            </ul>
          </div>

          <div class="result-section">
            <h3>Recommendation</h3>
            <p class="recommendation">{result.decision.recommendation}</p>
          </div>
        </div>
      {:else if error}
        <div class="card error-card">
          <div class="error-content">
            <span class="error-icon">❌</span>
            <div>
              <h3>Error</h3>
              <p>{error}</p>
            </div>
          </div>
        </div>
      {:else if !analyzing}
        <div class="card placeholder-card">
          <div class="placeholder-content">
            <svg class="placeholder-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <p>No analysis yet</p>
            <p class="placeholder-hint">Select a sample or submit the current transaction</p>
          </div>
        </div>
      {/if}
    </section>
  </main>
</div>

<style>
  :global(body) {
    margin: 0;
    font-family: system-ui, -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif;
    background: radial-gradient(circle at top, #050816 0, #020617 40%, #000 100%);
    color: #e5e7eb;
  }

  .app-shell {
    min-height: 100vh;
    position: relative;
    padding: 1.5rem 1.5rem 2rem;
    box-sizing: border-box;
    overflow: hidden;
  }

  .bg-gradient {
    position: fixed;
    inset: 0;
    background:
      radial-gradient(circle at 0% 0%, rgba(59, 130, 246, 0.35), transparent 55%),
      radial-gradient(circle at 100% 100%, rgba(236, 72, 153, 0.3), transparent 55%);
    opacity: 0.7;
    pointer-events: none;
    z-index: -2;
  }

  .top-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.75rem;
    gap: 1.5rem;
  }

  .brand {
    display: flex;
    align-items: center;
    gap: 0.9rem;
  }

  .logo {
    width: 2.4rem;
    height: 2.4rem;
    border-radius: 0.9rem;
    background: linear-gradient(135deg, #22d3ee, #6366f1);
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    letter-spacing: 0.05em;
    color: #0b1120;
    box-shadow: 0 10px 30px rgba(37, 99, 235, 0.5);
  }

  .brand h1 {
    font-size: 1.25rem;
    margin: 0;
  }

  .brand p {
    margin: 0;
    font-size: 0.85rem;
    color: #9ca3af;
  }

  .alert-meta {
    display: flex;
    gap: 1.5rem;
    font-size: 0.8rem;
    color: #9ca3af;
    align-items: center;
  }

  .alert-meta .label {
    display: block;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    font-size: 0.7rem;
    margin-bottom: 0.15rem;
  }

  .alert-meta .value {
    color: #e5e7eb;
  }

  .edit-toggle {
    padding: 0.5rem 1rem;
    border-radius: 0.6rem;
    border: 1px solid rgba(148, 163, 184, 0.5);
    background: rgba(59, 130, 246, 0.2);
    color: #bfdbfe;
    font-size: 0.8rem;
    cursor: pointer;
    transition: all 0.15s ease;
  }

  .edit-toggle:hover {
    background: rgba(59, 130, 246, 0.3);
    border-color: rgba(59, 130, 246, 0.8);
    transform: translateY(-1px);
  }

  .layout {
    display: grid;
    grid-template-columns: minmax(0, 3fr) minmax(0, 2.2fr);
    gap: 1.5rem;
  }

  @media (max-width: 960px) {
    .layout {
      grid-template-columns: minmax(0, 1fr);
    }
    .top-bar {
      flex-direction: column;
      align-items: flex-start;
    }
  }

  .column {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .card {
    background: rgba(15, 23, 42, 0.8);
    border-radius: 1rem;
    padding: 1.3rem 1.4rem;
    border: 1px solid rgba(148, 163, 184, 0.25);
    box-shadow:
      0 18px 40px rgba(15, 23, 42, 0.7),
      0 0 0 1px rgba(15, 23, 42, 0.9);
    backdrop-filter: blur(14px);
  }

  .card-main {
    padding: 1.5rem 1.6rem;
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
    gap: 0.75rem;
  }

  .card-header h2,
  .card-header h3 {
    margin: 0;
    font-size: 1rem;
  }

  .card-header p {
    margin: 0;
    font-size: 0.85rem;
    color: #9ca3af;
  }

  .badge {
    padding: 0.3rem 0.7rem;
    border-radius: 999px;
    font-size: 0.75rem;
    border: 1px solid rgba(148, 163, 184, 0.5);
    text-transform: capitalize;
  }

  .badge-low {
    background: rgba(22, 163, 74, 0.12);
    border-color: rgba(34, 197, 94, 0.6);
    color: #bbf7d0;
  }

  .badge-medium {
    background: rgba(234, 179, 8, 0.12);
    border-color: rgba(234, 179, 8, 0.6);
    color: #fef08a;
  }

  .badge-high {
    background: rgba(220, 38, 38, 0.12);
    border-color: rgba(239, 68, 68, 0.6);
    color: #fecaca;
  }

  .grid {
    display: grid;
    gap: 1.1rem;
    margin-bottom: 1.1rem;
  }

  .grid-2 {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: 800px) {
    .grid-2 {
      grid-template-columns: minmax(0, 1fr);
    }
  }

  .block h3 {
    font-size: 0.9rem;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: #9ca3af;
    margin: 0 0 0.6rem;
  }

  .kv {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
    font-size: 0.84rem;
    padding: 0.25rem 0;
  }

  .kv span:first-child {
    color: #9ca3af;
    flex-shrink: 0;
  }

  .kv span:last-child {
    color: #e5e7eb;
  }

  .kv.highlight span:last-child {
    color: #f97316;
    font-weight: 600;
    font-size: 1.05rem;
  }

  .score-value {
    color: #fbbf24 !important;
    font-weight: 600;
  }

  .inline-input,
  .inline-select {
    background: rgba(15, 23, 42, 0.95);
    border: 1px solid rgba(148, 163, 184, 0.5);
    border-radius: 0.4rem;
    padding: 0.3rem 0.5rem;
    color: #e5e7eb;
    font-size: 0.82rem;
    outline: none;
    transition: all 0.15s ease;
    max-width: 200px;
  }

  .inline-input:focus,
  .inline-select:focus {
    border-color: rgba(59, 130, 246, 0.8);
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
  }

  .inline-input.small {
    max-width: 70px;
  }

  .velocity-inputs {
    display: flex;
    align-items: center;
    gap: 0.3rem;
  }

  .inline-textarea {
    width: 100%;
    background: rgba(15, 23, 42, 0.95);
    border: 1px solid rgba(148, 163, 184, 0.5);
    border-radius: 0.4rem;
    padding: 0.5rem;
    color: #e5e7eb;
    font-size: 0.82rem;
    outline: none;
    resize: vertical;
    font-family: inherit;
  }

  .inline-textarea:focus {
    border-color: rgba(59, 130, 246, 0.8);
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
  }

  .pill {
    padding: 0.15rem 0.55rem;
    border-radius: 999px;
    font-size: 0.75rem;
    text-transform: capitalize;
  }

  .pill-low {
    background: rgba(22, 163, 74, 0.1);
    color: #bbf7d0;
  }

  .pill-medium {
    background: rgba(234, 179, 8, 0.1);
    color: #fef08a;
  }

  .pill-high {
    background: rgba(220, 38, 38, 0.1);
    color: #fecaca;
  }

  .pill-ok {
    background: rgba(59, 130, 246, 0.16);
    color: #bfdbfe;
  }

  .pill-warning {
    background: rgba(234, 179, 8, 0.16);
    color: #fef08a;
  }

  .pill-danger {
    background: rgba(220, 38, 38, 0.16);
    color: #fecaca;
  }

  .mono {
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    font-size: 0.78rem;
  }

  .context-row {
    display: flex;
    justify-content: space-between;
    gap: 1.2rem;
    align-items: flex-start;
    margin-top: 0.4rem;
  }

  .context-row h3 {
    font-size: 0.9rem;
    margin: 0 0 0.35rem;
    color: #9ca3af;
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }

  .context-row p {
    margin: 0 0 0.5rem;
    font-size: 0.83rem;
    color: #d1d5db;
  }

  .events {
    display: flex;
    flex-wrap: wrap;
    gap: 0.4rem;
    font-size: 0.8rem;
    align-items: center;
  }

  .events strong {
    color: #9ca3af;
  }

  .event-badge {
    padding: 0.15rem 0.5rem;
    border-radius: 999px;
    background: rgba(234, 179, 8, 0.1);
    color: #fef08a;
    font-size: 0.72rem;
    text-transform: capitalize;
  }

  .chips {
    display: flex;
    flex-wrap: wrap;
    gap: 0.4rem;
  }

  .chip {
    font-size: 0.78rem;
    padding: 0.18rem 0.55rem;
    border-radius: 999px;
    border: 1px solid rgba(148, 163, 184, 0.5);
    color: #9ca3af;
    background: rgba(15, 23, 42, 0.8);
  }

  .chip strong {
    color: #e5e7eb;
  }

  @media (max-width: 800px) {
    .context-row {
      flex-direction: column;
    }
  }

  .sample-buttons {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 0.6rem;
    margin-bottom: 1rem;
  }

  @media (max-width: 600px) {
    .sample-buttons {
      grid-template-columns: 1fr;
    }
  }

  .sample-btn {
    padding: 0.6rem 0.8rem;
    border-radius: 0.7rem;
    border: 1px solid rgba(148, 163, 184, 0.4);
    background: rgba(15, 23, 42, 0.7);
    color: #e5e7eb;
    font-size: 0.8rem;
    cursor: pointer;
    transition: all 0.15s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.4rem;
  }

  .sample-btn:hover {
    transform: translateY(-1px);
    box-shadow: 0 8px 20px rgba(59, 130, 246, 0.4);
  }

  .sample-legitimate:hover {
    background: rgba(22, 163, 74, 0.2);
    border-color: rgba(34, 197, 94, 0.6);
  }

  .sample-borderline:hover {
    background: rgba(234, 179, 8, 0.2);
    border-color: rgba(234, 179, 8, 0.6);
  }

  .sample-fraud:hover {
    background: rgba(220, 38, 38, 0.2);
    border-color: rgba(239, 68, 68, 0.6);
  }

  .sample-btn .icon {
    font-size: 1rem;
  }

  .actions {
    display: flex;
    justify-content: center;
    gap: 0.6rem;
  }

  .primary {
    flex: 1;
    padding: 0.75rem 1.5rem;
    border-radius: 0.8rem;
    border: none;
    background: linear-gradient(135deg, #3b82f6, #8b5cf6);
    color: white;
    font-size: 0.9rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.15s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    box-shadow: 0 10px 25px rgba(59, 130, 246, 0.4);
  }

  .primary:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 15px 35px rgba(59, 130, 246, 0.6);
  }

  .primary:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .spinner {
    display: inline-block;
    width: 14px;
    height: 14px;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-top-color: white;
    border-radius: 50%;
    animation: spin 0.6s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  .result-card {
    animation: slideIn 0.3s ease;
  }

  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .decision-badge {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0.4rem 0.9rem;
    border-radius: 999px;
    font-size: 0.85rem;
    font-weight: 600;
    border: 2px solid;
  }

  .decision-allow {
    background: rgba(22, 163, 74, 0.15);
    border-color: rgba(34, 197, 94, 0.8);
    color: #bbf7d0;
  }

  .decision-block {
    background: rgba(220, 38, 38, 0.15);
    border-color: rgba(239, 68, 68, 0.8);
    color: #fecaca;
  }

  .decision-escalate {
    background: rgba(234, 179, 8, 0.15);
    border-color: rgba(234, 179, 8, 0.8);
    color: #fef08a;
  }

  .decision-icon {
    font-size: 1.2rem;
  }

  .metrics-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 0.8rem;
    margin-bottom: 1.2rem;
  }

  @media (max-width: 600px) {
    .metrics-grid {
      grid-template-columns: 1fr;
    }
  }

  .metric {
    background: rgba(15, 23, 42, 0.6);
    border: 1px solid rgba(148, 163, 184, 0.3);
    border-radius: 0.7rem;
    padding: 0.7rem;
    text-align: center;
  }

  .metric-label {
    display: block;
    font-size: 0.72rem;
    color: #9ca3af;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    margin-bottom: 0.3rem;
  }

  .metric-value {
    display: block;
    font-size: 1.4rem;
    font-weight: 700;
  }

  .metric-value.risk {
    color: #f97316;
  }

  .metric-value.conf {
    color: #3b82f6;
  }

  .metric-value.time {
    color: #10b981;
  }

  .result-section {
    margin-bottom: 1rem;
  }

  .result-section h3 {
    font-size: 0.85rem;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: #9ca3af;
    margin: 0 0 0.5rem;
  }

  .reasoning,
  .recommendation {
    font-size: 0.85rem;
    line-height: 1.6;
    color: #d1d5db;
    margin: 0;
  }

  .recommendation {
    padding: 0.8rem;
    background: rgba(59, 130, 246, 0.1);
    border-left: 3px solid #3b82f6;
    border-radius: 0.5rem;
  }

  .factors-list {
    margin: 0;
    padding-left: 1.2rem;
    font-size: 0.84rem;
    color: #d1d5db;
    line-height: 1.7;
  }

  .factors-list li {
    margin-bottom: 0.3rem;
  }

  .error-card {
    background: rgba(220, 38, 38, 0.1);
    border-color: rgba(239, 68, 68, 0.5);
  }

  .error-content {
    display: flex;
    align-items: flex-start;
    gap: 1rem;
  }

  .error-icon {
    font-size: 2rem;
  }

  .error-content h3 {
    margin: 0 0 0.4rem;
    color: #fecaca;
  }

  .error-content p {
    margin: 0;
    color: #fca5a5;
    font-size: 0.85rem;
  }

  .placeholder-card {
    padding: 2rem;
  }

  .placeholder-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.8rem;
    color: #6b7280;
  }

  .placeholder-icon {
    width: 4rem;
    height: 4rem;
    opacity: 0.5;
  }

  .placeholder-content p {
    margin: 0;
    font-size: 0.95rem;
  }

  .placeholder-hint {
    font-size: 0.8rem !important;
    color: #4b5563;
  }
</style>
