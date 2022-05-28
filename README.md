<img src="public/assets/logo.png" width="128">

# Tubular - _your history on TfL, visualised_

> The project is currently live at [🚇🚇🚇.ml](https://🚇🚇🚇.ml).

![GitHub](https://img.shields.io/github/license/PocketCoder/tubular) ![GitHub package.json version](https://img.shields.io/github/package-json/v/PocketCoder/tubular) ![GitHub commit activity](https://img.shields.io/github/commit-activity/m/PocketCoder/tubular) ![GitHub last commit](https://img.shields.io/github/last-commit/PocketCoder/tubular) ![Website](https://img.shields.io/website?url=https%3A%2F%2Ftubular.110399.xyz)

---

> The new tube map will be used when the Elizabeth Line is fully open and the map is in its final form. The map update will take a lot of effort so I won't do it until it won't need to be done again for ages.

---

> **Contents:** [Minimum Viable Product](#mvp) &bull; [Information sources](#sources) &bull; [Next Steps](#next-steps) &bull; [Rough Roadmap](#roadmap) &bull; [Style](#brand) &bull; [Logic Explained](#linesjson-and-scriptjs-logic-explained) &bull; [Extended To Do List](#things-i-may-or-may-not-eventually-add)

I made this project because I wanted to see how much of the TfL network I've been on...and because ticking off stations on a physical map was too easy.

_I am open to new ideas for names._

## M.V.P.

- The map displays and is faded out initially.
- Any previously added stations are retrieved from `localStorage` and added to the map.
- The input box makes the station fade in, stores it in `localStorage`, and updates the line to be complete.
- You can upload a CSV file (downloaded from the Oyster website) to mass-add stations.
- You can see a progress bar for how many stations you've visited.
- Bus data is also saved in case of future use.

## Sources

I stole the Oyster SVG Map from: [https://tfl.gov.uk/Modules/TubeMap?nightMode=false](https://tfl.gov.uk/Modules/TubeMap?nightMode=false)

_(I spent **hours** changing the IDs on the [map.svg](public/assets/map.svg) so that I could manipulate them. Perhaps longer than I should have. I'm fragile, please don't say if there was an easier way as I may collapse.)_

[stations.json](public/assets/stations.json) and [lines.json](public/assets/lines.json) were adapted from [@paulcuth's](https://gist.github.com/paulcuth/1111303) and [@Lissy93's](https://gist.github.com/Lissy93/cb316efbf4b0968bc744cbbe48a574ab) gists, as well as a [TfL Source](https://content.tfl.gov.uk/station-abbreviations.pdf).

_(Some of the three-letter station codes were non-existent so I made them up. I didn't keep track of which are made up. I'm sorry.)_

## Next steps

- [x] UI Polish
  - [x] Mobile-friendly UI
  - [x] Make it prettier
  - [x] Fix font
  - [ ] Rough text match for station input.
  - [x] Visual handling of correct and incorrect input.
- [x] Bus route data (X routes used out of X) (for now)
- [ ] Login and User Profiles (WIP)
  - [ ] Data saved in database, not LS; therefore syncing across devices
- [ ] Stats
  - [ ] % of stations visited
    - [x] on a line
    - [ ] on the whole TfL service
  - [ ] % label next to progress bar
  - [ ] Line label next to progress bar
- [ ] Export data as CSV or PNG Map.
- [x] Move development to TypeScript.

## Roadmap

| Version | Feature                           |
| ------- | --------------------------------- |
| 1.0.0   | Minimum Viable Product            |
| N.X.0   | Stats are better labelled         |
| N.X.0   | Bus routes displayed more clearly |
| N.X.0   | Sharable PNG of map/stats         |
| 2.0.0   | User Login and info stored in DB  |
| 3.0.0   | PWA                               |

## Brand

### Type faces

To keep it open source, the station labels on the map are [`Hammersmith One`](https://fonts.google.com/specimen/Hammersmith+One)—a copyright friendly font alternative to the official [`Johnston`](https://en.wikipedia.org/wiki/Johnston_(typeface)).

![Hammersmith One font sample](/README%20assets/hammersmith-one.png)

![Oxford Circus on the map](/README%20assets/OXC.png)

The body is currently [`Roboto`](https://fonts.google.com/specimen/Roboto). This may change in future.

![Body Sample](/README%20assets/body.png)

### Colours

Borrowed from [oobrien.com](https://oobrien.com/2012/01/tube-colours/).

| Line               | Colour Hex |
| ------------------ | ---------- |
| Bakerloo           | #B36305    |
| Cable Car          | #E21836    |
| Central            | #E32017    |
| Circle             | #FFD300    |
| District           | #00782A    |
| DLR                | #00A4A7    |
| Elizabeth          | #7156A5    |
| Hammersmith & City | #F3A9BB    |
| Jubilee            | #A0A5A9    |
| Metropolitan       | #9B0056    |
| Northern           | #000000    |
| Overground         | #EE7C0E    |
| Piccadilly         | #003688    |
| Trams              | #84B817    |
| Victoria           | #0098D4    |
| Waterloo & City    | #95CDBA    |

Where possible, all the colours are one of the above.

## Logic explained

### data.ts

In [`data.ts`](public/assets/data.ts), there are two variables for us to access: `lines` and `stations`.

`stations` is a simple object that holds the station name (as it appears on an Oyster statement) as the key, and it's corresponding unique three-letter code as the value.

`lines` holds the information about the line and it's stations, primarily: if it has branches or not, and the order the stations appear it. North to South, East to West (with one exception: the Overground line from Liverpool Street to Enfield Town/Chesnut/Chingford.)

The Bakerloo Line is represented like this:

```javascript
bakerloo: {
	branch: false,
	line: 'bakerloo',
	stations: ['HAW', 'SKT', 'NWM', 'WEM', 'SPK', 'HSD', 'WJN', 'KGN', 'QPK', 'KPK', 'MDV', 'WAR', 'PAD', 'ERB', 'MYB', 'BST', 'RPK', 'OXC', 'PIC', 'CHX', 'EMB', 'WLO', 'LAM', 'ELE']
}
```

with no branches, the stations are in an array in N-S order.

The Picadilly Line branches at one the southern end, so is represented like so:

```javascript
piccadilly: {
		branch: 'true',
		line: 'piccadilly',
		top: [
			['CFS', 'OAK', 'SGT', 'AGR', 'BGR', 'WGN', 'TPL', 'TPL', 'MNR', 'FPK', 'ARL', 'HRD', 'CRD', 'KXX', 'RSQ', 'HOL', 'COV', 'LSQ', 'PIC', 'GPK', 'HPC', 'KNB', 'SKN', 'GRD', 'ECT', 'BCT', 'HMD', 'TGR']
		],
		bottom: [
			['TGR', 'ACT', 'ECM', 'NEL', 'PRY', 'ALP', 'STN', 'SHL', 'SHR', 'RLN', 'ETE', 'RUM', 'RUI', 'ICK', 'HDN', 'UXB'],
			['TGR', 'ACT', 'SEL', 'NFD', 'BOS', 'OST', 'HNE', 'HNC', 'HNW', 'HTX', 'HRC', 'HTF', 'HTC'],
			['TGR', 'ACT', 'SEL', 'NFD', 'BOS', 'OST', 'HNE', 'HNC', 'HNW', 'HTX', 'HRC', 'HRV']
		]
	}
```

The `stations` array is now replaced by arrays `top` and `bottom`. The `top` array holds all the stations from north to south up to Turnham Green (TGR), the station just before the line splits. The `bottom` array holds all the stations from Turnham Green to their termini. As it splits futher down in the southern end at the Heathrow stations, the arrays contain repeated data as if each end-point were their own branch.

`top` and `bottom` are always named so, even if they could be more aptly named `left` and `right`.

### script.js

To interpret these arrays, there's the `updateLineSegs()` function.

```js
let stnCodes = findVisCodes(usrData('get', 'stations'));
```

First we get an array of station codes that the user has visited. `usrData('get', 'stations')` retrieves a list of all the stations a user has visited and returns the array. `findVisCodes()` takes in the array and outputs a new array of only the three-letter codes.

> In future I will change it so the stations are saved as codes.

```js
let data = {
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
```

This is for the stats. We set up the object to assume the user has visited none of them.

```js
for (const l in lines) {
		const lineObj = lines[l];
```

For each of the lines in the `line` variable we have in `data.ts`, explose the line's object to `lineObj`.

```js
if (lineObj['branch']) {
```

We then check to see if this line has branches. If it does we set up two functions: `top()` and `bottom()` which see if the corresponding branch has visited stations in it.

```js
function top() {
	let active = false;
	lineObj['top'].forEach((a: string[]) => {
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

function bottom() {
	let active = false;
	lineObj['bottom'].forEach((a: string[]) => {
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
```

If cycles through each station in each branch in the `top` and `bottom` arrays and if the previously retrieved station codes contain any of them then the branch is deemed active.

We then have a function called `complete(top, bottom)` which takes in `Booleans` to fill in the line segements depending on if one of both of the sections are active.

```js
if (top && bottom) {
	let total = 0; // For the stats saved earlier
	lineObj['top'].forEach((e: string[]) => {
		let first = 100; // The first station will never be at array position 100.
		e.forEach((a) => {
			// For each array in top.
			const index = e.indexOf(a); // Get index of station in array.
			if (stnCodes.includes(a)) {
				// If the station has been visited by the user.
				total++; // Increase the total.
				if (index <= first) {
					// If it's earlier than the current earliest station.
					first = index; // Make it the earliest.
				}
			}
		});
		for (let i = first; i < e.length; i++) {
			// Between the first station visited and the last on the branch.
			$(`#lul-${lineObj['line']}_${e[i]}-${e[i + 1]}`).addClass('visible'); // Make the segment between the current station and the next visible.
			// Stations have id #lul-[line name]_[stnCode]-[stnCode].
			// e.g. #lul-central_OXC-BST
		}
	});
	lineObj['bottom'].forEach((e) => {
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
			$(`#lul-${lineObj['line']}_${e[i]}-${e[i + 1]}`).addClass('visible');
		}
	});
	// Same is done for the bottom branches, except we find the last station visited.
	data[lineObj['line']] = data[lineObj['line']] + total; // Update total in data object.
}
```

If just the `top` or `bottom` branches have been visited, we essneitally combine the above to find the first and last visited stations and loop through the segments between them to make them visible.

Finally we call `complete(top(), bottom())` passing in the earlier functions and their returned `Booleans`.

If there are no branches we copy the code of filling in the line segments as if only one branch were visited. Finding the first and last station visited and looping between their indexes.

Finally we call the `updateStats()` function, passing in our `data` variable which should now be complete for each line.

### Final additions

Each line in `data.ts` is sometimes split into segments, for example the DLR is explit into three segments as it is a mini-network in itself. TfL Rail (soon to be the Elizabeth Line) acts as two separate lines as currently it is disconnected.

---

## Things I may or may not eventually add

- [ ] PWA
- [ ] Hover on line/stations for emphasis and information (number of visits, last visit)
- [ ] Challenges/Achievements:
  - [ ] Streak: visit a new station every month
    - 272 stations; 272/12 = 22 years to do them all
  - [ ] Travel through the whole of each line
    - Stations at either end have to be visited
    - 11 lines + overground + trams
  - [ ] Visit every station on a line
  - [ ] Use every line
  - [ ] Use every branch of the Northern line?
    - Or another fun idiosyncrasy of TfL
  - [ ] Use every overground line
  - [ ] Have gotten the first/last train of the day of that line/on TfL
- [ ] Map of Riverboat services
- Leaderboards?
  - Would require authentication of CSVs
    - Complicated:- See if their journeys were feasible. Times taken + whether the line/stations were open on that day/time + gap between entries
    - Easier:- User history. Not too many visited too often. Account age and number of stations visited.
    - Easiest:- Honour system
  - Can be turned on/off by users
  - Rankings of users stats
