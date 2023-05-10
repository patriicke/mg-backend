export const removeSpecialCharacters = (string: string) => {
  return string.replace(/[&\/\\#,+()$~%.'":*?<>{}]/g, '');
};

export const getKeyFromVal = (obj, val) =>
  Object.keys(obj).find((k) => obj[k] === val);

export const containsDuplicates = (array) => {
  if (array.length !== new Set(array).size) {
    return true;
  }
  return false;
};

export const padTo2Digits = (num) => {
  return num.toString().padStart(2, '0');
};

export const convertMsToHM = (milliseconds) => {
  let seconds = Math.floor(milliseconds / 1000);
  let minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  seconds = seconds % 60;
  minutes = seconds >= 30 ? minutes + 1 : minutes;
  minutes = minutes % 60;

  return `${padTo2Digits(hours)}H ${padTo2Digits(minutes)}M`;
};

export const roundOff = (roundingNumber: any, place: number): number => {
  return Math.trunc(roundingNumber * Math.pow(10, place)) / Math.pow(10, place);
};

export const getAcronym = (words: string): string => {
  const splitted = words.trim().split(' ');
  if (!splitted[1]) {
    return words;
  }
  return splitted.map((word) => word.charAt(0).toUpperCase()).join('');
};
