navigator.getUserMedia = (navigator.getUserMedia ||
    navigator.webkitGetUserMedia ||
    navigator.mozGetUserMedia ||
    navigator.msGetUserMedia);

var v = document.getElementById("user_name");

var record = document.querySelector('.record');
var stop = document.querySelector('.stop');
var upload = document.querySelector('.upload');


var soundClips = document.querySelector('.sound-clips');
var canvas = document.querySelector('.visualizer');
var mediaRecorder = null;
var mediaStreamSource = null;
var ignoreAutoPlay = false;

// disable stop button while not recording
//MAKES THEM GRAY
stop.disabled = true;
upload.disabled = true;

var tries = 1;

// visualiser setup - create web audio api context and canvas

var audioCtx = new (window.AudioContext || webkitAudioContext)();
var canvasCtx = canvas.getContext("2d");

audioCtx.sampleRate = 48000;

//main block for doing the audio recording

if (navigator.mediaDevices.getUserMedia) {

    console.log('getUserMedia supported.');

    var constraints = {audio: true};
    var chunks = [];

    navigator.mediaDevices.getUserMedia(constraints)
        .then(function (stream) {
            mediaRecorder = new MediaRecorder(stream);
            mediaStreamSource = audioCtx.createMediaStreamSource(stream);
            record.onclick = function () {
                visualize(stream);

                // Display a countdown before recording starts.
                var progress = document.querySelector('.progress-display');
                progress.innerText = "3";
                document.querySelector('.info-display').innerText = "";
                setTimeout(function () {
                    progress.innerText = "2";
                    setTimeout(function () {
                        progress.innerText = "1";
                        setTimeout(function () {
                            progress.style.fontSize = "xx-large";
                            progress.innerText = "";
                            startRecording();
                        }, 1000);
                    }, 1000);
                }, 1000);
                stop.disabled = false;
                record.disabled = true;
            }

            stop.onclick = function () {
                if (mediaRecorder.state == 'inactive') {
                    // The user has already pressed stop, so don't set up another word.
                    ignoreAutoPlay = true;
                } else {
                    mediaRecorder.stop();
                }
                mediaStreamSource.disconnect();
                record.style.background = "";

                record.style.color = "";
                stop.disabled = true;
                record.disabled = false;
            }

            upload.onclick = function () {
                saveRecordings();
            }

            mediaRecorder.onstop = function (e) {
                console.log("data available after MediaRecorder.stop() called.");

                var clipName = document.querySelector('.info-display').innerText;
                var clipContainer = document.createElement('article');
                var clipLabel = document.createElement('p');
                var audio = document.createElement('audio');
                var deleteButton = document.createElement('button');

                clipContainer.classList.add('clip');
                clipLabel.classList.add('clip-label');
                audio.setAttribute('controls', '');
                deleteButton.textContent = 'Delete';
                deleteButton.className = 'delete';
                clipLabel.textContent = clipName;

                clipContainer.appendChild(audio);
                clipContainer.appendChild(clipLabel);
                clipContainer.appendChild(deleteButton);
                soundClips.appendChild(clipContainer);

                audio.controls = true;
                var blob = new Blob(chunks, {'type': 'audio/wav; codecs=opus'});
                chunks = [];
                var audioURL = window.URL.createObjectURL(blob);
                audio.src = audioURL;
                console.log("recorder stopped");

                deleteButton.onclick = function (e) {
                    evtTgt = e.target;
                    evtTgt.parentNode.parentNode.removeChild(evtTgt.parentNode);
                    updateProgress();
                }
            }

            mediaRecorder.ondataavailable = function (e) {
                chunks.push(e.data);
            }
        })

        .catch(function (err) {
            console.log('The following error occurred: ' + err);
        })

} else {
    document.querySelector('.info-display').innerText =
        'Unfortuante';
}

function visualize(stream) {
    var analyser = audioCtx.createAnalyser();
    analyser.fftSize = 2048;
    var bufferLength = analyser.frequencyBinCount;
    var dataArray = new Uint8Array(bufferLength);

    mediaStreamSource.connect(analyser);

    WIDTH = canvas.width
    HEIGHT = canvas.height;

    draw()

    function draw() {

        requestAnimationFrame(draw);

        analyser.getByteTimeDomainData(dataArray);

        canvasCtx.fillStyle = 'rgb(200, 200, 200)';
        canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);

        canvasCtx.lineWidth = 2;
        canvasCtx.strokeStyle = 'rgb(0, 0, 0)';

        canvasCtx.beginPath();

        var sliceWidth = WIDTH * 1.0 / bufferLength;
        var x = 0;

        for (var i = 0; i < bufferLength; i++) {

            var v = dataArray[i] / 128.0;
            var y = v * HEIGHT / 2;

            if (i === 0) {
                canvasCtx.moveTo(x, y);
            } else {
                canvasCtx.lineTo(x, y);
            }

            x += sliceWidth;
        }

        canvasCtx.lineTo(canvas.width, canvas.height / 2);
        canvasCtx.stroke();
    }
}


// function shuffleArray(array) {
//     for (var i = array.length - 1; i > 0; i--) {
//         var j = Math.floor(Math.random() * (i + 1));
//         var temp = array[i];
//         array[i] = array[j];
//         array[j] = temp;
//     }
// }

var englishWords = ['One',
    'Two',
    // 'Three',
    // 'Four',
    // 'Five',
    // "Hi UMEC",
    // "UMEC"
];
var chineseWords = [
// '一',
//     '二',
//     '三',
//     '四',
//     '五',
//     '你好 UMEC',
];

var wantedWords = englishWords.concat(chineseWords);

// Reading data in utf-8 format
// which is a type of character set.
// Instead of 'utf-8' it can be
// other character set also like 'ascii'


function getRecordedWords() {
    var wordElements = document.querySelectorAll('.clip-label');
    var wordCounts = {};
    wordElements.forEach(function (wordElement) {
        const word = wordElement.innerText;
        if (!wordCounts.hasOwnProperty(word)) {
            wordCounts[word] = 0;
        }
        wordCounts[word] += 1;
    });
    return wordCounts;
}

//each word
function getAllWantedWords() {
    var wordCounts = {};
    wantedWords.forEach(function (word) {
        wordCounts[word] = tries;
    });
    return wordCounts;
}

function getRemainingWords() {
    const recordedCounts = getRecordedWords();
    var wantedCounts = getAllWantedWords();
    var remainingCounts = {};
    for (var word in wantedCounts) {
        wantedCount = wantedCounts[word];
        var recordedCount;
        if (recordedCounts.hasOwnProperty(word)) {
            recordedCount = recordedCounts[word];
        } else {
            recordedCount = 0;
        }
        var remainingCount = wantedCount - recordedCount;
        if (remainingCount > 0) {
            remainingCounts[word] = remainingCount;
        }
    }
    return remainingCounts;
}

function unrollWordCounts(wordCounts) {
    var result = [];
    for (var word in wordCounts) {
        count = wordCounts[word];
        for (var i = 0; i < count; ++i) {
            result.push(word);
        }
    }
    return result;
}

var banta = 0;


function getNextWord() {
    var loyt;
    if (banta == (wantedWords.length * tries)) {
        return null;
    } else if (banta >= englishWords.length * tries) {
        if (englishWords.length > chineseWords.length) {
            loyt = chineseWords[(banta - tries) % chineseWords.length];
        } else {
            loyt = chineseWords[banta % chineseWords.length];
        }
    } else {
        loyt = englishWords[banta % englishWords.length];
    }
    banta++;
    return loyt;
}

function getProgressDescription() {
    var allWords = unrollWordCounts(getAllWantedWords());
    var remainingWords = unrollWordCounts(getRemainingWords());
    if (((allWords.length) - remainingWords.length) == (englishWords.length * tries)) {
        alert("Now read out in Mandarin, next letter is 'Yi'\n現在說普通話, 按確定後讀'一'");
    }
    return ((allWords.length + 1) - remainingWords.length) + "/" + allWords.length;
}

function updateProgress() {
    var progress = getProgressDescription();
    document.querySelector('.progress-display').innerText = progress;
}

function startRecording() {
    if (ignoreAutoPlay) {
        ignoreAutoPlay = false;
        return;
    }
    var word = getNextWord();
    if (word === null) {
        promptToSave();
        return;
    }
    updateProgress();
    document.querySelector('.info-display').innerText = word;
    mediaRecorder.start();
    console.log(mediaRecorder.state);
    console.log("recorder started");
    record.style.background = "red";
    setTimeout(endRecording, 2000);
}

function endRecording() {
    if (mediaRecorder.state == 'inactive') {
        // The user has already pressed stop, so don't set up another word.
        return;
    }
    mediaRecorder.stop();
    console.log(mediaRecorder.state);
    console.log("recorder stopped");
    record.style.background = "";
    record.style.color = "";
    setTimeout(startRecording, 1000);
}

function promptToSave() {
    if (confirm('Are you ready to upload your words?\nIf not, press cancel now,' +
        ' and then press Upload once you are ready.')) {
        saveRecordings();
    }
    upload.disabled = false;
}

var allClips;
var clipIndex;

function saveRecordings() {
    mediaStreamSource.disconnect();
    allClips = document.querySelectorAll('.clip');
    clipIndex = 0;
    uploadNextClip();
}

function uploadNextClip() {
    document.querySelector('.progress-display').innerText = 'Uploading clip ' +
        clipIndex + '/' + unrollWordCounts(getAllWantedWords()).length;
    var clip = allClips[clipIndex];
    clip.style.display = 'None';
    var audioBlobUrl = clip.querySelector('audio').src;
    var word = clip.querySelector('p').innerText;
    var trialN = trialCount(word).toString();
    var xhr = new XMLHttpRequest();
    xhr.open('GET', audioBlobUrl, true);
    xhr.responseType = 'blob';
    xhr.onload = function (e) {
        if (this.status == 200) { //if successful response
            var blob = this.response;

            var strUser = v.value;
            var ajaxRequest = new XMLHttpRequest();
            ajaxRequest.open('POST', "/upload?word=" + word + '&trialN=' + trialN + "&name=" + strUser, true);
            ajaxRequest.setRequestHeader('Content-Type', 'application/json');
            ajaxRequest.onreadystatechange = function () {
                if (ajaxRequest.readyState == 4) { //request finished and ready
                    if (ajaxRequest.status === 200) {
                        clipIndex += 1;
                        if (clipIndex < allClips.length) {
                            uploadNextClip();
                        } else {
                            allDone();
                        }
                    } else {
                        alert('Uploading failed with error1 code ' + ajaxRequest.status);
                    }
                }
            };
            ajaxRequest.send(blob);
        }
    };
    xhr.send();
}

function allDone() {
    location.reload(true);
}

var trialDic = {};

function trialCount(tword) {
    if (!(tword in trialDic)) {
        trialDic[tword] = 1;
    } else {
        trialDic[tword] = trialDic[tword] + 1;
    }
    return trialDic[tword];
}


//for security reason
// press shift+0 to un-hide buttons
function showChar(e) {
    if (e.key == ')') {
        butts.style.display = "block";
        document.cookie = 'ccc';
    }
}

var butts = document.getElementById("main");

if (document.cookie == "ccc") {
    butts.style.display = "block";
}
else{
    butts.style.display = "none";
}