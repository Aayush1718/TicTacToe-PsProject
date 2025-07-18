import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const UserSchema = new mongoose.Schema({

    userName:{
        type : String ,
        required : [true , "This field is required"] ,
    },
    email: {
        type : String,
        required : [true , "This field is required"] ,
    },
    password: {
        type: String,
        required : [true , "This field is required"] ,
    },
    gamesWon: { type: Number, default: 0 }
}, { timestamps: true })

UserSchema.pre('save', async function(next){
    if(!this.isModified("password")){
        return next();
    }
    this.password=await bcrypt.hash(this.password,10);
    next()
})

UserSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password)
}

UserSchema.methods.generateJWT = function () {
  return jwt.sign(
    { id: this._id, email: this.email },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );
};

export const User = mongoose.model("User" , UserSchema);