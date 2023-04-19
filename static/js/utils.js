function creadiv(x,y,t){ //l是距左的距离,r是距右的距离,t是要显示的文本内容
  let [offsetX, offsetY] = [-15, -15]
  var dd=document.createElement("div");
  dd.id = t; // 添加一个 ID
  dd.style.position="absolute"
  dd.style.fontWeight = "bold";
  if(t=='please select dog'||t=='please select cat'){
    dd.style.fontWeight = "bold";
    dd.style.fontSize = "24px";
    dd.style.fontFamily = "SimSun";
    // console.log('please select wolf')
  }
  
  x = x - 0.5*EXPSETTINGS.cellSize*EXPSETTINGS.matrixsize + 0.5*document.body.clientWidth + offsetX
  y = y - 0.5*EXPSETTINGS.cellSize*EXPSETTINGS.matrixsize - EXPSETTINGS.textPadding + 0.5*document.body.clientHeight + offsetY
  if(t=="cat"||t=="dog"){
    x += 0.4*offsetX
  }
  if(t=="experiment content"){
    x += 5*offsetX
  }
  if(t=="thank you for participation"){
    x += 6*offsetX
  }
  dd.style.left=x+"px";
  dd.style.top=y+"px"
  dd.innerText=t;
  document.body.appendChild(dd);
  }

function unique(arr) { 
  return Array.from(new Set(arr)) }

function dist(x1, y1, x2, y2){
  return Math.sqrt((x1-x2)**2 + (y1-y2)**2)
}

function posConvert(x,y){
  x = x - 0.5*document.body.clientWidth + 0.5*EXPSETTINGS.cellSize*EXPSETTINGS.matrixsize
  y = y - 0.5*document.body.clientHeight + 0.5*EXPSETTINGS.cellSize*EXPSETTINGS.matrixsize + EXPSETTINGS.textPadding
  return [x, y]
}

function judgePressKeyAndClick(info, agentIdSeleted, interval, trajFrame, clickListX, clickListY, pressNum, trialIndex, ifText, pressJ){
  if(jsPsych.pluginAPI.compareKeys(info.key,'f')&&pressNum==0&&pressJ==0){
    console.log(agentIdSeleted)
    var singleTrialData = {
      trial: trialIndex,
      ifChase: 0,
      selectWolf: null,
      selectSheep: null,
      angleOfDivergence: conditionData[trajConditionIndex[trialIndex]]['condition']['angleOfDivergence'], 
      masterRealForce: conditionData[trajConditionIndex[trialIndex]]['condition']['masterRealForce'],
      hideId: conditionData[trajConditionIndex[trialIndex]]['condition']['hideId'],
    };
      // console.log(singleTrialData)
      psiTurk.recordTrialData(singleTrialData)
    jsPsych.finishTrial() 
    return 'f'
  }
  else if(jsPsych.pluginAPI.compareKeys(info.key,'j')&&pressNum==0){
    // ifPressJKey = true
  if(ifText){
    creadiv(EXPSETTINGS.selectTextPos[0], EXPSETTINGS.selectTextPos[1], 'please select dog') 
  }
  // clickName = 'click'+trialIndex.toString()
  // console.log('click'+trialIndex.toString())
  if(pressJ==0){
      document.addEventListener('click', (e) => {
  
    var elementSelectWolfText = document.getElementById('please select dog');
    var elementSelectSheepText = document.getElementById('please select cat');
    // console.log(elementSelectWolfText)
    if(elementSelectWolfText!=null||elementSelectSheepText!=null){
      [mouseX, mouseY] = posConvert(e.clientX, e.clientY)
      // console.log(mouseX,mouseY)
      if ((clickListX.includes(mouseX)&&clickListY.includes(mouseY))||agentIdSeleted.length>=2){}
      else{
        console.log(agentIdSeleted)
        clickListX.push(mouseX)
        clickListY.push(mouseY)
        agentIdSeleted = checkSelection(mouseX, mouseY, trajData[trialIndex][trajFrame], agentIdSeleted, trialIndex)
        // if(agentIdSeleted.length==2){
        //   agentIdSeleted = []
        // }
        
      }
    }
  })
  }
  // document.addEventListener('click',handleMouseClick(clickListX, clickListY, trialIndex, trajFrame, agentIdSeleted))
  // console.log('x:',mouseX)
  // console.log('y:',mouseY)
  // console.log(ifClick)
  // if(ifClick){
  // console.log
  // mouseX = jsPsych.data.get().select('pos').values[0];
  // mouseY = jsPsych.data.get().select('pos').values[1];
  // console.log(mouseY)

  //   ifClick = false
  // }

  // document.addEventListener('click', (e) => {
  //   if(ifPressJKey==true){
  //     [mouseX, mouseY] = posConvert(e.clientX, e.clientY)
  //     console.log(mouseX,mouseY)
  //     if (clickListX.includes(mouseX)&&clickListY.includes(mouseY)){}
  //     else{
  //       clickListX.push(mouseX)
  //       clickListY.push(mouseY)
  //       agentIdSeleted = checkSelection(mouseX, mouseY, trajData[trialIndex][trajFrame], agentIdSeleted, trialIndex, ifPressJKey)
  //     }
  //   }
  // })
 
  clearInterval(interval);
  return 'j';}
}

function checkSelection(mouseX, mouseY, traj, agentIdSeleted, trialIndex) {
  // console.log('before:',agentIdSeleted)
  for(let i=0; i<agentNum; i++) {
        agentX = traj[i][0] * EXPSETTINGS.posConvFactor - EXPSETTINGS.posConvDis
        agentY = traj[i][1] * EXPSETTINGS.posConvFactor - EXPSETTINGS.posConvDis
        let d = dist(mouseX, mouseY, agentX, agentY);
          // console.log(d)
          if(d <= radius) {
            // console.log((mouseX-agentX),(mouseY-agentY))
                if(agentIdSeleted.includes(i)==false){
                     agentIdSeleted.push(i)
                }
                console.log('inner:',agentIdSeleted)
                // agentIdSeleted = unique(agentIdSeleted)
                // agentIdSeleted = agentIdSeleted.filter(function(item) { return item !== -1; });
                // console.log(agentIdSeleted.length)
                if(agentIdSeleted.length==1){
                  // console.log('wolf',agentIdSeleted)
                  // console.log(document.getElementById("wolf"))
                  if(document.getElementById("dog")==null){
                    var elementSelectWolfText = document.getElementById('please select dog');
                    if(elementSelectWolfText!=null){     
                        elementSelectWolfText.parentNode.removeChild(elementSelectWolfText);
                    }     
                     creadiv(agentX, agentY, 'dog')
                     creadiv(EXPSETTINGS.selectTextPos[0], EXPSETTINGS.selectTextPos[1], 'please select cat') 
                     break;
                  }
                }
                else if(agentIdSeleted.length==2){
                  // console.log('sheep',agentIdSeleted)
                  if(document.getElementById("cat")==null){
                    creadiv(agentX, agentY, 'cat')
                  }
                  
                  // sleep(100, agentX, agentY)
                  
                  jsPsych.pluginAPI.setTimeout(function() {
                    var elementWolf = document.getElementById("dog");
                    // console.log(element)
                    if(elementWolf!=null){
                      elementWolf.parentNode.removeChild(elementWolf);
                    }        
                    var elementSheep = document.getElementById("cat");
                    // console.log(document.getElementById("sheep"))
                    if(elementSheep!=null){
                      elementSheep.parentNode.removeChild(elementSheep);
                      var elementSelectSheepText = document.getElementById('please select cat');
                      if(elementSelectSheepText!=null){     
                        elementSelectSheepText.parentNode.removeChild(elementSelectSheepText);
                      }
                      // clickName = 'click'+trialIndex.toString()
                      // myFunction = null;
                      // document.addEventListener(clickName, myFunction);
                      // var agentIdSeletedTotal2 = jsPsych.data.get().last(1).values()[0].agentIdSeletedTotal;
                      var singleTrialData = {
                        trial: trialIndex,
                        ifChase: 1,
                        selectWolf: agentIdSeleted[0],
                        selectSheep: agentIdSeleted[1],
                        angleOfDivergence: conditionData[trajConditionIndex[trialIndex]]['condition']['angleOfDivergence'], 
                        masterRealForce: conditionData[trajConditionIndex[trialIndex]]['condition']['masterRealForce'],
                        hideId: conditionData[trajConditionIndex[trialIndex]]['condition']['hideId'],
                      };
                        console.log(singleTrialData)
                        psiTurk.recordTrialData(singleTrialData)
                      jsPsych.finishTrial()
                    }
                    // console.log('finish')
                    // jsPsych.finishTrial()
                    
                  }, 800);
                  // timer = setInterval(countdown(), 5000);
                }
                break;
          }
      }
  return agentIdSeleted
  }

function shuffleList(list) {
  for (let i = list.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
          [list[i], list[j]] = [list[j], list[i]];
              }
          return list;
        }

function shuffleListForTraj(list) {
  let shuffledList = [...list]; // 复制列表
  let indexList = []; // 索引列表
  for (let i = shuffledList.length - 1; i > 0; i--) {
    // 从后往前遍历列表，随机交换当前元素和前面的某个元素
    let j = Math.floor(Math.random() * (i + 1)); // 生成[0, i]之间的随机整数
    [shuffledList[i], shuffledList[j]] = [shuffledList[j], shuffledList[i]]; // 交换元素
  }
  // 生成索引列表
  for (let i = 0; i < list.length; i++) {
    indexList.push(list.indexOf(shuffledList[i]));
  }
  return {'trajList': shuffledList, 'trajIndexList': indexList}; // 返回打乱后的列表和索引列表
}

function isEnoughForRest(trialIndex, restNum) {
  if (trialIndex % restNum === 0) {
    return true;
  } else {
    return false;
  }
}

// const handleMouseClick = (e) => {

// }


// function handleMouseClick(clickListX, clickListY, trialIndex, trajFrame, agentIdSeleted) {
// 	[mouseX, mouseY] = posConvert(event.clientX, event.clientY)
//   console.log([mouseX, mouseY])
//   if (clickListX.includes(mouseX)&&clickListY.includes(mouseY)){}
//   else{
//     agentIdSeleted = checkSelection(mouseX, mouseY, trajData[trialIndex][trajFrame], agentIdSeleted, trialIndex)
//   }
// }

