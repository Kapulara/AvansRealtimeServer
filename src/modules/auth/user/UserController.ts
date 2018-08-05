import { Authenticated, BodyParams, Controller, Get, Post, Req } from 'ts-express-decorators';
import { UserService } from './UserService';


@Controller('/user')
export class UserController {

  constructor(
    private UserService: UserService
  ) {

  }

  @Authenticated()
  @Post('/')
  public async createUser(
    @BodyParams() bodyParams
  ) {
    return {
      err: false,
      data: await this.UserService.create(bodyParams)
    };
  }

  @Post('/authorize')
  public async authorize(
    @BodyParams('email') email: string,
    @BodyParams('password') password: string
  ) {
    return {
      err: false,
      data: await this.UserService.validate(email, password)
    };
  }

  @Get('/whoAmI')
  @Authenticated()
  public async whoAmI(
    @Req() req
  ) {
    const user = req.user;

    return {
      err: false,
      data: {
        _id: user._id,
        email: user.email,
        token: user.token,
        streamerMode: user.streamerMode,
        info: {
          firstName: user.firstName,
          lastName: user.lastName,
          fromEmail: user.fromEmail
        }
      }
    };
  }
}
