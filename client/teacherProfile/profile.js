// profile fetch request
async function profile_fetch(page) {
  const token = window.localStorage.getItem("accessToken");
  try {
    const fetchResponse = await fetch(
      "http://localhost:3000/profile?" +
        new URLSearchParams({ page: page }).toString(),
      {
        method: "GET",
        headers: {
          authorization: `Bearer ${token}`,
        },
      }
    );
    const data = await fetchResponse.json();
    return data;
  } catch (error) {
    return { error: "cannot fetch your profile at the moment" };
  }
}

// profile page controller
async function profile(page = 0) {
  clearAll();
  const fetchedData = await profile_fetch(page);
  console.log(fetchedData);
  if (fetchedData["error"]) {
    if (fetchedData["status"] == "unauthorized") {
      window.location.href = "/client/login/login.html";
    } else {
      const profileDivision = document.getElementById("profileDiv");
      const message = document.createElement("h3");
      message.innerText = fetchedData["error"];
      profileDivision.append(message);
    }
  } else {
    // console.log(fetchedData[0]);

    user_details(fetchedData[0]);

    createdCourses(fetchedData[1], fetchedData[fetchedData.length - 1]);

    total_Enrollments(fetchedData[2]);

    nav_profile(fetchedData[0]);
  }
}

// delete course fetch request
async function delete_from_createdCourses(enrolled_course) {
  const token = window.localStorage.getItem("accessToken");
  const body = {
    enrolled_course: enrolled_course,
  };
  try {
    const fetchResponse = await fetch(
      "http://localhost:3000/teacher_profile/delete_from_createdCourses",
      {
        method: "DELETE",
        headers: {
          authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      }
    );
    return await fetchResponse.json();
  } catch (error) {
    return {
      error: "cannot remove the course from your training path at the moment",
    };
  }
}

// user details displaying function
function user_details(user) {
  console.log(user.role);
  const user_role = document.getElementById("user_role");
  user_role.innerText = user.role;

  const name = document.getElementById("user_name");
  name.innerText = user.name;

  const email = document.getElementById("user_email");
  email.innerText = user.email;

  const edit_profile = document.getElementById("edit_profile");
  edit_profile.innerText = "Edit Profile";

  edit_profile.addEventListener("click", () => {
    window.location.href = "/client/edit_profile/edit_profile.html";
  });
}

// teacher created courses displaying function
function createdCourses(created_courses, count) {
  const created_courses_details = document.getElementById("createdCourses");

  const heading = document.createElement("tr");
  heading.classList.add(
    "flex",
    "justify-between",
    "bg-slate-700",
    "text-white",
    "px-6",
    "sticky",
    "top-0",
    "bg-white",
    "py-2",
    "text-sm",
    "md:text-base"
  );

  const courseName = document.createElement("th");
  courseName.innerText = "Course";
  courseName.classList.add("w-[47%]", "text-left");
  const status = document.createElement("th");
  status.innerText = "Edit";
  const remove = document.createElement("th");
  remove.innerText = " Delete ";

  heading.append(courseName, status, remove);

  created_courses_details.append(heading);

  created_courses.forEach((course) => {
    // Created Courses element row
    const div = document.createElement("tr");
    div.classList.add("flex", "justify-between");

    // course div
    const courseDiv = document.createElement("td");
    courseDiv.classList.add("inline-flex", "w-1/2", "px-4");

    // course image element
    const image = document.createElement("img");
    image.src = course.course_image;
    image.alt = "ecommerce";
    image.classList.add("w-[80px]", "mr-2", "md:mr-4", "w-[56px]");

    // course name element
    const course_name = document.createElement("h2");
    course_name.innerText = course.course_name;
    course_name.classList.add("text-xs", "md:text-base", "break-all");

    courseDiv.append(image, course_name);
    courseDiv.classList.add("items-center");

    // edit button
    const course_edit = document.createElement("button");
    course_edit.innerText = "Edit";
    course_edit.classList.add(
      "focus:outline-none",
      "text-white",
      "bg-indigo-700",
      "font-medium",
      "rounded-lg",
      "text-[0.5rem]",
      "md:text-sm",
      "px-2",
      "md:px-5",
      "py-1.5",
      "md:py-2.5",
      "mr-2",
      "mb-2"
    );

    // remove button
    const remove = document.createElement("button");
    remove.innerText = "Delete";
    remove.classList.add(
      "focus:outline-none",
      "text-white",
      "bg-red-700",
      "font-medium",
      "rounded-lg",
      "text-[0.5rem]",
      "md:text-sm",
      "px-2",
      "md:px-5",
      "py-1.5",
      "md:py-2.5",
      "mr-2",
      "mb-2"
    );

    const editWrapper = document.createElement("td");
    const removeWrapper = document.createElement("td");

    editWrapper.append(course_edit);
    removeWrapper.append(remove);

    div.append(courseDiv, editWrapper, removeWrapper);
    div.classList.add("items-center", "my-4");

    created_courses_details.append(div);

    // create course button event handler
    document.getElementById("create").addEventListener("click", () => {
      window.location.href = "/client/create_course/create_course.html";
    });

    // course div event handler
    courseDiv.addEventListener("click", () => {
      window.localStorage.setItem("course_id", course.course_id);
      window.location.href =
        "/client/teacher_course_view/teacher_course_view.html";
    });

    // course edit button event handler
    course_edit.addEventListener("click", async () => {
      window.localStorage.setItem("course_id", course.course_id);
      window.location.href = "/client/edit_course/edit_course.html";
    });

    // remove button event handler
    remove.addEventListener("click", async () => {
      const fetchedData = await delete_from_createdCourses(course.course_id);
      if (fetchedData["error"]) {
        if (fetchedData["status"] == "unauthorized") {
          window.location.href = "/client/login/login.html";
        } else {
          clearAll();
          const profileDivision = document.getElementById("profileDiv");
          const message = document.createElement("h3");
          message.innerText = fetchedData["error"];
          profileDivision.append(message);
        }
      } else {
        profile();
      }
    });
  });
  // page numbers
  const page_numbers = document.getElementById("pagination-numbers");
  for (let i = 1; i <= Math.ceil(count / 5); i++) {
    const button = document.createElement("button");
    button.id = i - 1;
    button.innerText = i;
    button.classList.add(
      "py-1",
      "px-3",
      "leading-tight",
      "text-gray-500",
      "bg-white",
      "border",
      "border-gray-300",
      "hover:bg-gray-100",
      "hover:text-gray-700"
    );

    button.addEventListener("click", (e) => {
      const page = e.target.id;
      profile(page);
    });
    page_numbers.append(button);
  }
}

// total enrolled students count display function
function total_Enrollments(enrollments) {
  const total_Enrollments = document.getElementById("total_Enrollments");
  const count = enrollments.length;

  total_Enrollments.innerText = count;
}

// clear all function
function clearAll() {
  const createdCourses = document.getElementById("createdCourses");
  while (createdCourses.lastChild) {
    createdCourses.removeChild(createdCourses.lastChild);
  }
  const page_numbers = document.getElementById("pagination-numbers");
  while (page_numbers.lastChild) {
    page_numbers.removeChild(page_numbers.lastChild);
  }
}

//profile function call
profile();

//back button event handler
document.getElementById("back").addEventListener("click", () => {
  window.location.href = "/client/home/home.html";
});

// profile event handler
function nav_profile(user) {
  document.getElementById("userName").innerText = user.name;
  document.getElementById("profile").addEventListener("click", () => {
    if (user.role == "student") {
      window.location.href = "../studentProfile/profile.html";
    } else {
      window.location.href = "../teacherProfile/profile.html";
    }
  });
}

//logout
document.getElementById("logout").addEventListener("click", () => {
  window.localStorage.removeItem("accessToken");
  profile();
});

document.addEventListener("alpine:init", () => {
  Alpine.data("layout", () => ({
    profileOpen: false,
    // asideOpen: false,
  }));
});
