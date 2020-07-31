import * as serverSecretJson from "./serverSecret.json";

export class ServerSetting {
  public static readonly serverProtocol   = serverSecretJson.serverProtocol;
  public static readonly dbProtocol       = serverSecretJson.dbProtocol;

  public static readonly frontendDomain   = serverSecretJson.frontendDomain;
  public static readonly backendDomain    = serverSecretJson.backendDomain;
  public static readonly databaseDomain    = serverSecretJson.databaseDomain;

  public static readonly ngPort           = serverSecretJson.ngPort;
  public static readonly nestPort         = serverSecretJson.nestPort;
  public static readonly dbPort           = serverSecretJson.dbPort;

  public static readonly dbName           = serverSecretJson.dbName;

  public static readonly ngUrl            = ServerSetting.serverProtocol + ServerSetting.frontendDomain + ServerSetting.ngPort;
  public static readonly dbUrl            = ServerSetting.dbProtocol + ServerSetting.databaseDomain + ServerSetting.dbPort + ServerSetting.dbName;
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
    10 * 60 * 10,
    60 * 60 * 10,
    3 * 60 * 60 * 10,
    6 * 60 * 60 * 10,
    24 * 60 * 60 * 10,
    2 * 24 * 60 * 60 * 10,
    3 * 24 * 60 * 60 * 10,
    4 * 24 * 60 * 60 * 10,
    5 * 24 * 60 * 60 * 10,
    6 * 24 * 60 * 60 * 10,
  ];
}
