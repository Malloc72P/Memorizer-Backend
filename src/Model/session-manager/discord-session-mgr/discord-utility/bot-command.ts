export class BotCommand {
  public command;
  public params:Array<string> = new Array<string>();

  constructor(command, params: Array<string>) {
    this.command = command;
    this.params = params;
  }
}
