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
  private async sendMsg(discordChannel:Discord.TextChannel, discordMsg:DiscordMsg) :Promise<Discord.Message>{
    return  await discordChannel.send(this.buildEmbedMsg(discordMsg));
  }
  private async sendTextMsg(dmChannel:Discord.DMChannel, discordMsg:DiscordMsg){
    let textMessage = `${discordMsg.title}\n${discordMsg.description}\n`;
    for(let currEmbedField of discordMsg.embedFields){
      textMessage += `${currEmbedField.name} : ${currEmbedField.value}\n`;
    }
    textMessage = "\n" + textMessage + "\n";
    await dmChannel.send(textMessage);
  }

  public async sendMsgWithIdToken(idToken, discordMsg:DiscordMsg) : Promise<Discord.Message>{
    try {
      let discordChannel:Discord.TextChannel = await this.getTextChannelByIdToken(idToken);
      if(!discordChannel){
        console.log("DiscordSessionMgrService >> sendMsgWithIdToken >> !discordChannel");
      }
      return await this.sendMsg(discordChannel, discordMsg);
    } catch (e) {
      console.log("DiscordSessionMgrService >> sendMsgWithIdToken >> e : ",e);
    }
  }
  public async sendMsgWithChannelId(channelId, discordMsg:DiscordMsg) : Promise<Discord.Message>{
    try {
      let textChannel:Discord.TextChannel = await this.getTextChannelByChannelId(channelId);
      if(!textChannel){
        console.log("DiscordSessionMgrService >> sendMsgWithDiscordId >> !dmChannel");
      }
      return await this.sendMsg(textChannel, discordMsg);
    } catch (e) {
      console.log("DiscordSessionMgrService >> sendMsgWithDiscordId >> e : ",e);
      console.log("DiscordMsgSenderService >> sendMsgWithDiscordId >> this.buildEmbedMsg(discordMsg) : ",this.buildEmbedMsg(discordMsg));
    }
  }
  public async sendTextWithIdToken(idToken, discordMsg:DiscordMsg){
    try {
      let dmChannel:Discord.DMChannel = await this.getDmChannelByIdToken(idToken);
      if(!dmChannel){
        console.log("DiscordSessionMgrService >> sendMsgWithIdToken >> !dmChannel");
      }
      await this.sendTextMsg(dmChannel, discordMsg);
    } catch (e) {
      console.log("DiscordSessionMgrService >> sendMsgWithIdToken >> e : ",e);
    }
  }

  public async sendTextMsgWithDiscordId(discordId, discordMsg:DiscordMsg){
    try {
      let dmChannel:Discord.DMChannel = await this.getDmChannelByDiscordId(discordId);
      if(!dmChannel){
        console.log("DiscordSessionMgrService >> sendTextMsgWithDiscordId >> !dmChannel");
      }
      await this.sendTextMsg(dmChannel, discordMsg);
    } catch (e) {
      console.log("DiscordSessionMgrService >> sendTextMsgWithDiscordId >> e : ",e);
      console.log("DiscordMsgSenderService >> sendTextMsgWithDiscordId >> this.buildEmbedMsg(discordMsg) : ",this.buildEmbedMsg(discordMsg));
    }
  }
  //메모라이저 IdToken으로 DM찾아주는 메서드
  private async getDmChannelByIdToken(idToken) :Promise<Discord.DMChannel>{
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
  //메모라이저 IdToken으로 TextChannel을 찾아주는 메서드
  private async getTextChannelByIdToken(idToken) :Promise<Discord.TextChannel>{
    try{
      let discordUserDto:DiscordUsersDto = await this.discordUsersDao.findOneByOwner(idToken);
      if(!discordUserDto){
        return ;
      }
      return await this.getTextChannelByChannelId(discordUserDto.channelId);
    }catch(e){
      console.log("DiscordSessionMgrService >> getTextChannelByIdToken >> e : ",e);
    }
  }
  private async getTextChannelByChannelId(channelId) :Promise<Discord.TextChannel>{
    try {
      let discordChannel: Discord.TextChannel = await this.discordClient.channels.fetch(channelId) as Discord.TextChannel;

      if (!discordChannel) {
        return;
      }
      return discordChannel;
    } catch (e) {
      console.log("DiscordSessionMgrService >> getTextChannelByChannelId >> e : ",e);
    }
  }
  buildEmbedMsg(discordMsg:DiscordMsg) : Discord.MessageEmbed{
    let newEmbedMsg:Discord.MessageEmbed = new Discord.MessageEmbed();
    newEmbedMsg.setColor(discordMsg.color)
      .setTitle(discordMsg.title)
      .setAuthor(ServerSetting.discordBotName,
        this.botInfo.avatarURL(), ServerSetting.ngUrl,)
      .setDescription(discordMsg.description)
      .addFields(discordMsg.embedFields)
      .setTimestamp()
      .setFooter('developed by scra1028');

    if(discordMsg.link){
      newEmbedMsg.setURL(discordMsg.link);
    }else {
      newEmbedMsg.setURL(ServerSetting.ngUrl);
    }
    return newEmbedMsg;
  }
  buildEmbedField(name, value, inline) : Discord.EmbedField{
    return {name : name, value : value,  inline : inline};
  }
}
