const express = require('express');
const router = express.Router();
const User = require('../models/user');
const multer = require('multer');
const fs = require('fs');
 
// image upload
var storage = multer.diskStorage({
    destination: function(req,file,cb){
        cb(null , './uploads');
    },
    filename: function(req,file,cb){
        cb(null , file.fieldname+'_'+Date.now()+"_"+file.originalname);
    },
});

var upload = multer({
    storage : storage,
}).single('image');
// insert user into the databse route
router.post('/add', upload , ( req,resp)=>{
    // console.log(req.body)
    const user = new User({
        name : req.body.name,
        email: req.body.email,
        phone: req.body.phone,
        image: req.file.filename,
    });
    user.save((err)=>{
        if(err){
            resp.json({message: err.message , type: "danger"});
        }else{
            req.session.message = {
                type: 'success',
                message : 'User added successfully!'
            }
            resp.redirect('/');
        }
    })
});



router.get('/',(req,resp)=>{
    User.find().exec((err,users)=>{
        if(err){
            resp.json({message: err.message})
        }else{
            resp.render('index' , { title:'Home Page' , users:users})
        }
    })
   
});

router.get('/add',(req,resp)=>{
    resp.render('add-user' , { title:'Add Users' })
});
// edit user router
router.get('/edit/:id',(req,resp)=>{
    let id = req.params.id;
    User.findById(id, (err,user)=>{
        if(err){
            resp.redirect('/');
        }else{
            if(user == null){
                resp.redirect('/');
            }else{
                resp.render('edit-user',{
                    title: 'Edit User',
                    user: user 
                })
            }
        }
    })
});
// update router
router.post('/update/:id', upload , (req,resp)=>{
    let id = req.params.id;
    let new_image = '';
    if(req.file){
        new_image = req.file.filename;
        try{
            fs.unlinkSync('./upload/'+req.body.old_image);
        }catch(err){
            console.log(err);
        }
    }else{
        new_image = req.body.old_image; 
    }

    User.findByIdAndUpdate(id, {
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone,
        image: new_image
    },(err,result)=>{
        if(err){
            resp.json({message:err.message,type:'danger'});

        }else{
            req.session.message = {
                type : 'success',
                message: 'User updated successfully!',
            }
            resp.redirect('/');
        }
    })
})
// detele route
router.get('/delete/:id',(req,resp)=>{
    let id = req.params.id;
    User.findByIdAndRemove(id,(err,result)=>{
        if(result.image != ''){
            try{
                fs.unlinkSync('./uploads/' + result.image);
            }catch(err){
                console.log(err);
            }
        }
        if(err){
            result.json({message: err.message});
        }else{
            req.session.message = {
                type:'info',
                message:'user delete successfully!'
            }
            resp.redirect("/");
        }
    })
})


module.exports = router;