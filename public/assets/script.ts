function usrData(func: string, type: string, data: string | Array<string> = []) {
	if (func === 'get') {
		if (localStorage.getItem(type) != null && localStorage.getItem(type) != '[]') {
			return JSON.parse(localStorage.getItem(type)!);
		} else {
			// Does not exist/empty.
			return [];
		}
	} else if (func === 'save') {
		let current = JSON.parse(localStorage.getItem(type)!) ? JSON.parse(localStorage.getItem(type)!) : [];
		let newData = [];
		if (typeof data === 'string') {
			newData.push(data);
		} else {
			newData.push(...data);
		}
		current.push(...newData);
		let unique = current.filter((c: string, i: number) => {
			return current.indexOf(c) === i;
		});
		localStorage.setItem(type, JSON.stringify(unique));
	} else {
		throw "Func param only accepts 'get' or 'save'";
	}
}

function findVisCodes(arr: string | Array<string>) {
	const stnArr: Array<string> = [...arr];
	let visArr: Array<string> = [];
	for (const stn of stnArr) {
		visArr.push(stations[stn]);
	}
	return visArr;
}

function addStnsToMap(stns: string | Array<string>) {
	let s: Array<string> = [];
	if (typeof stns === 'string') {
		s.push(stns);
	} else {
		s.push(...stns);
	}
	s.sort();
	s.forEach((v) => {
		document.querySelector(`[id*="${stations[v]}-dash"]`)?.classList.add('visible');
		document.querySelector(`[id*="${stations[v]}-label"]`)?.classList.add('visible');
		document.querySelector(`[id*="IC_${stations[v]}"]`)?.classList.add('visible');
	});
}

function updateLineSegs() {
	let stnCodes = findVisCodes(usrData('get', 'stations'));
	let data: {[line: string]: number} = {
		bakerloo: 0,
		central: 0,
		piccadilly: 0,
		jubilee: 0,
		metropolitan: 0,
		victoria: 0,
		northern: 0,
		circle: 0,
		'hammersmith-city': 0,
		district: 0,
		elizabeth: 0,
		overground: 0,
		'waterloo-city': 0,
		'cable-car': 0,
		dlr: 0,
		OSI: 0
	};
	for (const l in lines) {
		const lineObj = lines[l];
		if (lineObj['branch']) {
			// Check if top branches are active.
			function top() {
				let active = false;
				lineObj['top']!.forEach((a: string[]) => {
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
				lineObj['bottom']!.forEach((a: string[]) => {
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
			function complete(top: Boolean, bottom: Boolean) {
				// If the top and bottom branches are active then go from the the first visited station of the top branches in those arrays to the last station, then from the first station of the bottom branches to the last visited station.
				if (top && bottom) {
					let total = 0;
					lineObj['top']!.forEach((e: string[]) => {
						let first = 100;
						e.forEach((a) => {
							const index = e.indexOf(a);
							if (stnCodes.includes(a)) {
								total++;
								if (index <= first) {
									first = index;
								}
							}
						});
						for (let i = first; i < e.length; i++) {
							document.getElementById(`lul-${lineObj['line']}_${e[i]}-${e[i + 1]}`)?.classList.add('visible');
						}
					});
					lineObj['bottom']!.forEach((e) => {
						let last = 0;
						e.forEach((a: string) => {
							const index = e.indexOf(a);
							if (stnCodes.includes(a)) {
								total++;
								if (index >= last) {
									last = index;
								}
							}
						});
						for (let i = 0; i < last; i++) {
							document.getElementById(`lul-${lineObj['line']}_${e[i]}-${e[i + 1]}`)?.classList.add('visible');
						}
					});
					data[lineObj['line']] = data[lineObj['line']] + total;
				} else if (top) {
					let total = 0;
					lineObj['top']!.forEach((e) => {
						let first = 100,
							last = 0;
						e.forEach((a) => {
							const index = e.indexOf(a);
							if (stnCodes.includes(a)) {
								total++;
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
							document.getElementById(`lul-${lineObj['line']}_${e[i]}-${e[i + 1]}`)?.classList.add('visible');
						}
					});
					data[lineObj['line']] = data[lineObj['line']] + total;
				} else if (bottom) {
					let total = 0;
					lineObj['bottom']!.forEach((e) => {
						let first = 100,
							last = 0;
						e.forEach((a) => {
							const index = e.indexOf(a);
							if (stnCodes.includes(a)) {
								total++;
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
							document.getElementById(`lul-${lineObj['line']}_${e[i]}-${e[i + 1]}`)?.classList.add('visible');
						}
					});
					data[lineObj['line']] = data[lineObj['line']] + total;
				}
			}
			complete(top(), bottom());
		} else {
			const lineArr = lineObj['stations']!;
			let first = 100,
				last = 0,
				total = 0;
			lineArr.forEach((a) => {
				const index = lineArr.indexOf(a);
				if (stnCodes.includes(a)) {
					total++;
					if (index < first) {
						first = index;
					} else if (index > last) {
						last = index;
					} else {
						// Error!
					}
				}
			});
			for (let i = first; i < last; i++) {
				document.getElementById(`lul-${lineObj['line']}_${lineArr[i]}-${lineArr[i + 1]}`)?.classList.add('visible');
			}
			data[lineObj['line']] = data[lineObj['line']] + total;
		}
	}
	updateStats(data);
}

function updateStats(data: {[line: string]: number}) {
	const totals: {[line: string]: number} = {
		bakerloo: 25,
		central: 49,
		piccadilly: 53,
		jubilee: 27,
		metropolitan: 34,
		victoria: 16,
		northern: 52,
		circle: 36,
		'hammersmith-city': 29,
		district: 60,
		elizabeth: 32,
		overground: 112,
		'waterloo-city': 2,
		'cable-car': 2,
		dlr: 45,
		tram: 39
	};
	for (const l in totals) {
		let percent: number = 0,
			visited: number;
		if (data[l] === NaN) {
			document.getElementById(`${l}`)!.setAttribute('value', '0');
		} else {
			const total: number = totals[l];
			visited = data[l];
			percent = Math.floor((visited / total) * 100);
		}
		document.getElementById(`${l}`)!.setAttribute('value', percent.toString());
	}
}

function readFile(file: File) {
	const reader = new FileReader();

	reader.readAsText(file, 'UTF-8');

	// reader.onprogress = updateProgress;
	reader.onload = (evt) => {
		const fileString: any = evt.target!.result || '';
		const CSVarr = CSVtoArray(fileString);
		loadData(CSVarr);
	};

	reader.onerror = (err) => {
		console.error(err);
	};
}

function loadData(arr: string[][]) {
	let stations: string[] = [],
		busses: string[] = [];
	for (const a in arr) {
		const journey = arr[a][3];
		if (journey == undefined) continue;
		if (journey.toLowerCase().indexOf('bus') !== -1) {
			const bus = journey.split('route ')[1];
			if (!busses.includes(bus)) {
				busses.push(bus);
			}
		} else if (journey.toLowerCase().indexOf(' to ') !== -1) {
			const j = journey.split(' to ');
			const s = j.map((d) => {
				const regEx = /( \[.*\])|( DLR)|( tram stop)|(\[No touch-out\])/;
				return d.replace(regEx, '');
			});
			for (const i in s) {
				if (!stations.includes(s[i])) {
					stations.push(s[i]);
				}
			}
		}
	}
	try {
		usrData('save', 'stations', stations);
		usrData('save', 'bus', busses);
	} catch (e) {
		console.error(`[script.ts | loadData()]: ${e}`);
	} finally {
		addStnsToMap(stations);
		updateLineSegs();
	}
}

function CSVtoArray(strData: string, strDelimiter = ',') {
	// https://gist.github.com/luishdez/644215
	strDelimiter = strDelimiter || ',';
	let objPattern = new RegExp(
		// Delimiters.
		'(\\' +
			strDelimiter +
			'|\\r?\\n|\\r|^)' +
			// Quoted fields.
			'(?:"([^"]*(?:""[^"]*)*)"|' +
			// Standard fields.
			'([^"\\' +
			strDelimiter +
			'\\r\\n]*))',
		'gi'
	);

	let arrData: string[][] = [[]];
	let arrMatches: any = null;

	while ((arrMatches = objPattern.exec(strData))) {
		let strMatchedDelimiter = arrMatches[1];
		if (strMatchedDelimiter.length && strMatchedDelimiter != strDelimiter) {
			arrData.push([]);
		}

		let strMatchedValue: any;
		if (arrMatches[2]) {
			strMatchedValue = arrMatches[2].replace(new RegExp('""', 'g'), '"');
		} else {
			strMatchedValue = arrMatches[3];
		}
		arrData[arrData.length - 1].push(strMatchedValue);
	}
	return arrData;
}

function dragOverHandler(e: any) {
	e.preventDefault();
}

function dropHandler(e: any) {
	e.preventDefault();
	const file = e.dataTransfer.items[0].getAsFile();
	readFile(file);
}
