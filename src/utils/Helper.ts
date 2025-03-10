
export const capitalize = (s: string) => {
  if (typeof s !== 'string') return ''
  return s.charAt(0).toUpperCase() + s.slice(1)
}
export const validateEmail = (emailTest: any) => {
  if (!emailTest.length) {
    return false
  }
  const re = /^(([^<>()[]\.,;:\s@"]+(.[^<>()[]\.,;:\s@"]+)*)|(".+"))@(([[0-9]{1,3}.[0-9]{1,3}.[0-9]{1,3}.[0-9]{1,3}])|(([a-zA-Z-0-9]+.)+[a-zA-Z]{2,}))$/
  return re.test(String(emailTest).toLowerCase())
}
export const secondsToStringTime = (seconds: number) => {
  return new Date(seconds * 1000).toISOString().substr(11, 8).split(':')
}
export const setValue = (value: any) =>
  JSON.stringify(value, (k, v) => (v === undefined ? null : v));

export const getValue = (value: any) => JSON.parse(value);

export const cutFrame = (value: string) => {
  if (!value) {
    return ''
  }
  return value?.split("=")[1]?.trim();
}

export const round = (value: number, precision: number) => {
  const multiplier = Math.pow(10, precision || 0);
  return Math.round(value * multiplier) / multiplier;
}

export const extractString = (str: any, start: string, end: string) => {
  const startIndex = str.indexOf(start);
  const endIndex = str.indexOf(end, startIndex);
  if (startIndex != -1 && endIndex != -1 && endIndex > startIndex)
    return str.substring(startIndex, endIndex);
}

export const getSecondTime = (time: string) => {
  const a = time.split(':');
  const seconds: number = (+a[0]) * 60 * 60 + (+a[1]) * 60 + (+a[2]);
  return seconds;
}
export const createRandumFileName = (min: number = 100, max: number = 999) => {
  return Math.floor(Math.random() * (max + 1 - min)) + min;
};
export const extractExtension = (file: string) => {
  const parseFileName = file.split('.');
  return parseFileName[parseFileName.length - 1];
};
export const createNewFilePath = (path: string) => {
  const parsePath = path.split('/');
  const fileName = parsePath[parsePath.length - 1];
  parsePath[
    parsePath.length - 1
  ] = `${createRandumFileName()}.${extractExtension(fileName)}`;
  return parsePath.join('/')
}
export const formatKeyPoints = (temp: any[], duration: number) => {
  const keyPoints = temp.map((item: any) => {
    const strArr = Object.values(item['keypoints']).map((ite: any) => {
      return `${ite["x"]},${ite["y"]},${ite['score']}`
    })
    return `\n${duration * 1000},${strArr}\n`
  }).flat()
  return keyPoints
}