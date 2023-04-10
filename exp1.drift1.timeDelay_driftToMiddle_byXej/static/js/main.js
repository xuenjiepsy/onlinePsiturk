var psiTurk = new PsiTurk(uniqueId, adServerLoc, mode);

console.log('psiTurk start')
var subName = 'test';
const TIME_DELAY = 5000;

var ifPlayerShowInFixation = false;
var ifGoalShowInFixation = false;
var ifObstacleShowInFixation = false;

var curTrial = 0;
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
        destination: Array()
};
var allTrialsData = new Array();

var stepCount = 0;
var ifPrac = true;
var pracCurTrial = 0;
var ifDrift = 0;

var jsPsych = initJsPsych();


var initialMap = {
    type: jsPsychCallFunction,
    func: function(){
        stepCount = 0;
        gridMatrixList[curTrial][playerStateList[curTrial][0]][playerStateList[curTrial][1]] = gridPointer.player;
        goalList[curTrial].forEach((state,i) => gridMatrixList[curTrial][state[0]][state[1]] = gridPointer.goal);
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
            destination: Array()};
    },
    data:{type: 'initial'}
}

var fixationT={
    type: jsPsychCanvasKeyboardResponse,
    canvas_size: [WINSETTING.w, WINSETTING.h],
    stimulus: fixation,
    choices: [" "],
    prompt: '<p style="font-size:30px;font-weight: bold; text-align: center;">Press the spacebar to start a new round of game</p>',
    on_finish: function(data){
        data.type = 'eachStep';
        data.drift = 0;
        data.goal = 0;
        data.aimAction = [0,0];
        data.realAction =[0,0];
        data.RT = 0;
        data.destination = 0;
        data.playergrid = playerStateList[curTrial];
        data.sub = subName;
        data.trials = curTrial + 1;
        data.trial = curTrial + 1;
        data.step = stepCount;
        data.goalgrid1 = goalList[curTrial][0];
        data.goalgrid2 = goalList[curTrial][1];
    },
};

var eachStep = {
    type: jsPsychCanvasKeyboardResponse,
    canvas_size: [WINSETTING.w, WINSETTING.h],
    stimulus: drawGrid,
    choices: ["ArrowDown","ArrowUp","ArrowLeft","ArrowRight"],
    prompt: '<p style="font-size:20px;text-align: center;">Press ↑ ↓ ← → to control the player</p>',
    on_finish: function(data){
        data.type = 'keypress';
    }
};

// var delayScreenBlank = {
//     type:jsPsychHtmlKeyboardResponse,
//     stimulus:
//         `
//         <br><br/><br><br/> <br><br/>
//         <br><br/><br><br/><br><br/>
//         <p style="font-size:30px; text-align: center; height: 300px;">Please wait...</p>
//       `,

//     choices: "NO_KEYS",
//     trial_duration: TIME_DELAY,
//     data: {type: 'delayPhase'}
// };

var delayScreen = {
    type: jsPsychCanvasKeyboardResponse,
    canvas_size: [WINSETTING.w, WINSETTING.h],
    stimulus: drawGrid,
    choices: "NO_KEYS",
    prompt: '<p style="font-size:30px;text-align: center;color:red">Please wait...</p>',

    trial_duration: TIME_DELAY,
    data: {type: 'delayPhase'}
};

var delayPhase = {
    timeline: [delayScreen],
    conditional_function: function(){
        if (ifDrift === 1){
            return true;
        }
        else {
            return false;
        }
    },
    on_finish: function (){
      ifDrift = 0;
    }
};



var mainTask = {
    timeline: [delayPhase, eachStep],
    loop_function: function(){
        const [x,y] = playerStateList[curTrial];
        let ifSpecialTrial = false;
        let responseKey = jsPsych.data.getLastTrialData().filter({type:'keypress'}).trials[0].response;
        let action = DIRECTIONS[responseKey].movement;

        let intentedStates = transition(playerStateList[curTrial], action);
        let ifGoal = inferGoal([x,y], intentedStates, goalList[curTrial][0], goalList[curTrial][1]);

        let currenState = playerStateList[curTrial]
        let isCurrentStateEqual = isEqualDisState(currenState, goalList[curTrial][0], goalList[curTrial][1])

        let lastState = singleTrialData.playerPos[stepCount-1]
        let isLastStateEqual = lastState ? isEqualDisState(lastState, goalList[curTrial][0], goalList[curTrial][1]): null

        //special trial judgement: drag to other goal
        // if( (curTrial === gridMatrixList.length-1) && (ifGoal != 0) && specialTrialIfNoise) {

        // drag to middle
        if( (curTrial === gridMatrixList.length-1) && (isLastStateEqual==1) && (isCurrentStateEqual == 0) && specialTrialIfNoise) {
            specialTrialIfNoise = false;
            ifSpecialTrial = true;
            ifDrift = 1;
        } else {
            ifDrift = driftSequenceList[curTrial][stepCount];
        }
        // let realAction = actionAfterDriftToOther(action, ifDrift, ifSpecialTrial, playerStateList[curTrial], goalList[curTrial][0], goalList[curTrial][1]);

        let realAction = actionAfterDrift(action, ifDrift, ifSpecialTrial, lastState, playerStateList[curTrial], goalList[curTrial][0], goalList[curTrial][1]);

        realAction =  isValidMove(gridMatrixList[curTrial], playerStateList[curTrial], realAction);
        gridMatrixList[curTrial] = updateMatrix(gridMatrixList[curTrial], x, y, 0);
        gridMatrixList[curTrial] = updateMatrix(gridMatrixList[curTrial], x  + realAction[0], y + realAction[1], 2);
        playerStateList[curTrial] = [x + realAction[0], y + realAction[1]];

        let trialOver = isGoalReached(playerStateList[curTrial], goalList[curTrial]);
        let whichDestination = whichGoalReached(playerStateList[curTrial], goalList[curTrial]);

        singleTrialData.playerPos.push(playerStateList[curTrial]);
        singleTrialData.aimAction.push(action);
        singleTrialData.realAction.push(realAction);
        singleTrialData.ifGoal.push(ifGoal);
        singleTrialData.destination.push(whichDestination);
        singleTrialData.driftSequence.push(ifDrift);


        jsPsych.data.get().addToLast({trials: curTrial + 1, drift: ifDrift, goal: ifGoal, aimAction: action, realAction: realAction, RT: jsPsych.data.getLastTrialData().select('rt').values[0],
            destination: whichDestination, playergrid: playerStateList[curTrial], sub: subName, type: 'eachStep', trial: curTrial + 1, step: stepCount + 1,
            goalgrid1: goalList[curTrial][0], goalgrid2: goalList[curTrial][1]});

        if(trialOver) {
            singleTrialData.RT.push(jsPsych.data.get().filter({trials:curTrial+1}).select('rt'));
            allTrialsData[curTrial] = singleTrialData;
            psiTurk.recordTrialData(singleTrialData)
            return false;
        } else {
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
    timeline: [initialMap, fixationT, mainTask, updateTrial],
    repetitions: nTrials,
    data: {type: 'experiments'}
}


var introPage1= {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: `
        <p style="font-size:40px;">Thank you for participating in our experiment!</p>
        <br />
        <p style="font-size:20px;">You will play a game where you are a hungry traveler (<PLAYER>blue circle</PLAYER>) who needs to reach a restaurant to replenish your food as soon as possible.</p>
        <p style="font-size:20px;">There will be two restaurants (<GOAL>red circles</GOAL>) on the map.
        </p>
        <img src="static/images/demoMap.png" style = "width: 150px; height: 150px"/>
        <p style="font-size:20px;">Your goal is to use the arrow keys (up, down, left, right) to navigate to one of the restaurants  <strong> as quickly as possible with the fewest steps</strong> .</p>

        <p style="font-size:20px;">Please press the spacebar to continue.</p>
        <style>
            PLAYER {
                color: blue;
            }
            GOAL {
                color: red;
            }
        </style>
      `,
    choices: [' '],
    data: {type: 'introPage1'}
};

var introPage2= {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: `
        <p style="font-size:20px;">
            During navigation, there is a 10% chance that your keypress will fail, causing your movement direction to randomize to one of the other three directions.
        </p>
        <p style="text-align: center;"><img src="static/images/driftDemo.png" style = "width: 150px; height: 150px;"/></p>

        <p style="font-size:15px; text-align: center;">For example, in the above figure, when you press the ← key to control the blue player to move one step to the left, there is a 10% probability that you will take one step in one of the other three directions instead of one step to the left.</p>

        <p style="font-size:20px;margin-left: 100px; color: red">
            If this happens, a "Please wait" text will appear, and you should wait until it disappears before pressing the arrow keys again.
        </p>

        <p style="font-size:20px;">Press the spacebar to continue.</p>
      `,
    choices: [' '],
    data: {type: 'introPage2'}
};


var introPage3= {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: `
        <p style="font-size:20px;">
            We'll give you 3 rounds to practice with and 10 rounds to play.
        </p>
        <br />

        <p style="font-size:20px;">
            In each round of the game, you can reach only one restaurant, and this round of the game will end after reaching the restaurant. A new round will start once you press the spacebar.
        </p>
        <br />

        <p style="font-size:20px;">
            To transition between rounds smoothly, we recommend using <strong> one hand to press the spacebar and the other to use the arrow keys </strong>.
        </p>
        <br />

        <p style="font-size:20px;">When you are ready to start, press the spacebar !</p>
      `,
    choices: [' '],
    data: {type: 'introPage3'}
};


var pracInitialMap = {
    type: jsPsychCallFunction,
    func: function(){
        stepCount = 0;
        pracGridMatrixList[pracCurTrial][pracPlayerStateList[pracCurTrial][0]][pracPlayerStateList[pracCurTrial][1]] = gridPointer.player;
        pracGoalList[pracCurTrial].forEach((state,i) => pracGridMatrixList[pracCurTrial][state[0]][state[1]] = gridPointer.goal);
    },
    data: {type: 'pracInitialMap'}
}

var pracEachStep = {
    type: jsPsychCanvasKeyboardResponse,
    canvas_size: [WINSETTING.w, WINSETTING.h],
    stimulus: pracDrawGrid,
    choices: ["ArrowDown","ArrowUp","ArrowLeft","ArrowRight"],
    prompt: '<p style="font-size:20px;text-align: center;">Press ↑ ↓ ← → to control the player</p>',
    data: {type: 'pracEachStep'}
};

var pracDelayScreen = {
    type: jsPsychCanvasKeyboardResponse,
    canvas_size: [WINSETTING.w, WINSETTING.h],
    stimulus: pracDrawGrid,
    choices: "NO_KEYS",
    prompt: '<p style="font-size:30px;text-align: center;color:red">Please wait...</p>',

    trial_duration: TIME_DELAY,
    data: {type: 'delayPhase'}
};

var pracDelayPhase = {
    timeline: [pracDelayScreen],
    conditional_function: function(){
        if (ifDrift === 1){
            return true;
        }
        else {
            return false;
        }
    },
    on_finish: function (){
      ifDrift = 0;
    }
};

var pracMainTask = {
    timeline: [pracDelayPhase, pracEachStep],
    loop_function: function(){
        const [x,y] = pracPlayerStateList[pracCurTrial];
        let ifSpecialTrial = false;
        let responseKey = jsPsych.data.getLastTrialData().filter({type:'pracEachStep'}).trials[0].response;
        let action = DIRECTIONS[responseKey].movement;

        let intentedStates = transition(pracPlayerStateList[pracCurTrial], action);
        let ifGoal = inferGoal([x,y], intentedStates, pracGoalList[pracCurTrial][0], pracGoalList[pracCurTrial][1]);

        ifDrift = pracDriftSequenceList[pracCurTrial][stepCount];

        let realAction = actionAfterDrift(action, ifDrift, ifSpecialTrial, pracPlayerStateList[pracCurTrial], pracGoalList[pracCurTrial][0], pracGoalList[pracCurTrial][1]);
        realAction =  isValidMove(pracGridMatrixList[pracCurTrial], pracPlayerStateList[pracCurTrial], realAction);
        pracGridMatrixList[pracCurTrial] = updateMatrix(pracGridMatrixList[pracCurTrial], x, y, 0);
        pracGridMatrixList[pracCurTrial] = updateMatrix(pracGridMatrixList[pracCurTrial], x  + realAction[0], y + realAction[1], 2);
        pracPlayerStateList[pracCurTrial] = [x + realAction[0], y + realAction[1]];
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

var pracNextTrialNotification = {
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
                prompt: 'Each keypress will move only one step.\n',
                options: ["True", "False"],
                correct_response: "True",
                required: true
            },
            {
                type: 'multi-choice',
                prompt: 'Each round of the game ends when you reach one of the restaurants.\n',
                options: ["True", "False"],
                correct_response: "True",
                required: true
            },
            {
                type: 'multi-choice',
                prompt: 'Your keypress has a certain probability of failure.\n',
                options: ["True", "False"],
                correct_response: "True",
                required: true
            },
            {
                type: 'multi-choice',
                prompt: 'The agent will move in the direction you are going when your keypress fails.\n',
                options: ["True", "False"],
                correct_response: "False",
                required: true
            }
        ],
    ],
    title: 'Please answer the following questions. The experiment will start if all the answers are correct.',
    button_label_finish: 'Click to submit your answer',
    show_question_numbers: 'onPage',
    data:{type: 'questionaire'}
};

var wrongQuesntionarieFeedback = {
    type:jsPsychHtmlKeyboardResponse,
    stimulus:'<p style="font-size:30px;text-align: center;">Some mistakes in your answers. Please read the instructions again. </p> <p style="font-size:30px;text-align: center;">  Press the spacebar to continue.</p>',
    choices: " ",
    data: {type: 'wrongQuesntionarieFeedback'}
};


var correctQuesntionarieFeedback = {
    type:jsPsychHtmlKeyboardResponse,
    stimulus:`<p style="font-size:30px;text-align: center;">The practice is over. </p>
            <p style="font-size:30px;text-align: center;"> Please press the spacebar to enter the formal experiment. </p>`,
    choices: " ",
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

var pratice = {
    timeline: [pracInitialMap, fixationT, pracMainTask, pracUpdateTrial],
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
    timeline: [introPage1, introPage2, introPage3, pratice, introTest, introTestJudge, wrongFeedbackJudge, correctFeedbackJudge],
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


var timeline = [];
timeline.push(introWithPrac);
timeline.push(experiments);
timeline.push(endExpInfo);
timeline.push(endExp);

jsPsych.run(timeline);
