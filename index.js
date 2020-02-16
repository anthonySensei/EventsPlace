const path = require('path');

const express = require('express');
const sequelize = require('./config/database');
const session = require('express-session');
const bodyParser = require('body-parser');
const passport = require('passport');
const passportJWT = require('passport-jwt');
const bcrypt = require('bcryptjs');
const multer = require('multer');


const postRoutes = require('./routes/post');
const userRoutes = require('./routes/user');

const User = require('./models/user');
const Post = require('./models/post');
const Role = require('./models/role');
const Hashtag = require('./models/hashtag');

const roles = require('./enums/role.enum');

const app = express();

const port = 3000;

const uuidv4 = require('uuid/v4')


app.use(passport.initialize());
app.use(passport.session());

require('./config/passport')(passport);

const imageStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'angular/src/assets/images');
    },
    filename: (req, file, cb) => {
        cb(null, uuidv4());
    }
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg' ) {
        cb(null, true);
    } else {
        cb(null, false);
    }
};

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(multer({storage: imageStorage, fileFilter: fileFilter}).single('image'));

app.use(express.static(path.join(__dirname, 'public')));
app.use('angular/src/assets/images', express.static(path.join(__dirname, 'angular/src/assets/images')));

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "http://localhost:4200"); // update to match the domain you will make the request from
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.use(postRoutes);
app.use(userRoutes);

Post.belongsTo(User, {constraints: true, onDelete: 'CASCADE'});
User.hasMany(Post);
Post.belongsTo(Hashtag);
Hashtag.hasMany(Post);
Role.belongsTo(User, { foreignKey: 'id' })


sequelize   
    .sync()
    .then(result => {
        console.log('Database connected!');
        return User.findOne({ where: {name: 'admin'}});
    })
    .then(user => {
        if(!user){
            const admin = new User({
                name: 'admin',
                email: 'admin',
                password: 'admin123'
            });
            bcrypt.genSalt(10, (err, salt) => {
                bcrypt.hash(admin.password, salt, (err, hash) => {
                    admin.password = hash;
                    User.create({
                        name: admin.name,
                        email: admin.email,
                        password: admin.password
                    }).then(user => {
                        Role.create({
                            id: user.dataValues.id,
                            role: roles.ADMIN
                          })
                          .then(result => {
                              console.log('Admin was successfully created!');
                          })
                          .catch(err => {
                              console.log(err.errors[0].message);
                          });
                    }).catch(err => {
                        console.log(err);
                    });
                });
            });
        }
        app.listen(port);
    })
    .catch(err => console.log(err));