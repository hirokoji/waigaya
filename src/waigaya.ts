import {Cli} from "./Cli";

const rootDirPath = __dirname + '/../';
const cli = new Cli( rootDirPath + 'db/members.json',rootDirPath + 'db/history.json');
cli.cli(process.argv);
