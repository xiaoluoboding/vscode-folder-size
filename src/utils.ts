export const getHumanReadableSizeObject = (bytes: number) => {
  if (bytes === 0) {
    return {
      size: 0,
      measure: 'Bytes'
    };
  }

  const K = 1024;
  const MEASURE = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  const i = Math.floor(Math.log(bytes) / Math.log(K));

  return {
    size: parseFloat((bytes / Math.pow(K, i)).toFixed(2)),
    measure: MEASURE[i]
  };
};

export const getHumanReadableSize = (size: number) => {
  if (!size) return '';

  const t = getHumanReadableSizeObject(size);

  return t.size + ' ' + t.measure;
};
