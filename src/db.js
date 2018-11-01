const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const db_path = './db/test.db';
const table_name = 'scores';

function open_db() {
    return new Promise((resolve, reject) => {
        new Promise((resolve1, reject1) => {
            if (!fs.existsSync(db_path)) {
                fs.writeFileSync(db_path, '');
            }
            resolve1();
        }).then(() => {
            let db = new sqlite3.Database(db_path, sqlite3.OPEN_READWRITE, (err) => {
                if (err) {
                    console.error(err.message);
                    reject(err.message);
                }
                console.log('Connected to the database.');
            });


            db.run(`CREATE TABLE IF NOT EXISTS ${table_name}(id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, height REAL, score REAL, lat REAL, lon REAL, device_token TEXT, phone_type TEXT, time INTEGER)`);
            resolve(db);
        })
    });
}

module.exports.save_score = (score) => {
    return new Promise(async (resolve, reject) => {
        let db = await open_db();

        db.run(`INSERT INTO ${table_name}(name, height, score, lat, lon, device_token, phone_type, time) 
                VALUES('${score.name}', ${score.height}, ${score.score}, ${score.location[0]}, ${score.location[1]}, '${score.device_token}', '${score.phone_type}', ${score.time})`,
            (err) => {
                if (err) {
                    console.error(err);
                    reject(err);
                } else {
                    console.log('successfully inserted scores data', score);
                }
            })

        db.close();
        resolve("sucess");
    });
}

module.exports.test_db_all_scores = () => {
    return new Promise(async (resolve, reject) => {
        let db = await open_db();

        db.all(`SELECT * FROM '${table_name}'`,
            (err, rows) => {
                if (err) {
                    console.error(err);
                    reject(err);
                } else {
                    console.log(`Successfully retrieved ${rows.length} scores`);
                    resolve(rows);
                }
            });
        db.close();
    });
}


module.exports.get_global_leaderboard = (offset) => {
    offset = offset || 0;
    return new Promise(async (resolve, reject) => {
        let db = await open_db();

        db.all(`SELECT * FROM '${table_name}'
                ORDER BY score DESC
                LIMIT 100 OFFSET ${offset}`,
            (err, rows) => {
                if (err) {
                    console.error(err);
                    reject(err);
                } else {
                    console.log(`Successfully retrieved ${rows.length} scores`);
                    resolve(rows);
                }
            });
        db.close();
    });
}