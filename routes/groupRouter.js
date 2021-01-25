const express = require('express');
const Group = require('../models/group');
const cors = require('./cors');
const authenticate = require('../authenticate');

const groupRouter = express.Router();

groupRouter.route('/')
.options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
.get(cors.cors, (req, res, next) => {
    Group.find()
    .then(groups => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'appliaction/json');
        res.json(groups);
    })
    .catch(err => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    Group.create(req.body)
    .then(group => {
        console.log('Group Created ', group);
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(group);
    })
    .catch(err => next(err));
})
.put(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /groups');
})
.delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    Group.deleteMany()
    .then(response => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'appliation/json');
        res.json(response);
    })
    .catch(err => next(err));
});

groupRouter.route('/:groupId')
.options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
.get(cors.cors, (req, res, next) => {
    Group.findById(req.params.groupId)
    .then(group => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(group);
    })
    .catch(err => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
    res.statusCode = 403;
    res.end(`POST operation not supported on /groups/${req.params.groupId}`);
})
.put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    Group.findByIdAndUpdate(req.params.groupId, {
        $set: req.body
    }, { new: true })
    .then(group => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(group);
    })
    .catch(err => next(err));
})
.delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    Group.findByIdAndDelete(req.params.groupId)
    .then(response => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(response);
    })
    .catch(err => next(err));
});

groupRouter.route('/:groupId/posts')
.options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
.get(cors.cors, (req, res, next) => {
    Group.findById(req.params.groupId)
    .then(group => {
        if (group) {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(group.posts);
        } else {
            err = new Error(`Group ${req.params.groupId} not found`);
            err.status = 404;
            return next(err);
        }
    })
    .catch(err => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Group.findById(req.params.groupId)
    .then(group => {
        if (group) {
            group.posts.push(req.body);
            group.save()
            .then(group => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(group);
            })
            .catch(err => next(err));
        } else {
            err = new Error(`Group ${ req.params.groupId} not found`);
            err.status = 404;
            return next(err);
        }
    })
    .catch(err => next(err));
})
.put(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
    res.statusCode = 403;
    res.end(`PUT operation not supported on /groups/${req.params.groupId}/posts`);
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Group.findById(req.params.groupId)
    .then(group => {
        if (group) {
            for (let i = (group.posts.length-1); i >= 0; i--) {
                group.posts.id(group.posts[i]._id).remove();
            }
            group.save()
            .then(group => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(group);
            })
            .catch(err => next(err));
        } else {
            err = new Error(`Group ${req.params.groupId} not found`);
            err.status = 404;
            return next(err);
        }
    })
    .catch(err => next(err));
});

groupRouter.route('/:groupId/posts/:postId')
.options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
.get(cors.cors, (req, res, next) => {
    Group.findById(req.params.groupId)
    .then(group => {
        if (group && group.posts.id(req.params.postId)) {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(group.posts.id(req.params.postId));
        } else if (!group) {
            err = new Error(`Group ${req.params.groupId} not found`);
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
    res.end(`POST operation not supported on /groups/${req.params.groupId}/posts/${req.params.postId}`);
})
.put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Group.findById(req.params.groupId)
    .then(group => {
        if (group && group.posts.id(req.params.postId)) {
            if (req.body.text) {
                group.posts.id(req.params.postId).text = req.body.text;
            }
            group.save()
            .then(group => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(group);
            })
            .catch(err => next(err));
        } else if (!group) {
            err = new Error(`Group ${req.params.groupId} not found`);
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
    Group.findById(req.params.groupId)
    .then(group => {
        if (group && group.posts.id(req.params.postId)) {
            group.posts.id(req.params.postId).remove();
            group.save()
            .then(group => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(group);
            })
            .catch(err => next(err));
        } else if (!group) {
            err = new Error(`Group ${req.params.groupId} not found`);
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

module.exports = groupRouter;