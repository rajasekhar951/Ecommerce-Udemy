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
    return await fetchResponse.json();
  } catch (error) {
    return { error: "cannot fetch your profile at the moment" };
  }
}

// profile page controller
async function profile(page = 0) {
  clearAll();
  const fetchedData = await profile_fetch(page);

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

    training_path(fetchedData[1], fetchedData[fetchedData.length - 1]);

    nav_profile(fetchedData[0]);
  }
}

// toggle isCompleted fetch request
async function toggle_isCompleted(enrolled_course) {
  const token = window.localStorage.getItem("accessToken");
  const body = {
    enrolled_course: enrolled_course,
  };
  try {
    const fetchResponse = await fetch(
      "http://localhost:3000/student_profile/toggle_isCompleted",
      {
        method: "PUT",
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
      error: "cannot mark/unmark the course as completed at the moment",
    };
  }
}

// delete course fetch request
async function delete_from_trainingPath(enrolled_course) {
  const token = window.localStorage.getItem("accessToken");
  const body = {
    enrolled_course: enrolled_course,
  };
  try {
    const fetchResponse = await fetch(
      "http://localhost:3000/student_profile/delete_from_trainingPath",
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
  const role = document.getElementById("role");
  role.innerText = user.role;

  const name = document.getElementById("name");
  name.innerText = user.name;

  const email = document.getElementById("email");
  email.innerText = user.email;

  const edit_profile = document.getElementById("edit_profile");
  edit_profile.innerText = "Edit Profile";

  edit_profile.addEventListener("click", () => {
    window.location.href = "/client/edit_profile/edit_profile.html";
  });
}

// training path displaying function
function training_path(enrolled_courses, count) {
  const training_path_details = document.getElementById("trainingPath");

  const heading = document.createElement("tr");
  heading.classList.add(
    "flex",
    "justify-between",
    "bg-slate-700",
    "text-white",
    "px-4",
    "sticky",
    "top-0",
    "bg-white",
    "py-2",
    "text-sm",
    "md:text-base"
  );

  const courseName = document.createElement("th");
  courseName.innerText = "Course";
  courseName.classList.add("w-[45%]", "text-left");
  const status = document.createElement("th");
  status.innerText = "Status";
  const remove = document.createElement("th");
  remove.innerText = " Delete ";

  heading.append(courseName, status, remove);

  training_path_details.append(heading);

  enrolled_courses.forEach((course) => {
    // training path element row
    const div = document.createElement("tr");
    div.classList.add("flex", "justify-between");

    // course div
    const courseDiv = document.createElement("td");
    courseDiv.classList.add("inline-flex", "w-1/2", "px-4");

    // course image element
    const image = document.createElement("img");
    image.src = course.course_image;
    image.alt = "ecommerce";
    image.classList.add("md:w-[80px]", "mr-2", "md:mr-4", "w-[56px]");

    // course name element
    const course_name = document.createElement("h2");
    course_name.innerText = course.course_name;
    course_name.classList.add("text-xs", "md:text-base", "break-all");

    courseDiv.append(image, course_name);
    courseDiv.classList.add("items-center");

    //isCompleted toggle button
    const isCompleted = document.createElement("button");
    if (course.isCompleted == 0) {
      isCompleted.innerText = "complete it";
      isCompleted.classList.add(
        "focus:outline-none",
        "text-white",
        "bg-indigo-600",
        "font-medium",
        "rounded-lg",
        "text-[0.44rem]",
        "md:text-sm",
        "px-2",
        "md:px-5",
        "py-1.5",
        "md:py-2.5",
        "mr-2",
        "mb-2"
      );
    } else {
      isCompleted.innerText = "completed";
      isCompleted.classList.add(
        "focus:outline-none",
        "text-gray",
        "bg-indigo-300",
        "font-medium",
        "rounded-lg",
        "text-[0.44rem]",
        "md:text-sm",
        "px-2",
        "md:px-5",
        "py-1.5",
        "md:py-2.5",
        "mr-2",
        "mb-2"
      );
    }

    // remove from training path button
    const remove = document.createElement("button");
    remove.innerText = "Remove";
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

    const completedWrapper = document.createElement("td");
    const removeWrapper = document.createElement("td");

    completedWrapper.append(isCompleted);
    removeWrapper.append(remove);

    div.append(courseDiv, completedWrapper, removeWrapper);
    div.classList.add("items-center", "my-4");

    training_path_details.append(div);

    // course div event handler
    courseDiv.addEventListener("click", () => {
      window.localStorage.setItem("course_id", course.course_id);
      window.location.href = "/client/course/course.html";
    });

    // isCompleted button event handler
    isCompleted.addEventListener("click", async () => {
      //   console.log(course.course_id);
      const fetchedData = await toggle_isCompleted(course.course_id);
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

    // remove button event handler
    remove.addEventListener("click", async () => {
      const fetchedData = await delete_from_trainingPath(course.course_id);
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

// clear all function
function clearAll() {
  const trainingPath = document.getElementById("trainingPath");
  while (trainingPath.lastChild) {
    trainingPath.removeChild(trainingPath.lastChild);
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
