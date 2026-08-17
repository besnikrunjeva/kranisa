import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    // Integration tests share one real Postgres test database (TRUNCATE-based
    // reset between tests), so test files must not run in parallel workers.
    fileParallelism: false
  }
})
