// ========== PAGE HANDLER ==========
function showPage(id) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById(id).classList.add('active');

  // Show welcome message if user is logged in
  const currentUser = localStorage.getItem("currentUser");
  if (currentUser) {
    const user = JSON.parse(localStorage.getItem("cvUsers"))[currentUser];
    document.querySelectorAll('.welcomeMsg').forEach(el => {
      el.textContent = `Welcome, ${user.name}!`;
    });
  }
}

// ========== LOGIN & SIGNUP ==========
let authMode = "signup";

function toggleAuthMode() {
  authMode = authMode === "signup" ? "login" : "signup";
  document.getElementById("authTitle").textContent = authMode === "signup" ? "Sign Up" : "Login";
  document.getElementById("fullnameDiv").style.display = authMode === "signup" ? "block" : "none";
}

function signupOrLogin() {
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();
  const fullname = document.getElementById("fullname") ? document.getElementById("fullname").value.trim() : "";

  if (!username || !password || (authMode === "signup" && !fullname)) {
    alert("Please fill all required fields.");
    return;
  }

  let users = JSON.parse(localStorage.getItem("cvUsers")) || {};

  if (authMode === "signup") {
    if (users[username]) {
      alert("User already exists. Please login.");
      return;
    }
    users[username] = { name: fullname, password };
    localStorage.setItem("cvUsers", JSON.stringify(users));
    alert("Account created! Now login.");
    toggleAuthMode();
  } else {
    if (users[username] && users[username].password === password) {
      localStorage.setItem("currentUser", username);
      alert(`Welcome, ${users[username].name}!`);
      showPage("templateSelect");
    } else {
      alert("Incorrect username or password.");
    }
  }
}

function logout() {
  localStorage.removeItem("currentUser");
  showPage("auth");
}

// ========== TEMPLATE SELECTION ==========
let selectedTemplate = "";
function selectTemplate(type) {
  selectedTemplate = type;
  localStorage.setItem("templateType", type);
  showPage("detailsForm");
}

// ========== AUTO-SAVE FEATURE ==========
const form = document.getElementById("cvForm");
if (form) {
  form.addEventListener("input", () => {
    const formData = new FormData(form);
    const obj = {};
    formData.forEach((v, k) => (obj[k] = v));
    const currentUser = localStorage.getItem("currentUser");
    if (currentUser) {
      localStorage.setItem("cvData_" + currentUser, JSON.stringify(obj));
    }
  });

  window.onload = () => {
    const currentUser = localStorage.getItem("currentUser");
    if (currentUser) {
      const saved = JSON.parse(localStorage.getItem("cvData_" + currentUser));
      if (saved) {
        for (const key in saved) {
          if (form[key]) form[key].value = saved[key];
        }
      }
    }
  };
}

// ========== UTILITY FUNCTIONS ==========
function formatSkills(skills) {
  if (!skills) return "";
  const arr = skills.split(',').map(s => s.trim()).filter(s => s);
  if (arr.length === 0) return "";
  if (arr.length === 1) return `Expert in ${arr[0]}, ready to take on challenging projects.`;
  const last = arr.pop();
  return `Experienced in ${arr.join(', ')}, and currently advancing expertise in ${last}.`;
}

function formatExperience(exp) {
  if (!exp) return "";
  return exp.split('\n').map(line => line.trim()).filter(line => line).map(line => `• ${line}`).join('<br>');
}

// ========== OOP DESIGN ==========

// ---------- Encapsulation ----------
// Base CV class hides the data (_data) and provides controlled access through getters/setters
class CV {
  constructor(data) { this._data = data; } // _data is "private"
  get data() { return this._data; }        // Getter
  set data(newData) { this._data = newData; } // Setter
  generate() { return ""; }                // Abstract method placeholder
}

// ---------- Inheritance & Polymorphism ----------
// Child classes inherit from CV (Inheritance)
// Each overrides generate() to provide unique output (Polymorphism)

// Corporate Template
class CorporateCV extends CV {
  generate() {
    const skillsText = formatSkills(this.data.skills);   // dynamic skill formatting
    const expText = formatExperience(this.data.experience); // dynamic experience formatting
    return `
      <h2>${this.data.name}</h2>
      <p>📍 ${this.data.address}</p>
      <p>📧 ${this.data.email} | 📞 ${this.data.phone}</p>
      <hr>
      <h3>💼 Professional Summary</h3>
      <p>${this.data.summary}</p>
      <h3>🏢 Work Experience</h3>
      <p>${expText}</p>
      <h3>🛠️ Skills</h3>
      <p>${skillsText}</p>
      <h3>🎓 Education</h3>
      <p>${this.data.education}</p>
      <h3>🌐 Languages</h3>
      <p>${this.data.languages}</p>
    `;
  }
}

// Minimal Modern Template
class MinimalCV extends CV {
  generate() {
    const skillsText = formatSkills(this.data.skills);
    const expText = formatExperience(this.data.experience);
    return `
      <h2>${this.data.name}</h2>
      <p><strong>${this.data.summary}</strong></p>
      <hr>
      <h3>Core Skills</h3>
      <p>${skillsText}</p>
      <h3>Professional Experience</h3>
      <p>${expText}</p>
      <h3>Education</h3>
      <p>${this.data.education}</p>
      <h3>Technical Stack</h3>
      <p>${skillsText}</p>
      <h3>Languages</h3>
      <p>${this.data.languages}</p>
    `;
  }
}

// Personal Brand Template
class PersonalCV extends CV {
  generate() {
    const skillsText = formatSkills(this.data.skills);
    const expText = formatExperience(this.data.experience);
    return `
      <h2>${this.data.name}</h2>
      <p>${this.data.summary}</p>
      <hr>
      <h3>💼 Experience</h3>
      <p>${expText}</p>
      <h3>🧠 Tech Skills</h3>
      <p>${skillsText}</p>
      <h3>🌍 Languages</h3>
      <p>${this.data.languages}</p>
      <h3>💬 Contact</h3>
      <p>📧 ${this.data.email} | 📞 ${this.data.phone}</p>
    `;
  }
}

// ---------- Abstraction ----------
// User doesn’t need to know how CV classes format data internally
// They just call cv.generate() in previewCV() and get a formatted CV

// ========== PREVIEW ==========
function previewCV() {
  const formData = new FormData(form);
  const data = {};
  formData.forEach((v, k) => (data[k] = v));

  let cv;
  switch (selectedTemplate) {
    case "corporate": cv = new CorporateCV(data); break;
    case "minimal":   cv = new MinimalCV(data); break;
    case "personal":  cv = new PersonalCV(data); break;
  }

  document.getElementById("cvPreview").innerHTML = cv.generate();
  showPage("preview");
}

// ========== DOWNLOAD PDF ==========
function downloadPDF() {
  const element = document.getElementById("cvPreview");
  const win = window.open("", "_blank");
  win.document.write("<html><body>" + element.innerHTML + "</body></html>");
  win.print();
}
