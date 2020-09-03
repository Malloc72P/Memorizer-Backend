import * as serverSecretJson from "./serverSecret.json";

export class ServerSetting {
  public static readonly serverProtocol   = serverSecretJson.serverProtocol;
  public static readonly dbProtocol       = serverSecretJson.dbProtocol;

  public static readonly frontendDomain   = serverSecretJson.deploy_frontendDomain;
  public static readonly backendDomain    = serverSecretJson.deploy_backendDomain;
  public static readonly databaseDomain    = serverSecretJson.deploy_databaseDomain;

  public static readonly ngPort           = serverSecretJson.deploy_ngPort;
  public static readonly nestPort         = serverSecretJson.deploy_nestPort;
  public static readonly dbPort           = serverSecretJson.deploy_dbPort;

  public static readonly dbName           = serverSecretJson.dbName;
  public static readonly dbAccount        = serverSecretJson.dbAccount;

  public static readonly ngUrl            = ServerSetting.serverProtocol + ServerSetting.frontendDomain + ServerSetting.ngPort;
  public static readonly dbUrl            = ServerSetting.dbProtocol + ServerSetting.dbAccount + "@" + ServerSetting.databaseDomain + ServerSetting.dbPort + ServerSetting.dbName;
  public static readonly nestUrl          = ServerSetting.serverProtocol + ServerSetting.backendDomain + ServerSetting.nestPort;

  public static readonly googleCallbackURL      = ServerSetting.nestUrl + "/auth/google/callback";

  public static readonly discordClientId      = serverSecretJson.discordBot_clientId;
  public static readonly discordToken         = serverSecretJson.discordBot_token;

  public static readonly discordBotName         = serverSecretJson.discordBot_name;

  public static readonly ngRoutes = {
    "loginSuccess" : ServerSetting.ngUrl + "/login/success/",
    "loginFailure" : ServerSetting.ngUrl + "/login/failure"
  };

  public static readonly timerStepList:Array<number> = [
    10 *  60 * 1000,
    30 *  60 * 1000,
    60 *  60 * 1000,
    2  *  60 * 60 * 1000,
    4  *  60 * 60 * 1000,
    6  *  60 * 60 * 1000,
    12 *  60 * 60 * 1000,
    24 *  60 * 60 * 1000,
    2  *  24 * 60 * 60 * 1000,
    3  *  24 * 60 * 60 * 1000,
  ];
}
