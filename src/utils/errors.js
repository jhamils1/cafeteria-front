export function getApiErrorMessage(error, fallback = 'Ocurrio un error inesperado') {
  if (!error) {
    return fallback;
  }

  const data = error.response?.data;

  if (typeof data === 'string') {
    return data;
  }

  if (data && typeof data === 'object') {
    const [firstKey] = Object.keys(data);
    const firstValue = data[firstKey];

    if (Array.isArray(firstValue)) {
      return firstValue.join(', ');
    }

    if (typeof firstValue === 'string') {
      return firstValue;
    }
  }

  return error.message || fallback;
}
