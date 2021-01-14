const mongoose = require('mongoose');
const bcrypt = require('bcrypt-nodejs');

let UserSchema;
UserSchema = new mongoose.Schema({
    name: String,
    username: {type: String, required: true, index: {unique: true}},
    password: {type: String, required: true, select: false}
});

 //hash password
UserSchema.pre('save', function(next){
    let user = this;

    //hash the password only if password is changed or user is new
    if (!user.isModified('password')) return next();

    //generate hash
    bcrypt.hash(user.password,null,null, function(err,hash){
        if (err) return next(err);

        user.password = hash;
        next();
    })
});

UserSchema.methods.comparePassword = function (password){
    let user = this;
    return bcrypt.compareSync(password, user.password);
}

module.exports = mongoose.model('User', UserSchema);