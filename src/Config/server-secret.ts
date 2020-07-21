import * as serverSecretJson from "./serverSecret.json";

export class ServerSecret {
  public static readonly secretOrKey   = serverSecretJson.secretOrKey;

  public static readonly google_clientID      = serverSecretJson.google_clientID;
  public static readonly google_clientSecret  = serverSecretJson.google_clientSecret;
}
