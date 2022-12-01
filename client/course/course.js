async function displayCourse() {
  const token = window.localStorage.getItem("accessToken");
  const course_id = window.localStorage.getItem("course_id");
  // console.log(course_id);
  let course_response;
  let course;
  try {
    course_response = await fetch("http://localhost:3000/course", {
      method: "GET",
      headers: {
        authorization: `Bearer ${token}`,
        course_id: `${course_id}`,
      },
    });
    course = await course_response.json();
  } catch (error) {
    const message = document.getElementById("message");
    message.innerText = error.message;
  }
  console.log(course_response);
  if (course_response.ok) {
    console.log(course);
    if (course[0]) {
      console.log(course);
      profile(course[0]);

      if (course[0].role == "teacher") {
        const enroll = document.getElementById("enroll_btn");
        enroll.style.display = "none";

        const student_rating_form = document.getElementById(
          "student_rating_form"
        );
        student_rating_form.style.display = "none";
      } else if (course[0].role == "student") {
        console.log(course[2]);
        if (course[2].enrolled == false) {
          const enroll_btn = document.getElementById("enroll_btn");
          enroll_btn.innerText = "Enroll";
          enroll_btn.classList.add(
            "focus:outline-none",
            "text-white",
            "bg-green-600",
            "hover:bg-green-800",
            "focus:ring-4",
            "focus:ring-green-300",
            "font-medium",
            "rounded-lg",
            "text-sm",
            "px-5",
            "py-2.5",
            "mr-2",
            "mb-2",
            "dark:bg-green-600"
          );

          const student_rating_form = document.getElementById(
            "student_rating_form"
          );
          student_rating_form.style.display = "none";
        } else if (course[2].enrolled == true) {
          const enroll_btn = document.getElementById("enroll_btn");
          enroll_btn.innerText = "Enrolled";
          enroll_btn.setAttribute("disabled", "");
          enroll_btn.classList.add(
            "focus:outline-none",
            "text-white",
            "bg-gray-500",
            "bg-opacity-40",
            "font-medium",
            "rounded-lg",
            "text-sm",
            "px-5",
            "py-2.5",
            "mr-2",
            "mb-2"
          );

          // student rating part
          if (course[2].rated == 0) {
            const student_rating_form = document.getElementById(
              "student_rating_form"
            );
            student_rating_form.style.display = "flex";
            student_rating_form.addEventListener("click", (e) => {
              const rating = e.target.id;
              console.log(rating);
              for (let i = 1; i <= 5; i++) {
                const a = "0" + i;
                if (Number(a) <= Number(rating)) {
                  document
                    .getElementById(a)
                    .setAttribute("fill", "currentColor");
                } else {
                  document.getElementById(a).setAttribute("fill", "none");
                }
              }

              document
                .getElementById("rating_btn")
                .addEventListener("click", async (e) => {
                  console.log("im in rating");
                  let rating_response;
                  let response_message;
                  const body = {
                    rating: rating,
                  };
                  try {
                    rating_response = await fetch(
                      "http://localhost:3000/student_rating",
                      {
                        method: "POST",
                        headers: {
                          authorization: `Bearer ${token}`,
                          course_id: `${course_id}`,
                          "Content-Type": "application/json",
                        },
                        body: JSON.stringify(body),
                      }
                    );
                    response_message = await rating_response.json();
                  } catch (error) {
                    const message = document.getElementById("message");
                    message.innerText = error.message;
                  }

                  if (rating_response.ok) {
                    console.log(response_message);
                    alert(response_message["message"]);
                    displayCourse();
                  } else {
                    const message = document.getElementById("message");
                    message.innerText = response_message["message"];
                  }
                });
            });
          } else {
            const student_rating_form = document.getElementById(
              "student_rating_form"
            );
            student_rating_form.style.display = "none";
          }
        }
        document
          .getElementById("enroll_btn")
          .addEventListener("click", async (e) => {
            const body = {
              enrolled_course: course[1].course_id,
            };
            let enroll;
            let response_data;
            try {
              enroll = await fetch("http://localhost:3000/enroll", {
                method: "POST",
                headers: {
                  authorization: `Bearer ${token}`,
                  "Content-Type": "application/json",
                },
                body: JSON.stringify(body),
              });
              response_data = await enroll.json();
            } catch (error) {
              const message = document.getElementById("message");
              message.innerText = error.message;
            }
            console.log(enroll);
            if (enroll.ok) {
              displayCourse();
            } else {
              console.log(response_data);
              const message = document.getElementById("message");
              message.innerText = response_data["error"];
            }
          });
      }
      const image = document.getElementById("image");
      image.setAttribute("src", course[1].course_image);

      const category = document.getElementById("category");
      category.innerText = "Category: " + course[1].course_category;

      const course_name = document.getElementById("course_name");
      course_name.innerText = course[1].course_name;

      const author_name = document.getElementById("author_name");
      author_name.innerText = course[1].user_name;

      const course_description = document.getElementById("course_description");
      course_description.innerText = course[1].course_description;

      if (course[1].course_rating) {
        console.log(course[1].course_rating);
        for (let i = 1; i <= course[1].course_rating; i++) {
          const rating = document.getElementById(i);
          rating.setAttribute("fill", "currentColor");
        }
      }

      const course_price = document.getElementById("course_price");
      course_price.innerText = "Rs.  " + course[1].course_price;
    }
  } else {
    if (course["error"]) {
      // console.log(course['error']);
      if (
        course["error"] == "selected the unavailable course" ||
        course["error"] == "cannot fetch the course details"
      ) {
        const message = document.getElementById("message");
        message.innerText = course["error"];
      } else {
        window.localStorage.removeItem("course_id");
        window.location.href = "/client/login/login.html";
      }
    }
  }
}

const course = displayCourse();

//back button event handler
document.getElementById("back").addEventListener("click", () => {
  window.location.href = "/client/home/home.html";
});

// profile event handler
function profile(user) {
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
  displayCourse();
});

document.addEventListener("alpine:init", () => {
  Alpine.data("layout", () => ({
    profileOpen: false,
    // asideOpen: false,
  }));
});
