import { Router, type Request, type Response } from "express";

import type { User, CustomRequest, UserPayload, } from "../libs/types.js";
import { students, courses, enrollments, users, reset_users, reset_enrollments } from "../db/db.js";

import { authenticateToken } from "../middlewares/authenMiddleware.js"
import { checkRoleAdmin } from "../middlewares/checkRoleAdminMiddleware.js"
import { checkRoleStudent, checkRoleOwner } from "../middlewares/checkRoleStudentMiddleware.js"
import { checkAllRole } from "../middlewares/checkAllRoleMiddleware.js"

import { zStudentId, zEnrollmentPostBody, zEnrollmentDeleteBody } from "../libs/zodValidators.js";
import type { Enrollment } from "../libs/types.js"

const router = Router();

// GET /api/v2/enrollments
router.get("/", authenticateToken, checkRoleAdmin, (req: Request, res: Response) => {
    try{
    const enrollments_information = students.map(student => { 
    
    //testv3
    // ({
    //   studentId: student.studentId,
    //   courses: student.courses 
    // ? student.courses.map(courseId => ({ courseId })) 
    // : [] // ถ้าไม่มี courses ให้เป็น []
    // }));

    //testv1
    //const course = student.courses?.map(courseId => ({courseId: courseId}));
    // ไม่แน่ใจว่าให้ดึงข้อมูลจาก enrollments เป็นหลักมาแสดงหรือ students เป็นหลัก


     const studentEnrollments = enrollments
        .filter(e => e.studentId === student.studentId)
        .map(e => ({ courseId: e.courseId }));

    return { 
        studentId: student.studentId,
        courses: 
        studentEnrollments,
        // course,
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
    reset_enrollments();
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

    const studentId = req.params.studentId;

    const body = req.body as Enrollment;

    // validate req.body with predefined validator
    const result = zEnrollmentPostBody.safeParse(body); // check zod
    if (!result.success) {
      return res.status(400).json({
        message: "Validation failed",
        errors: result.error.issues[0]?.message,
      });
    }



    //check duplicate courseId
    const found = enrollments.find(
      (enrollment) => enrollment.studentId === body.studentId && enrollment.courseId === body.courseId
    );

    if (found) {
      return res.status(409).json({
        success: false,
        message: "StudentId && CourseId is already exists",
      });
    }

   

    // add new Enrollment
    const new_enrollment = body;
    enrollments.push(new_enrollment);

    // push students data อาจจะไม่ทำเพราะคิดว่า เป็นการลงทะเบียนอยู่แต่อาจจะไม่ติดก็ได้
    // const foundIndex = students.findIndex(
    //   (student) => student.studentId === studentId
    // );
    // students[foundIndex]?.courses?.push(body.courseId);
    


    // add response header 'Link'
    res.set("Link", `/${new_enrollment.courseId}`);

    return res.status(201).json({
      success: true,
       message: `Student ${new_enrollment.studentId} && Course ${new_enrollment.courseId} has been added successfully`,
      data: new_enrollment,
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Somthing is wrong, please try again",
      error: err,
    });
  }
});

// DELETE /api/v2/enrollments/:studentId
router.delete("/:studentId", authenticateToken, checkRoleOwner, (req: Request, res: Response) => {
    try {
    const body = req.body as Enrollment;
    const studentId = req.params.studentId;

    const result = zEnrollmentDeleteBody.safeParse(body); // check zod
    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: result.error.issues[0]?.message,
      });
    }

    const foundIndex = enrollments.findIndex(
        (e) => e.courseId === body.courseId
    );

    if (foundIndex === -1) {
        return res.status(404).json({
            success: false,
            message: "Enrollments does not exists",
        });
    }

    //delete found course from array
    enrollments.splice(foundIndex, 1);

    res.status(200).json({
      success: true,
      message: `Student ${studentId} && Course ${body.courseId} has been deleted successfully`,
      data: enrollments,
    });
    

    }catch (err) {
    return res.status(500).json({
      success: false,
      message: "Somthing is wrong, please try again",
      error: err,
    });
  }

});

export default router;