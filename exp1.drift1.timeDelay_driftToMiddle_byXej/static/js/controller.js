function inferGoal(currentGrid, aimGrid, targetGridA, targetGridB){
    let goal = 0
    let disToTargetA = calculatetGirdDistance(currentGrid, targetGridA);
    let disToTargetB = calculatetGirdDistance(currentGrid, targetGridB);
    let aimGridToTargetA = calculatetGirdDistance(aimGrid, targetGridA);
    let aimGridToTargetB = calculatetGirdDistance(aimGrid, targetGridB);
    let effortToTargetA = disToTargetA - aimGridToTargetA;
    let effortToTargetB = disToTargetB - aimGridToTargetB
    if (effortToTargetA > effortToTargetB){
        goal = 1;
    }
    else if (effortToTargetA < effortToTargetB){
        goal = 2;
    }
    else{
        goal = 0;
    }

    return goal
}

function calculatetGirdDistance(grid1,grid2){
    return math.norm([math.abs(grid1[1]-grid2[1]), math.abs(grid1[0]-grid2[0])],1);
}

function isEqualDisState(state, goal1, goal2) {
    if (calculatetGirdDistance(state, goal1) == calculatetGirdDistance(state, goal2)){
        return 1;}
    else {
        return 0;
    }
}

function isValidMove(matrix, playerState,action) {
    let [x, y] = playerState;
    let nextState = [x+action[0],y+action[1]];
    if ((nextState[0] < EXPSETTINGS.matrixsize) && (nextState[1] < EXPSETTINGS.matrixsize) && (nextState[0] >= 0) && (nextState[1] >= 0))
    {
        if (matrix[nextState[0]][nextState[1]] !== 1) {
            return action;
        }
    }
    return [0,0];
}

function isGoalReached( playerState, goalStates) {
    const [player_x,player_y] = playerState
    if (player_x === goalStates[0][0] && player_y === goalStates[0][1])
    {return true;}
    else if
    (player_x === goalStates[1][0] && player_y === goalStates[1][1])
    {return true;}
    else
    {return false;}
}

function whichGoalReached( playerState, goalStates) {
    const [player_x,player_y] = playerState
    if (player_x === goalStates[0][0] && player_y === goalStates[0][1])
    {return 1;}
    else if
    (player_x === goalStates[1][0] && player_y === goalStates[1][1])
    {return 2;}
    else
    {return 0;}
}

function updateMatrix(matrix, y, x, value) {
    matrix[y][x] = value;
    return matrix
}

function normalDrift(ifDrift, aimAction){
    let [x,y] = aimAction;
    let actionAfterDrift = [x,y];
    if (ifDrift){
        let actionSpace = copyAnyElement(ACTIONSPACE);
        actionSpace.splice(actionSpace.findIndex(e => arrayEqual(e,[x,y])), 1);
        actionAfterDrift = actionSpace[Math.floor(Math.random() * actionSpace.length)];
    }
    return actionAfterDrift
}

// drift to other
function driftToOther(aimAction, playerState, targetAgrid, targetBgrid){
    let [x,y] = aimAction;
    let actionSpace = copyAnyElement(ACTIONSPACE);
    actionSpace.splice(actionSpace.findIndex(e => arrayEqual(e,[x,y])), 1);
    let gridAfterDrift =  copyAnyElement(playerState);
    let futureStates =  copyAnyElement(actionSpace);
    futureStates.forEach((item, index, arr) => {
        let [x,y] = copyAnyElement(item);
        arr[index] = [playerState[0] + x, playerState[1] + y];
        if (inferGoal(playerState, [playerState[0] + x, playerState[1] + y], targetAgrid, targetBgrid)!=0){
            gridAfterDrift = copyAnyElement(item);
        }
    })
    return gridAfterDrift
}

function actionAfterDriftToOther(action, ifDrift, ifSpecialTrial, playerState, targetAgrid, targetBgrid) {
    if (ifSpecialTrial){
        return driftToOther(action, playerState, targetAgrid, targetBgrid);
    }
    else {
        return normalDrift(ifDrift, action);
    }
}

// drift to middle
function driftToMiddle(lastState, currentState, targetAgrid, targetBgrid){
    let isLastStateEqual = isEqualDisState(lastState, targetAgrid, targetBgrid);
    let isCurrentStateEqual = isEqualDisState(currentState, targetAgrid, targetBgrid);
    if ((isLastStateEqual==1) && (isCurrentStateEqual==0)) {
        return [lastState[0]-currentState[0],lastState[1]-currentState[1]]
    }
}

function actionAfterDrift(action, ifDrift, ifSpecialTrial,lastState, playerState, targetAgrid, targetBgrid) {
    if (ifSpecialTrial){
        return driftToMiddle(lastState, playerState, targetAgrid, targetBgrid);
    }
    else {
        return normalDrift(ifDrift, action);
    }
}



function transition(grid, aimAction) {
    return [grid[0] + aimAction[0], grid[1] + aimAction[1]]
}


function getCenter(w, h) {
    return {
        x: window.innerWidth / 2 - w / 2 + "px",
        y: window.innerHeight / 2 - h / 2 + "px"
    };
}

Storage.prototype.setObj = function(key, obj) {
    return this.setItem(key, JSON.stringify(obj))
}

Storage.prototype.getObj = function(key) {
    return JSON.parse(this.getItem(key))
}

