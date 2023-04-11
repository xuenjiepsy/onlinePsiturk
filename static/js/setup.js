let xmlhttp = new XMLHttpRequest();
xmlhttp.open('GET', 'traj.json', false);  // 第三个参数指定同步加载
xmlhttp.send();
const trajData = JSON.parse(xmlhttp.responseText);

const EXPSETTINGS = {
cellSize: 40,
matrixsize: 15,
lineWidth: 4, 
posConvFactor: 1.5,
posConvDis: 300,
textPadding: 24,
radiusConvFactor: 0.025,
selectTextPos: [215,-20], 
lineWidthConnectBalls: 3.2, 
};

const COLORPOOL = {
  map: "white",
  line: "grey",
  lineWidth: 5,
  obstacle: "black",
  player: "red",
  goal: "blue",
  fixation: "black"
}

const WINSETTING = {
  w: (EXPSETTINGS.cellSize) * EXPSETTINGS.matrixsize,
  h: (EXPSETTINGS.cellSize) * EXPSETTINGS.matrixsize
  }

 