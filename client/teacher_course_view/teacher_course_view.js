const token = window.localStorage.getItem("accessToken");
const course_id = window.localStorage.getItem("course_id");

// data fetch request
async function mainReq(page) {
  try {
    const fetchResponse = await fetch(
      "http://localhost:3000/teacher_profile/teacher_course_view?" +
        new URLSearchParams({ page: page }).toString(),
      {
        method: "GET",
        headers: {
          authorization: `Bearer ${token}`,
          course_id: `${course_id}`,
        },
      }
    );

    return await fetchResponse.json();
  } catch (error) {
    return { error: "cannot fetch the course at the moment" };
  }
}

// data display function
async function teacher_course_view(page = 0) {
  const fetchedData = await mainReq(page);
  if (fetchedData["error"]) {
    if (fetchedData["status"] == "unauthorized") {
      window.location.href = "/client/login/login.html";
    } else {
      const p = document.getElementById("message");
      p.innerText = fetchedData["error"];
    }
  } else {
    console.log(fetchedData);
    clearAll();
    display_course(fetchedData[1]);

    display_enrolled_students(fetchedData[2], fetchedData[3]);

    nav_profile(fetchedData[0]);
  }
}

function display_course(course) {
  const image = document.getElementById("image");
  image.setAttribute("src", course[0].course_image);

  const category = document.getElementById("category");
  category.innerText = course[0].course_category;

  const course_name = document.getElementById("course_name");
  course_name.innerText = course[0].course_name;

  const author_name = document.getElementById("author_name");
  author_name.innerText = course[0].user_name;

  const course_description = document.getElementById("course_description");
  course_description.innerText = course[0].course_description;

  if (course[0].course_rating) {
    console.log(course[0].course_rating);
    for (let i = 1; i <= course[0].course_rating; i++) {
      const rating = document.getElementById(i);
      rating.setAttribute("fill", "currentColor");
    }
  }
  const course_price = document.getElementById("course_price");
  course_price.innerText = "Rs.  " + course[0].course_price;
}

// course enrolled students displaying function
function display_enrolled_students(enrolled_students, count) {
  const enrolled_students_details = document.getElementById("enrolledStudents");

  const heading = document.createElement("tr");
  heading.classList.add(
    "flex",
    "justify-between",
    "bg-slate-700",
    "text-white",
    "pl-2",
    "pr-6",
    "md:pr-10",
    "sticky",
    "top-0",
    "bg-white",
    "py-2",
    "text-sm",
    "md:text-base"
  );

  const studentName = document.createElement("th");
  studentName.innerText = "Student Name";
  studentName.classList.add("text-left");
  const status = document.createElement("th");
  status.innerText = "Status";

  heading.append(studentName, status);

  enrolled_students_details.append(heading);

  enrolled_students.forEach((student) => {
    // Created Courses element row
    const div = document.createElement("tr");
    div.classList.add("flex", "justify-between", "px-3");

    // student name element
    const student_name = document.createElement("h2");
    student_name.innerText = student.user_name;
    student_name.classList.add(
      "text-md",
      "font-extrabold",
      "md:text-base",
      "break-all",
      "items-center"
    );

    const student_status = document.createElement("h2");
    student_status.classList.add(
      "focus:outline-none",
      "text-white",
      "font-medium",
      "rounded-lg",
      "text-[0.5rem]",
      "md:text-sm",
      "px-1",
      "md:px-3",
      "py-1.5",
      "md:py-2",
      "mr-2",
      "mb-1"
    );
    if (student.isCompleted == 1) {
      student_status.innerText = "completed";
      student_status.classList.add("bg-green-700");
    } else {
      student_status.innerText = "inComplete";
      student_status.classList.add("bg-blue-700");
    }

    const nameWrapper = document.createElement("td");
    const statusWrapper = document.createElement("td");

    nameWrapper.append(student_name);
    statusWrapper.append(student_status);

    div.append(nameWrapper, statusWrapper);
    div.classList.add("items-center", "my-4");

    enrolled_students_details.append(div);
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
      teacher_course_view(page);
    });
    page_numbers.append(button);
  }
}

teacher_course_view();

// clear all function
function clearAll() {
  const enrolledStudents = document.getElementById("enrolledStudents");
  while (enrolledStudents.lastChild) {
    enrolledStudents.removeChild(enrolledStudents.lastChild);
  }
  const page_numbers = document.getElementById("pagination-numbers");
  while (page_numbers.lastChild) {
    page_numbers.removeChild(page_numbers.lastChild);
  }
}

//back button event handler
document.getElementById("back").addEventListener("click", () => {
  window.location.href = "/client/teacherProfile/profile.html";
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
  teacher_course_view();
});

document.addEventListener("alpine:init", () => {
  Alpine.data("layout", () => ({
    profileOpen: false,
  }));
});
