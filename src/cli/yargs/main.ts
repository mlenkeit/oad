import yargs from 'yargs'
import downloadCommand from './command/download'

export default (args: readonly string[]) => {
  const argv = yargs(args)
    .command(downloadCommand())
    .argv
  
  console.log(argv)
}