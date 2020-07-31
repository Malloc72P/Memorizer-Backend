import { Injectable } from '@nestjs/common';
import * as krDiscordReplyMsg from '../discord-utility/discord-msg/discord-reply-msg.kr.json';
import { DiscordMsg } from '../discord-utility/discord-msg/discord-msg';
import * as Discord from "discord.js"
export enum DiscordReplyMsgEnum {
  requestWhoAmI               = "requestWhoAmI",
  requestRegister             = "requestRegister",
  prepareTest                 = "prepareTest",
  onRegisterSuccess           = "onRegisterSuccess",
  requestHelp                 = "requestHelp",
  onError                     = "onError",
  onInvalidRequest            = "onInvalidRequest",
  alreadyLinkedAccount        = "alreadyLinkedAccount",
  notYetLinked                = "notYetLinked",
  resignedMemorizerAccount    = "resignedMemorizerAccount",
}
@Injectable()
export class DiscordReplyMsgMgrService {
  private kr:Map<DiscordReplyMsgEnum,DiscordMsg> = new Map<DiscordReplyMsgEnum,DiscordMsg>();
  constructor(){
    for(let discordMsg of krDiscordReplyMsg.msgList){
      this.kr.set(DiscordReplyMsgEnum[discordMsg.command],
        new DiscordMsg(discordMsg.title, discordMsg.description, discordMsg.embedFields, discordMsg.color));
    }
    console.log("DiscordReplyMsgMgrService >> constructor >> kr : ",this.kr);
  }
  getKrReplyMsg(command:DiscordReplyMsgEnum) : DiscordMsg{
    let discordMsg:DiscordMsg = new DiscordMsg();
    discordMsg.embedFields = new Array<Discord.EmbedField>();

    let originMsg:DiscordMsg = this.kr.get(command);
    discordMsg.title = originMsg.title.slice();
    discordMsg.description = originMsg.description.slice();
    discordMsg.color = originMsg.color.slice();
    for (let embedField of originMsg.embedFields){
      discordMsg.embedFields.push({name : embedField.name.slice(), value : embedField.value.slice(), inline : embedField.inline});
    }
    return discordMsg
  }
}
