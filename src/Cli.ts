import { Team, Member } from './team';
import { RepositoryHistoryJson } from './RepositoryHistoryJson';
import * as readline from 'readline';
import { program }from 'commander';
import {RepositoryJson} from "./RepositoryJson";

export class Cli{
    private team: Team;
    private repo: RepositoryHistoryJson;
    private memberRepo: RepositoryJson;

    constructor(memberDBFilePath: string, historyDBFilePath: string) {

        this.memberRepo = new RepositoryJson(memberDBFilePath);
        this.team = new Team(this.getMemberList());
        this.repo = new RepositoryHistoryJson(historyDBFilePath)

    }

    public cli = async (argv: any) => {

        program
            .command('member')
            .description('member operation')
            .option('-a, --add', 'Add member', false)
            .option('-l, --list', 'List members', false)
            .action(async (cmd) => {
                if(cmd.add){ await this.addMember(); }
                if(cmd.list){ await this.displayMembers(); }
            });

        program
            .command('pair')
            .description('pair operation')
            .option('-h, --history', 'History', false)
            .option('-m, --make', 'Make pair from team members', false)
            .action(async (cmd) => {

                await this.validateMemberNum(2, `To use pair command. please add more than two members`);
                if(cmd.history){ await this.displayPairHistory(); }
                if(cmd.make){ await this.makePair(); }
            });

        program.parse(argv);

    };

    private displayMembers = async (): Promise<void> => {

        console.log('Members:')
        this.team.members.forEach((member) => {
            console.log(`     ${member.name}, ${member.status}`);
        })

    }

    private displayPairHistory = async (): Promise<void> => {

        const pairList = await this.team.pairList();
        const data = this.repo.load();

        console.log('');
        console.log(`Pair History:`);

        pairList.forEach((pair, index) => {
            if(data?.history[pair.id]) {
                pair.lastDate = data?.history[pair.id].lastDate
            } else{
                pair.lastDate = new Date(-8640000000000000);
            }
        });

        pairList.sort((a, b) => {
            if(a.lastDate === undefined) {return 1;}
            else if(b.lastDate === undefined) {return 1;}
            else {
                return b.lastDate.getMilliseconds() - a.lastDate.getMilliseconds();
            }
        });

        pairList.forEach((pair, index) => {
            if (pair.lastDate?.getMilliseconds() === new Date(-8640000000000000).getMilliseconds()) {
                console.log(`     ${index + 1}: ${pair['1']}, ${pair['2']} , None`);
            } else {
                console.log(`     ${index + 1}: ${pair['1']}, ${pair['2']} , ${pair.lastDate}`);
            }
        });
    }

    private makePair = async () => {

        const pairs = await this.team.makePair(this.repo.load());

        console.log('');
        console.log(`Today's pair:`);
        pairs.forEach((pair, index) => {
            console.log(`     ${index + 1}: ${pair['1']}, ${pair['2']}`);
            pair.lastDate = new Date();
        })

        console.log('');

        // Save repo if it's necessary.
        for(let i = 0; i < 5; i ++){
            const answer = await this.prompt(`Do you work with those pairs [y/n]? : `);

            if(answer === 'y' || answer === 'yes' || answer === 'Y' || answer === 'Yes'  ){

                pairs.forEach(pair => { this.repo.save(pair); });
                console.log('Saved paris on repo');
                break;

            } else if(answer === 'n' || answer === 'no' || answer === 'N' || answer === 'No'  ) {
                console.log(`Didn't save pairs on history`);
                break;
            } else{
                console.log(`Please type 'yes' or 'no' `);
            }
        }
    };

    private addMember= async () => {

        const name = await this.prompt(`What's member's name ? : `) as string;
        const id = await this.prompt(`What's member's id? : `) as string;
        const status = await this.loopPrompt(`Do you work with those pairs [active/inactive]? : `, 3, ['active','inactive']) as string;
        if(status === 'active' ||  status === 'inactive'){
            const member: Member = {name ,id ,status };
            this.memberRepo.save(member.id, member);
            console.log('');
            console.log('Saved member on repo');
        } else{
            console.log('Please select suitable value');
        }
    };

    private getMemberList = ():Member[] => {

        const members = this.memberRepo.load() as {[key:string]:Member }
        const memberList: Member[] = [];

        if(members){

            for(const key of Object.keys(members)){
                memberList.push(members[key]);
            }
        }

        return memberList;
    };

    private prompt = async (question: string) => {

        const ask = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        return new Promise(resolve => {
            ask.question(question, (answer) => {
                ask.close();
                resolve(answer);
            });
        });
    };

    private loopPrompt = async (question:string, challengeTimes:number, choices:string[]  ): Promise<string | undefined> => {

        let flag = false;
        let answer: string|undefined = undefined;
        for(let i = 0; i < challengeTimes; i ++){

            answer = await this.prompt(question) as string;
            choices.forEach((choice) => {
                if( answer === choice){
                    flag = true;
                }
            });

            if(flag){
                break;
            }
        }

        return answer;

    };


    private validateMemberNum = async(num:number, msg:string) => {

        if(this.getMemberList().length < num){
            console.log(msg);
            console.log("");
            process.exit(1);
        }


    };

}