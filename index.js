if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

admin_name='admin';
admin_email='admin@gmail.com';
admin_password='Admin123_';

const path = require('path');

const express = require('express');

const sequelize = require('./config/database');

const bodyParser = require('body-parser');

const passport = require('passport');

const bcrypt = require('bcryptjs');
const multer = require('multer');

const postRoutes = require('./routes/post');
const userRoutes = require('./routes/user');
const authRoutes = require('./routes/auth');

const User = require('./models/user');
const Post = require('./models/post');
const Role = require('./models/role');
const Hashtag = require('./models/hashtag');

const roles = require('./enums/role.enum');
const status = require('./enums/user-status.enum');

const app = express();

const port = process.env.PORT || 3000;

const uuidv4 = require('uuid/v4')

app.use(passport.initialize());
app.use(passport.session());

require('./config/passport')(passport, User);

const imageStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'images');
    },

    filename: function(req, file, cb) {
        let extension = file.originalname.split('.').pop();         
        cb(null, uuidv4() + '.' + extension);
    }
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg' ) {
        cb(null, true);
    } else {
        cb(null, false);
    }
};

app.use(bodyParser.json({limit: '10mb'}));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(multer({
     limits: {fieldSize: 5 * 1024 * 1024 },
     storage: imageStorage,
     fileFilter: fileFilter
}).single('image'));

app.use(express.static(path.join(__dirname, 'public')));
app.use('images', express.static(path.join(__dirname, 'images')));

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', process.env.ANGULAR);
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.header('Access-Control-Allow-Methods', 'GET, PATCH, PUT, POST, DELETE, OPTIONS');
    next();
});

app.use(postRoutes);
app.use(userRoutes);
app.use(authRoutes);

Post.belongsTo(User, {constraints: true, onDelete: 'CASCADE'});
User.hasMany(Post);
Post.belongsTo(Hashtag);
Hashtag.hasMany(Post);
Role.belongsTo(User, { foreignKey: 'id' })


sequelize   
    .sync()
    .then(result => {
        return User.findOne({ where: {name: 'admin'}});
    })
    .then(user => {
        if(!user){
            const admin = new User({
                name: admin_name,
                email: admin_email,
                password: admin_password
            });
            bcrypt.genSalt(10, (err, salt) => {
                bcrypt.hash(admin.password, salt, (err, hash) => {
                    admin.password = hash;
                    User.create({
                        name: admin.name,
                        email: admin.email,
                        status: status.ACTIVATED,
                        password: admin.password
                    }).then(user => {
                        Role.create({
                            id: user.dataValues.id,
                            role: roles.ADMIN
                          })
                          .then()
                          .catch();
                    }).catch();
                });
            });
        }
        app.listen(port);
    })
    .catch();