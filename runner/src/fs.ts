import fs from "fs"

interface File{
    type: "file" | "dir";
    name: string;
}

export const fetchDir = async (dir:string, baseDir:string) : Promise<File[]> => {
    return new Promise(async (resolve,reject) => {
        fs.readdir(dir, {withFileTypes:true}, (err, files) => {
            if(err){
                reject(err);
                return;
            }

            resolve(files.map(file => ({ type: file.isDirectory() ? "dir" : "file", name: file.name, path: `${baseDir}/${file.name}`  })));

        })
    })
}

export const saveFile = async (filePath:string, content:string) : Promise<void> => {
    return new Promise(async (resolve,reject) => {
        fs.writeFile(filePath, content, (err) => {
            if(err){
                reject(err);
                return;
            }

            resolve();
        })
    })
}

export const fetchFileContent = async (file:string) : Promise<string> => {
    return new Promise(async (resolve,reject) => {
        fs.readFile(file, "utf-8", (err, data) => {
            if(err){
                reject(err);
                return;
            }

            resolve(data);
        })
    })
}
