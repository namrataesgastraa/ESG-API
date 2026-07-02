const normalizeName = (str) => {
  if (!str) return '';
  return str.toLowerCase().replace(/\s+/g, '');
};

// URL-friendly slug: lowercase, hyphen-separated, punctuation stripped.
// e.g. "What the Best Indian Companies Do Differently?" -> "what-the-best-indian-companies-do-differently"
const slugify = (str) => {
  if (!str) return '';
  return String(str)
    .toLowerCase()
    .trim()
    .replace(/['"`]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

module.exports = {
  normalizeName,
  slugify
};
