import { Router, type Request, type Response } from "express";

import type { User, CustomRequest, UserPayload } from "../libs/types.js";
import { students, users, reset_users } from "../db/db.js";

import { authenticateToken } from "../middlewares/authenMiddleware.js"
import { checkRoleAdmin } from "../middlewares/checkRoleAdminMiddleware.js"
import { checkRoleStudent } from "../middlewares/checkRoleStudentMiddleware.js"
import { checkAllRole } from "../middlewares/checkAllRoleMiddleware.js"

import { zStudentId } from "../libs/zodValidators.js";

const router = Router();

// GET /api/v2/enrollments
router.get("/", authenticateToken, checkRoleAdmin, (req: Request, res: Response) => {
    try{
    const enrollments_information = students.map(student => { 
    const course = student.courses?.map(student => ({student}));
    
    return { 
        studentId: student.studentId,
        courses: course,
             };
    });


    // return data courses users
    return res.status(200).json({
      success: true,
      message: "Enrollments Information",
      data: enrollments_information,



    });
  } catch (err) {
    return res.status(200).json({
      success: false,
      message: "Something is wrong, please try again",
      error: err,
    });
  }
});

// POST /api/v2/enrollments/reset
router.post("/reset", authenticateToken, checkRoleAdmin, (req: Request, res: Response) => {
  try {
    reset_users();
    return res.status(200).json({
      success: true,
      message: "enrollments database has been reset",
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Something is wrong, please try again",
      error: err,
    });
  }
});

// GET /api/v2/enrollments/:studentId
router.get("/:studentId", authenticateToken, checkAllRole, (req: Request, res: Response) => {
    try{
      const studentId = req.params.studentId;
      const result = zStudentId.safeParse(studentId);

      if (!result.success) {
            return res.status(400).json({
                //success: false,
                message: "Validation failed",
                errors: result.error.issues[0]?.message,
            });
        }

      const foundIndex = students.findIndex(
      (student) => student.studentId === studentId
        );

      if (foundIndex === -1) {
            return res.status(404).json({
                success: false,
                message: "Student does not exists",
            });
        }
      
    
    // return data student
    return res.status(200).json({
      success: true,
      message: "Student Information",
      data: students[foundIndex],



    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Something is wrong, please try again",
      error: err,
    });
  }
});

// POST /api/v2/enrollments/:studentId
router.post("/:studentId", authenticateToken, checkRoleStudent, (req: Request, res: Response) => {
  try {
    const body = req.body as Course;

    // validate req.body with predefined validator
    const result = zCoursePostBody.safeParse(body); // check zod
    if (!result.success) {
      return res.status(400).json({
        message: "Validation failed",
        errors: result.error.issues[0]?.message,
      });
    }

    //check duplicate courseId
    const found = courses.find(
      (course) => course.courseId === body.courseId
    );

    if (found) {
      return res.status(409).json({
        success: false,
        message: "Course Id already exists",
      });
    }

    // add new 
    const new_course = body;
    courses.push(new_course);

    // add response header 'Link'
    res.set("Link", `/${new_course.courseId}`);

    return res.status(201).json({
      success: true,
       message: `Course ${new_course.courseId} has been added successfully`,
      data: new_course,
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Somthing is wrong, please try again",
      error: err,
    });
  }
});

export default router;