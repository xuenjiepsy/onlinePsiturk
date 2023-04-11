var trialIndex = 0
var wolfId = 0
var sheepId = 1
var masterId = 2
var distractorId = 3
var agentNum = 4
var nTrials = trajData.length

var jsPsych = initJsPsych()
var timeline = [];
var psiTurk = new PsiTurk(uniqueId, adServerLoc, mode);
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
  },
  data: {type: 'updateTrial'}
}

var introduction = {
  type: jsPsychCanvasKeyboardResponse,
  canvas_size: [WINSETTING.w, WINSETTING.h],
  stimulus: drawIntroduction,
  on_start: function() {
    creadiv(0.5 * WINSETTING.w, 0.5 * WINSETTING.h, "experiment content")
  },
  choices: " ",
  prompt: '<p style="font-size:20px;text-align: center;margin-top: -10px;bold;">Press the <strong>spacebar</strong> to start.</p>',
  data: {type: 'introduction'},
  on_finish: function() {
    var elementContent = document.getElementById("experiment content");
    elementContent.parentNode.removeChild(elementContent);
  },
}

var experiments = {
  timeline: [initialExp, drawTrajAndJudge, updateTrial],
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

timeline.push(introduction);
timeline.push(experiments);
timeline.push(expEndIntro)
jsPsych.run(timeline)