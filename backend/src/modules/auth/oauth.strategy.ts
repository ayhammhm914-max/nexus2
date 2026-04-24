import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as DiscordStrategy } from "passport-discord";
import { env } from "../../config/env";

export const configureOAuthStrategies = () => {
  if (env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET && env.GOOGLE_CALLBACK_URL) {
    passport.use(
      new GoogleStrategy(
        {
          clientID: env.GOOGLE_CLIENT_ID,
          clientSecret: env.GOOGLE_CLIENT_SECRET,
          callbackURL: env.GOOGLE_CALLBACK_URL
        },
        (_accessToken, _refreshToken, _profile, done) => done(null, false)
      )
    );
  }

  if (env.DISCORD_CLIENT_ID && env.DISCORD_CLIENT_SECRET && env.DISCORD_CALLBACK_URL) {
    passport.use(
      new DiscordStrategy(
        {
          clientID: env.DISCORD_CLIENT_ID,
          clientSecret: env.DISCORD_CLIENT_SECRET,
          callbackURL: env.DISCORD_CALLBACK_URL,
          scope: ["identify", "email"]
        },
        (_accessToken, _refreshToken, _profile, done) => done(null, false)
      )
    );
  }
};
