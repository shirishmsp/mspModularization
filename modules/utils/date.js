/* ************ 0. Other Module Imports ************ */

/* ************** 1. Classes/Objects/Variables: ************** */

/* ************** 2. Actions/Events: ************** */

/* ************** 3. Exports: ************** */

export {
    difference,
    timeSince
}

/* ************** 4. Functions: ************** */

/* A snippet from a microlibrary from microjs.com */
/* Returns the time difference between two dates as an object (yrs, mnths, hrs, ...) */
function difference(fromDate, toDate) {
    if (!fromDate) throw new Error('Date should be specified');
    var startDate = new Date(1970, 0, 1, 0).getTime(),
        now = new Date(),
        toDate = toDate && toDate instanceof Date ? toDate : now,
        diff = toDate - fromDate,
        date = new Date(startDate + diff),
        years = date.getFullYear() - 1970,
        months = date.getMonth(),
        days = date.getDate() - 1,
        hours = date.getHours(),
        minutes = date.getMinutes(),
        seconds = date.getSeconds(),
        diffDate = {
            years: 0,
            months: 0,
            days: 0,
            hours: 0,
            minutes: 0,
            seconds: 0
        };

    if (years < 0) return diffDate;
    diffDate.years = years > 0 ? years : 0;
    diffDate.months = months > 0 ? months : 0;
    diffDate.days = days > 0 ? days : 0;
    diffDate.hours = hours > 0 ? hours : 0;
    diffDate.minutes = minutes > 0 ? minutes : 0;
    diffDate.seconds = seconds > 0 ? seconds : 0;

    return diffDate;
}

/* A snippet from: http://bit.ly/2GGbHGS */
/* Returns the vague time (english) elapsed since a specified date */
function timeSince(date) {
  var seconds = Math.floor((new Date() - date) / 1000);
  var interval = Math.floor(seconds / 31536000);

  if (interval > 1) {
    return interval + " years";
  }
  interval = Math.floor(seconds / 2592000);
  if (interval > 1) {
    return interval + " months";
  }
  interval = Math.floor(seconds / 86400);
  if (interval > 1) {
    return interval + " days";
  }
  interval = Math.floor(seconds / 3600);
  if (interval > 1) {
    return interval + " hours";
  }
  interval = Math.floor(seconds / 60);
  if (interval > 1) {
    return interval + " minutes";
  }
  return Math.floor(seconds) + " seconds";
}
