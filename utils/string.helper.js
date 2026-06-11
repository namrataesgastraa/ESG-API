const normalizeName = (str) => {
  if (!str) return '';
  return str.toLowerCase().replace(/\s+/g, '');
};

module.exports = {
  normalizeName
};