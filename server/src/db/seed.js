import 'dotenv/config'
import pool from './pool.js'

const destinations = [
  'Antalya, Turkey',
  'Bodrum, Turkey',
  'Sharm El Sheikh, Egypt',
  'Hurghada, Egypt',
  'Rhodes, Greece',
  'Crete, Greece'
]

async function seed () {
  for (const name of destinations) {
    await pool.query(
      'INSERT INTO destinations (name) VALUES ($1) ON CONFLICT (name) DO NOTHING',
      [name]
    )
  }
  console.log(`Seeded ${destinations.length} destinations`)
  await pool.end()
}

seed()
