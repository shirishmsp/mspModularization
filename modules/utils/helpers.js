/* ************ 0. Other Module Imports ************ */

/* ************** 1. Classes/Objects/Variables: ************** */

/* ************** 2. Actions/Events: ************** */

/* ************** 3. Exports: ************** */

export {
	numberWithCommas,
	numberWithoutCommas,
	backgroundImageURL,
	cycleShift
}

/* ************** 4. Functions: ************** */

function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function numberWithoutCommas(x) {
    return parseInt(x.replace(/,/g, ""));
}

function backgroundImageURL(bgProp) {
    bgProp.replace(/^url\(["']?/, '').replace(/["']?\)$/, '');
}

/* TODO: Replace with an ES6 Iterator */
function cycleShift(valueSet, currentValue) {
    var currentIndex;
    if ($.isArray(valueSet)) {
        currentIndex = valueSet.indexOf(currentValue);
        if (currentIndex !== -1) {
            return valueSet[(currentIndex + 1) % valueSet.length];
        }
    }
}
