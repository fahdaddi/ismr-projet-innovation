const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/passportapp');
const bcrypt = require('bcryptjs');


// User Schema
const UserSchema = mongoose.Schema({
  username : {
    type: String
  },
  email : {
    type: String
  },
  password : {
    type: String
  }
});

const User = module.exports = mongoose.model('User', UserSchema);

module.exports.registerUser = (newUser,callback) =>{
  bcrypt.genSalt(10,(err,salt) =>{
    bcrypt.hash(newUser.password, salt,(err, hash)=>{
      if(err){
        console.log(err);
      }
      newUser.password = hash;
      newUser.save(callback);
    })
  })
}


module.exports.getUserByUsername = (username, callback)=>{
  const query = {username:username}
  User.findOne(query,callback);
}
module.exports.getUserById = (id, callback)=>{
  User.findById(id,callback);
}

module.exports.comparePassword =(clientpassword, hash , callback)=>{
  bcrypt.compare(clientpassword, hash , (err, isMatch)=>{
    if(err) throw err;
    callback(null, isMatch);
  });
}
