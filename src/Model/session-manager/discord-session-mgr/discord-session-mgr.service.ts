import { Injectable } from '@nestjs/common';
import { ServerSetting } from '../../../Config/server-setting';
import * as Discord from "discord.js";
class BotCommand {
  public command;
  public params:Array<string> = new Array<string>();

  constructor(command, params: Array<string>) {
    this.command = command;
    this.params = params;
  }
}
@Injectable()
export class DiscordSessionMgrService {
  private readonly discordClient:Discord.Client = null;
  private discordChannel:Discord.TextChannel = null;
  private readonly discordChannelMap:Map<any, Discord.Channel> = null;

  private registerHelpMsg = `명령어 : !register [연동암호]\n설명 : 문제내주는 서비스와 현재 봇이 위치한 디코채널을 연동합니다`;
  private divider = `\n___________________\n`;
  private helpMsg = `메모라이저 사용법\n`;

  constructor(){
    //discord 클라이언트 생성
    console.log("DiscordSessionMgrService >> constructor >> 진입함");
    this.discordClient = new Discord.Client();
    this.discordChannelMap = new Map<any, Discord.Channel>();
    this.initDiscordBot().then(()=>{});
  }
  async initDiscordBot(){
    console.log("DiscordSessionMgrService >> initDiscordBot >> 진입함");

    this.helpMsg += this.registerHelpMsg += this.divider;
    if(!this.isAvail()){
      return;
    }
    try {
      this.onReady();
      this.onMsg();
      await this.onLogin();
      await this.getParticipatingChannels();

    } catch (e) {
      console.log("DiscordSessionMgrService >> initDiscordBot >> e : ",e);
    }

  }
  async getParticipatingChannels(){
    // 테스트 채널아이디 "422998508295946262"
    let channelId = "422998508295946262";
    let userId = "310214901878489089";
    let foundChannel:Discord.TextChannel = await this.discordClient.channels.fetch(channelId) as Discord.TextChannel;
    console.log("DiscordSessionMgrService >> getParticipatingChannels >> foundChannel : ",foundChannel);
    let userInfo:Discord.User = await this.discordClient.users.fetch(userId);
    console.log("DiscordSessionMgrService >> getParticipatingChannels >> userInfo : ",userInfo);
    //프사 주소 : https://cdn.discordapp.com/avatars/310214901878489089/edae54344884ffd8059ac5e35d091e27.jpg
    //userId/avatar.jpg
    this.discordChannel = foundChannel;
  }
  async onLogin(){
    console.log("DiscordSessionMgrService >> onLogin >> 메모라이저 디코봇 로그인 시도중...");
    await this.discordClient.login(ServerSetting.discordToken);
    console.log("DiscordSessionMgrService >> onLogin >> 메모라이저 디코봇 로그인 완료");
    console.log("DiscordSessionMgrService >> onLogin >> 메모라이저 디코봇 작업 시작");
  }
  onReady(){
    console.log("DiscordSessionMgrService >> onReady >> 진입함");
    this.discordClient.on("ready", ()=>{
      console.log("DiscordSessionMgrService >> onReady >> 메모라이저 디코봇 상태변경 >>> ready");
    });
  }
  onMsg(){
    console.log("DiscordSessionMgrService >> onMsg >> 진입함");
    this.discordClient.on("message", (msg:Discord.Message)=>{
      let botCommand:BotCommand = this.msgParser(msg);
      if(botCommand === null){
        return;
      }
      switch (botCommand.command) {
        case "register" :
          this.onRegisterCommand(msg, botCommand).then(()=>{});
          break;
        default :
          this.onUndefinedRequest(msg).then(()=>{});
      }

    });
  }
  msgParser(msg:Discord.Message){
    let splitedCommand = msg.content.split(' ');
    if(splitedCommand.length < 1){
      return null;
    }
    let flag = splitedCommand[0].charAt(0);
    if(flag !== '!'){
      return null;
    }
    let command = splitedCommand[0].slice(1, splitedCommand[0].length);
    return new BotCommand(command, splitedCommand.slice(1, splitedCommand.length));
  }
  //디코 명령 컨트롤러
  async onUndefinedRequest(msg:Discord.Message, customReplyMsg?){
    console.log("DiscordSessionMgrService >> onUndefinedRequest >> 진입함");
    console.log("DiscordSessionMgrService >> onUndefinedRequest >> customReplyMsg : ",customReplyMsg);
    console.log("DiscordSessionMgrService >> onUndefinedRequest >> msg : ",msg);
    let replyMsg = (customReplyMsg) ? customReplyMsg : this.helpMsg;
    await msg.reply(replyMsg);
  }
  async onRegisterCommand(msg:Discord.Message, botCommand:BotCommand){
    if(botCommand.params.length < 1){
      this.onUndefinedRequest(msg, "");
    }
    console.log(`DiscordSessionMgrService >> onRegisterCommand >> userName : ${msg.author.username}#${msg.author.discriminator}`);
    let replyMsg = `연동요청이 접수되었습니다\n${ServerSetting.ngUrl} 에 접속하고 로그인하신 다음, 입력하신 연동암호를 입력해주세요\n입력하신 연동암호 : ${botCommand.params[0]}`;
    await msg.reply(replyMsg);
  }
  isAvail(){
    console.log("DiscordSessionMgrService >> isAvail >> 진입함");
    if(!this.discordClient){
      console.log("DiscordSessionMgrService >> isAvail >> 에러 발생");
      return false;
    }
    return true
  }
}
