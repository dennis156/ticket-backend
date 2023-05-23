let restaurantModel = require('../models/restaurantModel');

module.exports = {
    getrestaurants: async function(req, res) {
        try {
            const restaurants = await restaurantModel.find().exec();
            return res.json(restaurants);
        } catch (err) {
            return res.status(500).json({
                message: 'Error when getting restaurants.',
                error: err
            });
        }
    },

    createrestaurant: function(req, res) {
        restaurantModel.findOne({ email: req.body.email }, function(err, existingrestaurant) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when creating restaurant',
                    error: err
                });
            }

            if (existingrestaurant) {
                return res.status(409).json({
                    message: 'Email already in use'
                });
            }
            let restaurant = new restaurantModel({
                name: req.body.name,
                lastName: req.body.lastName,
                email: req.body.email,
                password: req.body.password,
                status: req.body.status
            });
            restaurant.save((err, restaurant) => {
                if (err) {
                    return res.status(500).json({
                        message: 'Error when creating restaurant',
                        error: err
                    });
                }
                return res.status(201).json(restaurant);
            });
        })
    },
    removerestaurant: function(req, res) {
        restaurantModel.findByIdAndRemove(req.params.id, (err, restaurant) => {
            if (err) {
                return res.status(500).json({
                    message: 'Error when deleting the restaurant.',
                    error: err
                });
            }
            return res.status(204).json();
        });
    },
    updaterestaurant: function(req, res) {
        restaurantModel.findByIdAndUpdate(req.params.id, req.body, (err, restaurant) => {
            if (err) {
                return res.status(500).json({
                    message: 'Error when updating the restaurant.',
                    error: err
                });
            }
            if (!restaurant) {

                return res.status(404).json({
                    message: 'No such restaurant'
                });
            }

            restaurant.email = req.body.email ? req.body.email : restaurant.email;
            restaurant.password = req.body.password ? req.body.password : restaurant.password;
            restaurant.name = req.body.name ? req.body.name : restaurant.name;
            restaurant.save((err, restaurant) => {
                if (err) {
                    return res.status(500).json({
                        message: 'Error when updating the restaurant.',
                        error: err
                    });
                }

                if (!restaurant) {
                    return res.status(404).json({
                        message: 'No such restaurant'
                    });
                }

                return res.json(restaurant);
            });

        });
    },
    // searchrestaurant: function(req, res) {
    //     restaurantModel.findById(req.params.id, (err, restaurant) => {
    //         if (err) {
    //             return res.status(500).json({
    //                 message: 'Error when getting the restaurant.',
    //                 error: err
    //             });
    //         }
    //         if (!restaurant) {
    //             return res.status(404).json({
    //                 message: 'No such restaurant'
    //             });
    //         }
    //         return res.json(restaurant);
    //     });
    // },


    SearchrestaurantByEmail: async function(req, res) {
        const { email } = req.body;
        const restaurant = await restaurantModel.findOne({ email });
        if (!restaurant) {
            return res.status(404).json({
                message: 'No such restaurant'
            });
        }
        return res.json(restaurant);
    }

}