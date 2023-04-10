/// 生成噪声矩阵
var specialTrialIfNoise = true;
let noiseCondition = getPermutation([1,2,0]);
noiseCondition.push([1,1,1]);
var blockNumber = 3;
let sequence = length => Array.from({length}).map((v,k) => k);
noiseDesignValuesIndex = getRandomArrayElements(sequence(noiseCondition.length),blockNumber);
var noiseDesignValues = new Array();
for (let i = 0; i < noiseDesignValuesIndex.length; i ++){
  noiseDesignValues.push.apply(noiseDesignValues,noiseCondition[i]);
}
noiseDesignValues.push(0);

///createshape design
const bottom = [6,7,8];
const height = [4,6,8];
const dimension = EXPSETTINGS.matrixsize;
const shapeDesignValues = Array()
for (let i = 0; i< bottom.length; i++){
  for (let j = 0; j< height.length; j++){
    shapeDesignValues.push([bottom[i],height[j]])
  }
}
shapeDesignValues.sort(randomsort);
shapeDesignValues.push([bottom[Math.floor(Math.random() * bottom.length)],height[Math.floor(Math.random() * height.length)]]);

const nTrials = shapeDesignValues.length;
const direction = [0,90,180,270];
let directionSingleTrial = 0;
let pacmanPosition = new Array();
let bean1Position = new Array();
let bean2Position = new Array();
var gridMatrixList =
    (new Array(nTrials)).fill().map(function(){ return new Array(dimension).fill().map(_ => Array(dimension).fill(0));});
var playerStateList = new Array();
const goalList = new Array();
const driftSequenceList = new Array();

for (let trial = 0; trial < shapeDesignValues.length; trial ++){
  directionSingleTrial = direction[Math.floor(Math.random() * direction.length)];
  if (directionSingleTrial === 0){
    pacmanPosition = [Math.floor(dimension/2),random(shapeDesignValues[trial][1],dimension-1)];
    bean1Position = [pacmanPosition[0] - Math.floor(shapeDesignValues[trial][0]/2),pacmanPosition[1] - shapeDesignValues[trial][1]];
    bean2Position = [pacmanPosition[0] + Math.floor(shapeDesignValues[trial][0]/2),pacmanPosition[1] - shapeDesignValues[trial][1]];
  }
  else if (directionSingleTrial === 180){
    pacmanPosition = [Math.floor(dimension/2),random(0, dimension - 1 - shapeDesignValues[trial][1])];
    bean1Position = [pacmanPosition[0] - Math.floor(shapeDesignValues[trial][0]/2),pacmanPosition[1] + shapeDesignValues[trial][1]];
    bean2Position = [pacmanPosition[0] + Math.floor(shapeDesignValues[trial][0]/2),pacmanPosition[1] + shapeDesignValues[trial][1]];
  }
  else if (directionSingleTrial === 90){
    pacmanPosition = [random(0, dimension - 1 - shapeDesignValues[trial][1]), Math.floor(dimension/2)];
    bean1Position = [pacmanPosition[0] + shapeDesignValues[trial][1], pacmanPosition[1] - Math.floor(shapeDesignValues[trial][0]/2)];
    bean2Position = [pacmanPosition[0] + shapeDesignValues[trial][1], pacmanPosition[1] + Math.floor(shapeDesignValues[trial][0]/2)];
  }
  else {
    pacmanPosition = [random(shapeDesignValues[trial][1], dimension - 1), Math.floor(dimension/2)];
    bean1Position = [pacmanPosition[0] - shapeDesignValues[trial][1], pacmanPosition[1] - Math.floor(shapeDesignValues[trial][0]/2)];
    bean2Position = [pacmanPosition[0] - shapeDesignValues[trial][1], pacmanPosition[1] + Math.floor(shapeDesignValues[trial][0]/2)];
  }
  playerStateList.push(pacmanPosition);
  goalList.push([bean1Position, bean2Position]);

  let trajectoryLength = calculatetGirdDistance(bean1Position,pacmanPosition);
  let noiseStep = getRandomArrayElements(sequence(trajectoryLength), noiseDesignValues[trial]);
  let driftSequenceInATrial = new Array(trajectoryLength).fill(0);
  for (let i = 0; i < noiseStep.length; i++) {
      const x = noiseStep[i];
      driftSequenceInATrial[x] = 1;
  }
  driftSequenceList.push(driftSequenceInATrial);
}


nPracTrials = 3;
var pracGridMatrixList =
    (new Array(nPracTrials)).fill().map(function(){ return new Array(dimension).fill().map(_ => Array(dimension).fill(0));});
var pracPlayerStateList = [[0,7],[7,3],[13,7]];
const pracGoalList = [[[7,4],[7,10]],[[3,10],[11,10]],[[5,3],[5,11]]];
const pracDriftSequenceList = new Array();
const pracNoiseDesignValues = [1,0,2];
for (let trial = 0; trial < pracGridMatrixList.length; trial ++) {
  let pracTrajectoryLength = calculatetGirdDistance(pracGoalList[trial][0],pracPlayerStateList[trial]);
  let pracNoiseStep = getRandomArrayElements(sequence(pracTrajectoryLength),pracNoiseDesignValues[trial]);
  let pracDriftSequenceInATrial = new Array(pracTrajectoryLength).fill(0);
  for (let i = 0; i < pracNoiseStep.length; i++) {
      const x = pracNoiseStep[i];
      pracDriftSequenceInATrial[x] = 1;
  }
  pracDriftSequenceList.push(pracDriftSequenceInATrial);
}
