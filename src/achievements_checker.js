const db = require('./db');

var achievements = { 
    heights: [{ id: "h1", h: 1 }, { id: "h5", h: 5 }, { id: "h10", h: 10 }, { id: "h20", h: 20 }, { id: "h30", h: 30 }, { id: "h40", h: 40 }, { id: "h50", h: 50 }], 
    consecutive: [{ id: "h1c3", h: 1, n: 3 }, { id: "h1c5", h: 1, n: 5 }, { id: "h1c10", h: 1, n: 10 }, { id: "h1c15", h: 1, n: 15 }, { id: "h5c3", h: 5, n: 3 }, { id: "h5c5", h: 5, n: 5 }, { id: "h5c10", h: 5, n: 10 }, { id: "h5c15", h: 5, n: 15 }, { id: "h10c3", h: 10, n: 3 }, { id: "h10c5", h: 10, n: 5 }, { id: "h10c10", h: 10, n: 10 }, { id: "h10c15", h: 10, n: 15 }, { id: "h20c3", h: 20, n: 3 }, { id: "h20c5", h: 20, n: 5 }, { id: "h20c10", h: 20, n: 10 }, { id: "h20c15", h: 20, n: 15 }, { id: "h30c3", h: 30, n: 3 }, { id: "h30c5", h: 30, n: 5 }, { id: "h30c10", h: 30, n: 10 }, { id: "h30c15", h: 30, n: 15 }, { id: "h40c3", h: 40, n: 3 }, { id: "h40c5", h: 40, n: 5 }, { id: "h40c10", h: 40, n: 10 }, { id: "h40c15", h: 40, n: 15 }, { id: "h50c3", h: 50, n: 3 }, { id: "h50c5", h: 50, n: 5 }, { id: "h50c10", h: 50, n: 10 }, { id: "h50c15", h: 50, n: 15 }] 
}

module.exports.check = (score) => {
    return new Promise(async (resolve, reject) => {
        var completed = { achievements: [], time: Date.now(), score: score.score.toFixed(2)}
        if (!score) reject("no score was given...")
        achievements.heights.forEach(achievement => {
            if (score.height >= achievement.h) {
                completed.achievements.push(achievement.id);
            }
        });

        var last_five = await db.get_last_throws_for_user(score.device_token, 15);

        for (var achievement of achievements.consecutive) {
            var throws = [];
            if (last_five.length < achievement.n) {
                continue;
            }
            last_five.forEach((t) => {
                if (t.height > achievement.h) throws.push(t.height);
            })
            if (throws.length >= achievement.n) {
                completed.achievements.push(achievement.id)
            }
        }

        resolve(completed);
    });
} 