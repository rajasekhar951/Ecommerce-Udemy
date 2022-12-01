const Sequelize = require("sequelize");
const { sequelize } = require("../DB/db");
const bcrypt = require("bcrypt");
const { Users } = require("../models/user_model");
const { Courses } = require("../models/courses_model");
const { Enrollments } = require("../models/enrollments_model");

const { createToken } = require("../JWT/jwt");

// register handler
exports.register = async (req, res) => {
  if (
    req.body?.user_role &&
    req.body?.user_name &&
    req.body?.email &&
    req.body?.password
  ) {
    const role = req.body.user_role;
    const name = req.body.user_name;
    const email = req.body.email;
    const password = req.body.password;
    let addUser;
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      addUser = await Users.create({
        user_role: role,
        user_name: name,
        email: email,
        password: hashedPassword,
      });
    } catch (error) {
      if (error.parent.code == "ER_DUP_ENTRY") {
        return res.status(400).send({
          status: "bad request",
          error: "User already exists kindly login",
        });
      } else {
        return res
          .status(500)
          .send({ status: "error", error: "Internal server error!" });
      }
    }
    if (addUser) {
      return res
        .status(200)
        .send({ status: "success", messgae: "registerd successfully" });
    } else {
      return res
        .status(400)
        .send({ status: "error", error: "cannot register" });
    }
  } else {
    return res.status(400).send({
      status: "error",
      error: "please provide all required details to register",
    });
  }
};

// login handler
exports.login = async (req, res) => {
  if (req.body?.email && req.body?.password) {
    const email = req.body.email;
    const password = req.body.password;
    let user;
    let validation;
    try {
      user = await Users.findOne({ where: { email: email } });
      validation = await bcrypt.compare(password, user.password);
    } catch (error) {
      return res
        .status(500)
        .send({ status: "error", error: "Internal server error!" });
    }
    if (user) {
      if (validation) {
        const accessToken = createToken(user);
        return res
          .status(200)
          .send({ status: "success", accessToken: accessToken });
      } else {
        return res
          .status(400)
          .send({ status: "bad request", error: "Wrong password" });
      }
    } else {
      return res.status(400).send({
        status: "fail",
        error: "account doesn't exist. kindly register",
      });
    }
  } else {
    return res.status(400).send({
      status: "error",
      error: "please provide all required details to login",
    });
  }
};

// all courses fetch handler
exports.courses = async (req, res) => {
  let page = 0;
  if (req.query.page) {
    page = req.query.page;
  }
  const limit = 8;
  const query1 = "select course_category from Courses";
  const query2 =
    "select * from Users inner join Courses on Users.user_id = Courses.createdby limit " +
    page * limit +
    ", " +
    limit;
  if (req.user.role == "student") {
    const query3 =
      "select * from Enrollments where enrolledby = " + req.user.id + "";
    let courses;
    let enrollments;
    let categories;
    try {
      categories = await sequelize.query(query1, {
        type: Sequelize.QueryTypes.SELECT,
      });
      courses = await sequelize.query(query2, {
        type: Sequelize.QueryTypes.SELECT,
      });
      enrollments = await sequelize.query(query3, {
        type: Sequelize.QueryTypes.SELECT,
      });
    } catch (error) {
      return res.status(500).send({
        status: "error",
        error: "Internal server error!",
        user: req.user,
      });
    }
    // console.log(enrollments);
    if (courses[0]) {
      return res.send([req.user, courses, enrollments, categories]);
    } else {
      return res.status(401).send({
        error: "Sry geek there are no courses available",
        user: req.user,
      });
    }
  } else {
    let courses;
    let categories;
    try {
      categories = await sequelize.query(query1, {
        type: Sequelize.QueryTypes.SELECT,
      });
      courses = await sequelize.query(query2, {
        type: Sequelize.QueryTypes.SELECT,
      });
    } catch (error) {
      return res.status(500).send({
        status: "error",
        error: "Internal server error!",
        user: req.user,
      });
    }
    if (courses[0]) {
      return res.status(200).send([req.user, courses, categories]);
    } else {
      return res.status(401).send({
        error: "Sry geek there are no courses available",
        user: req.user,
      });
    }
  }
};

// sort_courses handler
exports.sort_courses = async (req, res) => {
  let page = 0;
  if (req.body.page) {
    page = req.body.page;
  }
  const limit = 8;
  if (req.body?.sort_by) {
    let query1;
    if (req.body.sort_by == "Relevence") {
      query1 =
        "select * from Users inner join Courses on Users.user_id = Courses.createdby order by course_name";
    } else if (req.body.sort_by == "Popularity") {
      query1 =
        "select * from Users inner join Courses on Users.user_id = Courses.createdby order by course_rating desc";
    } else if (req.body.sort_by == "Newest") {
      query1 =
        "select * from Users inner join Courses on Users.user_id = Courses.createdby order by createdAt desc";
    } else if (req.body.sort_by == "Oldest") {
      query1 =
        "select * from Users inner join Courses on Users.user_id = Courses.createdby order by createdAt";
    }
    if (query1) {
      query1 = query1 + " limit " + page * limit + ", " + limit;
      sort(query1);
    } else {
      return res
        .status(500)
        .send({ status: "error", message: "Something went wrong!" });
    }
    async function sort(query1) {
      const query3 = "select course_category from Courses";
      if (req.user.role == "student") {
        const query2 =
          "select * from Enrollments where enrolledby = " + req.user.id + "";
        let courses;
        let enrollments;
        let categories;
        try {
          courses = await sequelize.query(query1, {
            type: Sequelize.QueryTypes.SELECT,
          });

          enrollments = await sequelize.query(query2, {
            type: Sequelize.QueryTypes.SELECT,
          });

          categories = await sequelize.query(query3, {
            type: Sequelize.QueryTypes.SELECT,
          });
        } catch (error) {
          return res
            .status(500)
            .send({ status: "error", error: "Internal server error!" });
        }
        if (courses[0]) {
          return res.send([req.user, courses, enrollments, categories]);
        } else {
          return res
            .status(401)
            .send({ error: "Sry geek there are no courses available" });
        }
      } else {
        let courses;
        let categories;
        try {
          courses = await sequelize.query(query1, {
            type: Sequelize.QueryTypes.SELECT,
          });
          categories = await sequelize.query(query3, {
            type: Sequelize.QueryTypes.SELECT,
          });
        } catch (error) {
          return res
            .status(500)
            .send({ status: "error", error: "Internal server error!" });
        }
        if (courses[0]) {
          return res.send([req.user, courses, categories]);
        } else {
          return res
            .status(401)
            .send({ error: "Sry geek there are no courses available" });
        }
      }
    }
  } else {
    return res.status(400).send({
      status: "error",
      error: "something went wrong!",
    });
  }
};

// filter_courses handler
exports.filter_courses = async (req, res) => {
  let page = 0;
  if (req.body.page) {
    page = req.body.page;
  }
  const limit = 8;
  if (req.body?.filters) {
    const filters = req.body.filters;

    let query1 =
      "select * from Users inner join Courses on Users.user_id = Courses.createdby";

    let query4 =
      "select count(user_id) from Users inner join Courses on Users.user_id = Courses.createdby";
    if (filters[0][0]) {
      query1 = query1 + " where Courses.course_category in (";
      query4 = query4 + " where Courses.course_category in (";

      for (let i = 0; i < filters[0].length; i++) {
        if (i == filters[0].length - 1) {
          query1 = query1 + "'" + filters[0][i] + "'";
          query4 = query4 + "'" + filters[0][i] + "'";
        } else {
          query1 = query1 + "'" + filters[0][i] + "',";
          query4 = query4 + "'" + filters[0][i] + "',";
        }
      }
      query1 = query1 + ")";
      query4 = query4 + ")";
    }
    if (filters[1][0]) {
      const range = filters[1][0].split("-");
      const lower = Number(range[0]) - 1;
      const upper = Number(range[1]) + 1;
      query1 =
        query1 +
        " and Courses.course_runtime between " +
        lower +
        " and " +
        upper +
        "";
      query4 =
        query4 +
        " and Courses.course_runtime between " +
        lower +
        " and " +
        upper +
        "";
    }
    if (filters[2][0]) {
      const range = filters[2][0].split("-");
      const lower = Number(range[0]) - 1;
      const upper = Number(range[1]) + 1;
      query1 =
        query1 +
        " and Courses.course_price between " +
        lower +
        " and " +
        upper +
        "";
      query4 =
        query4 +
        " and Courses.course_price between " +
        lower +
        " and " +
        upper +
        "";
    }
    if (filters[3][0]) {
      const range = filters[3][0].split("-");
      const lower = Number(range[0]);
      const upper = Number(range[1]) + 1;
      query1 =
        query1 +
        " and Courses.course_rating between " +
        lower +
        " and " +
        upper +
        "";

      query4 =
        query4 +
        " and Courses.course_rating between " +
        lower +
        " and " +
        upper +
        "";
    }
    query1 = query1 + " limit " + page * limit + ", " + limit;

    const query3 = "select course_category from Courses";
    if (req.user.role == "student") {
      const query2 =
        "select * from Enrollments where enrolledby = " + req.user.id + "";

      let courses;
      let enrollments;
      let categories;
      let count = 0;
      try {
        courses = await sequelize.query(query1, {
          type: Sequelize.QueryTypes.SELECT,
        });
        enrollments = await sequelize.query(query2, {
          type: Sequelize.QueryTypes.SELECT,
        });
        categories = await sequelize.query(query3, {
          type: Sequelize.QueryTypes.SELECT,
        });
        count = await sequelize.query(query4, {
          type: Sequelize.QueryTypes.SELECT,
        });
      } catch (error) {
        return res
          .status(500)
          .send({ status: "error", error: "Internal server error!" });
      }
      console.log(categories);
      if (courses[0]) {
        console.log(count[0]["count(user_id)"]);

        return res.send([
          req.user,
          courses,
          enrollments,
          count[0]["count(user_id)"],
          categories,
        ]);
      } else {
        return res.status(401).send({
          error: "Sry geek there are no courses available",
        });
      }
    } else {
      let courses;
      let categories;
      let count;
      try {
        courses = await sequelize.query(query1, {
          type: Sequelize.QueryTypes.SELECT,
        });
        categories = await sequelize.query(query3, {
          type: Sequelize.QueryTypes.SELECT,
        });
        count = await sequelize.query(query4, {
          type: Sequelize.QueryTypes.SELECT,
        });
      } catch (error) {
        return res
          .status(500)
          .send({ status: "error", error: "Internal server error!" });
      }
      if (courses[0]) {
        return res
          .status(200)
          .send([req.user, courses, count[0]["count(user_id)"], categories]);
      } else {
        return res.status(401).send({
          error: "Sry geek there are no courses available",
        });
      }
    }
  } else {
    return res.status(400).send({
      status: "error",
      error: "something went wrong!",
    });
  }
};

//search_courses handler
exports.search_courses = async (req, res) => {
  let page = 0;
  if (req.body.page) {
    page = req.body.page;
  }
  const limit = 8;
  const query1 = "select course_category from Courses";
  const query2 =
    "select * from Users inner join Courses on Users.user_id = Courses.createdby where Courses.course_name like '" +
    req.body.search_value +
    "%' limit " +
    page * limit +
    ", " +
    limit;

  const query4 =
    "select count(user_id) from Users inner join Courses on Users.user_id = Courses.createdby where Courses.course_name like '" +
    req.body.search_value +
    "%'";
  if (req.user.role == "student") {
    const query3 =
      "select * from Enrollments where enrolledby = " + req.user.id + "";
    let courses;
    let enrollments;
    let categories;
    let count;
    try {
      categories = await sequelize.query(query1, {
        type: Sequelize.QueryTypes.SELECT,
      });
      courses = await sequelize.query(query2, {
        type: Sequelize.QueryTypes.SELECT,
      });
      enrollments = await sequelize.query(query3, {
        type: Sequelize.QueryTypes.SELECT,
      });
      count = await sequelize.query(query4, {
        type: Sequelize.QueryTypes.SELECT,
      });
    } catch (error) {
      return res
        .status(500)
        .send({ status: "error", error: "Internal server error!" });
    }
    // console.log(enrollments);
    if (courses[0]) {
      return res.send([
        req.user,
        courses,
        enrollments,
        count[0]["count(user_id)"],
        categories,
      ]);
    } else {
      return res.status(401).send({
        error: "Sry geek there are no courses available",
      });
    }
  } else {
    let courses;
    let categories;
    let count;
    try {
      categories = await sequelize.query(query1, {
        type: Sequelize.QueryTypes.SELECT,
      });
      courses = await sequelize.query(query2, {
        type: Sequelize.QueryTypes.SELECT,
      });
      count = await sequelize.query(query4, {
        type: Sequelize.QueryTypes.SELECT,
      });
    } catch (error) {
      return res
        .status(500)
        .send({ status: "error", error: "Internal server error!" });
    }
    if (courses[0]) {
      return res
        .status(200)
        .send([req.user, courses, count[0]["count(user_id)"], categories]);
    } else {
      return res.status(401).send({
        error: "Sry geek there are no courses available",
      });
    }
  }
};

// single course fetch handler
exports.course = async (req, res) => {
  console.log("in course route");
  const course_id = req.headers["course_id"];
  // console.log((course_id));
  const query1 =
    "select * from Users inner join (select * from Courses where course_id = " +
    course_id +
    ")as temp1 on Users.user_id = temp1.createdby";
  let course;
  try {
    course = await sequelize.query(query1, {
      type: Sequelize.QueryTypes.SELECT,
    });
  } catch (error) {
    return res
      .status(500)
      .send({ status: "error", error: "Internal server error!" });
  }
  console.log(course);
  if (course[0]) {
    if (req.user.role == "student") {
      const query2 =
        "select * from Enrollments where enrolledby = " +
        req.user.id +
        " and enrolled_course = " +
        course[0].course_id +
        "";
      let enrollment;
      try {
        enrollment = await sequelize.query(query2, {
          type: Sequelize.QueryTypes.SELECT,
        });
      } catch (error) {
        return res
          .status(500)
          .send({ status: "error", error: "Internal server error!" });
      }
      console.log(enrollment);
      if (enrollment[0]) {
        return res.send([
          req.user,
          course[0],
          { enrolled: true, rated: enrollment[0].rated },
        ]);
      } else {
        return res.send([req.user, course[0], { enrolled: false, rated: 0 }]);
      }
    } else {
      return res.send([req.user, course[0]]);
    }
  } else {
    return res.status(401).send({ error: "cannot fetch the course details" });
  }
};

// student_rating handler
exports.student_rating = async (req, res) => {
  console.log(req.body.rating);
  if (req.headers["course_id"] && req.body?.rating) {
    const query0 =
      "select course_rating from Courses where course_id = " +
      Number(req.headers["course_id"]);
    let old_rating;
    try {
      old_rating = await sequelize.query(query0, {
        type: Sequelize.QueryTypes.SELECT,
      });
    } catch (error) {
      return res
        .status(500)
        .send({ status: "error", message: "Internal server error!" });
    }
    console.log(old_rating[0].course_rating);
    let rating = req.body.rating;
    if (old_rating[0].course_rating != null) {
      rating = Math.ceil(
        (old_rating[0].course_rating + Number(req.body.rating)) / 2
      );
    }
    console.log(rating);
    const query1 =
      "update Courses set course_rating = " +
      rating +
      " where course_id = " +
      Number(req.headers["course_id"]);
    const query2 =
      "update Enrollments set rated = " +
      1 +
      " where enrolled_course = " +
      Number(req.headers["course_id"]) +
      " and enrolledby = " +
      req.user.id;

    let update_course_table;
    let update_enrollments_table;

    try {
      update_course_table = sequelize.query(query1, {
        type: Sequelize.QueryTypes.UPDATE,
      });
      update_enrollments_table = sequelize.query(query2, {
        type: Sequelize.QueryTypes.UPDATE,
      });
    } catch (error) {
      return res
        .status(500)
        .send({ status: "error", message: "Internal server error!" });
    }
    if (update_course_table && update_enrollments_table) {
      return res
        .status(200)
        .send({ status: "success", message: "your rating added successfully" });
    } else {
      return res.status(400).send({
        status: "error",
        message: "cannot add your rating at the moment",
      });
    }
  } else {
    return res.status(400).send({
      status: "error",
      message: "cannot add your rating at the moment",
    });
  }
};

// enroll_course handler
exports.enroll_course = async (req, res) => {
  if (req.user.role == "student") {
    if (req.body?.enrolled_course) {
      const enrolledby = req.user.id;
      const enrolled_course = req.body.enrolled_course;
      let enrollCourse;
      try {
        enrollCourse = await Enrollments.create({
          enrolledby: enrolledby,
          enrolled_course: enrolled_course,
        });
      } catch (error) {
        return res
          .status(500)
          .send({ status: "error", error: "Internal server error!" });
      }
      console.log(enrollCourse);
      if (enrollCourse) {
        return res.status(200).send({
          status: "success",
          message: "Enrolled to the course successfully",
        });
      } else {
        return res.status(400).send({ error: "Cannot enroll to the course" });
      }
    } else {
      return res.status(400).send({ error: "Cannot enroll" });
    }
  } else {
    return res.status(400).send({ error: "Teacher cannot enroll a course" });
  }
};

// user_profile handler
exports.user_profile = async (req, res) => {
  let page = 0;
  if (req.query.page) {
    page = req.query.page;
  }
  const limit = 5;
  if (req.user.role == "teacher") {
    // querying Courses table
    const query1 =
      "select Courses.course_id, Courses.course_name, Courses.course_image, Courses.course_category, Courses.course_runtime from Courses where Courses.createdby = " +
      req.user.id +
      " limit " +
      page * limit +
      ", " +
      limit;

    const query2 =
      "select Users.user_id, Users.user_name, Users.email from Users inner join (select * from Enrollments inner join (select Courses.course_id from Courses where Courses.createdby = " +
      req.user.id +
      ") as temp1 on Enrollments.enrolled_course = temp1.course_id) as temp2 on Users.user_id = temp2.enrolledby";

    const query3 =
      "select count(course_id) from Courses where Courses.createdby = " +
      req.user.id +
      "";
    let createdCourses;
    let enrolledUsers;
    let count;
    try {
      //teacher details and his courses
      createdCourses = await sequelize.query(query1, {
        type: Sequelize.QueryTypes.SELECT,
      });
      //enrolled students
      enrolledUsers = await sequelize.query(query2, {
        type: Sequelize.QueryTypes.SELECT,
      });
      count = await sequelize.query(query3, {
        type: Sequelize.QueryTypes.SELECT,
      });
    } catch (error) {
      console.log(error);
      return res
        .status(500)
        .send({ status: "error", error: "Internal server error!" });
    }
    if (createdCourses && enrolledUsers) {
      return res.send([
        req.user,
        createdCourses,
        enrolledUsers,
        count[0]["count(course_id)"],
      ]);
    } else {
      return res.status(401).send({ error: "Cannot fetch the profile" });
    }
  } else if (req.user.role == "student") {
    const query1 =
      "select temp3.isCompleted, temp3.course_id, temp3.course_category, temp3.course_name, temp3.course_image, temp3.course_runtime, temp3.createdby, temp3.user_name from (select * from Users inner join (select * from Courses inner join (select enrolled_course, isCompleted from Enrollments where enrolledby = " +
      req.user.id +
      ")as temp1 on temp1.enrolled_course = Courses.course_id) as temp2 on Users.user_id = temp2.createdby) as temp3 limit " +
      page * limit +
      ", " +
      limit;

    const query2 =
      "select count(temp3.course_id) from (select * from Users inner join (select * from Courses inner join (select enrolled_course, isCompleted from Enrollments where enrolledby = " +
      req.user.id +
      ")as temp1 on temp1.enrolled_course = Courses.course_id) as temp2 on Users.user_id = temp2.createdby) as temp3";
    let profileDetails;
    let count;
    try {
      profileDetails = await sequelize.query(query1, {
        type: Sequelize.QueryTypes.SELECT,
      });
      count = await sequelize.query(query2, {
        type: Sequelize.QueryTypes.SELECT,
      });
    } catch (error) {
      console.log(error);
      return res
        .status(500)
        .send({ status: "error", error: "Internal server error!" });
    }
    if (profileDetails[0]) {
      return res
        .status(200)
        .send([req.user, profileDetails, count[0]["count(temp3.course_id)"]]);
    } else {
      return res.status(401).send({ error: "Cannot fetch the profile" });
    }
  }
};

// edit_profile handler
exports.edit_profile = async (req, res) => {
  if (req.body?.user_name && req.body?.email) {
    const query =
      "update Users set user_name = '" +
      req.body.user_name +
      "' , email =  '" +
      req.body.email +
      "' where user_id = " +
      req.user.id;

    let update_profile;
    try {
      update_profile = sequelize.query(query, {
        type: Sequelize.QueryTypes.UPDATE,
      });
    } catch (error) {
      return res
        .status(500)
        .send({ status: "error", error: "Internal server error!" });
    }
    if (update_profile) {
      return res.status(200).send(req.user);
    } else {
      return res.status(400).send({ error: "connot update your profile" });
    }
  } else {
    return res.status(400).send({ error: "connot update your profile" });
  }
};

// toggle_isCompleted handler
exports.toggle_isCompleted = async (req, res) => {
  if (req.body?.enrolled_course) {
    const query1 =
      "select * from Enrollments where enrolledby = " +
      req.user.id +
      " and enrolled_course = " +
      req.body.enrolled_course;
    let isCompleted_value;
    try {
      isCompleted_value = await sequelize.query(query1, {
        type: Sequelize.QueryTypes.SELECT,
      });
    } catch (error) {
      return res
        .status(500)
        .send({ status: "error", error: "Internal server error!1" });
    }
    let query2;
    if (isCompleted_value[0]) {
      if (isCompleted_value[0].isCompleted == 0) {
        query2 =
          "update Enrollments set isCompleted = 1 where enrolledby = " +
          req.user.id +
          " and enrolled_course = " +
          req.body.enrolled_course;
      } else if (isCompleted_value[0].isCompleted == 1) {
        query2 =
          "update Enrollments set isCompleted = 0 where enrolledby = " +
          req.user.id +
          " and enrolled_course = " +
          req.body.enrolled_course;
      }
    } else {
      return res
        .status(400)
        .send({ error: "you haven't enrolled this course" });
    }
    let toggle_isCompleted;
    try {
      toggle_isCompleted = await sequelize.query(query2, {
        type: Sequelize.QueryTypes.UPDATE,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).send({ status: "error", error: error.message });
    }
    // console.log(toggle_isCompleted);
    if (toggle_isCompleted) {
      return res
        .status(200)
        .send({ status: "success", message: "toggled the isCompleted value" });
    } else {
      return res
        .status(400)
        .send({ error: "connot mark/unmark the course as completed" });
    }
  } else {
    return res
      .status(400)
      .send({ error: "connot mark/unmark the course as completed" });
  }
};

// remove_from_trainingPath handler
exports.delete_from_trainingPath = async (req, res) => {
  if (req.body?.enrolled_course) {
    const query =
      "delete from Enrollments where enrolledby = " +
      req.user.id +
      " and enrolled_course = " +
      req.body.enrolled_course;

    let delete_from_trainingPath;
    try {
      delete_from_trainingPath = await sequelize.query(query, {
        type: Sequelize.QueryTypes.DELETE,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).send({ status: "error", error: error.message });
    }
    console.log(delete_from_trainingPath);
    if (delete_from_trainingPath == undefined) {
      return res.status(200).send({
        status: "success",
        message: "deleted the course from your training path",
      });
    } else {
      return res
        .status(400)
        .send({ error: "connot delete the course from your training path" });
    }
  } else {
    return res
      .status(400)
      .send({ error: "connot delete the course from your training path" });
  }
};

// teacher_course_view handler
exports.teacher_course_view = async (req, res) => {
  if (req.headers["course_id"]) {
    let page = 0;
    if (req.query.page) {
      page = req.query.page;
    }
    const limit = 5;
    const course_id = req.headers["course_id"];
    const query1 = "select * from Courses where course_id = " + course_id;

    const query2 =
      "select * from Users inner join (select * from Courses inner join Enrollments on Enrollments.enrolled_course = Courses.course_id where Courses.course_id = " +
      course_id +
      ") as temp on temp.enrolledby = Users.user_id limit " +
      page * limit +
      ", " +
      limit;

    const query3 =
      "select count(user_id) from Users inner join (select * from Courses inner join Enrollments on Enrollments.enrolled_course = Courses.course_id where Courses.course_id = " +
      course_id +
      ") as temp on temp.enrolledby = Users.user_id ";
    let course;
    let teacher_course_view;
    try {
      course = await sequelize.query(query1, {
        type: Sequelize.QueryTypes.SELECT,
      });
      teacher_course_view = await sequelize.query(query2, {
        type: Sequelize.QueryTypes.SELECT,
      });
      count = await sequelize.query(query3, {
        type: Sequelize.QueryTypes.SELECT,
      });
    } catch (error) {
      return res.status(500).send({ status: "error", error: error.message });
    }
    console.log(count[0]["count(user_id)"]);
    if (course[0]) {
      return res
        .status(200)
        .send([
          req.user,
          course,
          teacher_course_view,
          count[0]["count(user_id)"],
        ]);
    } else {
      return res.status(400).send({ error: "1connot open course" });
    }
  } else {
    return res.status(400).send({ error: "2connot open course" });
  }
};

// create_course handler
exports.create_course = async (req, res) => {
  console.log("im in create");
  // console.log(req.body);
  if (
    req.body?.course_category &&
    req.body?.course_name &&
    req.body?.course_image &&
    req.body?.course_description &&
    req.body?.course_runtime &&
    req.body?.course_price
  ) {
    let create_course;
    try {
      create_course = await Courses.create({
        createdby: req.user.id,
        course_category: req.body.course_category,
        course_name: req.body.course_name,
        course_image: req.body.course_image,
        course_description: req.body.course_description,
        course_runtime: req.body.course_runtime,
        course_price: Number(req.body.course_price),
      });
    } catch (error) {
      return res.status(500).send({ status: "error", error: error.message });
    }
    console.log(create_course);
    if (create_course) {
      return res
        .status(200)
        .send({ status: "success", message: "Created course successfully" });
    } else {
      return res.status(400).send({ error: "1cannot create course" });
    }
  } else {
    return res.status(400).send({ error: "2cannot create course" });
  }
};

// edit_course handler
exports.edit_course = async (req, res) => {
  console.log("im in edit");
  console.log(req.body);
  if (
    req.body?.course_category &&
    req.body?.course_name &&
    req.body?.course_image &&
    req.body?.course_description &&
    req.body?.course_runtime &&
    req.body?.course_price
  ) {
    let update_course;
    const course_id = req.headers["course_id"];
    try {
      update_course = await sequelize.query(
        "update Courses set course_category = '" +
          req.body.course_category +
          "', course_name = '" +
          req.body.course_name +
          "', course_image = '" +
          req.body.course_image +
          "', course_description = '" +
          req.body.course_description +
          "', course_runtime = '" +
          req.body.course_runtime +
          "', course_price = " +
          req.body.course_price +
          " where course_id =" +
          course_id,
        {
          type: Sequelize.QueryTypes.UPDATE,
        }
      );
    } catch (error) {
      return res.status(500).send({ status: "error", error: error.message });
    }
    console.log(update_course);
    if (update_course) {
      return res
        .status(200)
        .send({ status: "success", message: "Updated course successfully" });
    } else {
      return res.status(400).send({ error: "1cannot update course" });
    }
  } else {
    return res.status(400).send({ error: "2cannot update course" });
  }
};

// delete_from_createdCourses handler
exports.delete_from_createdCourses = async (req, res) => {
  if (req.body?.enrolled_course) {
    const query1 =
      "delete from Courses where course_id = " + req.body.enrolled_course;

    const query2 =
      "delete from Enrollments where enrolled_course = " +
      req.body.enrolled_course;

    let delete_from_createdCourses;
    let delete_from_enrollments;
    try {
      delete_from_createdCourses = await sequelize.query(query1, {
        type: Sequelize.QueryTypes.DELETE,
      });
      delete_from_enrollments = await sequelize.query(query2, {
        type: Sequelize.QueryTypes.DELETE,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).send({ status: "error", error: error.message });
    }
    console.log(delete_from_createdCourses);
    if (
      delete_from_createdCourses == undefined &&
      delete_from_enrollments == undefined
    ) {
      return res.status(200).send({
        status: "success",
        message: "deleted the course from your training path",
      });
    } else {
      return res
        .status(400)
        .send({ error: "connot delete the course from your training path" });
    }
  } else {
    return res
      .status(400)
      .send({ error: "connot delete the course from your training path" });
  }
};
