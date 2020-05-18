const path = require("path");
const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
var session = require('express-session');
const sessions = new Map();
const users = new Map();

function getAllUsers(req, res) {
    axios.get("http://localhost:8090/getAllUsers").then(function (response) {
        const friends = JSON.parse(response.data.Msg)
        const update_friends = friends.filter(friend => friend['UserId'] != req.session.userId)
        res.render("chat", {
            current: {
                Name: req.session.userName,
                UserId: req.session.userId
            },
            friends: update_friends
        })
    }).catch(function (error) {
        // handle error
        console.log(error);
    })
}


function establishWS(req, res) {
    axios.all([axios.post("http://localhost:8090/getUser", {UserId: req.query.to}),
        axios.post("http://localhost:8090/getMessages", {To: req.session.userId, From: req.query.to})
    ]).then(axios.spread((response1, response2) => {
        if (response1.data.Status == 'COMPLETED' && response2.data.Status == 'COMPLETED') {
            users.set(JSON.parse(response1.data.Msg)['UserId'], JSON.parse(response1.data.Msg)['Name'])
            res.render("chatwindow", {
                friend: {
                    userName: JSON.parse(response1.data.Msg)['Name'],
                    userId: JSON.parse(response1.data.Msg)['UserId']
                },
                userName: req.session.userName,
                userId: req.session.userId,
                previousMessages: JSON.parse(response2.data.Msg)
            });
        }
    }));
}


function loginUser(req, res) {
    axios.post("http://localhost:8090/login", {
        Email: req.body.username,
        Password: req.body.password
    }).then(function (response) {
        console.log(response)
        if (response.data.Status == 'COMPLETED') {
            req.session.userId = JSON.parse(response.data.Msg)['UserId']
            req.session.userName = JSON.parse(response.data.Msg)['Name']
            req.session.userEmail = JSON.parse(response.data.Msg)['Email']
            res.redirect("/chat")
        } else {
            res.render("index", {
                errorMsg: response.data.Msg
            })
        }

    });
}

function registerAction(req, res) {
    axios.post("http://localhost:8090/register", {
        Email: req.body.email,
        Password: req.body.password,
        Name: req.body.full_name
    }).then(function (response) {
        console.log(response)
        if (response.data.Status == 'COMPLETED') {
            req.session.userName = JSON.parse(response.data.Msg)['Name']
            req.session.userId = JSON.parse(response.data.Msg)['UserId']
            req.session.userEmail = JSON.parse(response.data.Msg)['Email']
            res.redirect("/chat")
        } else {
            res.render("registration", {
                errorMsg: response.data.Msg
            })
        }

    });
}

const app = express();
app.use(express.json());

app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({extended: true})); // support encoded bodies

app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(__dirname + '/'));
app.use(session({
    secret: "my_secret",
    resave: true,
    saveUninitialized: true
}));

app.get("/chat", getAllUsers);
app.get("/sendMessage", establishWS);
app.get("/", (req, res) => {
    res.render("index")
});
app.get("/registration", (req, res) => {
    res.render("registration")
});
app.post("/loginAction", loginUser)
app.post("/registerAction", registerAction)

server = app.listen(80, () => console.log('GoChat client app listening on port 80!'));
const webSocket = require('socket.io')(server);
//Websocket Client details
webSocket.on('connection', (socket) => {
    console.log("New user connected")

    socket.on('setSocketId', (data) => {
        console.log("Received setSocketId from :" + data.userId + " with socket id :" + data.socketId)
        sessions.set(data.userId, data.socketId)
    });


    socket.on('new_message', (data) => {
        const pData = JSON.parse(data)
        console.log("Received new message from :" + pData.from + " for :" + pData.to + ", details :" + pData.message)
        axios.post("http://localhost:8090/saveMessage", {
            To: pData.to,
            From: pData.from,
            Message: pData.message,
            Sent: new Date().toISOString()
        }).then(function (response) {
            if (response.data.Status == 'COMPLETED') {
                webSocket.sockets.to(sessions.get(pData.to)).emit('reply_message', users.get(pData.from) + ' : ' + pData.message)
            }
        });
        //webSocket.sockets.emit('reply_message', data)
    });

    socket.on('disconnect', function () {
        sessions.forEach((userId, sessionId) => {
                if (sessionId == socket.id) {
                    sessions.delete(userId)
                }
            }
        );
    });
});