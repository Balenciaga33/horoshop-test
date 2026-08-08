import { test } from '@playwright/test';

/** Прив’язує тест до стабільного ID у docs/KNOWN-ISSUES.md. */
export function annotateKnownIssue(id: string, summary: string): void {
  test.info().annotations.push({
    type: 'known-issue',
    description: `KNOWN-ISSUES.md ${id}: ${summary}`,
  });
}
