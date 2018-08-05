import { All, Authenticated, Controller, Get, RouteService } from 'ts-express-decorators';
import { $log } from 'ts-log-debug';

@Controller('')
export class RestController {

  constructor(
    private RouteService: RouteService
  ) {}

  @All('/')
  @Authenticated()
  public all() {
    $log.debug('Route ALL /rest');
    return {}
  }

  @Get('/')
  @Authenticated()
  public getRoutes(): any {
    return this.RouteService.getAll();
  }
}
