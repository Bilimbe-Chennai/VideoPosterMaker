const mongoose = require('mongoose');
const MONGO_URI = 'mongodb://localhost:27017/bilimbe';

const MediaSchema = new mongoose.Schema({
    photoId: mongoose.Schema.Types.ObjectId,
    posterVideoId: mongoose.Schema.Types.ObjectId,
    mergedVideoId: mongoose.Schema.Types.ObjectId,
}, { strict: false });

const Media = mongoose.model('medias', MediaSchema);

async function getId() {
    try {
        await mongoose.connect(MONGO_URI);
        const media = await Media.findOne({ source: 'photo merge app' }).sort({ createdAt: -1 });
        if (media) {
            console.log('FOUND_ID:' + (media.photoId || media.posterVideoId || media._id));
        } else {
            console.log('NO_MEDIA_FOUND');
        }
        await mongoose.disconnect();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

getId();
