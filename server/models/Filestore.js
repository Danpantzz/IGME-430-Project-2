const mongoose = require('mongoose');

const FileSchema = new mongoose.Schema({
    name: {
        type: String,
    },
    data: {
        type: Buffer,
    },
    size: {
        type: Number,
    },
    mimetype: {
        type: String,
    },
    md5: {
        type: String,
    },
});

const FileModel = mongoose.model('FileModel', FileSchema);
module.exports = FileModel;