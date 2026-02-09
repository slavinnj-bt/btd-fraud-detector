import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import nodemailer from 'nodemailer';

/**
 * Email escalation tool for fraud detection
 * Sends notification emails when transactions require human review
 */
export const escalationTool = createTool({
  id: 'escalate_to_human',
  description: 'Escalate a transaction to a human fraud analyst for manual review when the automated system is uncertain about the fraud decision',
  inputSchema: z.object({
    alert_id: z.string().describe('The unique alert ID for this transaction'),
    tx_id: z.string().describe('The transaction ID'),
    reason: z.string().describe('Detailed explanation of why this transaction needs human review'),
    risk_factors: z.array(z.string()).describe('List of specific risk factors that triggered escalation'),
    customer_id: z.string().describe('The customer ID involved in the transaction'),
    amount: z.number().describe('Transaction amount'),
    merchant_name: z.string().describe('Merchant name'),
  }),
  outputSchema: z.object({
    success: z.boolean(),
    message: z.string(),
    alert_id: z.string(),
    escalation_timestamp: z.string().optional(),
  }),
  execute: async (inputData: {
    alert_id: string;
    tx_id: string;
    reason: string;
    risk_factors: string[];
    customer_id: string;
    amount: number;
    merchant_name: string;
  }) => {
    const {
      alert_id,
      tx_id,
      reason,
      risk_factors,
      customer_id,
      amount,
      merchant_name,
    } = inputData;

    try {
      // In production, use environment variables for email configuration
      const escalationEmail = process.env.ESCALATION_EMAIL || 'fraud-team@example.com';
      const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
      const smtpPort = parseInt(process.env.SMTP_PORT || '587');
      const smtpUser = process.env.SMTP_USER;
      const smtpPass = process.env.SMTP_PASS;

      // For local testing/demo, we'll mock the email sending
      const isMockMode = !smtpUser || !smtpPass;

      if (isMockMode) {
        // Mock mode - just log the email content
        const emailContent = {
          to: escalationEmail,
          subject: `🚨 FRAUD ALERT ESCALATION - ${alert_id}`,
          body: `
TRANSACTION REQUIRES MANUAL REVIEW

Alert ID: ${alert_id}
Transaction ID: ${tx_id}
Customer ID: ${customer_id}
Amount: $${amount.toFixed(2)}
Merchant: ${merchant_name}

ESCALATION REASON:
${reason}

RISK FACTORS:
${risk_factors.map((factor: string, i: number) => `${i + 1}. ${factor}`).join('\n')}

ACTION REQUIRED:
Please review this transaction and make a final determination (ALLOW/BLOCK).

---
This is an automated escalation from the BTD Fraud Detection System
          `.trim(),
        };

        console.log('📧 [MOCK EMAIL] Escalation notification:', JSON.stringify(emailContent, null, 2));

        return {
          success: true,
          message: `Escalation notification sent (mock mode) to ${escalationEmail}`,
          alert_id,
          escalation_timestamp: new Date().toISOString(),
        };
      } else {
        // Real email sending
        const transporter = nodemailer.createTransport({
          host: smtpHost,
          port: smtpPort,
          secure: false,
          auth: {
            user: smtpUser,
            pass: smtpPass,
          },
        });

        await transporter.sendMail({
          from: smtpUser,
          to: escalationEmail,
          subject: `🚨 FRAUD ALERT ESCALATION - ${alert_id}`,
          html: `
            <h2>TRANSACTION REQUIRES MANUAL REVIEW</h2>
            <table style="border-collapse: collapse; width: 100%; max-width: 600px;">
              <tr style="background-color: #f0f0f0;">
                <td style="padding: 10px; border: 1px solid #ddd;"><strong>Alert ID</strong></td>
                <td style="padding: 10px; border: 1px solid #ddd;">${alert_id}</td>
              </tr>
              <tr>
                <td style="padding: 10px; border: 1px solid #ddd;"><strong>Transaction ID</strong></td>
                <td style="padding: 10px; border: 1px solid #ddd;">${tx_id}</td>
              </tr>
              <tr style="background-color: #f0f0f0;">
                <td style="padding: 10px; border: 1px solid #ddd;"><strong>Customer ID</strong></td>
                <td style="padding: 10px; border: 1px solid #ddd;">${customer_id}</td>
              </tr>
              <tr>
                <td style="padding: 10px; border: 1px solid #ddd;"><strong>Amount</strong></td>
                <td style="padding: 10px; border: 1px solid #ddd;">$${amount.toFixed(2)}</td>
              </tr>
              <tr style="background-color: #f0f0f0;">
                <td style="padding: 10px; border: 1px solid #ddd;"><strong>Merchant</strong></td>
                <td style="padding: 10px; border: 1px solid #ddd;">${merchant_name}</td>
              </tr>
            </table>

            <h3 style="color: #d9534f; margin-top: 20px;">ESCALATION REASON</h3>
            <p>${reason}</p>

            <h3 style="color: #d9534f;">RISK FACTORS</h3>
            <ul>
              ${risk_factors.map((factor: string) => `<li>${factor}</li>`).join('\n')}
            </ul>

            <p style="margin-top: 30px; padding: 15px; background-color: #fff3cd; border-left: 4px solid #ffc107;">
              <strong>ACTION REQUIRED:</strong> Please review this transaction and make a final determination (ALLOW/BLOCK).
            </p>

            <p style="color: #666; font-size: 12px; margin-top: 30px;">
              This is an automated escalation from the BTD Fraud Detection System
            </p>
          `,
        });

        return {
          success: true,
          message: `Escalation notification sent to ${escalationEmail}`,
          alert_id,
          escalation_timestamp: new Date().toISOString(),
        };
      }
    } catch (error) {
      console.error('Error sending escalation email:', error);
      return {
        success: false,
        message: `Failed to send escalation: ${error instanceof Error ? error.message : 'Unknown error'}`,
        alert_id,
      };
    }
  },
});
