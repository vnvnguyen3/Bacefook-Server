const express = require('express');
const Friend = require('../models/friend');
const cors = require('./cors');
const authenticate = require('../authenticate');

const friendRouter = express.Router();

friendRouter.route('/')
.options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
.get(cors.cors, (req, res, next) => {
    Friend.find()
    .then(friends => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'appliaction/json');
        res.json(friends);
    })
    .catch(err => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    Friend.create(req.body)
    .then(friend => {
        console.log('Friend Created ', friend);
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(friend);
    })
    .catch(err => next(err));
})
.put(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /friends');
})
.delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    Friend.deleteMany()
    .then(response => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'appliation/json');
        res.json(response);
    })
    .catch(err => next(err));
});

friendRouter.route('/:friendId')
.options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
.get(cors.cors, (req, res, next) => {
    Friend.findById(req.params.friendId)
    .then(friend => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(friend);
    })
    .catch(err => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
    res.statusCode = 403;
    res.end(`POST operation not supported on /friends/${req.params.friendId}`);
})
.put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    Friend.findByIdAndUpdate(req.params.friendId, {
        $set: req.body
    }, { new: true })
    .then(friend => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(friend);
    })
    .catch(err => next(err));
})
.delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    Friend.findByIdAndDelete(req.params.friendId)
    .then(response => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(response);
    })
    .catch(err => next(err));
});

friendRouter.route('/:friendId/posts')
.options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
.get(cors.cors, (req, res, next) => {
    Friend.findById(req.params.friendId)
    .then(friend => {
        if (friend) {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(friend.posts);
        } else {
            err = new Error(`Friend ${req.params.friendId} not found`);
            err.status = 404;
            return next(err);
        }
    })
    .catch(err => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Friend.findById(req.params.friendId)
    .then(friend => {
        if (friend) {
            friend.posts.push(req.body);
            friend.save()
            .then(friend => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(friend);
            })
            .catch(err => next(err));
        } else {
            err = new Error(`Friend ${ req.params.friendId} not found`);
            err.status = 404;
            return next(err);
        }
    })
    .catch(err => next(err));
})
.put(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
    res.statusCode = 403;
    res.end(`PUT operation not supported on /friends/${req.params.friendId}/posts`);
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Friend.findById(req.params.friendId)
    .then(friend => {
        if (friend) {
            for (let i = (friend.posts.length-1); i >= 0; i--) {
                friend.posts.id(friend.posts[i]._id).remove();
            }
            friend.save()
            .then(friend => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(friend);
            })
            .catch(err => next(err));
        } else {
            err = new Error(`Friend ${req.params.friendId} not found`);
            err.status = 404;
            return next(err);
        }
    })
    .catch(err => next(err));
});

friendRouter.route('/:friendId/posts/:postId')
.options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
.get(cors.cors, (req, res, next) => {
    Friend.findById(req.params.friendId)
    .then(friend => {
        if (friend && friend.posts.id(req.params.postId)) {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(friend.posts.id(req.params.postId));
        } else if (!friend) {
            err = new Error(`Friend ${req.params.friendId} not found`);
            err.status = 404;
            return next(err);
        } else {
            err = new Error(`Post ${req.params.postId} not found`);
            err.status = 404;
            return next(err);
        }
    })
    .catch(err => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
    res.statusCode = 403;
    res.end(`POST operation not supported on /friends/${req.params.friendId}/posts/${req.params.postId}`);
})
.put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Friend.findById(req.params.friendId)
    .then(friend => {
        if (friend && friend.posts.id(req.params.postId)) {
            if (req.body.text) {
                friend.posts.id(req.params.postId).text = req.body.text;
            }
            friend.save()
            .then(friend => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(friend);
            })
            .catch(err => next(err));
        } else if (!friend) {
            err = new Error(`Friend ${req.params.friendId} not found`);
            err.status = 404;
            return next(err);
        } else {
            err = new Error(`Post ${req.params.postId} not found`);
            err.status = 404;
            return next(err);
        }
    })
    .catch(err => next(err));
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Friend.findById(req.params.friendId)
    .then(friend => {
        if (friend && friend.posts.id(req.params.postId)) {
            friend.posts.id(req.params.postId).remove();
            friend.save()
            .then(friend => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(friend);
            })
            .catch(err => next(err));
        } else if (!friend) {
            err = new Error(`Friend ${req.params.friendId} not found`);
            err.status = 404;
            return next(err);
        } else {
            err = new Error(`Post ${req.params.postId} not found`);
            err.status = 404;
            return next(err);
        }
    })
    .catch(err => next(err));
});

module.exports = friendRouter;