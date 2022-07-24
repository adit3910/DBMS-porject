const express=require('express');
const authController=require('../controllers/auth');
const router=express.Router();
const req = require('express/lib/request');
const res = require('express/lib/response');
const {promisify} = require('util');
const jwt = require('jsonwebtoken');
const mysql=require("mysql");
const { DATE } = require("mysql/lib/protocol/constants/types");

const db=mysql.createConnection({
    host:process.env.DATABASE_HOST,
    user:process.env.DATABASE_USER,
    password:process.env.DATABASE_PASSWORD,
    database:process.env.DATABASE
});

router.get('/',(req,res)=>{
    res.render('homepage');
});

router.get('/index',authController.isLoggedIn,(req,res)=>{
    if(req.prof){
     db.query('SELECT * FROM project WHERE pid IS NULL',(error,rows)=>{
         console.log(rows);
        res.render('index',{
            prof:req.prof,rows
        });
     })   
    } else{
        res.redirect('/login');
    }
})


router.get('/register',(req,res)=>{ 
    res.render('register');
});
router.get('/login',(req,res)=>{
    res.render('login');
});

router.get('/project:id',(req,res)=>{
    console.log(req.params.id);
    console.log(req.params.pid);
    res.render('project',{pid:req.params.id});
});

//router.get('/accept:pid',authController.isLoggedIn,(req,res)=>{
  //  console.log(req.params.pid);
    //res.render('projok',{prof:req.prof,pid:req.params.pid});
//});

router.get('/profile',authController.isLoggedIn,(req,res)=>
{   
       if(req.prof)
    {   
        
        //var scripts = [{ script: '/overlay.js' }];
        db.query('SELECT * FROM project P WHERE P.pid=? AND P.id NOT IN (SELECT id FROM amount);',[req.prof.prof_id],(error,rows)=>{
            console.log(rows);
            
           res.render('profile',{
               prof:req.prof,rows
           });
        }) 
        }

    
  else{
      res.redirect('/login');
  } 
});

router.get('/projok/:pid',authController.isLoggedIn,(req,res)=>
{   
       if(req.prof)
    {   
        const pid=req.params.pid;
        const prof=req.prof.prof_id;
        db.query('UPDATE project SET pid=? WHERE id=?',[req.prof.prof_id,req.params.pid],(error,rows)=>{
            console.log(rows);
            console.log(req.params.pid);
           res.render('projok',{
               prof:req.prof
           });
     
        });
    }
    
  else{
      res.redirect('/login');
  } 
});

router.post('/pay/:prid',(req,res)=>
{      
    
   // console.log(proj_id);    
         console.log(req.body);
     db.query('INSERT INTO amount VALUES (?,?,?,?) ;',[req.params.prid,req.body.descwork,req.body.daysworked,req.body.amount],(error,rows)=>{
        
        res.render('prosucess');
     
        });
    }
)


router.get('/userindex',authController.userisLoggedIn,(req,res)=>{
    res.render('userindex',{
        user : req.user
    });
});

router.get('/userregister',(req,res)=>{
    res.render('userregister');
});

router.get('/userlogin',(req,res)=>{
    res.render('userlogin');
});



router.get('/userprofile', authController.userisLoggedIn, (req,res)=>{
    // console.log(req.message);
    
    if(req.user){
        db.query('SELECT * FROM project LEFT JOIN amount ON project.id=amount.id JOIN professional ON project.pid=professional.prof_id WHERE project.Uid=?;',[req.user.Uid],(error,rows)=>{
        console.log(rows);
        db.query('SELECT * FROM project P WHERE P.uid=? AND P.id NOT IN (SELECT id FROM amount);',[req.user.Uid],(error,answers)=>{
            console.log(answers);
            db.query('SELECT * FROM users U,project PR,professional P,amount A WHERE U.Uid=PR.Uid AND P.prof_id=PR.pid AND A.id=PR.id AND PR.Uid=?;',[req.user.Uid],(error,comp)=>{
        res.render('userprofile',{
            user:req.user,rows,answers,comp
        });
            })
    })
    })
    }
    else{
    res.redirect('/userlogin');
          }
})

router.post('/orderspost',async(req,res)=>{
     console.log(req.cookies);
  
     const decoded = await promisify(jwt.verify)(req.cookies.jwt, process.env.JWT_SECRET);
    console.log(decoded);

     console.log(decoded.Uid);
     console.log(req.body);
     const {description,location,department} = req.body;
   //  db.query('SELECT Did FROM department WHERE dname = ?',[department],(error,result)=>{
        //  console.log(result[0]);
        //  var did = result[0].Did;
    // console.log(did);
    //  console.log(did.Did);
    console.log(description,location,department);
     db.query('INSERT INTO project SET description = ?, location = ?, Did = ?, Uid = ?',[description,location,department,decoded.Uid], (err,rows)=>{
         if(err){
             console.log(err);
         }else{
             res.render('orders',{
                 message:'Order registered'
             });
         }
     } )
   // }
    //)
}
)

router.get('/orders',authController.userisLoggedIn, (req,res)=> {
    if(req.user){
        res.render('orders',{
                user:req.user
        });
    }

    else{
        res.redirect('/userlogin');
    }
})

module.exports=router;