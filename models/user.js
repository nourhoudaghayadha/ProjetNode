const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        
    },
  
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        default:'user',
    },

});
const SALT_ROUNDS = 12;

userSchema.pre('save', async function(next){
    const user = this;
    if(user.isModified('password')){
        user.password = await bcrypt.hash(user.password, SALT_ROUNDS);
    }
    next();
})
// Fonction pour vérifier si l'utilisateur est un administrateur
/*userSchema.methods.isAdmin = function() {
    return this.userType === 'administrateur';
};

const User = mongoose.model('user', userSchema);*/

const User = mongoose.model('User',userSchema)
module.exports=User;