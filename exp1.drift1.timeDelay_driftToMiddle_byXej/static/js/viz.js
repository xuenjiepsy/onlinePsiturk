var radius = EXPSETTINGS.radiusConvFactor * EXPSETTINGS.cellSize * EXPSETTINGS.matrixsize
// console.log(radius)

function getCenter(w, h) {
  return {
      x: window.innerWidth / 2 - w / 2 + "px",
      y: window.innerHeight / 2 - h / 2 + "px"
  };
}

function drawTraj(c){
  var context = c.getContext("2d");
  c.width = WINSETTING.w;
  c.height = WINSETTING.h;

  const center = getCenter(WINSETTING.w, WINSETTING.h);
  // c.style.marginLeft = center.x
  // c.style.marginTop = center.y;

  c.style.marginLeft = 0
  c.style.marginTop = 0;

  context.fillStyle = COLORPOOL.line;
  context.lineWidth = COLORPOOL.lineWidth;
  // let color = "#255";
  let color1 = "blue";
  let color2 = "red";
  let color3 = "green";
  let color4 = "yellow";
  context.strokeRect(0  ,
      0 ,
      WINSETTING.w, WINSETTING.h );

let trajFrame = 0
let agentIdSeleted = []
let clickListX = []
let clickListY = []
let delay = 25
let pressNum = 0
let ifText = true

let interval = setInterval(function() {

  jsPsych.pluginAPI.getKeyboardResponse({
    callback_function: function(info){
      ifPress = judgePressKeyAndClick(info, agentIdSeleted, interval, trajFrame, clickListX, clickListY, pressNum, trialIndex, ifText)
      if(ifPress=='f'){
        pressNum += 1
      }
      else if(ifPress = 'j'){
        ifText = false
      }
    },
    valid_responses: ["f","j"],
    rt_method: 'performance',
    persist: true,
    allow_held_key: false
  });
    drawWhiteBackground(context)
    drawCircle(context, color1, 1 / 6 * EXPSETTINGS.lineWidth,
        trajData[trialIndex][trajFrame][sheepId][0], trajData[trialIndex][trajFrame][sheepId][1], 0, 2 * Math.PI)
    drawCircle(context, color2, 1 / 6 * EXPSETTINGS.lineWidth,
    trajData[trialIndex][trajFrame][wolfId][0], trajData[trialIndex][trajFrame][wolfId][1], 0, 2 * Math.PI)
    drawCircle(context, color3, 1 / 6 * EXPSETTINGS.lineWidth,
    trajData[trialIndex][trajFrame][masterId][0], trajData[trialIndex][trajFrame][masterId][1], 0, 2 * Math.PI)
    drawCircle(context, color4, 1 / 6 * EXPSETTINGS.lineWidth,
    trajData[trialIndex][trajFrame][distractorId][0], trajData[trialIndex][trajFrame][distractorId][1], 0, 2 * Math.PI)
    context.beginPath();
    drawLine(context, [trajData[trialIndex][trajFrame][wolfId],trajData[trialIndex][trajFrame][masterId]], EXPSETTINGS.lineWidthConnectBalls)
  if (trajFrame < trajData[trialIndex].length-1) {
      trajFrame++;
  }
}, delay);
}

function drawWhiteBackground(c){
  c.fillStyle = COLORPOOL.map;
  c.fillRect(0 + COLORPOOL.lineWidth  ,
    0 + COLORPOOL.lineWidth ,
    WINSETTING.w - COLORPOOL.lineWidth*2, WINSETTING.h - COLORPOOL.lineWidth*2);
}



function drawFix(c){

var context = c.getContext("2d");
c.width = WINSETTING.w;
c.height = WINSETTING.h;

const center = getCenter(WINSETTING.w, WINSETTING.h);
// c.style.marginLeft = center.x
// c.style.marginTop = center.y;

c.style.marginLeft = 0
c.style.marginTop = 0;

context.fillStyle = COLORPOOL.line;
context.lineWidth = COLORPOOL.lineWidth;
context.strokeRect(0  ,
    0 ,
    WINSETTING.w, WINSETTING.h );
drawFixation(context,[Math.floor(EXPSETTINGS.matrixsize/2),Math.floor(EXPSETTINGS.matrixsize/2)],1 / 5, EXPSETTINGS.lineWidth);
}
 
function drawFixation(c,fixationPos,posScale, lineWidth) {
  let col = fixationPos[1];
  let row = fixationPos[0];
  c.lineWidth = lineWidth;
  c.strokeStyle = COLORPOOL.fixation;
  
  c.moveTo(col * (EXPSETTINGS.cellSize) + posScale * EXPSETTINGS.cellSize,
      row * (EXPSETTINGS.cellSize) + 1/2 * EXPSETTINGS.cellSize);
  c.lineTo(col * (EXPSETTINGS.cellSize) + (1-posScale) * EXPSETTINGS.cellSize,
      row * (EXPSETTINGS.cellSize) + 1/2 * EXPSETTINGS.cellSize);
  
  c.moveTo(col * (EXPSETTINGS.cellSize) + 1/2 * EXPSETTINGS.cellSize,
      row * (EXPSETTINGS.cellSize) + posScale * EXPSETTINGS.cellSize);
  c.lineTo(col * (EXPSETTINGS.cellSize) + 1/2 * EXPSETTINGS.cellSize,
      row * (EXPSETTINGS.cellSize) + (1-posScale) * EXPSETTINGS.cellSize);
  c.stroke();
  }

function drawCircle (c,color, lineWidth, colPos, rowPos, startAngle,tmpAngle){
 

  c.beginPath();
  c.lineWidth = lineWidth;
  c.strokeStyle = "white";
  c.arc(colPos * EXPSETTINGS.posConvFactor - EXPSETTINGS.posConvDis,
      rowPos * EXPSETTINGS.posConvFactor - EXPSETTINGS.posConvDis, radius,
      startAngle, tmpAngle);
  // console.log(colPos * EXPSETTINGS.posConvFactor - EXPSETTINGS.posConvDis)
  c.fillStyle = color
  c.fill()
  c.stroke();
  c.closePath();}

  function drawIntroduction(c){

    var context = c.getContext("2d");
    c.width = WINSETTING.w;
    c.height = WINSETTING.h;
    
    const center = getCenter(WINSETTING.w, WINSETTING.h);
    // c.style.marginLeft = center.x
    // c.style.marginTop = center.y;
    
    c.style.marginLeft = 0
    c.style.marginTop = 0;
    
    context.fillStyle = COLORPOOL.line;
    context.lineWidth = COLORPOOL.lineWidth;
    context.strokeRect(0  ,
        0 ,
        WINSETTING.w, WINSETTING.h );
    }

function drawLine(c,LinePos, lineWidth) {
  let LineFirst = LinePos[0];
  let LineSecond = LinePos[1];
  c.lineWidth = lineWidth;
  c.strokeStyle = COLORPOOL.fixation;
  
  c.moveTo(LineFirst[0]* EXPSETTINGS.posConvFactor - EXPSETTINGS.posConvDis,LineFirst[1]* EXPSETTINGS.posConvFactor - EXPSETTINGS.posConvDis);
  c.lineTo(LineSecond[0]* EXPSETTINGS.posConvFactor - EXPSETTINGS.posConvDis,LineSecond[1]* EXPSETTINGS.posConvFactor - EXPSETTINGS.posConvDis);
  c.stroke();
  }