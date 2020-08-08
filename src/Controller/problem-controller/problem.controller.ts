import { Body, Controller, Delete, Get, HttpStatus, Patch, Post, Query, Req, Res, UseGuards } from '@nestjs/common';
import { ProblemDaoService } from '../../Model/DAO/Problem-dao/Problem-dao.service';
import { UserDaoService } from '../../Model/DAO/user-dao/user-dao.service';
import { ErrorHandlerService } from '../../Model/error-handler/error-handler.service';
import { AuthGuard } from '@nestjs/passport';
import { ProblemDto } from '../../Model/DTO/ProblemDto/Problem.dto';
import { UserDto } from '../../Model/DTO/UserDto/user-dto';
import { SectionDaoService } from '../../Model/DAO/section-dao/section-dao.service';
import { SectionDto } from '../../Model/DTO/SectionDto/section.dto';
import { ProblemSessionMgrService } from '../../Model/session-manager/problem-session-mgr/problem-session-mgr.service';

@Controller('problem')
export class ProblemController {
  constructor(
    private sectionDao:SectionDaoService,
    private problemDao:ProblemDaoService,
    private userDao:UserDaoService,
    private problemSessionMgr:ProblemSessionMgrService,
    private errorHandlerService:ErrorHandlerService,
  ){
  }

  @Get()
  @UseGuards(AuthGuard('jwt'))
  async getProblemList(@Req() req, @Res() res, @Query() param)
  {
    try { //idToken 획득
      let thirdPartId = req.user;

      let sectionId = param.sectionId;
      let problemTitle = param.problemTitle;
      let problemQuestion = param.problemQuestion;

      //섹션ID를 안가져왔으면 수행 안함
      //검색기능이 붙으면서 수행하게 됨
      // if(!sectionId){
      //   this.errorHandlerService.onBadRequestState(res, "!sectionId");
      //   return;
      // }
      // let sectionDto:SectionDto = await this.sectionDao.findOne(sectionId);
      // //해당 섹션 소유자가 맞는지 검사
      //이 검사도 통합해서 수행하기 위해 주석처리됨
      // if(sectionDto.owner !== thirdPartId){
      //   this.errorHandlerService.onForbiddenRequest(res, "sectionDto.owner !== thirdPartId");
      //   return;
      // }

      //sectionId로 문제목록 가져오기
      let problemList: Array<ProblemDto> = await this.problemDao.findAllByParam(thirdPartId, sectionId, problemTitle, problemQuestion);

      //ProblemList 응답하기.
      res.status(HttpStatus.CREATED).send(problemList);
    } catch (e) {
      console.log("ProblemController >> getProblemList >> e : ",e);
      this.errorHandlerService.onErrorState(res, e);
    }
  }



  @Post()
  @UseGuards(AuthGuard('jwt'))
  async saveProblem(@Req() req, @Res() res, @Body() problemDto:ProblemDto)
  {
    try { //idToken 획득
      let thirdPartId = req.user;

      //ProblemDto 검사
      if(!this.isValidProblemDto(problemDto)){
        this.errorHandlerService.onErrorState(res, "isValidProblemDto");
        return ;
      }

      //Problem 생성 후, 생성된 개체 응답하기
      problemDto.owner = thirdPartId;
      problemDto.createdDate = new Date();

      problemDto.questionedCount = 0;
      problemDto.incorrectCount = 0;
      problemDto.correctCount = 0;

      problemDto.currQuestionStep = 0;
      problemDto.recentlyQuestionedDate = new Date();

      let createdProblem:ProblemDto = await this.problemDao.create(problemDto);
      this.problemSessionMgr.problemSessionMgrEventEmitter
        .emit("problem-created", createdProblem);

      res.status(HttpStatus.CREATED).send(createdProblem);
    } catch (e) {
      console.log("ProblemController >> saveProblemList >> e : ",e);
      this.errorHandlerService.onErrorState(res, e);
    }
  }
  @Patch()
  @UseGuards(AuthGuard('jwt'))
  async updateProblem(@Req() req, @Res() res, @Body() problemDto:ProblemDto)
  {
    try { //idToken 획득
      let thirdPartId = req.user;

      //ProblemDto 검사
      if(!this.isValidProblemDto(problemDto)){
        this.errorHandlerService.onErrorState(res,  "isValidProblemDto");
        return ;
      }
      //권한 검사
      if(!await this.isValidAccess(thirdPartId, problemDto)){
        this.errorHandlerService.onForbiddenRequest(res, "isValidAccess");
        return ;
      }

      //Problem 업데이트 후, 반영된 개체 응답하기
      let foundProblemDto:ProblemDto = await this.problemDao.findOne(problemDto._id);
      //해당 api는 제목, 지문, 해답, 현재 출제간격레벨만 수정가능
      foundProblemDto.title = problemDto.title;
      foundProblemDto.question = problemDto.question;
      foundProblemDto.answer = problemDto.answer;
      foundProblemDto.currQuestionStep = problemDto.currQuestionStep;
      let updatedProblem:ProblemDto = await this.problemDao.update(foundProblemDto._id, foundProblemDto);

      this.problemSessionMgr.problemSessionMgrEventEmitter
        .emit("problem-updated", problemDto);

      res.status(HttpStatus.CREATED).send(updatedProblem);
    } catch (e) {
      console.log("ProblemController >> updateProblemList >> e : ",e);
      this.errorHandlerService.onErrorState(res, e);
    }
  }
  @Patch("increaseCorrectCount")
  @UseGuards(AuthGuard('jwt'))
  async increaseCorrectCount(@Req() req, @Res() res, @Body() problemDto:ProblemDto)
  {
    try { //idToken 획득
      let thirdPartId = req.user;

      //ProblemDto 검사
      if(!this.isValidProblemDto(problemDto)){
        this.errorHandlerService.onErrorState(res,  "isValidProblemDto");
        return ;
      }
      //권한 검사
      if(!await this.isValidAccess(thirdPartId, problemDto)){
        this.errorHandlerService.onForbiddenRequest(res, "isValidAccess");
        return ;
      }

      //Problem 업데이트 후, 반영된 개체 응답하기
      let foundProblemDto:ProblemDto = await this.problemDao.findOne(problemDto._id);
      //해당 api는 correctCound를 1만큼 증가시키는것만 가능
      foundProblemDto.correctCount++;
      foundProblemDto.questionedCount++;
      foundProblemDto.recentlyQuestionedDate = new Date();
      foundProblemDto.currQuestionStep++;
      await this.problemDao.update(foundProblemDto._id, foundProblemDto);
      foundProblemDto = await this.problemDao.findOne(problemDto._id);

      this.problemSessionMgr.problemSessionMgrEventEmitter
        .emit("problem-updated", foundProblemDto);
      res.status(HttpStatus.CREATED).send(foundProblemDto);
      await this.problemSessionMgr.startProblemInstance(foundProblemDto);
    } catch (e) {
      console.log("ProblemController >> increaseCorrectCount >> e : ",e);
      this.errorHandlerService.onErrorState(res, e);
    }
  }
  @Patch("increaseIncorrectCount")
  @UseGuards(AuthGuard('jwt'))
  async increaseIncorrectCount(@Req() req, @Res() res, @Body() problemDto:ProblemDto)
  {
    try { //idToken 획득
      let thirdPartId = req.user;

      //ProblemDto 검사
      if(!this.isValidProblemDto(problemDto)){
        this.errorHandlerService.onErrorState(res,  "isValidProblemDto");
        return ;
      }
      //권한 검사
      if(!await this.isValidAccess(thirdPartId, problemDto)){
        this.errorHandlerService.onForbiddenRequest(res, "isValidAccess");
        return ;
      }

      //Problem 업데이트 후, 반영된 개체 응답하기
      let foundProblemDto:ProblemDto = await this.problemDao.findOne(problemDto._id);
      //해당 api는 incorrectCount를 1만큼 증가시키는것만 가능
      foundProblemDto.incorrectCount++;
      foundProblemDto.questionedCount++;
      foundProblemDto.recentlyQuestionedDate = new Date();
      if(foundProblemDto.currQuestionStep > 0){
        foundProblemDto.currQuestionStep--;
      }
      await this.problemDao.update(foundProblemDto._id, foundProblemDto);
      foundProblemDto = await this.problemDao.findOne(problemDto._id);

      this.problemSessionMgr.problemSessionMgrEventEmitter
        .emit("problem-updated", foundProblemDto);
      res.status(HttpStatus.CREATED).send(foundProblemDto);
      await this.problemSessionMgr.startProblemInstance(foundProblemDto);
    } catch (e) {
      console.log("ProblemController >> increaseCorrectCount >> e : ",e);
      this.errorHandlerService.onErrorState(res, e);
    }
  }
  @Delete()
  @UseGuards(AuthGuard('jwt'))
  async deleteProblem(@Req() req, @Res() res, @Body() problemDto:ProblemDto)
  {
    try { //idToken 획득
      let thirdPartId = req.user;

      //권한 검사
      if(!await this.isValidAccess(thirdPartId, problemDto)){
        this.errorHandlerService.onForbiddenRequest(res, "isValidAccess");
        return;
      }

      //Problem 삭제 후 성공메세지 응답
      await this.problemDao.deleteOne(problemDto._id);
      problemDto._id = problemDto._id.toString();

      this.problemSessionMgr.problemSessionMgrEventEmitter
        .emit("problem-deleted", problemDto);
      res.status(HttpStatus.CREATED).send();
    } catch (e) {
      console.log("ProblemController >> deleteProblemList >> e : ",e);
      this.errorHandlerService.onErrorState(res, e);
    }
  }

  isValidProblemDto(ProblemDto:ProblemDto) :boolean{
    if(!ProblemDto){
      return false;
    }
    else if(!ProblemDto.title){
      return false;
    }
    return true
  }
  private async isValidAccess(idToken, problemDto:ProblemDto){
    //수행하기에 권한이 충분한지 검사하는 메서드
    //여기선 수정,삭제하려는 섹션의 소유자가 요청자와 동일한지 검사함.
    try {
      let userDto:UserDto = await this.userDao.findOne(idToken);
      let foundProblemDto:ProblemDto = await this.problemDao.findOne(problemDto._id);
      //요청자의 idToken이 찾은 섹션의 소유자와 같은지를 반환함.
      return userDto.idToken === foundProblemDto.owner;
    }catch (e) {
      console.log("ProblemController >> isValidAccess >> e : ",e);
    }
  }

}
