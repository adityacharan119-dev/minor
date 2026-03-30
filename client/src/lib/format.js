export const formatCurrency = (value) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value);

export const formatOptionLabel = (value = '') =>
  String(value)
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (character) => character.toUpperCase());

export const formatSelectedOptions = (selectedOptions = {}, fallback = {}) => {
  const optionEntries = Object.entries(
    Object.keys(selectedOptions || {}).length ? selectedOptions : fallback,
  ).filter(([, value]) => value);

  return optionEntries.map(([key, value]) => `${formatOptionLabel(key)}: ${value}`).join(' • ');
};
