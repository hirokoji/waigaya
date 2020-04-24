import * as fs from "fs";

export class RepositoryJson{

    private readonly jsonFilePath: string ;

    constructor( jsonFilePath:string ) {
        this.jsonFilePath = jsonFilePath;
    }

    load(): object | undefined{

        let rawData;
        try{
            rawData = fs.readFileSync(this.jsonFilePath, 'utf8');
        } catch (e) {
            // Show error if the error is without ENOENT (No such file or directory)
            if(e.code !== 'ENOENT'){
                console.log(e);
            }
        }
        if(rawData){
            const json = JSON.parse(rawData);
            return json;
        } else {
            return undefined;
        }
    }

    save(key:string, json:object):void{

        const lastData = this.load();

        if(lastData){
            const newData = {...lastData, [key]:json};
            fs.writeFileSync(this.jsonFilePath, JSON.stringify(newData));
        }else{
            fs.writeFileSync(this.jsonFilePath, JSON.stringify({[key]:json}));
        }
    }

}