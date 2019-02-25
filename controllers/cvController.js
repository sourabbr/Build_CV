var bodyParser=require('body-parser');
const Cv = require('../models/cv-model');
const Message = require('../models/message-model');
const ChangesLog = require('../models/changeslog-model');
const passportSetup = require('../config/passport-setup');
var path = require("path");
var fs=require('fs');
var exec = require('child_process').exec;
var rusDiff = require('rus-diff').rusDiff


var jsonParser = bodyParser.json();
var urlencodedParser = bodyParser.urlencoded({extended:false});


module.exports=function(app){

    // create home route
    app.get('/', (req, res) => {
        res.render('home', { user: req.user });
    });
    
    //post request to retrieve cv
    app.post('/retrieve_cv',jsonParser,function(req,res){
        //get data from mongodb and pass it to view
        Cv.findOne({email:req.body.email},{__v:0}).then((currentUser) => {
            if(currentUser){
                res.json(currentUser);
            }
            else{
                res.send("no data").end();
            }
        });
    }); 

    //post request to submit cv
    app.post('/submit_cv',jsonParser,function(req,res){
        Cv.findOne({email:req.body.email}).then((currentUser) => {
            if(currentUser){
                // already have this user
                var prev_cv;
                var prevcv=JSON.stringify(currentUser);
                prevcv=JSON.parse(prevcv);
                prev_cv=prevcv.cv;
                var changeflag = 0;
                if(rusDiff(prev_cv,req.body.cv)){
                    req.body.changes=rusDiff(prev_cv,req.body.cv);
                    req.body.changes=req.body.changes.$set;
                    req.body.changes.edited_by=req.body.edited_by;
                    req.body.changes.last_updated=new Date(Date.now()).toLocaleString();
                    changeflag = 1;
                }
                // console.log(req.body);
                var query={email:req.body.email};
                Cv.updateOne(query, req.body,{upsert:true}, function(err, data){
                    if (err) return res.status(500).send({ error: err });
                    ChangesLog.findOne({email:req.body.email},{__v:0}).then((logs) => {
                        if(logs){
                            var log=JSON.stringify(logs);
                            log=JSON.parse(log);
                            if(changeflag == 1){
                                log.logs.push(req.body.changes);
                            }
                            ChangesLog.updateOne(query,log,{upsert:true}, function(err, data){
                                if (err) return res.status(500).send({ error: err });
                                return res.send("succesfully updated with change logs");
                            });
                        }
                        else{
                            var nlog={email:req.body.email,logs:[]};
                            var newLogs=ChangesLog(nlog).save(function(err,data){
                                if (err) return res.status(500).send({ error: err });
                                return res.send("succesfully updated without change logs");
                                // res.json(data);
                            });
                        }
                    });
                    
                });
            } else {
                // if not, create user in our db
                // console.log(req.body);
                var newCv=Cv(req.body).save(function(err,data){
                    if (err) return res.status(500).send({ error: err });
                    var nlog={email:req.body.email,logs:[]};
                    var newLogs=ChangesLog(nlog).save(function(err,data){
                        if (err) return res.status(500).send({ error: err });
                        return res.send("succesfully inserted");
                        // res.json(data);
                    });
                    // res.json(data);
                });
            }
        });
    });

    //post request to retrieve messages
    app.post('/retrieve_message',jsonParser,function(req,res){
        //get data from mongodb and pass it to view
        Message.findOne({email:req.body.email},{'_id':0,'__v':0}).then((msg) => {
            if(msg){
                var msgs=JSON.stringify(msg);
                msgs=JSON.parse(msgs);
                res.json(msgs.msgs);
            }
            else{
                res.send("no data").end();
            }
        });
    });
    
    //post request to retrieve change logs
    app.post('/retrieve_changeslogs',jsonParser,function(req,res){
        //get data from mongodb and pass it to view
        ChangesLog.findOne({email:req.body.email},{'_id':0,'__v':0}).then((logs) => {
            if(logs){
                var log=JSON.stringify(logs);
                log=JSON.parse(log);
                res.json(log.logs);
            }
            else{
                res.send("no data").end();
            }
        });
    }); 
     
    
  
  };