// Seeded offers have no real photos yet (image_url is null in the DB).
// Fall back to a relevant, reliable destination photo (see destinationPhoto),
// keyed by the destination name so the same place always shows the same image.
import { destinationPhoto } from './destinationPhoto.js'

export function offerImageUrl (offer) {
  if (offer.image_url) return offer.image_url
  return destinationPhoto(offer.destination_name, 800, 600)
}
