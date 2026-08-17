import pg from 'pg'

export const testPool = new pg.Pool({
  connectionString: process.env.TEST_DATABASE_URL || 'postgres://localhost:5432/kranisa_test'
})

export async function resetDb () {
  await testPool.query('TRUNCATE offers, agencies, destinations RESTART IDENTITY CASCADE')
}
