function usrData(func, type, data = []) {
  if (func === 'get') {
    if (localStorage.getItem(type) != null && localStorage.getItem(type) != "[]") {
      return JSON.parse(localStorage.getItem(type));
    } else {
      // Does not exist/empty.
      return [];
    }
  } else if (func === 'save') {
    const current = JSON.parse(localStorage.getItem(type)) ? JSON.parse(localStorage.getItem(type)) : [];
    current.push(data);
    let unique = current.filter((c, i) => {
      return current.indexOf(c) === i;
    });
    localStorage.setItem(type, JSON.stringify(unique));
  } else {
    throw 'Func param only accepts \'get\' or \'save\'';
  }
}

function findVisCodes(arr) {
  const stnArr = [...arr];
  let visArr = [];
  for (const stn of stnArr) {
    visArr.push(stations[stn]);
  }
  return visArr;
}

function addStnsToMap(stns) {
  let s = [];
  if (typeof stns === 'string') {
    s.push(stns)
  } else {
    s.push(...stns);
  }
  s.sort();
  s.forEach((v) => {
    $(`[id*="${stations[v]}-dash"]`).addClass("visible");
    $(`[id*="${stations[v]}-label"]`).addClass("visible");
    $(`[id*="IC_${stations[v]}"]`).addClass("visible");
  });
  console.log({
    s,
    stns
  });
}

function updateLineSegs(arr) {
  let stnsArr = [],
    stnCodes;
  try {
    stnsArr.push(...arr);
  } catch (e) {
    console.log(`stnsArr Error:\n'${e}'`);
  } finally {
    stnCodes = findVisCodes(usrData('get', 'stations'));
  }
  if (stnsArr.every((s) => s.length === 3)) { // FIXME: No handler for if it's a mix. Will it ever be a mix?
    stnCodes.push(...stnsArr);
  } else {
    stnCodes.push(...findVisCodes(stnsArr));
  }
  for (const l in lines) {
    // l = line name;
    if (l !== 'central') continue;
    const lineObj = lines[l];
    if (lineObj['branch']) {

      // Check if top branches are active.
      function top() {
        let active = false;
        lineObj['top'].forEach((a) => {
          a.forEach((s) => {
            if (stnCodes.includes(s)) {
              active = true;
            } else {
              // Hasn't been visited.
            }
          });
        });
        return active;
      }

      // Check if bottom branches are active
      function bottom() {
        let active = false;
        lineObj['bottom'].forEach((a) => {
          a.forEach((s) => {
            if (stnCodes.includes(s)) {
              active = true;
            } else {
              // Hasn't been visited.
            }
          });
        });
        return active;
      }

      // Complete the line segments.
      function complete(top, bottom) {
        console.log({
          top,
          bottom
        });
        // If the top and bottom branches are active then go from the the first visited station of the top branches in those arrays to the last station, then from the first station of the bottom branches to the last visited station.
        if (top && bottom) {
          lineObj['top'].forEach((e) => {
            let first = 100;
            e.forEach((a) => {
              const index = e.indexOf(a);
              if (stnCodes.includes(a)) {
                if (index <= first) {
                  first = index;
                }
              }
            });
            for (let i = first; i < e.length; i++) {
              $(`#lul-${l}_${e[i]}-${e[i+1]}`).addClass('visible');
            }
          });
          lineObj['bottom'].forEach((e) => {
            let last = 0;
            e.forEach((a) => {
              const index = e.indexOf(a);
              if (stnCodes.includes(a)) {
                if (index >= last) {
                  last = index;
                }
              }
            });
            for (let i = 0; i < last; i++) {
              $(`#lul-${l}_${e[i]}-${e[i+1]}`).addClass('visible');
            }
          });
        } else if (top) {
          lineObj['top'].forEach((e) => {
            let first = 100,
              last = 0;
            e.forEach((a) => {
              const index = e.indexOf(a);
              if (stnCodes.includes(a)) {
                if (index <= first) {
                  first = index;
                } else if (index >= last) {
                  last = index;
                } else {
                  // Error!
                }
              }
            });
            for (let i = first; i < last; i++) {
              $(`#lul-${l}_${e[i]}-${e[i+1]}`).addClass('visible');
            }
          });
        } else if (bottom) {
          lineObj['bottom'].forEach((e) => {
            let first = 100,
              last = 0;
            e.forEach((a) => {
              const index = e.indexOf(a);
              if (stnCodes.includes(a)) {
                if (index <= first) {
                  first = index;
                } else if (index >= last) {
                  last = index;
                } else {
                  // Error!
                }
              }
            });
            for (let i = first; i < last; i++) {
              $(`#lul-${l}_${e[i]}-${e[i+1]}`).addClass('visible');
            }
          });
        }
      }
      complete(top(), bottom());
    } else {
      const lineArr = lineObj['stations'];
      lineArr.forEach((a) => {
        let first = 100,
          last = 0;
        const index = lineArr.indexOf(a);
        if (stnCodes.includes(a)) {
          if (index <= first) {
            first = index;
          } else if (index >= last) {
            last = index;
          } else {
            // Error!
          }
        }
        for (let i = first; i < last; i++) {
          $(`#lul-${l}_${e[i]}-${e[i+1]}`).addClass('visible');
        }
      });
    }
  }
}

// Upload and handle CSVs

function readFile(file) {
  const reader = new FileReader();

  reader.readAsText(file, "UTF-8");

  // reader.onprogress = updateProgress;
  reader.onload = (evt) => {
    const fileString = evt.target.result;
    const CSVarr = CSVtoArray(fileString);
    loadData(CSVarr);
  };

  reader.onerror = (err) => {
    console.error(err);
  };
}

function loadData(arr) {
  let stations = [];
  for (a in arr) {
    const journey = arr[a][3];
    // FIXME: Logic & may have some issues. Double check.
    if (journey.toLowerCase().indexOf("bus") !== -1) {
      usrData('save', 'bus', journey.split('route ').shift());
    } else if (journey.toLowerCase().indexOf(' to ') !== -1) {
      const j = journey.split(' to ');
      const s = j.map((d) => {
        const regEx = /( \[.*\])|( DLR)|( tram stop)/;
        return d.replace(regEx, '');
      });
      for (i in s) {
        if (stations.includes(s[i]) == false) {
          stations.push(s[i]);
        }
      }
    }
  }
  console.log({
    stations
  });
  addStnsToMap(stations);
  usrData('save', 'stations', stations);
}

function CSVtoArray(strData, strDelimiter) {
  // https://gist.github.com/luishdez/644215
  strDelimiter = strDelimiter || ",";
  var objPattern = new RegExp(
    // Delimiters.
    "(\\" +
    strDelimiter +
    "|\\r?\\n|\\r|^)" +
    // Quoted fields.
    '(?:"([^"]*(?:""[^"]*)*)"|' +
    // Standard fields.
    '([^"\\' +
    strDelimiter +
    "\\r\\n]*))",
    "gi"
  );

  var arrData = [
    []
  ];
  var arrMatches = null;

  while ((arrMatches = objPattern.exec(strData))) {
    var strMatchedDelimiter = arrMatches[1];
    if (strMatchedDelimiter.length && strMatchedDelimiter != strDelimiter) {
      arrData.push([]);
    }

    if (arrMatches[2]) {
      var strMatchedValue = arrMatches[2].replace(new RegExp('""', "g"), '"');
    } else {
      var strMatchedValue = arrMatches[3];
    }
    arrData[arrData.length - 1].push(strMatchedValue);
  }
  return arrData;
}

function dragOverHandler(e) {
  e.preventDefault();
  $("#upload-popup").toggleClass("dragOver");
}

function dropHandler(e) {
  e.preventDefault();
  $("#upload-popup").toggleClass("dragOver");
  const file = e.dataTransfer.items[0].getAsFile();
  readFile(file);
}

function uploadHandler(e) {
  $("#fileSelect").click();
  $("#fileSelect").on("change", () => {
    const file = document.getElementById("fileSelect").files[0];
    readFile(file);
  });
}