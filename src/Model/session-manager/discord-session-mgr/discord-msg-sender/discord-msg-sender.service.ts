import { Injectable } from '@nestjs/common';
import { DiscordUsersDaoService } from '../../../DAO/discord-users-dao/discord-users-dao.service';
import * as Discord from "discord.js";
import { DiscordUsersDto } from '../../../DTO/DiscordUsersDto/discord-users.dto';
import { ServerSetting } from '../../../../Config/server-setting';
import { DiscordMsg } from '../discord-utility/discord-msg/discord-msg';

//디스코드 봇으로 사용자에게 메세지를 보내는 역할을 담당하는 서비스
@Injectable()
export class DiscordMsgSenderService {
  private discordClient:Discord.Client = null;
  constructor(
    private discordUsersDao:DiscordUsersDaoService
  ){

  }
  private botInfo:Discord.User = null;
  initDiscordMsgSender(discordClient:Discord.Client, botInfo:Discord.User){
    this.discordClient = discordClient;
    this.botInfo = botInfo
  }

  public async replyMsg(msg:Discord.Message, discordMsg:DiscordMsg){
    await msg.reply(this.buildEmbedMsg(discordMsg));
  }
  private async sendMsg(dmChannel:Discord.DMChannel, discordMsg:DiscordMsg){
    await dmChannel.send(this.buildEmbedMsg(discordMsg));
  }
  public async sendMsgWithIdToken(idToken, discordMsg:DiscordMsg){
    try {
      let dmChannel:Discord.DMChannel = await this.getDmChannelByIdToken(idToken);
      if(!dmChannel){
        console.log("DiscordSessionMgrService >> sendMsgWithIdToken >> !dmChannel");
      }
      await this.sendMsg(dmChannel, discordMsg);
    } catch (e) {
      console.log("DiscordSessionMgrService >> sendMsgWithIdToken >> e : ",e);
    }
  }
  public async sendMsgWithDiscordId(discordId, discordMsg:DiscordMsg){
    try {
      let dmChannel:Discord.DMChannel = await this.getDmChannelByDiscordId(discordId);
      if(!dmChannel){
        console.log("DiscordSessionMgrService >> sendMsgWithDiscordId >> !dmChannel");
      }
      await this.sendMsg(dmChannel, discordMsg);
    } catch (e) {
      console.log("DiscordSessionMgrService >> sendMsgWithDiscordId >> e : ",e);
      console.log("DiscordMsgSenderService >> sendMsgWithDiscordId >> this.buildEmbedMsg(discordMsg) : ",this.buildEmbedMsg(discordMsg));
    }
  }
  private async getDmChannelByIdToken(idToken) :Promise<Discord.DMChannel>{//메모라이저 IdToken으로 DM찾아주는 메서드
    try{
      let discordUserDto:DiscordUsersDto = await this.discordUsersDao.findOneByOwner(idToken);
      if(!discordUserDto){
        return ;
      }
      return await this.getDmChannelByDiscordId(discordUserDto.discordUserId);
    }catch(e){
      console.log("DiscordSessionMgrService >> getDmByIdToken >> e : ",e);
    }
  }
  private async getDmChannelByDiscordId(userId) :Promise<Discord.DMChannel>{
    let userInfo:Discord.User = await this.discordClient.users.fetch(userId);

    let dmChannel = userInfo.dmChannel;
    if(!dmChannel){
      dmChannel = await userInfo.createDM();
    }
    return dmChannel;
  }
  buildEmbedMsg(discordMsg:DiscordMsg) : Discord.MessageEmbed{
    let newEmbedMsg:Discord.MessageEmbed = new Discord.MessageEmbed();
    newEmbedMsg.setColor(discordMsg.color)
      .setTitle(discordMsg.title)
      .setURL(ServerSetting.ngUrl)
      .setAuthor(ServerSetting.discordBotName,
        this.botInfo.avatarURL(), ServerSetting.ngUrl,)
      .setDescription(discordMsg.description)
      .addFields(discordMsg.embedFields)
      .setTimestamp()
      .setFooter('developed by scra1028');

    return newEmbedMsg;
  }
  buildEmbedField(name, value, inline) : Discord.EmbedField{
    return {name : name, value : value,  inline : inline};
  }
}
