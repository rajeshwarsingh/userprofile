const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt-nodejs');
const userSchema = require("./schemas")

const login = (req, res) => {

    //validation
    const errors = validatePrms(["email", "password"], req.body); //checked for required field

    if (errors.length > 0) {
        return res.status(400).send(errors);
    }

    // Get the User information from email id
    const userDtlsP = new Promise((resolve, reject) => {
        getUserDtls(resolve, reject, {
            email: req.body.email
        })
    })

    userDtlsP.then((data) => {

        if (data && data.email && data.password) {

            bcrypt.compare(req.body.password, data.password, function(err, isMatch) {

                if (isMatch) {
                    const token = generateToken(data.toJSON());
                    if (data.password) data.password = undefined //removed  passward it's sensitive
                    return res.status(200).send({
                        token: token,
                        userinfo: data
                    })
                } else {
                    return res.status(400).send([{
                        msg: "email or password incorrect"
                    }]);
                }
            });
        } else {

            return res.status(400).send([{
                msg: "email or password incorrect"
            }]);
        }
    })

    userDtlsP.catch((reason) => {
        return res.status(400).send([{
            msg: "email or password incorrect"
        }]);
    })

}

const signup = (req, res) => {

    const errors = validatePrms(["name", "email", "image", "password"], req.body); //checked for required field

    if (req.body.email) {
        isValidEmail(req.body.email) ? "" : (errors.push([{
            "msg": "invalid eamil Id!"
        }]));
    }

    if (errors.length > 0) {
        return res.status(400).send(errors);
    }
    //validate already exist user
    const isEmailExistP = new Promise((resolve, reject) => {
        getUserDtls(resolve, reject, {
            email: req.body.email
        })
    })

    // already exist throw error
    isEmailExistP.then((data) => {
        res.status(400).send([{
            "msg": "Eamil Id already exist!"
        }])
    })

    //new user
    isEmailExistP.catch((reason) => {

        let userData = {
            "name": req.body.name,
            "email": req.body.email,
            "image": req.body.image,
            "password": req.body.password
        }

        let userModel = new userSchema.userModel(userData);

        userModel.save((err, udata) => {
            if (err) return res.status(400).send([{
                msg: "opps!, your registartion is unsuccesssful!"
            }]);

            const token = generateToken(udata.toJSON());

            return res.status(200).send({
                token: token,
                msg: "congratulations, you are successfully registed!"
            })
        })
    })
}

const getUserInfo = (req, res) => {
    //There is other authentication method but here i am using JWT token
    const token = req.headers['x-access-token'];

    if (!token) return res.status(403).send([{
        "msg": "unauthorized!"
    }]);

    //validate user token
    const tokenResP = new Promise((resolve, reject) => {
        ValidateToken(resolve, reject, token);
    });

    tokenResP.then((tokenRes) => {

        const userDtlsPromise = new Promise((resolve, reject) => {
            getUserDtls(resolve, reject, tokenRes.userinfo);
        })

        userDtlsPromise.then((userDtls) => {
            if (userDtls.password) userDtls.password = undefined //removed  passward it's sensitive
            if (userDtls) return res.status(200).send(userDtls)
        })

        userDtlsPromise.catch((reason) => {
            return res.status(400).send([{
                msg: "user not found!"
            }])
        });
    })

    tokenResP.catch((reasonTokenExp) => {
        return res.status(403).send(reasonTokenExp);
    })
}

const validatePrms = (prams, reqbody) => {

    let errors = [];

    prams.forEach((item) => {
        (reqbody && reqbody[item]) ? "" : errors.push([{
            "msg": item + " can't be null"
        }])
    })

    return errors;

}

const generateToken = (authData) => {
    let token = jwt.sign(authData, "shhh", {
        expiresIn: 604800 // expires in 1 week
    });
    return token
}

const ValidateToken = (resolve, reject, token) => {
    // verifies secret and checks exp
    jwt.verify(token, "shhh", function(err, decoded) {
        if (err) {
            return reject([{
                "msg": "token has been expired !"
            }]);
        } else {

            return resolve({
                userinfo: {
                    email: decoded.email,
                    password: decoded.password
                }
            });
        }
    });
}

const getUserDtls = (resolve, reject, query) => {
    userSchema.userModel.findOne(query, {
        "__v": 0,
    }, (err, data) => {
        if (data) {
            return resolve(data);
        } else {
            return reject(false);
        }
    })
}

const isValidEmail = (email) => {
    const pattern = /^\w+@[a-zA-Z_]+?\.[a-zA-Z]{2,3}$/;
    return pattern.test(email)
}

module.exports = {
    login,
    signup,
    getUserInfo
}
