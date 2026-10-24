/* ================= INITIAL DATA ================= */

let correct = localStorage.getItem("smartlift_correct")
  ? parseInt(localStorage.getItem("smartlift_correct"))
  : 87;

let error = localStorage.getItem("smartlift_error")
  ? parseInt(localStorage.getItem("smartlift_error"))
  : 13;

let seconds = localStorage.getItem("smartlift_seconds")
  ? parseInt(localStorage.getItem("smartlift_seconds"))
  : 0;

let isTraining = false;
let timerInterval = null;
let repInterval = null;

const dailyGoal = 120;
const weeklyGoal = 7;

let historyData = [60, 65, 70, 76, 82, 80, 87];


/* ================= SHORTCUT ================= */

const $ = (id) => document.getElementById(id);


/* ================= ELEMENTS ================= */

const splashScreen = $("splashScreen");
const toast = $("toast");

const loginPage = $("loginPage");
const appPage = $("appPage");
const bottomNav = $("bottomNav");

const googleLoginBtn = $("googleLoginBtn");
const appleLoginBtn = $("appleLoginBtn");
const guestLoginBtn = $("guestLoginBtn");
const logoutBtn = $("logoutBtn");

const greetingText = $("greetingText");

const summaryAccuracy = $("summaryAccuracy");
const summarySession = $("summarySession");
const durationText = $("durationText");
const caloriesText = $("caloriesText");
const riskLabel = $("riskLabel");
const accuracyRing = $("accuracyRing");

const sensorStatus = $("sensorStatus");
const batteryText = $("batteryText");
const signalText = $("signalText");

const trainingStatus = $("trainingStatus");

const connectBtn = $("connectBtn");
const saveBtn = $("saveBtn");
const resetBtn = $("resetBtn");

const goalText = $("goalText");
const goalBar = $("goalBar");

const correctText = $("correctText");
const errorText = $("errorText");
const errorRateText = $("errorRateText");
const accuracyText = $("accuracyText");

const scoreRing = $("scoreRing");
const trendText = $("trendText");

const riskScore = $("riskScore");
const riskText = $("riskText");

const coachText = $("coachText");

const levelText = $("levelText");
const expText = $("expText");
const expBar = $("expBar");

const weeklyText = $("weeklyText");
const weeklyBar = $("weeklyBar");

const profileName = $("profileName");
const profileTotal = $("profileTotal");
const profileAccuracy = $("profileAccuracy");

const beginnerStatus = $("beginnerStatus");
const advancedStatus = $("advancedStatus");
const expertStatus = $("expertStatus");

const bronzeMedal = $("bronzeMedal");
const silverMedal = $("silverMedal");
const goldMedal = $("goldMedal");

const startBtn = $("startBtn");


/* ================= LIVE MODAL ================= */

const liveModal = $("liveModal");
const closeLiveBtn = $("closeLiveBtn");

const liveTime = $("liveTime");
const liveSession = $("liveSession");
const liveCorrect = $("liveCorrect");
const liveError = $("liveError");
const liveFeedback = $("liveFeedback");


/* ================= ACHIEVEMENT MODAL ================= */

const achievementModal = $("achievementModal");
const modalMedal = $("modalMedal");
const modalTitle = $("modalTitle");
const modalText = $("modalText");
const closeAchievementBtn = $("closeAchievementBtn");


/* ================= REPORT MODAL ================= */

const reportModal = $("reportModal");
const reportDate = $("reportDate");
const reportAccuracy = $("reportAccuracy");
const reportCorrect = $("reportCorrect");
const reportError = $("reportError");
const reportDuration = $("reportDuration");
const reportCalories = $("reportCalories");
const reportRisk = $("reportRisk");
const closeReportBtn = $("closeReportBtn");


/* ================= SPLASH ================= */

setTimeout(function(){
  splashScreen.classList.add("hide");
}, 1400);


/* ================= TOAST ================= */

function showToast(message){
  toast.textContent = message;
  toast.classList.add("show");

  setTimeout(function(){
    toast.classList.remove("show");
  }, 1800);
}


/* ================= LOGIN ================= */

function login(username){
  localStorage.setItem("smartlift_logged_in", "true");
  localStorage.setItem("smartlift_username", username);

  profileName.textContent = username;

  loginPage.classList.add("hidden");
  appPage.classList.remove("hidden");
  bottomNav.classList.remove("hidden");

  showToast("เข้าสู่ระบบสำเร็จ");
}

googleLoginBtn.addEventListener("click", function(){
  login("Google User");
});

appleLoginBtn.addEventListener("click", function(){
  login("Apple User");
});

guestLoginBtn.addEventListener("click", function(){
  login("SmartLift User");
});

logoutBtn.addEventListener("click", function(){
  localStorage.removeItem("smartlift_logged_in");

  appPage.classList.add("hidden");
  bottomNav.classList.add("hidden");
  loginPage.classList.remove("hidden");

  showToast("ออกจากระบบแล้ว");
});

if(localStorage.getItem("smartlift_logged_in") === "true"){
  loginPage.classList.add("hidden");
  appPage.classList.remove("hidden");
  bottomNav.classList.remove("hidden");

  profileName.textContent =
    localStorage.getItem("smartlift_username") || "SmartLift User";
}


/* ================= TIME ================= */

function formatTime(totalSeconds){
  const minutes = Math.floor(totalSeconds / 60);
  const sec = totalSeconds % 60;

  return String(minutes).padStart(2, "0") + ":" + String(sec).padStart(2, "0");
}

function updateGreeting(){
  const hour = new Date().getHours();

  if(hour < 12){
    greetingText.textContent = "Good Morning";
  }else if(hour < 18){
    greetingText.textContent = "Good Afternoon";
  }else{
    greetingText.textContent = "Good Evening";
  }
}
/* ================= CHART ================= */

const chartCanvas = $("accuracyChart");

const accuracyChart = new Chart(chartCanvas, {
  type: "line",
  data: {
    labels: ["21", "22", "23", "24", "25", "26", "27"],
    datasets: [{
      data: historyData,
      borderColor: "#2563eb",
      backgroundColor: "rgba(37,99,235,0.15)",
      fill: true,
      tension: 0.42,
      pointRadius: 4,
      pointBackgroundColor: "#2563eb"
    }]
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      }
    },
    scales: {
      y: {
        min: 0,
        max: 100,
        ticks: {
          callback: function(value){
            return value + "%";
          }
        }
      }
    }
  }
});


/* ================= RISK SCORE ================= */

function getRiskInfo(errorPercent){

  if(errorPercent >= 30){
    return {
      label: "High",
      text: "ความเสี่ยงสูง ควรหยุดพักและปรับท่าทางก่อนฝึกต่อ",
      className: "high",
      coach: "ตรวจพบท่าผิดพลาดค่อนข้างสูง ควรลดน้ำหนักที่ใช้และควบคุมหลังให้ตรงมากขึ้น"
    };
  }

  if(errorPercent >= 15){
    return {
      label: "Medium",
      text: "ความเสี่ยงปานกลาง ควรระวังท่าทางระหว่างฝึก",
      className: "medium",
      coach: "วันนี้ยังมีท่าผิดพลาดบางส่วน ลองควบคุมจังหวะการยกให้ช้าลงและมั่นคงขึ้น"
    };
  }

  return {
    label: "Low",
    text: "ความเสี่ยงต่ำ สามารถฝึกต่อได้",
    className: "",
    coach: "วันนี้คุณทำได้ดีมาก รักษาท่าทางและจังหวะการยกแบบนี้ต่อไป"
  };
}


/* ================= LEVEL / EXP ================= */

function updateLevel(total){

  let level = 1;
  let title = "Beginner";
  let expGoal = 500;

  if(total >= 1000){
    level = 4;
    title = "Expert";
    expGoal = 1500;
  }else if(total >= 500){
    level = 3;
    title = "Advanced";
    expGoal = 1000;
  }else if(total >= 200){
    level = 2;
    title = "Intermediate";
    expGoal = 500;
  }

  const exp = total % expGoal;
  const expPercent = Math.min((exp / expGoal) * 100, 100);

  levelText.textContent = "Level " + level + " " + title;
  expText.textContent = "EXP " + exp + " / " + expGoal;
  expBar.style.width = expPercent + "%";
}


/* ================= WEEKLY GOAL ================= */

function updateWeeklyGoal(){

  const trainedDays = 4;
  const percent = Math.round((trainedDays / weeklyGoal) * 100);

  weeklyText.textContent = trainedDays + " / " + weeklyGoal + " วัน";
  weeklyBar.style.width = percent + "%";
}


/* ================= SAVE DATA ================= */

function saveData(){
  localStorage.setItem("smartlift_correct", correct);
  localStorage.setItem("smartlift_error", error);
  localStorage.setItem("smartlift_seconds", seconds);
}
/* ================= ACHIEVEMENT ================= */

function showAchievement(title, text, type){

  modalTitle.textContent = title;
  modalText.textContent = text;

  modalMedal.className = "modal-medal " + type;

  achievementModal.classList.add("show");
}


function updateAchievements(total){

  if(total >= 100){

    beginnerStatus.textContent = "Unlocked";
    beginnerStatus.className = "unlock";

    bronzeMedal.classList.add("medal-unlocked");

    if(!localStorage.getItem("smartlift_ach_beginner")){
      showAchievement(
        "Beginner",
        "ยกครบ 100 ครั้ง",
        "bronze"
      );

      localStorage.setItem("smartlift_ach_beginner", "true");
    }

  }


  if(total >= 500){

    advancedStatus.textContent = "Unlocked";
    advancedStatus.className = "unlock";

    silverMedal.classList.add("medal-unlocked");

    if(!localStorage.getItem("smartlift_ach_advanced")){
      showAchievement(
        "Advanced",
        "ยกครบ 500 ครั้ง",
        "silver"
      );

      localStorage.setItem("smartlift_ach_advanced", "true");
    }

  }else{

    advancedStatus.textContent = "Locked";
    advancedStatus.className = "lock";

  }


  if(total >= 1000){

    expertStatus.textContent = "Unlocked";
    expertStatus.className = "unlock";

    goldMedal.classList.add("medal-unlocked");

    if(!localStorage.getItem("smartlift_ach_expert")){
      showAchievement(
        "Expert",
        "ยกครบ 1000 ครั้ง",
        "gold"
      );

      localStorage.setItem("smartlift_ach_expert", "true");
    }

  }else{

    expertStatus.textContent = "Locked";
    expertStatus.className = "lock";

  }
}


/* ================= UPDATE UI ================= */

function updateUI(){

  const total = correct + error;

  const accuracyPercent =
    total === 0
      ? 0
      : Math.round((correct / total) * 100);

  const errorPercent =
    100 - accuracyPercent;

  const calories =
    Math.round(total * 0.45);

  const risk =
    getRiskInfo(errorPercent);


  /* Summary */

  summaryAccuracy.textContent =
    accuracyPercent + "%";

  summarySession.textContent =
    total + " ครั้ง";

  durationText.textContent =
    formatTime(seconds);

  caloriesText.textContent =
    calories + " kcal";

  riskLabel.textContent =
    risk.label;


  /* Accuracy Ring */

  accuracyRing.textContent =
    accuracyPercent + "%";

  accuracyRing.style.background =
    `radial-gradient(circle at center,#2563eb 55%,transparent 57%),
     conic-gradient(#93c5fd 0 ${accuracyPercent * 3.6}deg,
     rgba(255,255,255,0.28) ${accuracyPercent * 3.6}deg 360deg)`;


  /* Training Result */

  goalText.textContent =
    total + " / " + dailyGoal + " ครั้ง";

  goalBar.style.width =
    Math.min((total / dailyGoal) * 100, 100) + "%";

  correctText.textContent =
    correct + " ครั้ง";

  errorText.textContent =
    error + " ครั้ง";

  errorRateText.textContent =
    errorPercent + "%";

  accuracyText.textContent =
    accuracyPercent + "%";


  /* Chart Ring */

  scoreRing.textContent =
    accuracyPercent + "%";

  scoreRing.style.background =
    `radial-gradient(circle at center,#2563eb 56%,transparent 58%),
     conic-gradient(#2563eb 0 ${accuracyPercent * 3.6}deg,
     #dbeafe ${accuracyPercent * 3.6}deg 360deg)`;


  /* Risk */

  riskScore.textContent =
    errorPercent + "%";

  riskScore.className =
    risk.className;

  riskText.textContent =
    risk.text;

  coachText.textContent =
    risk.coach;


  /* Profile */

  profileTotal.textContent =
    total + " ครั้ง";

  profileAccuracy.textContent =
    accuracyPercent + "%";


  /* Live Modal */

  liveTime.textContent =
    formatTime(seconds);

  liveSession.textContent =
    total;

  liveCorrect.textContent =
    correct;

  liveError.textContent =
    error;


  /* Trend Text */

  const previous =
    historyData[historyData.length - 2];

  const diff =
    accuracyPercent - previous;

  if(diff > 0){
    trendText.textContent =
      "วันนี้ทำได้ดีขึ้นจากครั้งก่อน " + diff + "%";
  }else if(diff < 0){
    trendText.textContent =
      "วันนี้ทำได้น้อยกว่าครั้งก่อน " + Math.abs(diff) + "%";
  }else{
    trendText.textContent =
      "วันนี้ทำได้เท่ากับครั้งก่อน";
  }


  /* Chart Update */

  historyData[historyData.length - 1] =
    accuracyPercent;

  accuracyChart.data.datasets[0].data =
    historyData;

  accuracyChart.update();


  updateLevel(total);
  updateWeeklyGoal();
  updateAchievements(total);
  saveData();
}


/* ================= TRAINING SIMULATION ================= */

function simulateRep(){

  const isCorrect =
    Math.random() < 0.88;

  if(isCorrect){

    correct++;

    liveFeedback.textContent =
      "Perfect Form";

    liveFeedback.style.color =
      "#16a34a";

  }else{

    error++;

    liveFeedback.textContent =
      "ปรับท่าทาง";

    liveFeedback.style.color =
      "#ef4444";

  }

  updateUI();
}
/* ================= START TRAINING ================= */

function startTraining(){

  if(isTraining){
    stopTraining();
    return;
  }

  isTraining = true;

  trainingStatus.textContent =
    "กำลังฝึก";

  trainingStatus.classList.add("active");

  startBtn.textContent =
    "หยุดการฝึก";

  startBtn.classList.add("stop");

  liveModal.classList.add("show");

  liveFeedback.textContent =
    "AI กำลังวิเคราะห์ท่าทาง";

  timerInterval = setInterval(function(){
    seconds++;
    updateUI();
  }, 1000);

  repInterval = setInterval(function(){
    simulateRep();
  }, 1800);
}


/* ================= STOP TRAINING ================= */

function stopTraining(){

  isTraining = false;

  clearInterval(timerInterval);
  clearInterval(repInterval);

  trainingStatus.textContent =
    "สิ้นสุดการฝึก";

  trainingStatus.classList.remove("active");

  startBtn.textContent =
    "เริ่มการฝึก";

  startBtn.classList.remove("stop");

  liveModal.classList.remove("show");

  showReport();
}


/* ================= REPORT ================= */

function showReport(){

  const total = correct + error;

  const accuracyPercent =
    total === 0
      ? 0
      : Math.round((correct / total) * 100);

  const errorPercent =
    100 - accuracyPercent;

  const calories =
    Math.round(total * 0.45);

  const risk =
    getRiskInfo(errorPercent);

  reportDate.textContent =
    new Date().toLocaleDateString("th-TH");

  reportAccuracy.textContent =
    accuracyPercent + "%";

  reportCorrect.textContent =
    correct;

  reportError.textContent =
    error;

  reportDuration.textContent =
    formatTime(seconds);

  reportCalories.textContent =
    calories + " kcal";

  reportRisk.textContent =
    risk.label;

  reportModal.classList.add("show");
}


/* ================= BUTTON EVENTS ================= */

startBtn.addEventListener("click", function(){
  startTraining();
});


connectBtn.addEventListener("click", function(){

  sensorStatus.textContent =
    "Connected";

  batteryText.textContent =
    "Battery 92%";

  signalText.textContent =
    "Signal Strong";

  showToast("เชื่อมต่ออุปกรณ์สำเร็จ");
});


saveBtn.addEventListener("click", function(){

  showReport();

  showToast("บันทึกผลวันนี้แล้ว");
});


resetBtn.addEventListener("click", function(){

  localStorage.clear();

  correct = 87;
  error = 13;
  seconds = 0;

  updateUI();

  showToast("รีเซ็ตข้อมูลแล้ว");
});


closeLiveBtn.addEventListener("click", function(){

  liveModal.classList.remove("show");
});


closeAchievementBtn.addEventListener("click", function(){

  achievementModal.classList.remove("show");
});


closeReportBtn.addEventListener("click", function(){

  reportModal.classList.remove("show");
});


/* ================= BOTTOM NAVIGATION ================= */

document.querySelectorAll(".nav-item").forEach(function(item){

  item.addEventListener("click", function(){

    document.querySelectorAll(".nav-item").forEach(function(nav){

      nav.classList.remove("active");

    });

    item.classList.add("active");

    const targetId =
      item.getAttribute("data-target");

    const target =
      document.getElementById(targetId);

    target.scrollIntoView({
      behavior:"smooth",
      block:"start"
    });

  });

});


/* ================= INITIAL LOAD ================= */

updateGreeting();

updateUI();