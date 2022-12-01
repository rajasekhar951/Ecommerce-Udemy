const express = require("express");
const router = express.Router();

const { validateToken } = require("../JWT/jwt");

const route_handlers = require("../controllers/controllers");

router.post("/register", route_handlers.register);

router.post("/login", route_handlers.login);

//token validation middleware
router.use(validateToken);

router.post("/courses", route_handlers.courses);

router.post("/sort", route_handlers.sort_courses);

router.post("/filter", route_handlers.filter_courses);

router.post("/search", route_handlers.search_courses);

router.get("/course", route_handlers.course);

router.post("/student_rating", route_handlers.student_rating);

router.post("/create", route_handlers.create_course);

router.post("/enroll", route_handlers.enroll_course);

router.get("/profile", route_handlers.user_profile);

router.put("/edit_profile", route_handlers.edit_profile);

router.put(
  "/student_profile/toggle_isCompleted",
  route_handlers.toggle_isCompleted
);

router.delete(
  "/student_profile/delete_from_trainingPath",
  route_handlers.delete_from_trainingPath
);

router.post("/teacher_profile/create_course", route_handlers.create_course);

router.put("/teacher_profile/edit_course", route_handlers.edit_course);

router.delete(
  "/teacher_profile/delete_from_createdCourses",
  route_handlers.delete_from_createdCourses
);

router.get(
  "/teacher_profile/teacher_course_view",
  route_handlers.teacher_course_view
);

module.exports = { router };
