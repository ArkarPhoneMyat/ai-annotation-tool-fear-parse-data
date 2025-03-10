import RNFetchBlob from "rn-fetch-blob";
import { isAndroid } from "./Device";


export const saveLocalFile = (title: string, rowArr: any, name: string) => {
  const csvString = `${title}${rowArr}`;
  const time = Date.now()
  let dirs = isAndroid ? RNFetchBlob.fs.dirs.DownloadDir : RNFetchBlob.fs.dirs.DocumentDir
  const pathToWrite = `${dirs}/${time}${name}.csv`;
  // pathToWrite /storage/emulated/0/Download/data.csv
  RNFetchBlob
    .fs
    .writeFile(pathToWrite, csvString, 'utf8')
    .then(() => {
      console.log(`wrote file ${pathToWrite}`);
    })
    .catch(error => console.error(error));
}

export const handleSaveVideo = async (url: string) => {
  const time = Date.now()
  let dirs = isAndroid ? RNFetchBlob.fs.dirs.DownloadDir : RNFetchBlob.fs.dirs.DocumentDir
  const pathToWrite = `${dirs}/${time}annotated.mp4`;
  await RNFetchBlob.fs.createFile(pathToWrite, '', 'base64');
  //then you can copy it or move it like
  let _copy = await RNFetchBlob.fs.cp(`file://${url}`, pathToWrite);
}