const RestaurantController = require('../controllers/restaurantController');
// const passport = require("passport");

const router = require('express').Router();

router.get('/', function(req, res) {
    RestaurantController.getrestaurants(req, res);
});

router.get('/:id', function(req, res) {
    RestaurantController.searchrestaurant(req, res);
});

router.post('/search-by-email/:email', function(req, res) {
    RestaurantController.SearchrestaurantByEmail(req, res);
})

router.post('/', function(req, res) {
    RestaurantController.createrestaurant(req, res);
});

router.delete('/:id', function(req, res) {
    RestaurantController.removerestaurant(req, res);
});

router.put('/:id', function(req, res) {
    RestaurantController.updaterestaurant(req, res);
});


module.exports = router;