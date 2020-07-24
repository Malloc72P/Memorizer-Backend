import { Body, Controller, Delete, Get, HttpStatus, Patch, Post, Query, Req, Res, UseGuards } from '@nestjs/common';
import { ProblemDaoService } from '../../Model/DAO/Problem-dao/Problem-dao.service';
import { UserDaoService } from '../../Model/DAO/user-dao/user-dao.service';
import { ErrorHandlerService } from '../../Model/error-handler/error-handler.service';
import { AuthGuard } from '@nestjs/passport';
import { ProblemDto } from '../../Model/DTO/ProblemDto/Problem.dto';
import { UserDto } from '../../Model/DTO/UserDto/user-dto';
import { SectionDaoService } from '../../Model/DAO/section-dao/section-dao.service';
import { SectionDto } from '../../Model/DTO/SectionDto/section.dto';

@Controller('problem')
export class ProblemController {
  constructor(
    private sectionDao:SectionDaoService,
    private problemDao:ProblemDaoService,
    private userDao:UserDaoService,
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

      //섹션ID를 안가져왔으면 수행 안함
      if(!sectionId){
        this.errorHandlerService.onBadRequestState(res);
        return;
      }
      let sectionDto:SectionDto = await this.sectionDao.findOne(sectionId);
      //해당 섹션 소유자가 맞는지 검사
      if(sectionDto.owner !== thirdPartId){
        this.errorHandlerService.onForbiddenRequest(res);
        return;
      }
      //sectionId로 문제목록 가져오기
      let problemList: Array<ProblemDto> = await this.problemDao.findAllBySection(sectionId);


      //ProblemList 응답하기.
      res.status(HttpStatus.CREATED).send(problemList);
    } catch (e) {
      console.log("ProblemController >> getProblemList >> e : ",e);
      this.errorHandlerService.onErrorState(res);
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
        this.errorHandlerService.onErrorState(res);
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
      res.status(HttpStatus.CREATED).send(createdProblem);
    } catch (e) {
      console.log("ProblemController >> saveProblemList >> e : ",e);
      this.errorHandlerService.onErrorState(res);
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
        this.errorHandlerService.onErrorState(res);
        return ;
      }
      //권한 검사
      if(!await this.isValidAccess(thirdPartId, problemDto)){
        this.errorHandlerService.onForbiddenRequest(res);
        return ;
      }

      //Problem 업데이트 후, 반영된 개체 응답하기
      let updatedProblem:ProblemDto = await this.problemDao.update(problemDto._id, problemDto);
      res.status(HttpStatus.CREATED).send(updatedProblem);
    } catch (e) {
      console.log("ProblemController >> updateProblemList >> e : ",e);
      this.errorHandlerService.onErrorState(res);
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
        this.errorHandlerService.onForbiddenRequest(res);
        return;
      }

      //Problem 삭제 후 성공메세지 응답
      await this.problemDao.deleteOne(problemDto._id);
      res.status(HttpStatus.CREATED).send();
    } catch (e) {
      console.log("ProblemController >> deleteProblemList >> e : ",e);
      this.errorHandlerService.onErrorState(res);
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
