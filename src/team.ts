import {History} from "./RepositoryHistoryJson";

export type Member = {
    name: string,
    id: string,
    status: 'active' | 'inactive'
}

export type Pair = {
    1: Member['name'],
    2: Member['name'],
    id: string
    lastDate?: Date;
}

export type Option = {
    filter: 'activeMembers'
}

export class Team{

    private readonly _members:Member[];

    constructor(members: Member[]) {
        this._members = members;
    }

    get members(){
        return this._members;
    }

    get activeMembers(){
        return this.members.filter((member) => member.status === 'active');
    }

    pairList = async (options?:Option):Promise<Pair[]> => {

        let members:Member[];
        if(options){
            switch (options.filter) {
                case "activeMembers":
                    members = [...this.activeMembers];
                    break;
            }
        }else{
            members = [...this._members];
        }

        const tmpMembers = [...members];
        const pairs: Pair[] = [];

        for (let i = 0; this.members.length > i; i++) {
            tmpMembers.shift();
            for(const tmpMember of tmpMembers){
                const pair = this.makePairObject(this.members[i].name, tmpMember.name);
                pairs.push(pair);
            }
        }
        return pairs;
    };

    makePair = async(history?:History):Promise<Pair[]> => {

        const activePairs = await this.pairList({filter:"activeMembers"});

        if(history){
            console.log('Making pair with history...');
            this.setDateFromHistory(activePairs, history);
            activePairs.sort((a, b) => {
                if(a.lastDate === undefined) return 1;
                else if(b.lastDate === undefined) return 1;
                else {
                    return a.lastDate.getMilliseconds() - b.lastDate.getMilliseconds();
                }
            })
            const result = this.pickSequentialPairs(activePairs);
            return result;

        }else {
            const result = await this.pickRandomPairs(activePairs);
            return result;
        }
    }

    private setDateFromHistory(activePairs: Pair[], history: History) {
        activePairs.forEach(pair => {
            if (history.history[pair.id]?.lastDate) {
                pair.lastDate = history.history[pair.id].lastDate;
            } else {
                // add minimum Date value
                pair.lastDate = new Date(-8640000000000000);
            }
        });
    }

    private pickSequentialPairs(activePairs: Pair[]) {

        const pairs: Pair[] = [];
        let remainPairs = [...activePairs]

        while (remainPairs.length > 0){

            const pickedPair = remainPairs[0];
            remainPairs = remainPairs.filter((remainPair) =>
                pickedPair["1"] !== remainPair["1"] && pickedPair["1"] !== remainPair["2"] && pickedPair["2"] !== remainPair["1"] && pickedPair["2"] !== remainPair["2"]
            );

            pairs.push(pickedPair);
        }
        return pairs;
    }

    private async pickRandomPairs(originalPairs: Pair[]): Promise<Pair[]> {

        const result: Pair[] = [];
        let remainPairs = [...originalPairs]

        while(remainPairs.length > 0) {
            const pickedPair = await this.pickRandomPair(remainPairs);
            result.push(pickedPair.pickedPair);
            remainPairs = pickedPair.remainPairs;
        }

        return result;

    }

    private async pickRandomPair(pairs: Pair[]) {
        const pickedNumber = this.getRandomNumber(pairs.length);
        const remainPairs = pairs.filter((pair) =>
        pairs[pickedNumber]["1"] !==  pair["1"] && pairs[pickedNumber]["1"] !==  pair["2"] && pairs[pickedNumber]["2"] !==  pair["1"] && pairs[pickedNumber]["2"] !==  pair["2"]
        );
        return {pickedPair: pairs[pickedNumber], remainPairs: remainPairs};
    }

    private async pickMember(members: Member[]) {
        const pickedNumber = this.getRandomNumber(members.length);
        const remainMembers = members.filter((member) => member.id !== members[pickedNumber].id);

        return {pickedMember: members[pickedNumber], remainMembers: remainMembers};
    }

    private makePairObject = (member1:string, member2: string): Pair => {
        return {'1': member1, '2': member2, id: this.joinWithoutSpace(member1, member2)};
    }

    private joinWithoutSpace = (word1: string, word2: string): string => {
        return `${word1.replace(" ","")}${word2.replace(" ","")}`
    }

    private getRandomNumber = (max:number) :number => {
        return Math.floor(Math.random() * Math.floor(max));
    };

}