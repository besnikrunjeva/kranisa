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

export async function listPopularDestinations (pool, limit) {
  const { rows } = await pool.query(
    `SELECT d.*, COUNT(o.id)::int AS offer_count
     FROM destinations d
     JOIN offers o ON o.destination_id = d.id
     GROUP BY d.id
     ORDER BY offer_count DESC, d.name ASC
     LIMIT $1`,
    [limit]
  )
  return rows
}
