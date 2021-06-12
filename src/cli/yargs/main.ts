import yargs from 'yargs'

import downloadCommand from './command/download'
import testCommand from './command/test'

export default (args: readonly string[]) => {
  yargs(args)
    .command(downloadCommand())
    .command(testCommand())
    .argv
}