import * as Discord from "discord.js";
import { BotCommand } from './bot-command';

export class MsgParser {
  public static parseMsg(msg:Discord.Message): BotCommand{
    let splitedCommand = msg.content.split(' ');
    if(splitedCommand.length < 1){
      return null;
    }
    let flag = splitedCommand[0].charAt(0);
    if(flag !== '!'){
      return null;
    }
    let command = splitedCommand[0].slice(1, splitedCommand[0].length).toLowerCase();
    return new BotCommand(command, splitedCommand.slice(1, splitedCommand.length));
  }

}
