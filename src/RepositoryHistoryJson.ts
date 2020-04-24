import { Pair} from "./team";
import * as fs from "fs";

type item = {
    [key: string]: Pair
}

export type History = {
    history: item
}


export class RepositoryHistoryJson{
    private readonly historyFilePath: string;
    
    constructor(historyFilePath: string) {
        this.historyFilePath = historyFilePath;
    }

    load(): History | undefined{

        let rawData;
        try{
            rawData = fs.readFileSync(this.historyFilePath, 'utf8');
        } catch (e) {
            // Show error if the error is without ENOENT (No such file or directory)
            if(e.code !== 'ENOENT'){
                console.log(e);
            }
        }

        if(rawData){
            const json = JSON.parse(rawData);
            for(const key of Object.keys(json.history)){
                json.history[key].lastDate = new Date(Date.parse(json.history[key].lastDate));
            }
            return json;
        } else {
            return undefined;
        }
    }

    save(pair:Pair){

        const lastData = this.load() as History;

        if(lastData){
            const newData = {...lastData};
            newData.history[pair.id] = pair;
            fs.writeFileSync(this.historyFilePath, JSON.stringify(newData));

        } else{
            const data = { history: { [pair.id]: pair } };
            fs.writeFileSync(this.historyFilePath, JSON.stringify(data));
        }

    }

}