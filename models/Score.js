const mongoose = require('mongoose');
const { Schema } = mongoose;

const scoreSchema = new Schema({
    email: String,
    score: Number,
    ticketCreationDate: String
});

mongoose.model('Score', scoreSchema);