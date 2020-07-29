import { Injectable } from '@nestjs/common';
import { ServerSetting } from '../../../Config/server-setting';
import * as Discord from 'discord.js';
import { DiscordUsersDaoService } from '../../DAO/discord-users-dao/discord-users-dao.service';
import { DiscordUsersDto } from '../../DTO/DiscordUsersDto/discord-users.dto';

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
  private discordChannel:Discord.DMChannel = null;
  private readonly discordChannelMap:Map<any, Discord.Channel> = null;

  private registerHelpMsg = `명령어 : !register [연동암호]\n설명 : 문제내주는 서비스와 현재 봇이 위치한 디코채널을 연동합니다`;
  private divider = `\n___________________\n`;
  private helpMsg = `메모라이저 사용법\n`;

  constructor(
    private discordUsersDao:DiscordUsersDaoService
  ){
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
      // await this.getDmChannel("310214901878489089");

    } catch (e) {
      console.log("DiscordSessionMgrService >> initDiscordBot >> e : ",e);
    }

  }
  async sendMsgWithIdToken(idToken, msg){
    try {
      let dmChannel:Discord.DMChannel = await this.getDmChannelByIdToken(idToken);
      if(!dmChannel){
        console.log("DiscordSessionMgrService >> sendMsgWithIdToken >> !dmChannel");
      }

      await dmChannel.send(msg);
    } catch (e) {
      console.log("DiscordSessionMgrService >> sendMsgWithIdToken >> e : ",e);
    }
  }
  async sendMsgWithDiscordId(discordId, msg){
    try {
      let dmChannel:Discord.DMChannel = await this.getDmChannelByDiscordId(discordId);
      if(!dmChannel){
        console.log("DiscordSessionMgrService >> sendMsgWithDiscordId >> !dmChannel");
      }

      await dmChannel.send(msg);
    } catch (e) {
      console.log("DiscordSessionMgrService >> sendMsgWithDiscordId >> e : ",e);
    }
  }
  async getDmChannelByIdToken(idToken) :Promise<Discord.DMChannel>{//메모라이저 IdToken으로 DM찾아주는 메서드
    try{
      let discordUserDto:DiscordUsersDto = await this.discordUsersDao.findOneByOwner(idToken);
      if(!discordUserDto){
        console.log("DiscordSessionMgrService >> getDmByIdToken >> no discordUserDto");
        return ;
      }
      return await this.getDmChannelByDiscordId(discordUserDto.discordUserId);
    }catch(e){
      console.log("DiscordSessionMgrService >> getDmByIdToken >> e : ",e);
    }
  }
  async getDmChannelByDiscordId(userId) :Promise<Discord.DMChannel>{
    let userInfo:Discord.User = await this.discordClient.users.fetch(userId);

    let dmChannel = userInfo.dmChannel;
    if(!dmChannel){
      dmChannel = await userInfo.createDM();
    }
    //프사 주소 : https://cdn.discordapp.com/avatars/310214901878489089/edae54344884ffd8059ac5e35d091e27.jpg
    //userId/avatar.jpg
    // this.discordChannel = dmChannel;
    // await this.discordChannel.send("testing");
    return dmChannel;
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
  async onErrorHandler(msg:Discord.Message, errMsg?){
    let replyMsg = (errMsg) ? errMsg : `에러가 발생했습니다.\n 다시 시도해주세요`;
    await msg.reply(replyMsg);
  }
  //DM채널에서 디코봇한테 계정연동을 요청하는 경우를 처리함
  async onRegisterCommand(msg:Discord.Message, botCommand:BotCommand){
    if (botCommand.params.length < 1) {
      this.onUndefinedRequest(msg, '');
      return ;
    }
    try {
      let discordUserDto:DiscordUsersDto = null;//해당 개체에 저장된 디코유저를 DB에 저장하거나, 이 개체를 통해 디코유저정보를 불러옴
      let discordUserId = msg.author.id;
      let activationKey = botCommand.params[0];

      discordUserDto = await this.discordUsersDao.findOneByDiscordId(discordUserId);

      if(discordUserDto && discordUserDto.isAvail){
        //이미 연동된 경우
        await this.onErrorHandler(msg, `이미 연동된 계정입니다`);
        return ;
      } else if(discordUserDto && !discordUserDto.isAvail){
        //연동시도를 해서 데이터는 있으나 활성화는 안된상태
        if(activationKey !== discordUserDto.activationKey){
          //연동암호가 바뀌었다면 업데이트해준다
          discordUserDto.activationKey = activationKey;
          await this.discordUsersDao.update(discordUserDto._id, discordUserDto);
        }
      } else {
        console.log('DiscordSessionMgrService >> onRegisterCommand >> 연동요청이 없었던 경우');
        //연동요청이 없었던 경우엔 discordUserDto 생성
        let newDiscordUserDto: DiscordUsersDto = new DiscordUsersDto();
        newDiscordUserDto.isAvail = false;
        newDiscordUserDto.owner = null;//아직 연동된게 아니므로 일단 null값으로  초기화함
        //향후 웹앱에서 연동해서 해당 필드도 채우고 isAvail값도 true로 바꿀 수 있음.
        newDiscordUserDto.discordUserId = discordUserId;
        newDiscordUserDto.activationKey = activationKey;

        discordUserDto = await this.discordUsersDao.create(newDiscordUserDto);
      }
      if(!discordUserDto){
        //에러발생
        this.onErrorHandler(msg);
        return ;
      }
      console.log("DiscordSessionMgrService >> onRegisterCommand >> discordUserDto : ",discordUserDto);
      // console.log(`DiscordSessionMgrService >> onRegisterCommand >> userName : ${msg.author.username}#${msg.author.discriminator}`);
      let replyMsg =  `연동요청이 접수되었습니다\n${ServerSetting.ngUrl} 에 접속하고 로그인하신 다음,`
                    + ` 입력하신 연동암호를 입력해주세요\n입력하신 연동암호 : ${discordUserDto.activationKey}`;

      console.log("DiscordSessionMgrService >> onRegisterCommand >> discordUserDto : ", discordUserDto);

      await msg.reply(replyMsg);
    } catch (e) {
      console.log("DiscordSessionMgrService >> onRegisterCommand >> e : ",e);
    }
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
