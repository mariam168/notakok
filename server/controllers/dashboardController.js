const Media = require('../models/Media');
const Folder = require('../models/Folder');
const mongoose = require('mongoose');

exports.getStats = async (req, res) => {
    try {
        const userId = new mongoose.Types.ObjectId(req.user.id);

        const stats = await Media.aggregate([
            {
                $match: { user: userId, isDeleted: false }
            },
            {
                $group: {
                    _id: null,
                    totalFiles: { $sum: 1 },
                    totalStorage: { $sum: "$size" },
                    favorites: {
                        $sum: {
                            $cond: ["$isFavorite", 1, 0]
                        }
                    }
                }
            }
        ]);

        const folderCount = await Folder.countDocuments({ user: userId, isDeleted: false });

        const recentFiles = await Media.find({ user: userId, isDeleted: false })
            .sort({ updatedAt: -1 })
            .limit(5)
            .select('displayName type path');

        const result = {
            totalFiles: stats[0]?.totalFiles || 0,
            totalStorage: stats[0]?.totalStorage || 0,
            favorites: stats[0]?.favorites || 0,
            totalFolders: folderCount,
            recentFiles: recentFiles
        };

        res.json(result);

    } catch (e) {
        res.status(500).json({ msg: e.message });
    }
};