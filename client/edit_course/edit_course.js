const editCourse_form = document.getElementById("editCourse");

// course details fetch request
async function courseReq() {
  const token = window.localStorage.getItem("accessToken");
  const course_id = window.localStorage.getItem("course_id");
  // console.log(course_id);
  try {
    const course_response = await fetch("http://localhost:3000/course", {
      method: "GET",
      headers: {
        authorization: `Bearer ${token}`,
        course_id: `${course_id}`,
      },
    });
    return await course_response.json();
  } catch (error) {
    return { error: "cannot edit the course at the moment" };
  }
}

async function fill_course_details() {
  const fetchedData = await courseReq();
  console.log(fetchedData);
  if (fetchedData["error"]) {
    if (fetchedData["status"] == "unauthorized") {
      window.location.href = "/client/login/login.html";
    } else {
      const message = document.createElement("p");
      message.innerText = fetchedData["error"];
      editCourse_form.append(message);
    }
  } else {
    if (fetchedData[1]) {
      document.getElementById("course_category").value =
        fetchedData[1].course_category;
      document.getElementById("course_name").value = fetchedData[1].course_name;
      document.getElementById("course_image").value =
        fetchedData[1].course_image;
      document.getElementById("course_description").value =
        fetchedData[1].course_description;
      document.getElementById("course_runtime").value =
        fetchedData[1].course_runtime;
      document.getElementById("course_price").value =
        fetchedData[1].course_price;
    }
  }
}

fill_course_details();

//edit course submit request
async function editCourse(
  course_category,
  course_name,
  course_image,
  course_description,
  course_runtime,
  course_price
) {
  const token = window.localStorage.getItem("accessToken");
  const course_id = window.localStorage.getItem("course_id");

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
      "http://localhost:3000/teacher_profile/edit_course",
      {
        method: "PUT",
        headers: {
          authorization: `Bearer ${token}`,
          course_id: `${course_id}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      }
    );
    return await fetchResponse.json();
  } catch (error) {
    return { error: "cannot edit the course at the moment" };
  }
}

//form submit event handler
editCourse_form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const formData = new FormData(editCourse_form);
  const edited_values = [...formData.entries()];
  const edit_course = await editCourse(
    edited_values[0][1],
    edited_values[1][1],
    edited_values[2][1],
    edited_values[3][1],
    edited_values[4][1],
    edited_values[5][1]
  );
  if (edit_course["error"]) {
    if (edit_course["status"] == "unauthorized") {
      window.location.href = "/client/login/login.html";
    } else {
      const message = document.createElement("p");
      message.innerText = edit_course["error"];
      editCourse_form.append(message);
    }
  } else {
    const message = document.createElement("p");
    message.innerText = edit_course["message"];
    editCourse_form.append(message);
  }
});

//back button event handler
document.getElementById("back").addEventListener("click", () => {
  window.location.href = "/client/teacherProfile/profile.html";
});
