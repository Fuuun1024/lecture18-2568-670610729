import { Router, type Request, type Response } from "express";

import jwt from "jsonwebtoken";
// pnpm install jsonwebtoken และ pnpm install -D @types/jsonwebtoken

import dotenv from "dotenv";
// pnpm install dotenv
 dotenv.config();

import type { User, CustomRequest, UserPayload } from "../libs/types.js";

// import database
import { users, reset_users } from "../db/db.js";
import { success } from "zod";
import { zStudentId } from "../libs/zodValidators.js";
import { error } from "console";

import { authenticateToken } from "../middlewares/authenMiddleware.js"
import { checkRoleAdmin } from "../middlewares/checkRoleAdminMiddleware.js"

const router = Router();

// GET /api/v2/users
router.get("/", authenticateToken, checkRoleAdmin, (req: Request, res: Response) => {
    try{
      
      // // get Authorization headers
      // const authHeader = req.headers["authorization"]
      // console.log(authHeader)

      // // if authHeader is not found or wrong format
      // if(!authHeader || !authHeader.startsWith("Bearer")){ // authHeader มีค่าไหม และ ขึ้นต้นด้วย Bearer ไหม
      //   return res.status(401).json({
      //     success: false,
      //     message: "Authorization header is not found"
      //   });
      // }

      // // extract token aand check if token is available
      // const token = authHeader?.split(" ")[1] // ตัด Bearer ออก เอาแค่ token ได้เป็น array 2 ส่วน เอาแค่ส่วนหลัง(token)
      // if(!token){
      //   return res.status(401).json({
      //     success: false,
      //     message: "Token is required"
      //   });
      // }

      // try{
      //     const jwt_secret = process.env.JWT_SECRET || "forgot_secret";
      //     jwt.verify(token, jwt_secret, (err, payload) => {
      //       if(err){ // check หลัง verify ว่า token ถูกต้องไหม หมดอายุ หรือผิดพลาด
      //         return res.status(403).json({
      //           success: false,
      //           message: "invalid or expired token"
      //         })
      //       }

      //       console.log(payload)

      //       //extract "user" payload from CustomRequest
      //       const payload = req.user;

      //       const user = users.find( // หาจาก array (ระบบเรา)
      //           (u: User) => u.username === (payload as UserPayload).username // ดึงมาดูทีละคนว่า u.username === username
      //       );


      //       //check if user exists and has role ADMIN
      //       if( !user || user.role !== "ADMIN"){
      //         return res.status(401).json({
      //           success: false,
      //           message: "Unauthorized user"
      //         })
      //       }



    // return all users
    return res.status(200).json({
      success: true,
      message: "Successful operation",
      data: users,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Something is wrong, please try again",
      error: err,
    });
  }
});

// POST /api/v2/users/login
router.post("/login", (req: Request, res: Response) => {
  try{
  // 1. get username and password from body
    const { username, password } = req.body;
    const user = users.find( // หาจาก array (ระบบเรา)
        (u: User) => u.username === username && u.password === password
        // ดึงมาดูทีละคนว่า u.username === username และ u.password === password
    );


  // 2. check if user exists (search with username & password in DB)

    if(!user){ // กรณีค้นไม่เจอ user ดังกล่าว
        return res.status(401).json({
            success: false,
            message: "Invalid username or password!"
        })
    }

  // 3. create JWT token (with user info object as payload) using JWT_SECRET_KEY
  //    (optional: save the token as part of User data)

  // const jwt_secret = process.env.JWT_SECRET || "forgot_secret"; // || ค่า defual กรณีผู้ใช้ลืม
  const jwt_secret = process.env.JWT_SECRET || "this_is_my_secret"; // || ค่า defual กรณีผู้ใช้ลืม
  const token = jwt.sign(
    {
    // Payload ข้อมูลที่ server อยากฝากฝังเข้าไปเก็บไว้ใน token ด้วย
    // add create JWT Payload  
        username: user.username,
        studentId: user.studentId,
        role: user.role,
        // username: "user4@abc.com",
        // studentId: null,
        // role: "ADMIN",
  },
  jwt_secret,
  { expiresIn: "5m" } // login ได้ 5 นาที
    );

  // 4. send HTTP response with JWT token
  return res.status(200).json({
    success: true,
    message: "Login successful",
    token,
    });

  }catch(err){
        return res.status(500).json({
            success: false,
            message: "Something went wrong.",
            error: err
        })
    }
    
  return res.status(500).json({
    success: false,
    message: "POST /api/v2/users/login has not been implemented yet",
  });
});

// POST /api/v2/users/logout
router.post("/logout", (req: Request, res: Response) => {
    // try{
    // 1. check Request if "authorization" header exists
    
    // 2. extract the "...JWT-Token..." if available
    //    and container "Bearer ...JWT-Token..."

  

  // 3. verify token using JWT_SECRET_KEY and get payload (username, studentId and role)

  // 4. check if user exists (search with username)

  // 5. proceed with logout process and return HTTP response
  //    (optional: remove the token from User data)
//     }catch(err){
//     }

//   return res.status(500).json({
//     success: false,
//     message: "POST /api/v2/users/logout has not been implemented yet",
//   });
});

// POST /api/v2/users/reset
router.post("/reset", (req: Request, res: Response) => {
  try {
    reset_users();
    return res.status(200).json({
      success: true,
      message: "User database has been reset",
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Something is wrong, please try again",
      error: err,
    });
  }
});

export default router;