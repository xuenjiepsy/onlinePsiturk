function creadiv(x,y,t){ //l是距左的距离,r是距右的距离,t是要显示的文本内容
  let [offsetX, offsetY] = [-15, -15]
  var dd=document.createElement("div");
  dd.id = t; // 添加一个 ID
  dd.style.position="absolute"
  dd.style.fontWeight = "bold";
  if(t=='please select wolf'||t=='please select sheep'){
    dd.style.fontWeight = "bold";
    dd.style.fontSize = "24px";
    dd.style.fontFamily = "SimSun";
    // console.log('please select wolf')
  }
  
  x = x - 0.5*EXPSETTINGS.cellSize*EXPSETTINGS.matrixsize + 0.5*document.body.clientWidth + offsetX
  y = y - 0.5*EXPSETTINGS.cellSize*EXPSETTINGS.matrixsize - EXPSETTINGS.textPadding + 0.5*document.body.clientHeight + offsetY
  if(t=="sheep"||t=="wolf"){
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

function judgePressKeyAndClick(info, agentIdSeleted, interval, trajFrame, clickListX, clickListY, pressNum, trialIndex, ifText){
  if(jsPsych.pluginAPI.compareKeys(info.key,'f')&&pressNum==0){
    jsPsych.finishTrial() 
    return 'f'
  }
  else if(jsPsych.pluginAPI.compareKeys(info.key,'j')&&pressNum==0){
  if(ifText){
    creadiv(EXPSETTINGS.selectTextPos[0], EXPSETTINGS.selectTextPos[1], 'please select wolf') 
  }
  var agentIdSeleted = []
  document.addEventListener('click', (e) => {
    [mouseX, mouseY] = posConvert(e.clientX, e.clientY)
    if (clickListX.includes(mouseX)&&clickListY.includes(mouseY)){}
    else{
      clickListX.push(mouseX)
      clickListY.push(mouseY)
      agentIdSeleted = checkSelection(mouseX, mouseY, trajData[trialIndex][trajFrame], agentIdSeleted, trialIndex)
    }
    
    
  })
 
  clearInterval(interval);
  return 'j';}
}

function checkSelection(mouseX, mouseY, traj, agentIdSeleted, trialIndex) {
  // console.log('before:',agentIdSeleted)
  for(let i=0; i<agentNum; i++) {
        agentX = traj[i][0] * EXPSETTINGS.posConvFactor - EXPSETTINGS.posConvDis
        agentY = traj[i][1] * EXPSETTINGS.posConvFactor - EXPSETTINGS.posConvDis
        let d = dist(mouseX, mouseY, agentX, agentY);
          if(d <= radius) {
            // console.log((mouseX-agentX),(mouseY-agentY))
                if(agentIdSeleted.includes(i)==false){
                     agentIdSeleted.push(i)
                }
                
                // agentIdSeleted = unique(agentIdSeleted)
                // agentIdSeleted = agentIdSeleted.filter(function(item) { return item !== -1; });
                // console.log(agentIdSeleted.length)
                if(agentIdSeleted.length==1){
                  // console.log('wolf',agentIdSeleted)
                  // console.log(document.getElementById("wolf"))
                  if(document.getElementById("wolf")==null){
                    var elementSelectWolfText = document.getElementById('please select wolf');
                    if(elementSelectWolfText!=null){     
                        elementSelectWolfText.parentNode.removeChild(elementSelectWolfText);
                    }     
                     creadiv(agentX, agentY, 'wolf')
                     creadiv(EXPSETTINGS.selectTextPos[0], EXPSETTINGS.selectTextPos[1], 'please select sheep') 
                     break;
                  }
                }
                else if(agentIdSeleted.length==2){
                  // console.log('sheep',agentIdSeleted)
                  if(document.getElementById("sheep")==null){
                    creadiv(agentX, agentY, 'sheep')
                  }
                  
                  // sleep(100, agentX, agentY)
                  
                  jsPsych.pluginAPI.setTimeout(function() {
                    var elementWolf = document.getElementById("wolf");
                    // console.log(element)
                    if(elementWolf!=null){
                      elementWolf.parentNode.removeChild(elementWolf);
                    }        
                    var elementSheep = document.getElementById("sheep");
                    // console.log(document.getElementById("sheep"))
                    if(elementSheep!=null){
                      elementSheep.parentNode.removeChild(elementSheep);
                      var elementSelectSheepText = document.getElementById('please select sheep');
                      if(elementSelectSheepText!=null){     
                        elementSelectSheepText.parentNode.removeChild(elementSelectSheepText);
                      }  
                      // var agentIdSeletedTotal2 = jsPsych.data.get().last(1).values()[0].agentIdSeletedTotal;
                      var singleTrialData = {
                        trial: trialIndex,
                        agentIdSeleted: agentIdSeleted,
                        condition: trajCondition[trialIndex]
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