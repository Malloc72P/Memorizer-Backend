import { Module } from '@nestjs/common';

import { MongooseModule } from '@nestjs/mongoose';
import { ServerSetting } from '../../Config/server-setting';
import { UsersSchema } from '../DTO/UserDto/user.schema';
import { SectionSchema } from '../DTO/SectionDto/section.schema';
import { ProblemSchema } from '../DTO/ProblemDto/problem.schema';
import { DiscordUsersSchema } from '../DTO/DiscordUsersDto/discord-users.schema';
import { UserDaoService } from './user-dao/user-dao.service';
import { SectionDaoService } from './section-dao/section-dao.service';
import { ProblemDaoService } from './problem-dao/problem-dao.service';
import { DiscordUsersDaoService } from './discord-users-dao/discord-users-dao.service';

@Module({
  imports: [
    MongooseModule.forRoot(ServerSetting.dbUrl,
      {
        useNewUrlParser: true,
        useUnifiedTopology : true,
      }),
    MongooseModule.forFeature(
      [
        {
          name: "USERS_MODEL",
          schema: UsersSchema
        },
        {
          name: "SECTION_MODEL",
          schema: SectionSchema
        },
        {
          name: "PROBLEM_MODEL",
          schema: ProblemSchema
        },
        {
          name: "DISCORD_USERS_MODEL",
          schema: DiscordUsersSchema
        },
      ]),
  ],
  providers : [
    /* *************************************************** */
    /* Data Access Object START */
    /* *************************************************** */
    UserDaoService,
    SectionDaoService,
    ProblemDaoService,
    DiscordUsersDaoService,
  ],
  exports : [
    UserDaoService,
    SectionDaoService,
    ProblemDaoService,
    DiscordUsersDaoService,
  ],
})
export class DaoModule {}
