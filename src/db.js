const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const db_path = './db/test.db';
const table_name_scores = 'scores';
const table_name_names = 'names';

if (!fs.existsSync(db_path)) {
    fs.mkdirSync('./db/');
    fs.writeFileSync(db_path, '');
}

open_db().then((db) => {
    db.run(`CREATE TABLE IF NOT EXISTS ${table_name_scores}(id INTEGER PRIMARY KEY AUTOINCREMENT, device_token TEXT, height REAL, score REAL, location TEXT, time INTEGER)`);
    db.run(`CREATE TABLE IF NOT EXISTS ${table_name_names}(device_token TEXT UNIQUE PRIMARY KEY, name TEXT, phone_type TEXT)`);
})

function open_db() {
    return new Promise((resolve, reject) => {
        var db = new sqlite3.Database(db_path, sqlite3.OPEN_READWRITE, (err) => {
            if (err) {
                console.error(err.message);
                reject(err.message);
            }
            console.log('Connected to the database.');
        });
        resolve(db);
    });
}

module.exports.save_score = (score) => {
    return new Promise(async (resolve, reject) => {
        let db = await open_db();

        new Promise((resolve1, reject1) => {
            db.get(`SELECT score 
                    FROM ${table_name_scores} 
                    WHERE device_token = '${score.device_token}' 
                    ORDER BY time DESC`,
                (err, row) => {
                    if (err) {
                        console.error(err)
                        reject(err)
                    } else {
                        score.score = (score.height + (0.25 * (row != null ? row.score : 0)));
                        resolve1(score.score);
                    }
                })
        })
            .catch((reason) => { console.log(reason) })
            .then(() => {


                db.run(`INSERT INTO ${table_name_scores}(device_token, height, score, location, time) 
        VALUES('${score.device_token}',  ${Number((score.height).toFixed(2))}, ${Number(score.score).toFixed(2)}, '${score.location}', strftime('%s','now'))`,
                    (err) => {
                        if (err) {
                            console.error(table_name_scores, ":", err);
                            reject(err);
                        } else {
                            console.log(`successfully inserted VALUES('${score.device_token}', ${Number((score.height).toFixed(2))}, ${Number((score.score).toFixed(2))}, '${score.location}') into ${table_name_scores}`);
                        }
                    });

                db.run(`INSERT OR IGNORE INTO ${table_name_names}(device_token, name, phone_type) 
        VALUES('${score.device_token}', '${score.name}', '${score.phone_type}')`,
                    (err) => {
                        if (err) {
                            console.error(table_name_names, ":", err);
                            reject(err);
                        } else {
                            console.log(`successfully inserted VALUES('${score.device_token}', '${score.name}', '${score.phone_type}') into ${table_name_names}`);
                        }
                    });

                db.close();
                resolve("sucess");
            })
    });
}

module.exports.test_db_all_scores = () => {
    return new Promise(async (resolve, reject) => {
        let db = await open_db();

        db.all(`SELECT * FROM '${table_name_scores}' NATURAL JOIN '${table_name_names}'`,
            (err, rows) => {
                if (err) {
                    console.error(err);
                    reject(err);
                } else {
                    console.log(`Successfully retrieved all (${rows.length}) scores`);
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

        db.all(`SELECT * FROM '${table_name_scores}' NATURAL JOIN '${table_name_names}'
                ORDER BY score DESC
                LIMIT 100 OFFSET ${offset}`,
            (err, rows) => {
                if (err) {
                    console.error(err);
                    reject(err);
                } else {
                    console.log(`Successfully retrieved top ${rows.length} scores`);
                    resolve(rows);
                }
            });
        db.close();
    });
}

module.exports.get_local_leaderboard = (offset, location) => {

    return new Promise(async (resolve, reject) => {
        let db = await open_db();

        db.all(`SELECT * FROM '${table_name_scores}' NATURAL JOIN '${table_name_names}'
                WHERE location = '${location}'
                ORDER BY score DESC
                LIMIT 100 OFFSET ${offset}`,
            (err, rows) => {
                if (err) {
                    console.error(err);
                    reject(err);
                } else {
                    console.log(`Successfully retrieved ${rows.length} scores from ${location}`);
                    resolve(rows);
                }
            });
        db.close();
    });
}

module.exports.get_phone_leaderboard = (offset, phone_type) => {

    return new Promise(async (resolve, reject) => {
        let db = await open_db();

        db.all(`SELECT * FROM '${table_name_scores}' NATURAL JOIN '${table_name_names}'
                WHERE phone_type = '${phone_type}'
                ORDER BY score DESC
                LIMIT 100 OFFSET ${offset}`,
            (err, rows) => {
                if (err) {
                    console.error(err);
                    reject(err);
                } else {
                    console.log(`Successfully retrieved ${rows.length} scores with phonetype ${phone_type}`);
                    resolve(rows);
                }
            });
        db.close();
    });
}

module.exports.update_name = (device_token, new_name) => {

    return new Promise(async (resolve, reject) => {
        let db = await open_db();

        db.run(`UPDATE ${table_name_names} 
                SET name = '${new_name}' 
                WHERE device_type = '${device_token}'`,
            (err) => {
                if (err) {
                    console.error(err);
                    reject(err);
                } else {
                    console.log(`Successfully updated name of user with device_token to '${new_name}'`);
                    resolve('Success');
                }
            });

        db.close();
    })
}