const passport = require("passport")
const LocalStrategy = require("passport-local").Strategy
const GoogleStrategy = require("passport-google-oauth20").Strategy
const { compareSync } = require("bcrypt")
const User = require("../models/User")
const FacebookStrategy = require("passport-facebook").Strategy

// //normal login
passport.use(
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password" 
    },
    async (email, password, done) => {
      try {
        const user = await User.findOne({ email })
        if (!user){
          return done(null, false, { message: "incorrect username" })
        }
        if (!compareSync(password, user.password)){
          return done(null, false, { message: "Incorrect password" })
        }
        done(null, user)
      } catch (error) {
        done(error)
      }
}))




// //facebook
passport.use(new FacebookStrategy (
  {
  clientID:process.env.FACEBOOK_ID,
  clientSecret:process.env.FACEBOOK_SECRET,
  callbackURL:"http://localhost:3000/auth/facebook/callback",
  profileFields:["id", "email", "gender", "link", "name", "photos"]
  }, 
  async (accountToken, refreshToken, profile, done)=>{
  const user = await User.findOne({facebookID : profile.id})
  // console.log(profile)
  if(!user){
    const user = await User.create({
      facebookID : profile.id,
      email : profile.emails[0].value,
    })
    done(null, user)
  }
  done(null, user)
}))

//google
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_ID,
      clientSecret: process.env.GOOGLE_SECRET,
      callbackURL: "/auth/google/callback"
    },
    async (accessToken, refreshToken, profile, done) => {
      console.log("PROFILE: ", profile)
      const user = await User.findOne({ googleID: profile.id })
      if (!user) {
        const user = await User.create({
          email: profile.emails[0].value,
          googleID: profile.id,
          photo: profile.photos[0].value
        })
        done(null, user)
      }
      done(null, user)
    }
  )
)



passport.serializeUser((user, done)=>{
  done(null, user._id)
})

passport.deserializeUser(async(id, done)=>{
  try{
    const user = await User.findById(id)
    done(null, user)
  }catch(error){
    done(error)
  }
})

module.exports = passport