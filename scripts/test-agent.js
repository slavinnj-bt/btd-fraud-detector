#!/usr/bin/env node

/**
 * Test script for the fraud detection agent
 * Runs through test dataset and validates agent decisions
 */

import { readFile } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const TEST_DATA_PATH = join(__dirname, '../test-data/transactions.json');

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  gray: '\x1b[90m',
};

async function testAgent() {
  console.log(`\n${colors.blue}╔════════════════════════════════════════════╗${colors.reset}`);
  console.log(`${colors.blue}║  BTD Fraud Detector - Agent Testing       ║${colors.reset}`);
  console.log(`${colors.blue}╚════════════════════════════════════════════╝${colors.reset}\n`);

  try {
    // Load test data
    const testDataRaw = await readFile(TEST_DATA_PATH, 'utf-8');
    const testCases = JSON.parse(testDataRaw);

    console.log(`${colors.gray}Loaded ${testCases.length} test cases${colors.reset}\n`);

    // Check if server is running
    const apiUrl = process.env.API_URL || 'http://localhost:5173';

    const results = {
      total: testCases.length,
      passed: 0,
      failed: 0,
      errors: 0,
      details: [],
    };

    // Run each test case
    for (let i = 0; i < testCases.length; i++) {
      const testCase = testCases[i];
      console.log(`${colors.blue}[${i + 1}/${testCases.length}] ${testCase.name}${colors.reset}`);
      console.log(`${colors.gray}   Expected: ${testCase.expected_decision}${colors.reset}`);

      try {
        const response = await fetch(`${apiUrl}/api/analyze`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(testCase.data),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `HTTP ${response.status}`);
        }

        const result = await response.json();
        const actualDecision = result.decision.decision;
        const passed = actualDecision === testCase.expected_decision;

        if (passed) {
          console.log(`${colors.green}   ✓ PASS: ${actualDecision} (Confidence: ${(result.decision.confidence * 100).toFixed(0)}%)${colors.reset}`);
          results.passed++;
        } else {
          console.log(`${colors.red}   ✗ FAIL: Got ${actualDecision}, expected ${testCase.expected_decision}${colors.reset}`);
          results.failed++;
        }

        results.details.push({
          name: testCase.name,
          expected: testCase.expected_decision,
          actual: actualDecision,
          passed,
          confidence: result.decision.confidence,
          risk_score: result.decision.risk_score,
          processing_time_ms: result.processing_time_ms,
        });

        console.log(`${colors.gray}   Processing time: ${result.processing_time_ms}ms${colors.reset}\n`);
      } catch (error) {
        console.log(`${colors.red}   ✗ ERROR: ${error.message}${colors.reset}\n`);
        results.errors++;
        results.details.push({
          name: testCase.name,
          expected: testCase.expected_decision,
          actual: 'ERROR',
          passed: false,
          error: error.message,
        });
      }
    }

    // Print summary
    console.log(`\n${colors.blue}═══════════════════════════════════════════${colors.reset}`);
    console.log(`${colors.blue}Test Summary${colors.reset}`);
    console.log(`${colors.blue}═══════════════════════════════════════════${colors.reset}`);
    console.log(`Total:  ${results.total}`);
    console.log(`${colors.green}Passed: ${results.passed}${colors.reset}`);
    console.log(`${colors.red}Failed: ${results.failed}${colors.reset}`);
    console.log(`${colors.yellow}Errors: ${results.errors}${colors.reset}`);

    const passRate = ((results.passed / results.total) * 100).toFixed(1);
    console.log(`\nPass Rate: ${passRate}%`);

    // Print detailed results
    if (results.failed > 0 || results.errors > 0) {
      console.log(`\n${colors.yellow}Failed/Error Cases:${colors.reset}`);
      results.details
        .filter((d) => !d.passed)
        .forEach((d) => {
          console.log(`  • ${d.name}`);
          console.log(`    Expected: ${d.expected}, Got: ${d.actual}`);
          if (d.error) {
            console.log(`    Error: ${d.error}`);
          }
        });
    }

    // Exit with appropriate code
    process.exit(results.failed > 0 || results.errors > 0 ? 1 : 0);
  } catch (error) {
    console.error(`${colors.red}Fatal error: ${error.message}${colors.reset}`);
    process.exit(1);
  }
}

// Run tests
testAgent();
