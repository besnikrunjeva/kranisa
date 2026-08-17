export async function createAgency (pool, { name, logo_url, contact_link, notes }) {
  const { rows } = await pool.query(
    `INSERT INTO agencies (name, logo_url, contact_link, notes)
     VALUES ($1, $2, $3, $4) RETURNING *`,
    [name, logo_url ?? null, contact_link, notes ?? null]
  )
  return rows[0]
}

export async function listAgencies (pool) {
  const { rows } = await pool.query('SELECT * FROM agencies ORDER BY name ASC')
  return rows
}
