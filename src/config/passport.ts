import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/User';

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      callbackURL: '/auth/google/callback',
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findOne({ googleId: profile.id });

        if (user) {
          return done(undefined, user);
        }

        user = new User({
          fullName: profile.displayName,
          email: profile.emails?.[0].value,
          googleId: profile.id,
          isVerified: true,
        });

        await user.save();
        done(undefined, user);
      } catch (error) {
        done(error, undefined);
      }
    }
  )
);

// Serialize and deserialize user
passport.serializeUser((user: any, done) => {
  done(undefined, user.id);
});

passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await User.findById(id);
    done(undefined, user);
  } catch (error) {
    done(error, undefined);
  }
});
