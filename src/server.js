let config = require('../config/config.json');

var express = require('express');
var http = require('http');
var path = require('path');
var fs = require('fs');
var mime = require('mime');
var url = require('url');
var request = require('request');
const cors = require('cors');
const Sequelize = require('sequelize');
const sysinfo = require('../models/sysinfo');
const e = require('express');
const modelsPath = path.join(__dirname + "/../models");
const sequelize = new Sequelize(
    config["development"]["database"],
    config["development"]["username"],
    config["development"]["password"],
    {
        host: config["development"]["host"],
        dialect: config["development"]["dialect"]
    }
);
const model1 = require(`../models/sysinfo`)(sequelize, Sequelize.DataTypes);
var db = {};

//console.log(config);

/*
//sequelize v5
fs.readdirSync(modelsPath).filter(function(file){
    return (file.indexOf(".") !== 0) && (file !== "server.js");
})
.forEach(function(file){
    //console.log(path.join(__dirname, file));
    //console.log(sequelize);
    let model = sequelize.import(path.join(modelsPath, file));
    db[model.name] = model;
});
*/
db[model1.name] = model1;

Object.keys(db).forEach(function(modelName){
    if("associate" in db[modelName]) {
        db[modelName].associate(db);
    }
});
db.sequelize = sequelize;
db.Sequelize = Sequelize;

//console.log(db);

var app = express();
app.use(cors());
app.set('port', 8082);

http.createServer(app).listen(app.get('port'), function(){});

app.use('/' + express.static('public'), function(req, res, next){
});

var router = express.Router();
  
router.route('/test').get(function(req, res){
    console.log("connect");
    db['sysInfo'].create({
        name: "test Univ",
        country1: "country1",
        country2: "country2",
        country3: "country3",
        logo: "testUnivLogo.jpg",
        lmsurl: "testUniv:7000/lms",
        subscribe: false,
        latlng: {
            type: "Point", 
            coordinates: [127.0, 36.0]
        }
    }).then(()=>{
        console.log("db insert instruction is completed");
        res.status(201).end();
    });
});
router.route('/getList/:X/:Y/:distance').get(function(req, res){
    /*
    let results = sequelize.query('SELECT * FROM systemInfo where ST_Within(latlng,1, ST_GeogFromText(SRID=4326;POINT(' + '||' +  req.params.Y + '||'  + '||' + req.params.X + '||' + ')), 1000)', {
        model: sysinfo,
        mapToModel: true // pass true here if you have any mapped fields
    });
    */
   //SELECT * FROM "systemInfo" where id<5
   //model: db['sysInfo'],
   //'SELECT *, ST_ClusterDBSCAN(latlng, :distance, 1) OVER() AS clusterid, COUNT(clusterid) AS count FROM "systemInfo" GROUP BY clusterid'
   //'SELECT *, COUNT(clusterid) AS count FROM (SELECT *, ST_ClusterDBSCAN(latlng, :distance, 1) OVER() AS clusterid FROM "systemInfo") GROUP BY clusterid'
   /*
SELECT *
FROM
(SELECT * FROM "systemInfo") AS Target
JOIN
(SELECT MIN(A.id) AS id, clusterid, COUNT(clusterid) FROM (SELECT * FROM "systemInfo") AS A JOIN (SELECT id, ST_ClusterDBSCAN(latlng, :distance, 1) OVER() AS clusterid FROM "systemInfo") AS B ON A.id=B.id GROUP BY clusterid)
AS ClusterTable
ON Target.id=ClusterTable.id
   */
   
   let eps = 0;
   if(req.params.distance == 0){
       eps = 0.001;
   }
   else{
        eps = parseInt(req.params.distance) / 1000000
        if(eps > 100){
            eps = 100;
        }
   }
   
    sequelize.query('SELECT * FROM (SELECT * FROM "systemInfo") AS Target JOIN (SELECT MIN(A.id) AS id, clusterid, COUNT(clusterid) FROM (SELECT * FROM "systemInfo") AS A JOIN (SELECT id, ST_ClusterDBSCAN(latlng, :distance, 1) OVER() AS clusterid FROM "systemInfo") AS B ON A.id=B.id GROUP BY clusterid) AS ClusterTable ON Target.id=ClusterTable.id',{
        raw: true,
        replacements: { distance: eps }
    }
    ).then((results)=>{
        //console.log(results);
        results = results[0];

        let string = '{"list":[';
        for(let i = 0; i < results.length; i++){
            string += '{ "id": ' + results[i].id;
            string += ', "name": "' + results[i].name + '"';
            string += ', "country1": "' + results[i].country1 + '"';
            string += ', "country2": "' + results[i].country2 + '"';
            string += ', "country3":"' + results[i].country3 + '"';
            string += ', "logo": "' + results[i].logo + '"';
            string += ', "lmsurl": "' + results[i].lmsurl + '"';
            string += ', "subscribe": ' + results[i].subscribe;
            string += ', "latlng": "' + results[i].latlng.coordinates + '"';
            string += ', "clusterid": ' + results[i].clusterid;
            string += ', "count": ' + results[i].count;
            string += (i < results.length-1) ? '},' : '}';
        }
        string += ']}';

        //res.writeHead('200', {'Content-Type':'application/json'});
        res.json(JSON.parse(string));
        //res.end();
    });
    
    /*
    let results = sequelize.query('SELECT * FROM systemInfo where ST_Within(latlng,1, ST_GeogFromText(SRID=4326;POINT(' + '||' +  req.params.Y + '||'  + '||' + req.params.X + '||' + ')), 1000)', {
        model: sysinfo,
        mapToModel: true // pass true here if you have any mapped fields
    });
    */
    /*
    let string = "{list:[";
    for(let i = 0; i < results.length; i++){
        //string += "{" + results[i].
    }
    res.writeHead('200', {'content-Type':'xml'});
    res.write(body);
    res.end();
    */
});
app.use('/api/', router);