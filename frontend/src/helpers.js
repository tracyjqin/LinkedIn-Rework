/**
 * Given a js file object representing a jpg or png image, such as one taken
 * from a html file input element, return a promise which resolves to the file
 * data as a data url.
 * More info:
 *   https://developer.mozilla.org/en-US/docs/Web/API/File
 *   https://developer.mozilla.org/en-US/docs/Web/API/FileReader
 *   https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/Data_URIs
 * 
 * Example Usage:
 *   const file = document.querySelector('input[type="file"]').files[0];
 *   console.log(fileToDataUrl(file));
 * @param {File} file The file to be read.
 * @return {Promise<string>} Promise which resolves to the file as a data url.
 */
export function fileToDataUrl(file) {
    const validFileTypes = [ 'image/jpeg', 'image/png', 'image/jpg' ]
    const valid = validFileTypes.find(type => type === file.type);
    // Bad data, let's walk away.
    if (!valid) {
        throw Error('provided file is not a png, jpg or jpeg image.');
    }
    
    const reader = new FileReader();
    const dataUrlPromise = new Promise((resolve,reject) => {
        reader.onerror = reject;
        reader.onload = () => resolve(reader.result);
    });
    reader.readAsDataURL(file);
    return dataUrlPromise;
}

/**
 * Shows the input element
 */
export const show = (element) => {
    document.getElementById(element).classList.remove('hide');
}

/**
 * Hides the input element
 */
export const hide = (element) => {
    document.getElementById(element).classList.add('hide');
}

/**
 * Returns formatted time given a timestamp
 */
export function time(timestamp) {
    const today = new Date();         
    const notToday = new Date(timestamp);
    const diff = (today - notToday)/(1000*60*60);
    const hours = Math.floor(diff);
    const mins = Math.round((diff-hours)*60);
    const day = notToday.getDate();
    const month = notToday.getMonth();
    const year = notToday.getFullYear();

    let showTime = "";

    if (diff >= 24) {
        showTime = String(day + '/' + month + '/' + year);
    } else {
        showTime = String(hours + ' hours and ' + mins + ' minutes ago');
    }

    return showTime
}

/**
 * Returns formatted date to DD/MM/YYYY
 */
export function startDate(timestamp) {
    const notToday = new Date(timestamp);
    const day = notToday.getDate();
    const month = notToday.getMonth();
    const year = notToday.getFullYear();
    const showTime = String('Start date: ' + day + '/' + month + '/' + year);
    
    return showTime;
}

/**
 * Displays a popup on success or error based on function needs
 */
export const error = (errorMessage, message) => {
    const title = document.getElementById('title');
    const titleText = document.createTextNode(errorMessage);
    const body = document.getElementById("body");
    const bodyText = document.createTextNode(message);
    
    while (title.firstChild) {
        title.removeChild(title.firstChild);
    }

    while (body.firstChild) {
        body.removeChild(body.firstChild);
    }

    title.appendChild(titleText);
    body.appendChild(bodyText);
}
