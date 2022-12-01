// fetch request for all courses
const mainReq = async (page) => {
  const token = window.localStorage.getItem("accessToken");
  try {
    const fetchResponse = await fetch(
      "http://localhost:3000/courses?" +
        new URLSearchParams({ page: page }).toString(),
      {
        method: "POST",
        headers: {
          authorization: `Bearer ${token}`,
        },
      }
    );
    return await fetchResponse.json();
  } catch (error) {
    return { error: "Sorry geek there are no courses available" };
  }
};

// landing page controller
async function Courses(page = 0) {
  // console.log(page);
  const fetchedData = await mainReq(page);
  if (!fetchedData["error"]) {
    clearCategory();
    // filter ul element
    const category_dropdown = document.getElementById("Category-dropdown");
    const categories_array = new Array();
    fetchedData[fetchedData.length - 1].forEach((course) => {
      if (!categories_array.includes(course.course_category)) {
        const li_element = document.createElement("li");

        const input_element = document.createElement("input");
        Object.assign(input_element, {
          id: "Category",
          type: "checkbox",
          value: course.course_category,
          name: "Category",
        });
        input_element.classList.add(
          "w-4",
          "h-4",
          "text-blue-600",
          "bg-gray-100",
          "rounded",
          "border-gray-300",
          "focus:ring-blue-500"
        );

        const label_element = document.createElement("label");
        label_element.innerText = course.course_category;
        Object.assign(label_element, {
          for: "Category",
        });
        label_element.classList.add(
          "ml-2",
          "text-sm",
          "font-medium",
          "text-gray-900"
        );

        li_element.append(input_element, label_element);

        category_dropdown.append(li_element);

        categories_array.push(course.course_category);
      }
    });
  }
  dataHandler(fetchedData, "all");
}

// fetch request for sorted courses
const sortReq = async (sort_by, page) => {
  const token = window.localStorage.getItem("accessToken");

  const body = {
    sort_by: sort_by,
    page: page,
  };
  try {
    const fetchResponse = await fetch("http://localhost:3000/sort", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });
    // console.log(fetchResponse1);
    const fetchedData = await fetchResponse.json();
    // console.log(fetchedData);
    return fetchedData;
  } catch (error) {
    // console.log(error);
    return { error: "Sry geek there are no courses available" };
  }
};

// sorting controller
async function sortBy() {
  document
    .getElementById("sortCourses")
    .addEventListener("click", async (e) => {
      e.preventDefault();
      console.log(e.target.id);
      const fetchedData = await sortReq(e.target.id);
      dataHandler(fetchedData, "sort", e.target.id);
    });
}

//fetch request for filtered courses
const filterReq = async (filters, page) => {
  const token = window.localStorage.getItem("accessToken");
  const body = {
    filters: filters,
    page: page,
  };
  try {
    const fetchResponse = await fetch("http://localhost:3000/filter", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });
    return await fetchResponse.json();
  } catch (error) {
    return { error: "Sry geek there are no courses available" };
  }
};

//filter controller
function filterBy() {
  const formElement = document.getElementById("filterCourses");
  formElement.addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = new FormData(formElement);
    const values = [...formData.entries()];
    // console.log(values);
    const Category = new Array();
    const Runtime = new Array();
    const Price = new Array();
    const Rating = new Array();
    if (values[0]) {
      values.forEach((data) => {
        if (data[0] == "Category") {
          Category.push(data[1]);
        } else if (data[0] == "Runtime") {
          Runtime.push(data[1]);
        } else if (data[0] == "Price") {
          Price.push(data[1]);
        } else if (data[0] == "Rating") {
          Rating.push(data[1]);
        }
      });
      const fetchedData = await filterReq([Category, Runtime, Price, Rating]);
      // console.log(fetchedData);
      dataHandler(fetchedData, "filter", [Category, Runtime, Price, Rating]);
    } else {
      Courses();
    }
  });
}

// fetch request for search
async function searchReq(search_value, page = 0) {
  const token = window.localStorage.getItem("accessToken");
  const body = {
    search_value: search_value,
    page: page,
  };
  try {
    const fetchResponse = await fetch("http://localhost:3000/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });
    return await fetchResponse.json();
  } catch (error) {
    return { error: "Sry geek there are no courses available" };
  }
}

//search controller
function searchBy() {
  const search = document.getElementById("search-navbar");
  search.addEventListener("keydown", async (e) => {
    // console.log(e.target.value);
    if (e.keyCode == 13) {
      search_value = search.value;
      console.log(search_value.length);
      if (!search_value.length == 0) {
        const fetchedData = await searchReq(search_value);
        dataHandler(fetchedData, "search", search_value);
      } else {
        Courses();
      }
    }
  });
}

//data handler
const dataHandler = (fetchedData, type, optional = 0) => {
  //data clearing function invoking
  clearAll();
  if (fetchedData["error"]) {
    //profile navigator
    profile(fetchedData["user"]);
    // console.log(fetchedData["error"]);
    if (fetchedData["status"] == "unauthorized") {
      //   console.log(fetchedData);
      window.location.href = "/client/login/login.html";
    } else {
      const coursesDivision = document.getElementById("coursesDivision");
      const message = document.createElement("h3");
      message.innerText = fetchedData["error"];
      coursesDivision.append(message);
    }
  } else {
    // console.log(fetchedData);
    if (fetchedData[1]) {
      if (type == "filter") {
        display_filtered_courses(fetchedData, optional);
      } else if (type == "search") {
        display_searched_courses(fetchedData, optional);
      } else if (type == "sort") {
        console.log("in sort");
        display_sorted_courses(fetchedData, optional);
      } else {
        displayCourses(fetchedData);
      }

      // search event handler
      searchBy();

      // sort event handler
      sortBy();

      //filter handler
      filterBy();

      //profile navigator
      profile(fetchedData[0]);
    } else {
      const coursesDivision = document.getElementById("coursesDivision");
      const message = document.createElement("h3");
      message.innerText = "Cannot fetch the courses from DB";
      coursesDivision.append(message);
    }
  }
};

function courses_handling(fetchedData) {
  // courses div element
  const coursesDivision = document.getElementById("coursesDivision");

  //displaying user name
  document.getElementById("userName").innerText = fetchedData[0].name;
  // looping through the array of fetched courses
  fetchedData[1].forEach((course) => {
    const outerDiv = document.createElement("div");
    outerDiv.classList.add(
      "courseCard",
      "sm:w-full",
      "w-fit",
      "bg-white",
      "rounded",
      "shadow-lg"
    );

    const anchorTag = document.createElement("a");
    anchorTag.classList.add(
      "block",
      "relative",
      "h-48",
      "rounded",
      "overflow-hidden",
      "pt-4",
      "px-4"
    );

    const img = document.createElement("img");
    img.classList.add(
      "object-cover",
      "object-center",
      "w-full",
      "h-full",
      "block"
    );
    img.src = course.course_image;
    img.alt = "ecommerce";

    anchorTag.append(img);

    const innerDiv = document.createElement("div");
    innerDiv.classList.add("border-t", "mt-4", "py-2", "bg-indigo-100", "px-4");

    const category = document.createElement("h3");
    category.innerText = "category: " + course.course_category;
    category.classList.add(
      "text-gray-500",
      "text-xs",
      "tracking-widest",
      "title-font",
      "mb-1"
    );

    const title = document.createElement("h2");
    title.innerText = course.course_name;
    title.classList.add(
      "text-gray-900",
      "title-font",
      "text-lg",
      "font-medium"
    );

    if (fetchedData[0].role == "student") {
      let enrolled = false;
      fetchedData[2].forEach((enrollment) => {
        if (enrollment.enrolled_course === course.course_id) {
          enrolled = true;
        }
      });
      if (enrolled === false) {
        const enroll = document.createElement("button");
        enroll.innerText = "Enroll";
        enroll.classList.add(
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
          "mt-2",
          "dark:bg-green-600"
        );
        innerDiv.append(category, title, enroll);
        enroll.addEventListener("click", async (e) => {
          e.preventDefault();
          const token = window.localStorage.getItem("accessToken");

          const body = {
            enrolled_course: course.course_id,
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
            alert(error.message);
          }
          if (enroll.ok) {
            Courses();
          } else {
            alert(response_data["error"]);
          }
        });
      } else {
        const enroll = document.createElement("button");
        enroll.innerText = "Enrolled";
        enroll.setAttribute("disabled", "");
        enroll.classList.add(
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
          "mb-2",
          "mt-2"
        );
        innerDiv.append(category, title, enroll);
      }
    } else {
      innerDiv.append(category, title);
      outerDiv.append(anchorTag, innerDiv);
      coursesDivision.append(outerDiv);
    }

    outerDiv.append(anchorTag, innerDiv);
    coursesDivision.append(outerDiv);

    anchorTag.addEventListener("click", () => {
      window.localStorage.setItem("course_id", course.course_id);
      window.location.href = "/client/course/course.html";
    });
  });
}

// courses displaying function
function displayCourses(fetchedData) {
  courses_handling(fetchedData);

  // page numbers
  const page_numbers = document.getElementById("pagination-numbers");
  for (
    let i = 1;
    i <= Math.ceil(fetchedData[fetchedData.length - 1].length / 8);
    i++
  ) {
    const button = document.createElement("button");
    button.id = i - 1;
    button.innerText = i;
    button.classList.add(
      "py-2",
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
      Courses(page);
    });

    page_numbers.append(button);
  }
}

// sorted courses displaying function
function display_sorted_courses(fetchedData, sort_id) {
  courses_handling(fetchedData);

  // page numbers
  const page_numbers = document.getElementById("pagination-numbers");
  for (
    let i = 1;
    i <= Math.ceil(fetchedData[fetchedData.length - 1].length / 8);
    i++
  ) {
    const button = document.createElement("button");
    button.id = i - 1;
    button.innerText = i;
    button.classList.add(
      "py-2",
      "px-3",
      "leading-tight",
      "text-gray-500",
      "bg-white",
      "border",
      "border-gray-300",
      "hover:bg-gray-100",
      "hover:text-gray-700"
    );

    button.addEventListener("click", async (e) => {
      const page = e.target.id;
      const fetchedData_sort = await sortReq(sort_id, page);
      dataHandler(fetchedData_sort, "sort", sort_id);
    });

    page_numbers.append(button);
  }
}

// filtered courses displaying function
function display_filtered_courses(fetchedData, filters) {
  courses_handling(fetchedData);

  // page numbers
  console.log(fetchedData[fetchedData.length - 2]);
  const page_numbers = document.getElementById("pagination-numbers");
  for (
    let i = 1;
    i <= Math.ceil(fetchedData[fetchedData.length - 2] / 8);
    i++
  ) {
    const button = document.createElement("button");
    button.id = i - 1;
    button.innerText = i;
    button.classList.add(
      "py-2",
      "px-3",
      "leading-tight",
      "text-gray-500",
      "bg-white",
      "border",
      "border-gray-300",
      "hover:bg-gray-100",
      "hover:text-gray-700"
    );

    button.addEventListener("click", async (e) => {
      const page = e.target.id;
      const fetchedData_filter = await filterReq(filters, page);
      dataHandler(fetchedData_filter, "filter", filters);
    });

    page_numbers.append(button);
  }
}

// searched courses displaying function
function display_searched_courses(fetchedData, search_value) {
  courses_handling(fetchedData);

  // page numbers
  console.log(fetchedData[fetchedData.length - 2]);
  const page_numbers = document.getElementById("pagination-numbers");
  for (
    let i = 1;
    i <= Math.ceil(fetchedData[fetchedData.length - 2] / 8);
    i++
  ) {
    const button = document.createElement("button");
    button.id = i - 1;
    button.innerText = i;
    button.classList.add(
      "py-2",
      "px-3",
      "leading-tight",
      "text-gray-500",
      "bg-white",
      "border",
      "border-gray-300",
      "hover:bg-gray-100",
      "hover:text-gray-700"
    );

    button.addEventListener("click", async (e) => {
      const page = e.target.id;
      const fetchedData_search = await searchReq(search_value, page);
      dataHandler(fetchedData_search, "search", search_value);
    });

    page_numbers.append(button);
  }
}

function clearAll() {
  const coursesDivision = document.getElementById("coursesDivision");
  while (coursesDivision.lastChild) {
    coursesDivision.removeChild(coursesDivision.lastChild);
  }
  const page_numbers = document.getElementById("pagination-numbers");
  while (page_numbers.lastChild) {
    page_numbers.removeChild(page_numbers.lastChild);
  }
}

function clearCategory() {
  const category_dropdown = document.getElementById("Category-dropdown");
  while (category_dropdown.lastChild) {
    category_dropdown.removeChild(category_dropdown.lastChild);
  }
}

// profile event handler
function profile(user) {
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
  Courses();
});

Courses();

document.addEventListener("alpine:init", () => {
  Alpine.data("layout", () => ({
    profileOpen: false,
    asideOpen: false,
  }));
});

function list_view() {
  const course = document.getElementById("coursesDivision");
  const courseCard = document.getElementsByClassName("courseCard");
  const images = document.getElementsByClassName("object-cover");
  for (let i = 0; i < courseCard.length; i++) {
    courseCard[i].className =
      "courseCard mx-auto bg-white my-10  lg:w-[70%] md:w-[80%] ";
    courseCard[i].childNodes[0].className =
      "block relative  rounded overflow-hidden pt-4 px-4";
    courseCard[i].childNodes[0].childNodes[0].className =
      "h-[300px] object-cover object-center w-full";
  }
  // console.log(courseCard);
  course.className = "block";
}

function grid_view() {
  const course = document.getElementById("coursesDivision");
  const courseCard = document.getElementsByClassName("courseCard");
  for (let i = 0; i < courseCard.length; i++) {
    courseCard[i].className =
      "courseCard sm:w-full w-fit bg-white rounded shadow-lg";

    courseCard[i].childNodes[0].className =
      "block relative h-48 rounded overflow-hidden pt-4 px-4";
    courseCard[i].childNodes[0].childNodes[0].className =
      "object-cover object-center w-full h-full block";
  }
  course.className =
    "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4 md:mt-0 w-[92%] mx-auto overflow-y-auto py-6 justify-items-centers";
}
