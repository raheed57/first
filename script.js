// ===== BASIC CONFIG =====
const API_KEY = "d2b8ff96fdmsh685ceba9a9f2202p1548abjsn17e0d14000ba";

// الأساس لكل الطلبات
const API_BASE = "https://exercisedb.p.rapidapi.com";

// عناصر الـ DOM
const searchForm = document.getElementById("search-form");
const bodyPartSelect = document.getElementById("bodypart-select");
const nameInput = document.getElementById("name-input");
const clearBtn = document.getElementById("clear-btn");
const messageDiv = document.getElementById("message");
const resultsDiv = document.getElementById("results");

async function fetchJSON(url) {
  const response = await fetch(url, {
    headers: {
      "x-rapidapi-key": API_KEY,
      "x-rapidapi-host": "exercisedb.p.rapidapi.com"
    }
  });

  if (!response.ok) {
    throw new Error(`HTTP error: ${response.status}`);
  }

  return response.json();
}


async function loadBodyParts() {
  try {
    showMessage("Loading body parts...", "info");

    const url = API_BASE + "/exercises/bodyPartList";

    const bodyParts = await fetchJSON(url);

    bodyParts.forEach((bp) => {
      const option = document.createElement("option");
      option.value = bp;
      option.textContent = bp;
      bodyPartSelect.appendChild(option);
    });

    showMessage("Choose a body part and click Search.", "info");
  } catch (error) {
    console.error(error);
    showMessage(
      "Could not load body parts. Check your API key or internet connection.",
      "error"
    );
  }
}

async function searchExercises(bodyPart, nameQuery) {
  try {
    showMessage("Searching exercises...", "info");

    const url =
    API_BASE +
    "/exercises/bodyPart/" +
    encodeURIComponent(bodyPart);

    const data = await fetchJSON(url);

    // فلترة إضافية بالاسم (client-side)
    let filtered = data;
    if (nameQuery) {
      const q = nameQuery.toLowerCase();
      filtered = data.filter((ex) => ex.name.toLowerCase().includes(q));
    }

    if (filtered.length === 0) {
      clearResults();
      showMessage("No exercises found for your search.", "error");
      return;
    }

    showMessage(`Found ${filtered.length} exercises.`, "success");
    renderExercises(filtered);
  } catch (error) {
    console.error(error);
    showMessage("Error while fetching exercises. Please try again.", "error");
  }
}

function clearResults() {
  resultsDiv.innerHTML = "";
}

function renderExercises(exercises) {
  clearResults();

  exercises.forEach((ex) => {
    const card = document.createElement("article");
    card.className = "exercise-card";

    // نعرض على الأقل 5 عناصر من الـ API:
    // name, bodyPart, target, equipment, difficulty, instructions[0..2]
    const difficultyText = ex.difficulty || "Not specified";
    const instructions = Array.isArray(ex.instructions)
      ? ex.instructions.slice(0, 3)
      : [];

    card.innerHTML = `
      <h3>${ex.name}</h3>
      <p><strong>Body part:</strong> ${ex.bodyPart}</p>
      <p><strong>Target muscle:</strong> ${ex.target}</p>
      <p><strong>Equipment:</strong> ${ex.equipment}</p>
      <p><strong>Difficulty:</strong> ${difficultyText}</p>
      <p><strong>Category:</strong> ${ex.category || "Not specified"}</p>
      <p><strong>Instructions:</strong></p>
      <ul class="instructions">
        ${instructions.map((step) => `<li>${step}</li>`).join("")}
      </ul>
    `;

    // Event 3: click على الكرت يوسّع/يطوي الـ instructions
    card.addEventListener("click", () => {
      card.classList.toggle("expanded");
    });

    resultsDiv.appendChild(card);
  });
}

function showMessage(text, type = "info") {
  messageDiv.textContent = text;
  messageDiv.className = "message " + type;
}

// Event 1: تحميل البيانات عند فتح الصفحة
document.addEventListener("DOMContentLoaded", () => {
  loadBodyParts();
});

// Event 2: submit على الفورم (search)
searchForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const bodyPart = bodyPartSelect.value;
  const nameQuery = nameInput.value.trim();

  if (!bodyPart && !nameQuery) {
    showMessage("Please choose a body part or type an exercise name.", "error");
    return;
  }

  searchExercises(bodyPart, nameQuery);
});

// Event 3: click على زر Clear
clearBtn.addEventListener("click", () => {
  clearResults();
  nameInput.value = "";
  showMessage("Results cleared.", "info");
});

// Event 4 (اختياري لزيادة النقاط): keyup على خانة البحث
nameInput.addEventListener("keyup", () => {
  if (!nameInput.value.trim()) {
    // لما يصير فاضي، نشيل أي رسالة قديمة
    messageDiv.textContent = "";
    messageDiv.className = "message";
  }
});
