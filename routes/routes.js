const express = require('express');
const router = express.Router();
const users = require("../users/users")

let routeInfo = "#All errors or Array of object <br/></br>#server is running on 3002<br/></br>";
routeInfo += "use route : '/login' , method : 'post' , body(applicaiton/josn):{email:'  ', password:'123'} <br><br>";
routeInfo += "use route : '/signup' , method : 'post' , body(applicaiton/josn):{'name':'', 'email':'', 'image':'', 'password':''} *all fileds is mandatory <br><br>";
routeInfo += "use route : '/getUserInfo' , method : 'get' , header: {'x-access-token':'example token here'}"

const rootRoute = (req, res) => {
    return res.send(routeInfo)
}

// All routes here

router.get('/', rootRoute);
router.post('/', rootRoute);

router.post('/login', users.login);
router.post('/signup', users.signup);
router.get('/getUserInfo', users.getUserInfo);

module.exports = router;
