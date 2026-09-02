// Fade cover images in once they actually decode. Covers snap in hard
// otherwise (the photo host is slow), which reads as a jarring change.
// Handles both paths: a ref callback catches images already cached/complete
// on mount, onLoad catches the ones that arrive over the network.
function set (img) {
  if (img) img.setAttribute('data-loaded', 'true')
}

export function markImgLoaded (img) {
  if (img && img.complete) set(img)
}

export function onImgLoad (e) {
  set(e.currentTarget)
}
