var trialIndex = 0
var wolfId = 0
var sheepId = 1
var masterId = 2
var distractorId = 3
var agentNum = 4
var restNum = 20
// var ifPressJKey = false
// var ifClick = false
let [mouseX, mouseY] = [0, 0]

var jsPsych = initJsPsych()
var timeline = [];
var psiTurk = new PsiTurk(uniqueId, adServerLoc, mode);
trajForExp = shuffleListForTraj(traj)
trajData = trajForExp['trajList']
trajConditionIndex= trajForExp['trajIndexList']
var nTrials = trajData.length
// var nTrials = 2
var introduction1 = {
  type: jsPsychHtmlKeyboardResponse,
  stimulus: `
      <img src="static/images/onlineExp1.png" style = "width: 1400px; height: 800px"/>
    `,
  choices: " ",
  // prompt: '<p style="font-size:20px;text-align: center;margin-top: -10px;bold;">Press the <strong>spacebar</strong> to start.</p>',
  data: {type: 'introduction1'}
  // on_finish: function() {
  //   var elementContent = document.getElementById("experiment content");
  //   elementContent.parentNode.removeChild(elementContent);
  // },
}

var introduction2 = {
  type: jsPsychHtmlKeyboardResponse,
  stimulus: `
      <img src="static/images/onlineExp2.png" style = "width: 1400px; height: 800px"/>
    `,
  choices: " ",
  // prompt: '<p style="font-size:20px;text-align: center;margin-top: -10px;bold;">Press the <strong>spacebar</strong> to start.</p>',
  data: {type: 'introduction2'}
  // on_finish: function() {
  //   var elementContent = document.getElementById("experiment content");
  //   elementContent.parentNode.removeChild(elementContent);
  // },
}

var introductionVideo1 = {
  type: jsPsychHtmlKeyboardResponse,
  stimulus: `
      <video src="static/demos/masterRealForce=7.5,angleOfDivergence=0.0,hideId=3.mp4" controls width="800" height="800" atuoplay="atuoplay"/>
    `,
  choices: " ",
  prompt: '<p style="font-size:20px;text-align: center;margin-top: -10px;bold;">Chasing example 1. Press the <strong>spacebar</strong> to continue(if you have watched the video).</p>',
}

var introductionVideo2 = {
  type: jsPsychHtmlKeyboardResponse,
  stimulus: `
      <video src="static/demos/masterRealForce=7.5,angleOfDivergence=30.0,hideId=3.mp4" controls width="800" height="800" atuoplay="atuoplay"/>
    `,
  choices: " ",
  prompt: '<p style="font-size:20px;text-align: center;margin-top: -10px;bold;">Chasing example 2. Press the <strong>spacebar</strong> to continue(if you have watched the video).</p>',
}

var introductionVideo3 = {
  type: jsPsychHtmlKeyboardResponse,
  stimulus: `
      <video src="static/demos/masterRealForce=7.5,angleOfDivergence=0.0,hideId=1.mp4" controls width="800" height="800" atuoplay="atuoplay"/>
    `,
  choices: " ",
  prompt: '<p style="font-size:20px;text-align: center;margin-top: -10px;bold;">No-Chasing example 1. Press the <strong>spacebar</strong> to continue(if you have watched the video).</p>',
}

var introductionVideo4 = {
  type: jsPsychHtmlKeyboardResponse,
  stimulus: `
      <video src="static/demos/masterRealForce=7.5,angleOfDivergence=30.0,hideId=1.mp4" controls width="800" height="800" atuoplay="atuoplay"/>
    `,
  choices: " ",
  prompt: '<p style="font-size:20px;text-align: center;margin-top: -10px;bold;">No-Chasing example 2. Press the <strong>spacebar</strong> to continue(if you have watched the video).</p>',
}
// var introductionVideo2 = {
//   type: jsPsychHtmlKeyboardResponse,
//   stimulus: `
//       <img src="static/images/onlineExp1.png" style = "width: 1400px; height: 800px"/>
//     `,
//   choices: " ",
//   // prompt: '<p style="font-size:20px;text-align: center;margin-top: -10px;bold;">Press the <strong>spacebar</strong> to start.</p>',
//   data: {type: 'introduction'}
//   // on_finish: function() {
//   //   var elementContent = document.getElementById("experiment content");
//   //   elementContent.parentNode.removeChild(elementContent);
//   // },
// }

var initialExp = {
  type: jsPsychCanvasKeyboardResponse,
  canvas_size: [WINSETTING.w, WINSETTING.h],
  stimulus: drawFix,
  choices: "NO_KEYS",
  trial_duration: 1000,
  prompt:
  `
  <p style="font-size:20px;text-align: center;color: white;margin-top: -10px;bold;">wait for a second</p>
  `,
  data: {type: 'initial'}
}

var drawTrajAndJudge = {
  type: jsPsychCanvasKeyboardResponse,
  // type: jsPsychCanvasButtonResponse,
  canvas_size: [WINSETTING.w, WINSETTING.h],
  stimulus: drawTraj,
  choices: "NO_KEYS",
  // choices: " ",
  prompt: '<p style="font-size:20px;text-align: center;margin-top: -10px; bold;">if here is a chasing, press "j"; else press "f"</p>',
  data: {type: 'maintask'},
};

var updateTrial = {
  type: jsPsychCallFunction,
  func: function(){
    trialIndex += 1
    ifPressJKey = false
    if(isEnoughForRest(trialIndex, restNum)==false){
      jsPsych.finishTrial()
    }
  },
  data: {type: 'updateTrial'}
}

var rest = {
  type: jsPsychHtmlKeyboardResponse,
  // on_start: function() {
  //   if(isEnoughForRest(trialIndex, restNum)==false&&finishRestTrial==false){
  //     jsPsych.finishTrial()
  //     finishRestTrial = true
  //   }
  // },
  stimulus: `
      <img src="static/images/rest.png" style = "width: 1000px; height: 400px"/>
    `,
  choices: " ",
  // prompt: '<p style="font-size:20px;text-align: center;margin-top: -10px;bold;">Press the <strong>spacebar</strong> to start.</p>',
  data: {type: 'rest'}
}

// var introduction = {
//   type: jsPsychCanvasKeyboardResponse,
//   canvas_size: [WINSETTING.w, WINSETTING.h],
//   stimulus: drawIntroduction,
//   on_start: function() {
//     creadiv(0.5 * WINSETTING.w, 0.5 * WINSETTING.h, "experiment content")
//   },
//   choices: " ",
//   prompt: '<p style="font-size:20px;text-align: center;margin-top: -10px;bold;">Press the <strong>spacebar</strong> to start.</p>',
//   data: {type: 'introduction'},
//   on_finish: function() {
//     var elementContent = document.getElementById("experiment content");
//     elementContent.parentNode.removeChild(elementContent);
//   },
// }
var intro = {
  timeline: [introduction1,introductionVideo1,introductionVideo2,introductionVideo3,introductionVideo4,introduction2]
}

var experiments = {
  timeline: [initialExp, drawTrajAndJudge, updateTrial, rest],
  repetitions: nTrials
}

var expEndIntro = {
  type: jsPsychCanvasKeyboardResponse,
  canvas_size: [WINSETTING.w, WINSETTING.h],
  stimulus: drawIntroduction,
  on_start: function() {
    creadiv(0.5 * WINSETTING.w, 0.5 * WINSETTING.h, "thank you for participation")
    psiTurk.saveData({
      success: function(){
          psiTurk.completeHIT()},
      error: psiTurk.completeHIT()});
  },
  choices: "NO_KEYS",
  prompt: '<p style="font-size:20px;text-align: center;margin-top: -10px;bold;">the experiment is over</p>',
  data: {type: 'introduction'},
  // on_finish: function() {
  //   var elementContent = document.getElementById("thank you for participation");
  //   elementContent.parentNode.removeChild(elementContent);
  // },
}

timeline.push({
  type: jsPsychFullscreen,
  fullscreen_mode: true
});

// timeline.push(introduction);
// timeline.push(introductionVideo1);
timeline.push(intro);
timeline.push(experiments);
timeline.push(expEndIntro)
// if (typeof jsPsych !== "undefined") {
//   jsPsych.run(timeline);
// } else {
//   document.body.innerHTML = '<div style="text-align:center; margin-top:50%; transform:translate(0,-50%);">You must be online to view the plugin demo.</div>';}
jsPsych.run(timeline)