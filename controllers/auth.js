const mysql=require("mysql");
const jwt=require('jsonwebtoken');
const bcrypt=require('bcryptjs');
const async = require("hbs/lib/async");
const {promisify}=require('util');
const { DATE } = require("mysql/lib/protocol/constants/types");
//const async = require("hbs/lib/async");
const db=mysql.createConnection({
    host:process.env.DATABASE_HOST,
    user:process.env.DATABASE_USER,
    password:process.env.DATABASE_PASSWORD,
    database:process.env.DATABASE
});
exports.login=async(req,res)=>{
   try{
      const{prof_email,prof_password}=req.body;

      if(!prof_email || !prof_password){
          return res.status(400).render('login',{
              message:'Please provide an email and password'
          })
      }
      db.query('SELECT * FROM professional WHERE prof_email=?',[prof_email],async(error,results)=>{
         console.log(results); 
        if(!results|| !(await bcrypt.compare(prof_password,results[0].prof_password))){
            res.status(401).render('login',{
                message:'Email or Password is incorrect'
            })
        }
        else{
            const id=results[0].prof_id;
            const token = jwt.sign({id:id},process.env.JWT_SECRET,{
                expiresIn:process.env.JWT_EXPIRES_IN
            });
            console.log("The token is:"+ token);
            const cookieOptions={
                expiresIn:new Date(
                    Date.now() +process.env.JWT_COOKIE_EXPIRES*24*60*60*1000
                ) , 
                httpOnly:true 
            }
            res.cookie('jwt',token,cookieOptions);
            res.status(200).redirect("/index");
        }

      })
   }
   catch(error){
     console.log(error);
   }
}


exports.register=(req,res)=>{
    console.log(req.body);

    const {prof_name,prof_email,loc_add,prof_city,aadhar_no,phone_no,prof_password,passwordConfirm}=req.body;

    db.query('SELECT prof_email FROM professional WHERE prof_email=?',[prof_email],async(error,results)=>
    {
        if(error){
            console.log(error);
        }
        if(results.length >0){
            return res.render('register',{
                message:'That email is already in use'
            });
        }
        else if(prof_password!==passwordConfirm){
            return res.render('register',{
                message:'Passwords do not match'
            });
        }
      let hashedPassword=await bcrypt.hash(prof_password,8);
       console.log(hashedPassword);


       db.query('Insert INTO professional SET ?',{prof_name: prof_name,prof_email: prof_email,prof_password: hashedPassword,aadhar_no: aadhar_no,loc_add: loc_add,prof_city:prof_city,phone_no:phone_no},(error,results)=>{
        if(error){
            console.log(error);
        }
        else{
            return res.render('register',{
                message:'User registered'
            });
        }
    })
     });


}

exports.isLoggedIn=async(req,res,next)=>{
    console.log(req.cookies);
    if(req.cookies.jwt){
        try{
            //1.verify token
          const decoded=await promisify(jwt.verify)(req.cookies.jwt,process.env.JWT_SECRET);
            console.log(decoded);
            console.log("id is")
            console.log(decoded.id);
           //2.Check if user still exsists
           db.query('SELECT * FROM professional WHERE prof_id=?',[decoded.id],(error,result)=>{
               console.log(result);
               if(!result){
                   return next();
               }
               req.prof=result[0];
               console.log("professional is")
               console.log(req.prof);
               return next();
           });
        }
        catch(error){
            console.log(error);
            return next();
        }
    }

 
else{
    next();
}

}
exports.userlogin = async (req, res) =>{
    try {
        const{email, password}= req.body;

        if(!email || !password){
            return res.status(400).render('userlogin',{
                message: 'Please provUide an email and password'
            })
        }

        db.query('SELECT * FROM users WHERE email= ?',[email], async(error,results)=>{
            console.log(results);
            if(!results || !(await bcrypt.compare(password, results[0].password))) 
                {
                    res.status(401).render('userlogin',{
                        message: 'Email or Password is incorrect'
                    })
                }else {
                    const Uid = results[0].Uid;

                    const token =jwt.sign({ Uid }, process.env.JWT_SECRET,{
                        expiresIn: process.env.JWT_EXPIRES_IN
                    });
                    console.log("Token is : "+token);

                    const cookieOptions ={
                        expires: new Date(
                            Date.now() + process.env.JWT_COOKIE_EXPIRES*24*60*60*1000
                        ),
                        httpOnly: true 
                    }

                    res.cookie('jwt', token, cookieOptions )

                    res.status(200).redirect("/userindex");
                }
        })

    } catch (error) {
        console.log(error);
    }
}

exports.userregister = (req,res) => {
    console.log(req.body);

    const{name, email,password,passwordConfirm} = req.body;

    db.query('SELECT email FROM users where email = ?', [email], async (error, results)=>{
        if(error){
            console.log(error);
        }

        if(results.length > 0)
        {
            return res.render('userregister',{
                message: 'that email is already in use'
            });
            
        }
        else if(password!==passwordConfirm)
            {
                return res.render('userregister',{
                    message:'Password does mot match '
                });
            }

            let hashedPassword=await bcrypt.hash(password,8);
            console.log(hashedPassword);
            
            db.query('Insert INTO users SET ?',{name: name, email: email, password: hashedPassword},(error,results)=>{
                if(error){
                    console.log(error);
                }
                else{
                    return res.render('userregister',{
                        message:'User registerd'
                    });
                }
            })
    });

}

exports.userisLoggedIn = async (req,res,next)=>{
    console.log(req.cookies);
    if (req.cookies.jwt){
        try {
            console.log(req.cookies);
           const decoded = await promisify(jwt.verify)(req.cookies.jwt, process.env.JWT_SECRET);
           console.log(decoded);

           db.query('SELECT * FROM users WHERE Uid = ?',[decoded.Uid],(error,result)=>{
               console.log(result);
               if(!result){
                    return next();
               }

               req.user = result[0];
               return next();

           });
        } catch (error) {
           console.log(error);
           return next();
        }
    }   
    else{
        next();
    }
}



exports.logout=async(req,res)=>{
    res.cookie('jwt','logout',{
        expires:new Date(Date.now()+2*1000),
        httpOnly:true
    });
    res.status(200).redirect('/')
} 



exports.project=(req,res)=>{ 
    console.log(req.params.id);
    return res.render('project',{pid:req.params.id});

};

exports.accept=(req,res)=>{ 
    console.log(req.params.pid);
    prof_id=req.prof.prof_id;
    db.query("UPDATE project SET pid=? WHERE id=?",[prof_id],[req.params.id]);    
    return res.render('projok',{pid:req.params.pid});

};


exports.pay=(req,res)=>
{         
         console.log(req.body);
        db.query('INSERT INTO amount VALES (?,?) ',[req.params.prid,req.body.amount],(req,res)=>{
        
            console.log(req.params.prid);
           res.render('prosucess');
     
        });
    }
    
  
    
   

  
    
