let restaurantModel = require('../models/restaurantModel');
const { ObjectId } = require('mongoose').Types;

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
        restaurantModel.findOne({ name: req.body.name })
            .then(existingRestaurant => {
                if (existingRestaurant) {
                    return res.status(409).json({
                        message: 'Restaurant already exists'
                    });
                }

                const restaurant = new restaurantModel({
                    id: new ObjectId(),
                    address: req.body.address,
                    borough: req.body.borough,
                    cuisine: req.body.cuisine,
                    grades: req.body.grades,
                    name: req.body.name,
                    restaurant_id: req.body.restaurant_id
                });

                restaurant.save()
                    .then(savedRestaurant => {
                        return res.status(201).json(savedRestaurant);
                    })
                    .catch(err => {
                        console.log(err); // Agregar esta línea para obtener más información sobre el error
                        return res.status(500).json({
                            message: 'Error when creating restaurant',
                            error: err
                        });
                    });
            })
            .catch(err => {
                console.log(err); // Agregar esta línea para obtener más información sobre el error
                return res.status(500).json({
                    message: 'Error creating restaurant',
                    error: err
                });
            });
    },
    removerestaurant: function(req, res) {
        const restaurantId = req.params.id;

        restaurantModel.findByIdAndDelete(restaurantId)
            .then(restaurant => {
                if (!restaurant) {
                    return res.status(404).json({
                        message: 'No such restaurant'
                    });
                }
                return res.json("Se ha eliminado con éxito el restaurante con ID: " + restaurantId);
            })
            .catch(err => {
                return res.status(500).json({
                    message: 'Error when removing the restaurant',
                    error: err
                });
            });
    },
    updaterestaurant: function(req, res) {
        const { id } = req.params;
        const updateData = req.body;

        restaurantModel.findByIdAndUpdate(id, updateData)
            .exec()
            .then(restaurant => {
                if (!restaurant) {
                    return res.status(404).json({
                        message: 'No such restaurant'
                    });
                }

                restaurant.address = updateData.address ? updateData.address : restaurant.address;
                restaurant.borough = updateData.borough ? updateData.borough : restaurant.borough;
                restaurant.cuisine = updateData.cuisine ? updateData.cuisine : restaurant.cuisine;
                restaurant.grades = updateData.grades ? updateData.grades : restaurant.grades;
                restaurant.name = updateData.name ? updateData.name : restaurant.name;

                return restaurant.save();
            })
            .then(updatedRestaurant => {
                return res.json(updatedRestaurant);
            })
            .catch(err => {
                return res.status(500).json({
                    message: 'Error when updating the restaurant.',
                    error: err
                });
            });
    },
    searchrestaurant: function(req, res) {
        const restaurantId = req.params.id;
        console.log(restaurantId)
        restaurantModel.findById(restaurantId)
            .then(restaurant => {
                if (!restaurant) {
                    return res.status(404).json({
                        message: 'No such restaurant'
                    });
                }
                return res.json(restaurant);
            })
            .catch(err => {
                return res.status(500).json({
                    message: 'Error when getting the restaurant.',
                    error: err
                });
            });
    },



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