const OFFER_COLUMNS = `
  o.id, o.agency_id, o.destination_id, o.start_date, o.end_date, o.nights,
  o.price_per_person, o.currency, o.board_type, o.star_rating, o.capacity,
  o.image_url, o.external_link, o.created_at, o.updated_at,
  a.name AS agency_name, a.logo_url AS agency_logo_url, a.contact_link AS agency_contact_link,
  d.name AS destination_name
`

export async function searchOffers (pool, { destinationId, dateFrom = null, dateTo = null, people }) {
  // dateFrom/dateTo are optional — omitting them returns every current offer
  // for the destination instead of filtering by an overlap window, which is
  // what powers the "no exact match, but here's what's available" fallback.
  const hasDates = Boolean(dateFrom && dateTo)
  const orderBy = hasDates ? 'o.price_per_person ASC' : 'o.start_date ASC, o.price_per_person ASC'
  const { rows } = await pool.query(
    `SELECT ${OFFER_COLUMNS}
     FROM offers o
     JOIN agencies a ON a.id = o.agency_id
     JOIN destinations d ON d.id = o.destination_id
     WHERE o.destination_id = $1
       AND o.capacity >= $2
       AND o.end_date >= CURRENT_DATE
       AND ($3::date IS NULL OR o.start_date <= $3)
       AND ($4::date IS NULL OR o.end_date >= $4)
     ORDER BY ${orderBy}`,
    [destinationId, people, dateTo, dateFrom]
  )
  return rows
}

export async function getOfferById (pool, id) {
  const { rows } = await pool.query(
    `SELECT ${OFFER_COLUMNS}
     FROM offers o
     JOIN agencies a ON a.id = o.agency_id
     JOIN destinations d ON d.id = o.destination_id
     WHERE o.id = $1`,
    [id]
  )
  return rows[0] || null
}

export async function listCurrentOffers (pool) {
  const { rows } = await pool.query(
    `SELECT ${OFFER_COLUMNS}
     FROM offers o
     JOIN agencies a ON a.id = o.agency_id
     JOIN destinations d ON d.id = o.destination_id
     WHERE o.end_date >= CURRENT_DATE
     ORDER BY o.start_date ASC, o.price_per_person ASC`
  )
  return rows
}

export async function listAllOffers (pool) {
  const { rows } = await pool.query(
    `SELECT ${OFFER_COLUMNS}
     FROM offers o
     JOIN agencies a ON a.id = o.agency_id
     JOIN destinations d ON d.id = o.destination_id
     ORDER BY o.start_date DESC`
  )
  return rows
}

export async function createOffer (pool, data) {
  const { rows } = await pool.query(
    `INSERT INTO offers
       (agency_id, destination_id, start_date, end_date, nights, price_per_person,
        currency, board_type, star_rating, capacity, image_url, external_link)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
     RETURNING *`,
    [
      data.agency_id, data.destination_id, data.start_date, data.end_date, data.nights,
      data.price_per_person, data.currency, data.board_type, data.star_rating ?? null,
      data.capacity, data.image_url ?? null, data.external_link
    ]
  )
  return rows[0]
}

export async function updateOffer (pool, id, data) {
  const { rows } = await pool.query(
    `UPDATE offers SET
       agency_id = $1, destination_id = $2, start_date = $3, end_date = $4, nights = $5,
       price_per_person = $6, currency = $7, board_type = $8, star_rating = $9,
       capacity = $10, image_url = $11, external_link = $12, updated_at = now()
     WHERE id = $13
     RETURNING *`,
    [
      data.agency_id, data.destination_id, data.start_date, data.end_date, data.nights,
      data.price_per_person, data.currency, data.board_type, data.star_rating ?? null,
      data.capacity, data.image_url ?? null, data.external_link, id
    ]
  )
  return rows[0]
}

export async function deleteOffer (pool, id) {
  const { rowCount } = await pool.query('DELETE FROM offers WHERE id = $1', [id])
  return rowCount > 0
}
