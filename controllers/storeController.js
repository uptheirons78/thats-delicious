const mongoose = require('mongoose');
const Store = mongoose.model('Store');

exports.homePage = (req, res) => {
    res.render('index', { title: 'I Love Food!'});
}

exports.addStore = (req, res) => {
    res.render('editStore', { title: 'Add Store'});
}

//use async await to avoid "callbacks hell"!
exports.createStore = async (req, res) => {
    //let's create a Store and save it
    const store = await (new Store(req.body)).save();
    req.flash('success', `Successfully Created ${store.name}. Care to leave a review?`);
    //redirect to Store page
    res.redirect(`/store/${store.slug}`);
}

exports.getStores = async (req, res) => {
    //1. Query DB for a list of all stores
    const stores = await Store.find();
    res.render('stores', {title: 'Stores', stores});
}

exports.editStore = async (req, res) => {
    //1. find the store with given id
    const store = await Store.findOne({ _id: req.params.id });
    //2. confirm they are owners of the store to edit
    //todo later
    //3. render out the edit form
    res.render('editStore', {title: `Edit ${store.name}`, store});
}

exports.updateStore = async (req, res) => {
    //set location data to be a point
    req.body.location.type = 'Point';
    // find and update the store
    const store = await Store.findOneAndUpdate({ _id: req.params.id }, req.body, {
      new: true, // return the new store instead of the old one
      runValidators: true
    }).exec();
    req.flash('success', `Successfully updated <strong>${store.name}</strong>. <a href="/stores/${store.slug}">View Store →</a>`);
    res.redirect(`/stores/${store._id}/edit`);
    // Redriect them the store and tell them it worked
};