const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const db_path = './db/test.db';
const table_name_scores = 'scores';
const table_name_names = 'names';
const achievements_checker = require('./achievements_checker.js');

var phone_types = { 'iPhone 4': 1.06, 'iPhone 4s': 1.11, 'iPhone 5': 1.17, 'iPhone 5c': 1.22, 'iPhone 5s': 1.28, 'iPhone 6': 1.33, 'iPhone 6 Plus': 1.39, 'iPhone 6s': 1.44, 'iPhone 6s Plus': 1.50, 'iPhone 7': 1.56, 'iPhone 7 Plus': 1.61, 'iPhone SE': 1.67, 'iPhone 8': 1.72, 'iPhone 8 Plus': 1.78, 'iPhone X': 1.83, 'iPhone XS': 1.89, 'iPhone XS Max': 1.94, 'iPhone XR': 2.00, 'iPad 2': 2.06, 'iPad 3': 2.12, 'iPad 4': 2.18, 'iPad Air': 2.24, 'iPad Air 2': 2.29, 'iPad 5': 2.35, 'iPad 6': 2.41, 'iPad Mini': 2.47, 'iPad Mini 2': 2.53, 'iPad Mini 3': 2.59, 'iPad Mini 4': 2.65, 'iPad Pro (9.7-inch)': 2.71, 'iPad Pro (12.9-inch)': 2.76, 'iPad Pro (12.9-inch) (2nd generation)': 2.82, 'iPad Pro (10.5-inch)': 2.88, 'iPad Pro (11-inch)': 2.94, 'iPad Pro (12.9-inch) (3rd generation)': 3.00 }

if (!fs.existsSync(db_path)) {
    if (!fs.existsSync("./db/")) fs.mkdirSync('./db/');
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
                        score.score = (score.height + (0.25 * (row != null ? row.score : 0))) * phone_types[score.phone_type];
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
                achievements_checker.check(score).then((achievements) => {
                    resolve(achievements);
                })
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

        db.all(`SELECT height, score, name, phone_type FROM '${table_name_scores}' NATURAL JOIN '${table_name_names}'
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

        db.all(`SELECT height, score, name, phone_type FROM '${table_name_scores}' NATURAL JOIN '${table_name_names}'
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

        db.all(`SELECT height, score, name, phone_type FROM '${table_name_scores}' NATURAL JOIN '${table_name_names}'
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

module.exports.get_personal_leaderboard = (offset, device_token) => {

    return new Promise(async (resolve, reject) => {
        let db = await open_db();

        db.all(`SELECT height, score, name, phone_type FROM '${table_name_scores}' NATURAL JOIN '${table_name_names}'
                WHERE device_token = '${device_token}'
                ORDER BY score DESC
                LIMIT 100 OFFSET ${offset}`,
            (err, rows) => {
                if (err) {
                    console.error(err);
                    reject(err);
                } else {
                    console.log(`Successfully retrieved ${rows.length} scores with device_token ${device_token}`);
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
                WHERE device_token = '${device_token}'`,
            (err) => {
                if (err) {
                    console.error(err);
                    reject(err);
                } else {
                    console.log(`Successfully updated name of user with device_token to '${new_name}'`);
                    resolve('Successfully changed name to ' + new_name);
                }
            });

        db.close();
    })
}

module.exports.get_last_throws_for_user = (device_token, n) => {
    var n = n || 0;
    return new Promise(async (resolve, reject) => {
        let db = await open_db();

        db.all(`SELECT height
                FROM '${table_name_scores}'
                WHERE device_token = '${device_token}'
                ORDER BY time DESC
                ${(n === 0 ? "" : 'LIMIT ' + n)}`,
            (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        db.close();
    });
}