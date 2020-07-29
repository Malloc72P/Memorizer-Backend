import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from "mongoose";
import { DiscordUsersDto } from '../../DTO/DiscordUsersDto/discord-users.dto';
import { DiscordUsersDtoIntf } from '../../DTO/DiscordUsersDto/discord-users-dto-intf.interface';

@Injectable()
export class DiscordUsersDaoService {
  constructor(
    @InjectModel('DISCORD_USERS_MODEL') private readonly discordUsersModel: Model<DiscordUsersDtoIntf>) {}

  async create(discordUsersDto: DiscordUsersDto): Promise<any> {
    const createdDiscordUser = new this.discordUsersModel(discordUsersDto);
    return createdDiscordUser.save();
  }

  async findAll(): Promise<DiscordUsersDtoIntf[]> {
    return await this.discordUsersModel.find().exec();
  }

  async findAllByOwner(ownerIdToken): Promise<DiscordUsersDtoIntf[]> {
    return await this.discordUsersModel.find({ owner : ownerIdToken }).exec();
  }
  //유저 아이디토큰으로 DiscordUserDto하나를 찾음
  async findOneByOwner(ownerIdToken): Promise<DiscordUsersDtoIntf> {
    return await this.discordUsersModel.findOne({ owner : ownerIdToken }).exec();
  }
  //디코 아이디로 DiscordUserDto하나를 찾음
  async findOneByDiscordId(discordId): Promise<DiscordUsersDtoIntf> {
    return await this.discordUsersModel.findOne({ discordUserId: discordId }).exec();
  }

  async findOne(id): Promise<any> {
    return await this.discordUsersModel.findOne({ _id: id }).exec();
  }
  async update(_id, discordUserDto:DiscordUsersDto): Promise<any> {
    return await this.discordUsersModel.updateOne({_id : _id}, discordUserDto).exec();
  }
  async deleteOne(id): Promise<any>{
    return await this.discordUsersModel.deleteOne({_id : id}).exec();
  }
}
