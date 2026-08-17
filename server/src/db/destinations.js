export async function createDestination (pool, name) {
  const { rows } = await pool.query(
    `INSERT INTO destinations (name) VALUES ($1)
     ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
     RETURNING *`,
    [name]
  )
  return rows[0]
}

export async function listDestinations (pool) {
  const { rows } = await pool.query('SELECT * FROM destinations ORDER BY name ASC')
  return rows
}
