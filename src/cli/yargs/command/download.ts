import * as yargs from 'yargs'

export default (): yargs.CommandModule => {
  return {
    command: 'download',
    describe: '',
    builder: yargs => yargs
      .commandDir('download', {
        extensions: ['ts'],
        visit: commandObject => commandObject.default()
      }),
    handler: async (argv: object) => {
    }
  }
}