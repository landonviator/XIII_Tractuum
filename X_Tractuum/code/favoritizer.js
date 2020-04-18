const path = require('path');
const Max = require('max-api');
const readline = require('readline');
const fs = require('fs');
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false
  });

  //json
  let storage_json = {
  "first": []
  };

//Variables
var numberOfParameters = 0;
var parameters = [];
var currentGroup = [];
var modeGroup = [];

  // This will be printed directly to the Max console
Max.post(`Loaded the ${path.basename(__filename)} script`);

Max.addHandler('setNumberOfParameters', (msg1) =>{
  numberOfParameters = `${msg1}`
  createVariables(numberOfParameters);
});

Max.addHandler("writeVariables", (...params) => {
  for (var i = 0; i < params.length; i++){
    currentGroup[i].push(Number(params[i]));
  }
});

createVariables = (num) => {
  for (var i = 0; i < num; ++i) {
      parameters[i] = "param" + (i + 1);
      currentGroup[i] = []; //know which param is with which element in currentGroup array
  }
  Max.post(parameters);
  return parameters;
}

// Use the 'addHandler' function to register a function for a particular message
Max.addHandler("log", (...list) => {
    Max.post("List ", list);
    let data = {
        "${list[0]}": list[1],
        "${list[2]}": list[3]
    }
    Max.outlet(data);
});

Max.addHandler("getLog", () => {
    Max.post("List ", list);
    Max.outlet(storage_json.first.toString);
});

Max.addHandler('clearParams', () => {
parameters.length = 0;
Max.post(parameters);
});

getMode = (arr) => {
        let max = 0;
        let mode = [];  
        str = arr.sort();
        str = "~" + str.join('~~') + "~"
        str.replace( /(~-*\d+~)\1*/g, function(a, b){
            var m = a.length / b.length;
            if (max <= m ) {
                if (max < m) {
                    mode = [];
                    max = m;
            }
            mode.push( b.replace(/~/g,""));
        }
        arr = mode.filter(item => !mode.includes(item))
    });

    modeGroup.push(Number(mode));
}

Max.addHandler("getFavorites", () =>{


    for (var i in currentGroup){
      getMode(currentGroup[i]);
    }

    for (var i in currentGroup){
      currentGroup[i].length = 0;
    }

    parameters.length = 0;

    Max.post("Current Preset = [" + modeGroup + "]");
    modeGroup.length = 0;

    let data = JSON.stringify(storage_json);
  fs.writeFileSync('storeJSON.json', data);
});

//1. Function that creates how ever many variables the user needs.
//2. Function that takes in that many messeges from Max to set those variables.
//Use the new rest parameters// function(...args)
//3. Add an array for each variable as a container to hold the listening data from Max.
//4. Check and report the mean of each of those arrays.