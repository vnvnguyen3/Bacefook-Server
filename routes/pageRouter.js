const express = require('express');
const Page = require('../models/page');
const cors = require('./cors');
const authenticate = require('../authenticate');

const pageRouter = express.Router();

pageRouter.route('/')
.options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
.get(cors.cors, (req, res, next) => {
    Page.find()
    .then(pages => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'appliaction/json');
        res.json(pages);
    })
    .catch(err => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    Page.create(req.body)
    .then(page => {
        console.log('Page Created ', page);
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(page);
    })
    .catch(err => next(err));
})
.put(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /pages');
})
.delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    Page.deleteMany()
    .then(response => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'appliation/json');
        res.json(response);
    })
    .catch(err => next(err));
});

pageRouter.route('/:pageId')
.options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
.get(cors.cors, (req, res, next) => {
    Page.findById(req.params.pageId)
    .then(page => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(page);
    })
    .catch(err => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
    res.statusCode = 403;
    res.end(`POST operation not supported on /pages/${req.params.pageId}`);
})
.put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    Page.findByIdAndUpdate(req.params.pageId, {
        $set: req.body
    }, { new: true })
    .then(page => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(page);
    })
    .catch(err => next(err));
})
.delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    Page.findByIdAndDelete(req.params.pageId)
    .then(response => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(response);
    })
    .catch(err => next(err));
});

pageRouter.route('/:pageId/posts')
.options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
.get(cors.cors, (req, res, next) => {
    Page.findById(req.params.pageId)
    .then(page => {
        if (page) {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(page.posts);
        } else {
            err = new Error(`Page ${req.params.pageId} not found`);
            err.status = 404;
            return next(err);
        }
    })
    .catch(err => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Page.findById(req.params.pageId)
    .then(page => {
        if (page) {
            page.posts.push(req.body);
            page.save()
            .then(page => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(page);
            })
            .catch(err => next(err));
        } else {
            err = new Error(`Page ${ req.params.pageId} not found`);
            err.status = 404;
            return next(err);
        }
    })
    .catch(err => next(err));
})
.put(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
    res.statusCode = 403;
    res.end(`PUT operation not supported on /pages/${req.params.pageId}/posts`);
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Page.findById(req.params.pageId)
    .then(page => {
        if (page) {
            for (let i = (page.posts.length-1); i >= 0; i--) {
                page.posts.id(page.posts[i]._id).remove();
            }
            page.save()
            .then(page => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(page);
            })
            .catch(err => next(err));
        } else {
            err = new Error(`Page ${req.params.pageId} not found`);
            err.status = 404;
            return next(err);
        }
    })
    .catch(err => next(err));
});

pageRouter.route('/:pageId/posts/:postId')
.options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
.get(cors.cors, (req, res, next) => {
    Page.findById(req.params.pageId)
    .then(page => {
        if (page && page.posts.id(req.params.postId)) {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(page.posts.id(req.params.postId));
        } else if (!page) {
            err = new Error(`Page ${req.params.pageId} not found`);
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
    res.end(`POST operation not supported on /pages/${req.params.pageId}/posts/${req.params.postId}`);
})
.put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Page.findById(req.params.pageId)
    .then(page => {
        if (page && page.posts.id(req.params.postId)) {
            if (req.body.text) {
                page.posts.id(req.params.postId).text = req.body.text;
            }
            page.save()
            .then(page => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(page);
            })
            .catch(err => next(err));
        } else if (!page) {
            err = new Error(`Page ${req.params.pageId} not found`);
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
    Page.findById(req.params.pageId)
    .then(page => {
        if (page && page.posts.id(req.params.postId)) {
            page.posts.id(req.params.postId).remove();
            page.save()
            .then(page => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(page);
            })
            .catch(err => next(err));
        } else if (!page) {
            err = new Error(`Page ${req.params.pageId} not found`);
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

module.exports = pageRouter;