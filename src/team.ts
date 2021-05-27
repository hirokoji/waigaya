import {History} from "./RepositoryHistoryJson";

export type Member = {
    name: string,
    id: string,
    status: 'active' | 'inactive'
}

export type Pair = {
    first: Member['name'],
    second: Member['name'],
    third?: Member['name'],
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

        } else {
            const result = await this.pickRandomPairs(activePairs);
            return result;
        }
    }

    makePairMob = async (history?:History) => {

        const pairs = await this.makePair(history);
        const assignedMemberNames:String[] = [];
        for(const pair of pairs){
            assignedMemberNames.push(pair['first']);
            assignedMemberNames.push(pair['second']);
        }

        const remainMember = this.members.filter((member) => assignedMemberNames.indexOf(member.name) == -1);
        if(remainMember[0]){
          pairs[pairs.length - 1]['third'] = remainMember[0].name;
        }
        return pairs;
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
                pickedPair["first"] !== remainPair["first"] && pickedPair["first"] !== remainPair["second"] && pickedPair["second"] !== remainPair["first"] && pickedPair["second"] !== remainPair["second"]
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
        pairs[pickedNumber]["first"] !==  pair["first"] && pairs[pickedNumber]["first"] !==  pair["second"] && pairs[pickedNumber]["second"] !==  pair["first"] && pairs[pickedNumber]["second"] !==  pair["second"]
        );
        return {pickedPair: pairs[pickedNumber], remainPairs: remainPairs};
    }

    private async pickMember(members: Member[]) {
        const pickedNumber = this.getRandomNumber(members.length);
        const remainMembers = members.filter((member) => member.id !== members[pickedNumber].id);

        return {pickedMember: members[pickedNumber], remainMembers: remainMembers};
    }

    private makePairObject = (member1:string, member2: string): Pair => {
        return {'first': member1, 'second': member2, id: this.joinWithoutSpace(member1, member2)};
    }

    private joinWithoutSpace = (word1: string, word2: string): string => {
        return `${word1.replace(" ","")}${word2.replace(" ","")}`
    }

    private getRandomNumber = (max:number) :number => {
        return Math.floor(Math.random() * Math.floor(max));
    };

}