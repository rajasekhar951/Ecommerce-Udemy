const createCourse_form = document.getElementById("createCourse");

// create course fetch request
async function createCourse(
  course_category,
  course_name,
  course_image,
  course_description,
  course_runtime,
  course_price
) {
  const token = window.localStorage.getItem("accessToken");
  const body = {
    course_category: course_category,
    course_name: course_name,
    course_image: course_image,
    course_description: course_description,
    course_runtime: course_runtime,
    course_price: course_price,
  };
  let fetchResponse;
  try {
    fetchResponse = await fetch(
      "http://localhost:3000/teacher_profile/create_course",
      {
        method: "POST",
        headers: {
          authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      }
    );
    return await fetchResponse.json();
  } catch (error) {
    console.log(error.message);
    return { error: "cannot create the course at the moment" };
  }
}

//form submit event handler
createCourse_form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const formData = new FormData(createCourse_form);
  const values = [...formData.entries()];
  const create_course = await createCourse(
    values[0][1],
    values[1][1],
    values[2][1],
    values[3][1],
    values[4][1],
    values[5][1]
  );
  if (create_course["error"]) {
    if (create_course["status"] == "unauthorized") {
      window.location.href = "/client/login/login.html";
    } else {
      const message = document.createElement("p");
      message.innerText = create_course["error"];
      createCourse_form.append(message);
    }
  } else {
    const message = document.createElement("p");
    message.innerText = create_course["message"];
    createCourse_form.append(message);
  }
});

//back button event handler
document.getElementById("back").addEventListener("click", () => {
  window.location.href = "/client/teacherProfile/profile.html";
});
