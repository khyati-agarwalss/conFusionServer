const express = require('express');
const bodyParser = require('body-parser');
const authenticate = require('../authenticate');
const cors = require('./cors');

const Favorites = require('../models/favorite');
const favoriteRouter = express.Router();

favoriteRouter.use(bodyParser.json());
/********************************************************************************************/
favoriteRouter.route('/')
.options(cors.corsWithOptions, (req, res) => {
    res.sendStatus(200);
})
.get(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorites.findOne({user: req.user._id})
    .populate('user')
    .populate('dishes')
    .then((favorites) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(favorites);
    }, (err) => next(err))
    .catch((err) => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorites.findOne({user: req.user._id})
    .then((favorite) => {
        if(favorite !== null) {
            for (var i = 0; i < req.body.length; i++) {
                if(favorite.dishes.indexOf(req.body[i]._id) === -1) {
                    favorite.dishes.push(req.body[i]._id);
                }
            }
            favorite.save();
        } else {
            Favorites.create({user: req.user._id, dishes: req.body});
        }
        console.log('New favorites added!');
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(favorite);
    }, (err) => next(err))
    .catch((err) => next(err));
})
.put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /favorites');
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorites.findOne({user: req.user._id}).remove({})
    .then((resp) => {
        console.log('All favorites deleted!');
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(resp);
    }, (err) => next(err))
    .catch((err) => next(err));
});
/********************************************************************************************/
favoriteRouter.route('/:dishId')
.options(cors.corsWithOptions, (req, res) => {
    res.sendStatus(200);
})
.get(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end('GET operation not supported on /favorites/'+ req.params.dishId);
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorites.findOne({user: req.user._id})
    .then((favorite) => {
        if(favorite !== null) {
            if(favorite.dishes.indexOf(req.params.dishId) === -1) {
                favorite.dishes.push(req.params.dishId);
            }
            favorite.save();
        } else {
            Favorites.create({user: req.user._id, dishes: [req.params.dishId]});
        }
        console.log('New favorite added!');
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(favorite);
    }, (err) => next(err))
    .catch((err) => next(err));
})
.put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /favorites/'+ req.params.dishId);
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorites.findOne({user: req.user._id})
    .then((favorite) => {
        var index = favorite.dishes.indexOf(req.params.dishId);
        if(favorite !== null) {
            if(index === -1) {
                err = new Error('Dish ' + req.params.dishId + ' not Found in Favorites!');
                err.status = 404;
                return next(err);
            } else {
                favorite.dishes.splice(index, 1);
                favorite.save()
                .then((favorite) => {
                    console.log('Favorite Deleted!');
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(favorite);
                }, (err) => next(err));
            }
        } else {
            err = new Error('No Favorites Found!');
            err.status = 404;
            return next(err);
        }
    }, (err) => next(err))
    .catch((err) => next(err))
});
/********************************************************************************************/

module.exports = favoriteRouter;