import express from "express";
import mysql from "mysql2";
import cors from "cors";

const app = express();
const port = 3000;

app.use(express.json());
app.use(
    express.urlencoded({
        extended: true,
    }),
    cors()
);

const dbConfig = {
    host: 'localhost',
    user: 'doftopia',
    password: '1234',
    database: 'doftopia'
};

const connection = mysql.createConnection(dbConfig);

connection.connect((err) => {
    if (err) {
        console.log(err);
    }
    console.log("Connected to db");
})

app.get("/items", (req, res) => {
    let itemQuery = `SELECT items.name AS itemName, characteristics.name AS characName, items.id as itemId, characteristics.img_url as characImg, items.description as itemDescription, items.level, items.type, items.img, items.imgHighRes, items.apCost, items.maxRange, items.minRange, effects.description as effectDescription, items.nmbCast, items.criticalHitProbability, items.weaponDmgFrom as characFrom, items.weaponDmgTo as characTo, items.itemCharacteristics as characId, setName, setId, effectId FROM items LEFT JOIN characteristics ON items.itemCharacteristics = characteristics.characteristic_id LEFT JOIN effects on items.effectId = effects.id`;

    let base_limit = 10;
    const queryParams = [];
    const filters = [];

    if (req.query.id) {
        filters.push(`items.id = ?`);
        queryParams.push(parseInt(req.query.id));
    }
    
    if (req.query.name) {
        filters.push(`items.name LIKE ?`);
        queryParams.push(`%${req.query.name}%`);
    }

    if (req.query.setId) {
        filters.push(`items.setId = ?`);
        queryParams.push(req.query.setId);
    }

    if (req.query.minLevel) {
        filters.push(`items.level >= ?`);
        queryParams.push(parseInt(req.query.minLevel));
    }

    if (req.query.maxLevel) {
        filters.push(`items.level <= ?`);
        queryParams.push(parseInt(req.query.maxLevel));
    }
    
    if (req.query.effect) {
        const effects = Array.isArray(req.query.effect) ? req.query.effect : [req.query.effect];
        effects.forEach(effect => {
            filters.push(`items.name IN (
                SELECT DISTINCT
                items.name
                FROM
                items
                LEFT JOIN
                characteristics ON items.itemCharacteristics = characteristics.characteristic_id
                WHERE
                characteristics.characteristic_id LIKE ?
                AND items.weaponDmgFrom > 0
                )`);
            queryParams.push(effect);
        });
    }

    if (req.query.category) {
        const categories = Array.isArray(req.query.category) ? req.query.category : [req.query.category];
        const categoryFilters = categories.map(category => `items.type like ?`).join(' OR ');
        filters.push(`(${categoryFilters})`);
        categories.forEach(category => {
            queryParams.push(category);
        });
    }
    
    if (filters.length > 0) {
        itemQuery += ` WHERE ${filters.join(' AND ')}`;
    }
    
    if (req.query.limit) {
        base_limit = parseInt(req.query.limit);
    }

    if (req.query.skip) {
        base_skip = parseInt(req.query.skip);
    }

    let item_limit = base_limit;
    let groupedData = [];
    connection.query(itemQuery, queryParams, (error, results) => {
        if (error) {
            console.error('Error fetching items:', error);
            res.status(500).json({ error: "Internal Server Error" });
            return;
        } else {
            results.forEach((result, index) => {
                if (index >= base_limit) {
                    return;
                }
                try {
                    if (result.characId == -1) {
                        if (result.effectDescription.includes('Neutre')) {
                            result.characImg = 'https://dofusdb.fr/icons/characteristics/tx_neutral.png';
                        } else if (result.effectDescription.includes('Feu')) {
                            result.characImg = 'https://dofusdb.fr/icons/characteristics/tx_intelligence.png';
                        } else if (result.effectDescription.includes('Eau')) {
                            result.characImg = 'https://dofusdb.fr/icons/characteristics/tx_chance.png';
                        } else if (result.effectDescription.includes('Terre')) {
                            result.characImg = 'https://dofusdb.fr/icons/characteristics/tx_strength.png';
                        } else if (result.effectDescription.includes('Air')) {
                            result.characImg = 'https://dofusdb.fr/icons/characteristics/tx_agility.png';
                        }
                    }

                    let existingItem = groupedData.find(item => item.itemName === result.itemName);
                    if (result.effectDescription !== null) {
                        result.effectDescription = result.effectDescription.split('2')[2];
                            if (result.effectDescription !== undefined) {
                                if (result.effectDescription.includes('{~ps}{~zs}')) {
                                    result.effectDescription = `${result.effectDescription.split('{')[0]} ${result.effectDescription.split('}')[2]}`;
                                }
                            }
                        }
                    if (!existingItem) {
                        existingItem = { itemName: result.itemName, itemId: result.itemId, description: result.itemDescription, level: result.level, type: result.type, img: result.img, imgHighRes: result.imgHighRes, apCost: result.apCost, minRange: result.minRange, maxRange: result.maxRange, nmbCast: result.nmbCast, criticalHitProbability: result.criticalHitProbability, setName: result.setName, setID: result.setId, characteristics: [] };
                        groupedData.push(existingItem);
                    } else {
                        base_limit += 1;
                    }
                    existingItem.characteristics.push({ characName: result.effectDescription, characFrom: result.characFrom, characTo: result.characTo, characImg: result.characImg, characId: result.characId, effectId: result.effectId});
                } catch (error) {
                    console.error(error)
                }
            });
            res.json({ limit: item_limit, total: 18775, data: groupedData });
        }
    });
});


app.get('/jobs', (req, res) => {
    let itemQuery = `SELECT * from jobs`
    const queryParams = [];
    
    if (req.query.id) {
        itemQuery += ` WHERE jobs.jobId = ?`;
        queryParams.push(parseInt(req.query.id));
    }
    
    connection.query(itemQuery, queryParams, (error, results) => {
        if (error) {
            console.error(`Error fetching jobs: ${error}`);
            res.status(500).json({ error: "Internal Server Error" });
            return;
        } else {
            res.json({data: results})
        }
    })
});


app.get('/items-type', (req, res) => {
    let itemQuery = `SELECT * from itemsType`
    const queryParams = [];

    if (req.query.category) {
        itemQuery += ` WHERE itemstype.name LIKE ?`;
        queryParams.push(`%${req.query.category}%`)
    }
    
    console.log(itemQuery);
    console.log(queryParams);
    connection.query(itemQuery, queryParams, (error, results) => {
        if (error) {
            console.error(`Error fetching items-type: ${error}`);
            res.status(500).json({ error: "Internal Server Error" });
            return;
        } else {
            res.json({data: results})
        }
    })
});


app.get('/recipes', (req, res) => {
    let itemQuery = `SELECT 
        recipes.resultId,
        recipes.quantities,
        recipes.ids,
        recipes.jobId,
        GROUP_CONCAT(items.name) AS itemName,
        GROUP_CONCAT(items.img) AS itemImg,
        GROUP_CONCAT(items.level) AS itemLevel,
        items.id AS itemId 
    FROM 
        recipes 
    LEFT JOIN 
        items ON items.id = recipes.ids`

    const queryParams = [];

    if (req.query.resultId) {
        itemQuery += ` WHERE recipes.resultId = ? `
        queryParams.push(req.query.resultId);
    }

    itemQuery += ` GROUP BY 
        recipes.resultId, 
        recipes.quantities, 
        recipes.ids, 
        recipes.jobId 
    ORDER BY
        recipes.quantities DESC `

    let groupedData = [];
    let subData = []
    let previousItemId;
    connection.query(itemQuery, queryParams, (error, results) => {
        if (results.length > 0) {
            previousItemId = results[0].resultId;
        }

        if (error) {
            console.error(`Error fetching recipes: ${error}`);
            res.status(500).json({ error: "Internal Server Error" });
            return;
        } else {
            results.forEach(result => {
                try {
                    if (previousItemId != result.resultId) {
                        groupedData.push({resultItemId: previousItemId, jobId: result.jobId, itemLevel: result.itemLevel, recipe: subData});
                        previousItemId = result.resultId;
                        subData = [];
                    } 
                    subData.push({quantity: result.quantities, itemName: result.itemName, itemId: result.ids, itemImg: result.itemImg});
                } catch (error) {
                    console.error(error);
                }
            });
            try {
                groupedData.push({resultItemId: previousItemId, jobId: results[results.length-1].jobId, itemLevel: results[results.length-1].itemLevel, recipe: subData});
            } catch (error) {
                console.log(`trying to access an item without characs: ${error}`);
            }
            res.json({data: groupedData});
        }
    })
});


app.get('/itemSets', (req, res) => {
    let itemQuery = `SELECT * from itemSets
    join characteristics on itemSets.charac = characteristics.characteristic_id`;
    const queryParams = [];

    if (req.query.id) {
        itemQuery += ` WHERE itemSets.setId = ?`;
        queryParams.push(req.query.id);
    }

    let groupedData = [];
    let subData = []
    let nmbItems = [];
    let previousSetId;
    let previousNmbItems;

    connection.query(itemQuery, queryParams, (error, results) => {
        if (error) {
            console.error(`Error fetching sets: ${error}`);
            res.status(500).json({ error: "Internal Server Error" });
            return;
        } else {
            if (results.length > 0) {
                previousSetId = results[0].setId;
                previousNmbItems = results[0].numberItem;
            }
            results.forEach((result, index) => {
                try {
                    if (previousNmbItems != result.numberItem || index == results.length-1) {
                        if (index == results.length-1) {
                            subData.push({characName: result.name, characValue: result.characValue, characImg: result.img_url});
                            nmbItems.push({characs: subData, nmbItems: previousNmbItems});
                        } else {
                            nmbItems.push({characs: subData, nmbItems: previousNmbItems});
                        }
                        previousNmbItems = result.numberItem;
                        subData = []; 
                    } 
                    
                    if (previousSetId != result.setId) {
                        groupedData.push({nmbItems: nmbItems, setName: result.setName, setId: result.setId, setLevel: result.setLevel});
                        previousSetId = result.setId;
                        nmbItems = [];
                    }
                    subData.push({characName: result.name, characValue: result.characValue, characImg: result.img_url});
                } catch (error) {
                    console.error(`error parsing set ${error}`);
                }
            });
            groupedData.push({nmbItems: nmbItems, setName: results[results.length-1].setName, setId: results[results.length-1].setId, setLevel: results[results.length-1].setLevel});
            res.json({data: groupedData})
        }
    })
});


app.get('/mobs', (req, res) => {
    let groupedData = [];
    let itemQuery = `SELECT * from mobs LIMIT 200`
    const queryParams = [];
    let previousMobID = 0;
    let previousMobName = "";
    let mobCharac = [];
    
    if (req.query.id) {
        itemQuery += ` WHERE mobs.id = ?`;
        queryParams.push(parseInt(req.query.id));
    }
    
    connection.query(itemQuery, queryParams, (error, results) => {
        if (error) {
            console.error(`Error fetching mobs: ${error}`);
            res.status(500).json({ error: "Internal Server Error" });
            return;
        } else {
            if (results.length != 0) {
                previousMobID = results[0].id;
                previousMobName = results[0].name;
            }

            results.forEach(result => {
                if (result.id != previousMobID) {
                    groupedData.push({name: result.name, id: previousMobID, characs: mobCharac, img: result.img});
                    previousMobID = result.id;
                    previousMobName = result.name;
                    mobCharac = [];
                    mobCharac.push({level: result.level, lifePoints: result.lifePoints, ap: result.actionPoints, mp: result.mouvementPoints, vitality: result.vitality, paDodge: result.paDodge, pmDodge: result.pmDodge, wisdom: result.wisdom, earthResistance: result.earthResistance, fireResistance: result.fireResistance, airResistance: result.airResistance, waterResistance: result.waterResistance, neutralResistance: result.neutralResistance, strength: result.strength, intelligence: result.intelligence, chance: result.chance, agility: result.agility})
                } else {
                    mobCharac.push({level: result.level, lifePoints: result.lifePoints, ap: result.actionPoints, mp: result.mouvementPoints, vitality: result.vitality, paDodge: result.paDodge, pmDodge: result.pmDodge, wisdom: result.wisdom, earthResistance: result.earthResistance, fireResistance: result.fireResistance, airResistance: result.airResistance, waterResistance: result.waterResistance, neutralResistance: result.neutralResistance, strength: result.strength, intelligence: result.intelligence, chance: result.chance, agility: result.agility})
                }
            });
            res.json({data: groupedData})
        }
    })
});


app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
