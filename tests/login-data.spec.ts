import { readFileSync } from 'fs';
import path from 'path';
import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/login-page';

test.describe.configure({ mode: 'serial' });

type LoginRow = {
  scenario: string;
  username: string;
  password: string;
  expectedResult: 'success' | 'invalid';
};

function readLoginRows(): LoginRow[] {
  const csvPath = path.join(__dirname, '..', 'test-data', 'login-data.csv');
  const rows = readFileSync(csvPath, 'utf-8').trim().split(/\r?\n/);

  return rows.slice(1).map((row) => {
    const [scenario, username, password, expectedResult] = row.split(',');

    return {
      scenario,
      username,
      password,
      expectedResult: expectedResult as LoginRow['expectedResult'],
    };
  });
}

for (const loginRow of readLoginRows()) {
  test(`login scenario: ${loginRow.scenario}`, async ({ page }) => {
    const loginPage = new LoginPage(page);

    await loginPage.goto();
    await loginPage.login(loginRow.username, loginRow.password);

    if (loginRow.expectedResult === 'success') {
      await expect(page).toHaveURL(/dashboard/);
    } else {
      await expect(loginPage.invalidCredentialsMessage).toBeVisible();
    }
  });
}