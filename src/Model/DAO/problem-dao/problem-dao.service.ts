import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from "mongoose";

import { ProblemDtoIntf } from '../../DTO/ProblemDto/problem-dto-intf.interface';
import { ProblemDto } from '../../DTO/ProblemDto/problem.dto';

@Injectable()
export class ProblemDaoService {
  constructor(
    @InjectModel('PROBLEM_MODEL') private readonly problemModel: Model<ProblemDtoIntf>) {}

  async create(createProblemDto: ProblemDto): Promise<any> {
    const createdSection = new this.problemModel(createProblemDto);
    return createdSection.save();
  }

  async findAll(): Promise<ProblemDtoIntf[]> {
    return await this.problemModel.find().exec();
  }

  async findAllByOwner(ownerIdToken): Promise<ProblemDtoIntf[]> {
    return await this.problemModel.find({ owner : ownerIdToken }).exec();
  }
  async findAllBySection(sectionId): Promise<ProblemDtoIntf[]> {
    return await this.problemModel.find({ belongingSectionId : sectionId }).exec();
  }
  async findAllByParam(userIdToken, sectionId, problemTitle, problemQuestion): Promise<ProblemDtoIntf[]> {
    let query = { "owner" : userIdToken };
    if (sectionId && !this.isEmptyString(sectionId)) {
      query['belongingSectionId'] = sectionId;
    }
    if (problemTitle && !this.isEmptyString(problemTitle)) {
      query['title'] = { $regex : `.*${problemTitle}.*` };
    }
    if (problemQuestion && !this.isEmptyString(problemQuestion)) {
      query['question'] = { $regex : `.*${problemQuestion}.*` };
    }

    return await this.problemModel.find(query).exec();
  }
  isEmptyString(str){
    if(str === ""){
      return true
    }
    else return false;
  }


  async findOne(id): Promise<any> {
    return await this.problemModel.findOne({ _id: id })
      .exec();
  }
  async update(_id, problemDto:ProblemDto): Promise<any> {
    return await this.problemModel.updateOne({_id : _id}, problemDto).exec();
  }
  async deleteOne(id): Promise<any>{
    return await this.problemModel.deleteOne({_id : id}).exec();
  }
}
