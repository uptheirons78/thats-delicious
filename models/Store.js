const mongoose = require('mongoose');
const slug = require('slugs');

mongoose.Promise = global.Promise;

const storeSchema = mongoose.Schema({
    name: {
        type: String,
        trim: true,
        required: 'Please enter a store name!'
    },
    slug: String,
    description: {
        type: String,
        trim: true
    },
    tags: [String],
    created: {
        type: Date,
        default: Date.now
    },
    location: {
        type: {
            type: String,
            default: 'Point'
        },
        coordinates: [{
            type: Number,
            required: 'You must supply coordinates!'
        }],
        address: {
            type: String,
            required: 'You must supply an address!'
        }
    },
    photo: String
});

storeSchema.pre('save', async function(next) {
    if(!this.isModified('name')) {
        next(); //skip it !!!
        return; //stop this fn from running
    }
    this.slug = slug(this.name);
    //find store that has same slug
    const slugRegEx = new RegExp(`^(${this.slug})((-[0-9]*$)?)$`, 'i');
    const storeWithSlug = await this.constructor.find({ slug: slugRegEx});

    if(storeWithSlug.length) {
        this.slug = `${this.slug}-${storeWithSlug.length + 1}`;
    }
    next();
});

//here we create a method! Put it in statics
storeSchema.statics.getTagsList = function() {
    return this.aggregate([ //aggregate is a MongoDB method, like findOne()
        //it is possible to find all $method in "pipeline operator" inside MongoDB documents
        { $unwind: '$tags' }, //unwind store for any single tag it has
        { $group: { _id: '$tags', count: { $sum: 1 } } }, //group by tags and count
        { $sort: { count: -1 } } //sort by tags number (decreasing)
    ]);
}

module.exports = mongoose.model('Store', storeSchema);