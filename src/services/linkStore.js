const links = {};

export function save(code, url) {
  links[code] = url;
}

export function findByCode(code) {
  return links[code] ?? null;
}

export function hasCode(code) {
  return code in links;
}
