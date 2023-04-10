var psiTurk = new PsiTurk(uniqueId, adServerLoc, mode);

const subName = "test";

var ifPlayerShowInFixation = false;
var ifGoalShowInFixation = false;
var ifObstacleShowInFixation = false;

var curTrial = 0;
var allTrialsData = new Array();

var singleTrialData = {
    trial: curTrial,
    mapMatrix: gridMatrixList[curTrial],
    goal1Pos: goalList[curTrial][0],
    goal2Pos: goalList[curTrial][1],
    driftSequence: Array(),
    playerPos: Array(playerStateList[curTrial]),
    aimAction: Array(),
    realAction: Array(),
    RT: Array(),
    ifGoal: Array(),
    destination: Array()};

var stepCount = 0;
var ifPrac = true;
var pracCurTrial = 0;

var jsPsych = initJsPsych();

var timeline = [];

var introPage1= {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: `
        <p style="font-size:20px;">Thank you for participating in our experiment!</p>
        <p style="font-size:20px;">You will play a game where you are a hungry traveler (<PLAYER>red circle</PLAYER>), who needs to reach a restaurant to replenish your food as soon as possible.</p>
        <p style="font-size:20px;">There will be two restaurants (<GOAL>red circles</GOAL>) in the map.
        </p>
        <img src="static/images/demoMap.png" style = "width: 150px; height: 150px"/>
        <p style="font-size:20px;">Your goal is to manipulate the arrow keys (up, down, left, right) to get yourself to one of the restaurant as quickly as possible.</p>

        <p style="font-size:20px;">Press spacebar to continue.</p>
        <style>
            PLAYER {
                color: red;
            }
            GOAL {
                color: blue;
            }
        </style>
      `,
    choices: [' '],
    // css_classes:['Basic'],
    data: {type: 'introPage1'}
};

var introPage2= {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: `
        <br><br/>
        <br><br/>
         <p style="font-size:20px;">
            We will give you a series of 3 rounds to practice and 10 rounds to play.
        </p>

        <p style="font-size:20px;">
            In each round of the game, you can reach only one restaurant and this round of the game will end after reaching the restaurant. A new round will start once you press the spacebar.
        </p>

        <p style="font-size:20px;">
            There is a 10% probability that your keypress does not work, which causes your movement direction to randomly change to one of the other three directions.
        </p>
        <p style="text-align: center;"><img src="static/images/demoMap.png" style = "width: 150px; height: 150px;"/></p>

        <p style="font-size:15px; text-align: center;">For example, when you press the ← key to control the blue player to move one step to the left. There is a 10% chance that you will not move one step to the left, but instead one step in one of the other three directions.</p>

        <p style="font-size:20px;">
            To transition between the rounds as smoothly as possible, we recommend using one hand to press the spacebar and the other use the arrow keys.
        </p>

        <p style="font-size:20px;">Press spacebar when you are ready to start!</p>
      `,
    choices: [' '],
    data: {type: 'introPage2'}
};


var pratice = {
    timeline: [pracInitialMap, fixationT,pracMainTask,pracUpdateTrial],
    repetitions: nPracTrials,
    conditional_function(){
        if(ifPrac){
            pracCurTrial = 0;
            return true;
        }
        else {
            return false;
        }
    },
    data: {type: 'pratice'}
}


var introWithPrac = {
    timeline: [introPage1,introPage2,pratice,introTest,introTestJudge,wrongFeedbackJudge, correctFeedbackJudge],
    loop_function: function(){
        if(!ifQuestionarieCorrect){
            return true;
        }
        else {
            return false;
        }
    },
    data: {type: 'introWithPrac'}
}


var pracInitialMap = {
    type: jsPsychCallFunction,
    func: function(){
        stepCount = 0;
        pracGridMatrixList[pracCurTrial][pracPlayerStateList[pracCurTrial][0]][pracPlayerStateList[pracCurTrial][1]] = gridPointer.player;
        pracGoalList[pracCurTrial].forEach((state,i) => pracGridMatrixList[pracCurTrial][state[0]][state[1]] = gridPointer.goal);
    },
    data: {type: 'pracInitialMap'}
}

var pracEachStep={
    type: jsPsychCanvasKeyboardResponse,
    canvas_size: [WINSETTING.w, WINSETTING.h],
    stimulus: pracDrawGrid,
    choices: ["ArrowDown","ArrowUp","ArrowLeft","ArrowRight"],
    prompt: '<p style="font-size:20px;text-align: center;">Press ↑ ↓ ← → to control the player</p>',
    data: {type: 'pracEachStep'}
};

var pracMainTask = {
    timeline: [pracEachStep],
    loop_function: function(){
        const [x,y] = pracPlayerStateList[pracCurTrial];
        let ifSpecialTrial = false;
        var ifDrift = 0;
        let responseKey = jsPsych.data.getLastTrialData().filter({type:'pracEachStep'}).trials[0].response;
        let action = DIRECTIONS[responseKey].movement;

        let intentedStates = transition(pracPlayerStateList[pracCurTrial], action);
        let ifGoal = inferGoal([x,y], intentedStates, pracGoalList[pracCurTrial][0], pracGoalList[pracCurTrial][1]);

        ifDrift = stepCount < pracDriftSequenceList[pracCurTrial].length ? driftSequenceList[pracCurTrial][stepCount] : 0;

        let realAction = actionAfterDrift(action, ifDrift, ifSpecialTrial, pracPlayerStateList[pracCurTrial], pracGoalList[pracCurTrial][0], pracGoalList[pracCurTrial][1]);
        realAction =  isValidMove(pracGridMatrixList[pracCurTrial], pracPlayerStateList[pracCurTrial], realAction);
        pracGridMatrixList[pracCurTrial] = updateMatrix(pracGridMatrixList[pracCurTrial], x, y, 0);
        pracGridMatrixList[pracCurTrial] = updateMatrix(pracGridMatrixList[pracCurTrial], x  + realAction[1], y + realAction[0], 2);
        pracPlayerStateList[pracCurTrial] = [x + realAction[1], y + realAction[0]];
        let trialOver = isGoalReached(pracPlayerStateList[pracCurTrial], pracGoalList[pracCurTrial]);
        if(trialOver){
            return false;
        } else{
            stepCount ++;
            return true;
        }
    },
    data: {type: 'pracMainTask'}
}

var pracNextTrialNotification={
    type: jsPsychCanvasKeyboardResponse,
    canvas_size: [WINSETTING.w, WINSETTING.h],
    stimulus: pracDrawGrid,
    choices: [" "],
    prompt: '<p style="font-size:30px;font-weight: bold; text-align: center;">Press the spacebar to continue</p>',
    data: {type: 'pracNextTrialNotification'}
};

var pracNotificationBetweenTrials = {
    timeline: [pracNextTrialNotification],
    conditional_function: function(){
        if(pracCurTrial > nPracTrials-1){
            return false;
        } else {
            return true;
        }
    },
    data: {type: 'pracNotificationBetweenTrials'}
}

var pracUpdateTrial = {
    type: jsPsychCallFunction,
    func: function(){
        pracDrawGrid;
        pracCurTrial++;
    },
    data: {type: 'pracUpdateTrial'}

}

var introTest = {
    type: jsPsychSurvey,
    pages: [
        [
            {
                type: 'multi-choice',
                prompt: 'Each time a key is pressed the player moves one step.\n',
                options: ["True", "False"],
                correct_response: "True",
                required: true
            },
            {
                type: 'multi-choice',
                prompt: 'Each round of the game ends after the player reaches a certain restaurant.\n',
                options: ["True", "False"],
                correct_response: "True",
                required: true
            },
            {
                type: 'multi-choice',
                prompt: 'Your keypress  has a probability of failure to make the player move.\n',
                options: ["True", "False"],
                correct_response: "True",
                required: true
            },
            {
                type: 'multi-choice',
                prompt: 'When the keypress does not work, the player moves in the direction you intend to go.\n',
                options: ["True", "False"],
                correct_response: "False",
                required: true
            }
        ],
    ],
    title: 'Please answer the following questions. The experiment will start if all answers are correct.',
    button_label_finish: 'Click to submit your answer',
    show_question_numbers: 'onPage',
    data:{type: 'questionaire'}
};

var wrongQuesntionarieFeedback = {
    type:jsPsychHtmlKeyboardResponse,
    stimulus:'<p style="font-size:30px;text-align: center;">Some mistakes in your answers. Please read the instructions again. Press the spacebar to continue.</p>',
    choices: " ",
    css_classes:['BlankTime'],
    data: {type: 'wrongQuesntionarieFeedback'}
};


var correctQuesntionarieFeedback = {
    type:jsPsychHtmlKeyboardResponse,
    stimulus:'<p style="font-size:30px;text-align: center;">The practice is over. Please press the spacebar to enter the experiment.</p>',
    choices: " ",
    css_classes:['BlankTime'],
    data: {type: 'correctQuesntionarieFeedback'}
};


var correctFeedbackJudge = {
    timeline: [correctQuesntionarieFeedback],
    conditional_function: function(){
        if(ifQuestionarieCorrect){
            return true;
        } else {
            return false;
        }
    },
    data: {type: 'correctFeedbackJudge'}
}

var wrongFeedbackJudge = {
    timeline: [wrongQuesntionarieFeedback],
    conditional_function: function(){
        if(ifQuestionarieCorrect){
            return false;
        } else {
            return true;
        }
    },
    data: {type: 'wrongFeedbackJudge'}
}

var ifQuestionarieCorrect = false;
var introTestJudge = {
    type: jsPsychCallFunction,
    func: function(){
        if (pracCurTrial > nPracTrials-1){
            let introTestData = jsPsych.data.getLastTrialData().trials[0].accuracy;
            let introTestAccuracyData = new Array();
            introTestData.forEach((item, index) => {
                introTestAccuracyData.push(Object.values(item)[0]);
            });

            if (introTestAccuracyData.filter(function(res){
                return res == true;
            }).length === 4){
                ifPrac = false;
                ifQuestionarieCorrect = true;
                // pracCurTrial  = 0;
                // pracGridMatrixList =
                //     (new Array(nPracTrials)).fill().map(function(){ return new Array(dimension).fill().map(_ => Array(dimension).fill(0));});
                // pracPlayerStateList = [[0,7],[7,3],[13,7]];
            }
            else{
                ifPrac = false;
                ifQuestionarieCorrect = false;
            }
        }
    },
    data: {type: 'introTestJudge'}
}

var initialMap = {
    type: jsPsychCallFunction,
    func: function(){
        stepCount = 0;
        gridMatrixList[curTrial][playerStateList[curTrial][0]][playerStateList[curTrial][1]] = 2;
        goalList[curTrial].forEach((state,i) => gridMatrixList[curTrial][state[0]][state[1]] = 9);
        singleTrialData = {mapMatrix: Array(gridMatrixList[curTrial]), playerPos: Array(playerStateList[curTrial]), goal1Pos: Array(goalList[curTrial][0]),
            goal2Pos: Array(goalList[curTrial][1]),driftSequence: Array(), ifGoal: Array(), aimAction: Array(), realAction: Array(), RT: Array(), destination: Array()};
    },
    data:{type: 'initial'}
}

var fixationT = {
    type: jsPsychCanvasKeyboardResponse,
    canvas_size: [WINSETTING.w, WINSETTING.h],
    stimulus: fixation,
    choices: " ",
    prompt: '<p style="font-size:30px;font-weight: bold; text-align: center;">Press the spacebar to start a new round of game</p>',

    data: {type: 'fixation'}
};

var eachStep = {
    type: jsPsychCanvasKeyboardResponse,
    canvas_size: [WINSETTING.w, WINSETTING.h],
    stimulus: drawGrid,
    choices: ["ArrowDown","ArrowUp","ArrowLeft","ArrowRight"],
    prompt: '<p style="font-size:20px;text-align: center;">Press ↑ ↓ ← → to control the player</p>',
    on_finish: function(data){
        data.type = 'keypress';
    }};

var mainTask = {
    timeline: [eachStep],
    loop_function: function(){
        const [x,y] = playerStateList[curTrial]
        let ifSpecialTrial = false;
        var ifDrift = 0;
        let responseKey = jsPsych.data.getLastTrialData().filter({type:'maintask'}).trials[0].response;
        let action = DIRECTIONS[responseKey].movement;

        let intendNextState = transition(playerStateList[curTrial], action)
        let ifGoal = inferGoal([x,y], intentedStates, goalList[curTrial][0], goalList[curTrial][1]);

        //special trial judgement
        if( (curTrial === gridMatrixList.length-1) && (ifGoal != 0) && specialTrialIfNoise){
            specialTrialIfNoise = false;
            ifSpecialTrial = true;
            ifDrift = 1;
        } else {
            ifDrift = stepCount < driftSequenceList[curTrial].length ? driftSequenceList[curTrial][stepCount]: 0;
        }
        let realAction = actionAfterDrift(action, ifDrift, ifSpecialTrial, playerStateList[curTrial], goalList[curTrial][0], goalList[curTrial][1]);
        realAction =  isValidMove(gridMatrixList[curTrial], playerStateList[curTrial], realAction);
        gridMatrixList[curTrial] = updateMatrix(gridMatrixList[curTrial], x, y, OBJECT.blank);
        gridMatrixList[curTrial] = updateMatrix(gridMatrixList[curTrial], x  + realAction[1], y + realAction[0], OBJECT.player);
        playerStateList[curTrial] = [x + realAction[1], y + realAction[0]];


        let trialOver = isGoalReached(playerStateList[curTrial], goalList[curTrial]);
        let whichDestination = whichGoalReached(playerStateList[curTrial], goalList[curTrial]);


        singleTrialData.playerPos.push(playerStateList[curTrial]);
        singleTrialData.aimAction.push(action);
        

        if(trialOver){
            singleTrialData.RT.push(jsPsych.data.get().filter({trials:curTrial}).select('rt'));
            allTrialsData[curTrial] = singleTrialData;
            psiTurk.recordTrialData(singleTrialData)
            curTrial ++;
            //reset

            if (curTrial < nTrials) {
                singleTrialData = {
                    trial: curTrial,
                    mapMatrix: gridMatrixList[curTrial],
                    goal1Pos: goalList[curTrial][0],
                    goal2Pos: goalList[curTrial][1],
                    driftSequence: Array(),
                    playerPos: Array(playerStateList[curTrial]),
                    aimAction: Array(),
                    realAction: Array(),
                    RT: Array(),
                    ifGoal: Array(),
                    destination: Array()
                };
            }
            return false;
        } else{
            stepCount ++;
            return true;
        }
    },
    data: {type: 'mainloop'}

}



var updateTrial = {
    type: jsPsychCallFunction,
    func: function(){
        drawGrid;
        curTrial++;
    },
    data: {type: 'updateTrial'}
}

var experiments = {
    timeline: [initialMap,fixationT, mainTask, updateTrial],
    repetitions: nTrials,
    data: {type: 'experiments'}
}


var endExpInfo = {
    type:jsPsychHtmlButtonResponse,
    stimulus: `
      <p style="font-size:30px;">You have finished all the tasks!</p>
      <p style="font-size:30px;">Please press the button on the screen to save the data.</p>
      `,
    choices: ['OK!'],
};


var endExp = {
    type: jsPsychCallFunction,
    async: true,
    func: function(){
        psiTurk.saveData({
            success: function(){
                psiTurk.completeHIT()},
            error: psiTurk.completeHIT()});
    }
}


timeline.push(introWithPrac);
timeline.push(experiments);
timeline.push(endExpInfo);
timeline.push(endExp);

jsPsych.run(timeline);


