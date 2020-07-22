import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from "mongoose";
import { SectionDtoIntf } from '../../DTO/SectionDto/section-dto-intf.interface';
import { SectionDto } from '../../DTO/SectionDto/section.dto';

@Injectable()
export class SectionDaoService {
  constructor(
    @InjectModel('SECTION_MODEL') private readonly sectionModel: Model<SectionDtoIntf>) {
  }

  async create(createSectionDto: SectionDto): Promise<any> {
    const createdSection = new this.sectionModel(createSectionDto);
    return createdSection.save();
  }

  async findAll(): Promise<SectionDtoIntf[]> {
    return await this.sectionModel.find().exec();
  }

  async findAllByOwner(ownerIdToken): Promise<SectionDtoIntf[]> {
    return await this.sectionModel.find({ owner : ownerIdToken }).exec();
  }

  async findOne(id): Promise<any> {
    return await this.sectionModel.findOne({ _id: id })
      .exec();
  }
  async update(_id, sectionDto:SectionDto): Promise<any> {
    return await this.sectionModel.updateOne({_id : _id}, sectionDto).exec();
  }
  async deleteOne(id): Promise<any>{
    return await this.sectionModel.deleteOne({_id : id}).exec();
  }


}
