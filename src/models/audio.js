const {Schema, model} = require('mongoose')

const audioSchema = new Schema({
    description: {type: String},
    title: {type: String},
    audioURL: {type: String},
    public_id: {type: String},
});

module.exports = model('Audio', audioSchema);