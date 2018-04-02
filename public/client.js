    var langs =
    [
    ['English', ['en-AU', 'Australia'],
        ['en-CA', 'Canada'],
        ['en-IN', 'India'],
        ['en-NZ', 'New Zealand'],
        ['en-ZA', 'South Africa'],
        ['en-GB', 'United Kingdom'],
        ['en-US', 'United States']],
    ['Español', ['es-AR', 'Argentina'],
        ['es-BO', 'Bolivia'],
        ['es-CL', 'Chile'],
        ['es-CO', 'Colombia'],
        ['es-CR', 'Costa Rica'],
        ['es-EC', 'Ecuador'],
        ['es-SV', 'El Salvador'],
        ['es-ES', 'España'],
        ['es-US', 'Estados Unidos'],
        ['es-GT', 'Guatemala'],
        ['es-HN', 'Honduras'],
        ['es-MX', 'México'],
        ['es-NI', 'Nicaragua'],
        ['es-PA', 'Panamá'],
        ['es-PY', 'Paraguay'],
        ['es-PE', 'Perú'],
        ['es-PR', 'Puerto Rico'],
        ['es-DO', 'República Dominicana'],
        ['es-UY', 'Uruguay'],
        ['es-VE', 'Venezuela']],
    ['Euskara', ['eu-ES']],
    ['Français', ['fr-FR']],
    ['Nederlands', ['nl-NL']],
    ['Norsk bokmål', ['nb-NO']],
    ['Polski', ['pl-PL']],
    ['Português', ['pt-BR', 'Brasil'],
        ['pt-PT', 'Portugal']]
    ];

    var startedCreation = false;
    var addedDescription = false;
    var addedcause = false;
    var addedResolution = false;
    var commandSaid = false;

    var synth = window.speechSynthesis;
    var utterThis = new SpeechSynthesisUtterance("please use the command Add document to start");
    utterThis.pitch = 1;
    utterThis.rate = .8;

    var doc = {};

for (var i = 0; i < langs.length; i++) {
    select_language.options[i] = new Option(langs[i][0], i);
}
select_language.selectedIndex = 0;
updateCountry();
select_dialect.selectedIndex = 2;
showInfo('info_start');
function updateCountry() {
    for (var i = select_dialect.options.length - 1; i >= 0; i--) {
        select_dialect.remove(i);
    }
    var list = langs[select_language.selectedIndex];
    for (var i = 1; i < list.length; i++) {
        select_dialect.options.add(new Option(list[i][1], list[i][0]));
    }
    select_dialect.style.visibility = list[1].length == 1 ? 'hidden' : 'visible';
}
var final_transcript = '';
var recognizing = false;
var ignore_onend;
var start_timestamp;

if (!('webkitSpeechRecognition' in window)) {
    upgrade();
} else {
    start_button.style.display = 'inline-block';
    var recognition = new webkitSpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.onstart = function () {
        recognizing = true;
        showInfo('info_speak_now');
        //speak the commands to user
        //Add a document
        start_img.src = 'mic.png';
    };

    recognition.onerror = function (event) {
        if (event.error == 'no-speech') {
            start_img.src = 'mic.png';
            showInfo('info_no_speech');
            ignore_onend = true;
        }
        if (event.error == 'audio-capture') {
            start_img.src = 'mic.png';
            showInfo('info_no_microphone');
            ignore_onend = true;
        }
        if (event.error == 'not-allowed') {
            if (event.timeStamp - start_timestamp < 100) {
                showInfo('info_blocked');
            } else {
                showInfo('info_denied');
            }
            ignore_onend = true;
        }
    };

    recognition.onend = function () {
        recognizing = false;
        if (ignore_onend) {
            return;
        }
        start_img.src = 'mic.png';
        if (!final_transcript) {
            showInfo('info_start');
            return;
        }
        showInfo('');
        if (window.getSelection) {
            window.getSelection().removeAllRanges();
            var range = document.createRange();
            range.selectNode(document.getElementById('final_span'));
            window.getSelection().addRange(range);
        }
    };
    var str;
    recognition.onresult = function (event) {
        var interim_transcript = '';
        for (var i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
                final_transcript += event.results[i][0].transcript;
            } else {
                interim_transcript += event.results[i][0].transcript;
            }
        }
        
        if(final_transcript.indexOf("add document") > -1 && !startedCreation){
            startedCreation = true;
            //recognition.stop();
            final_transcript = ' ';
            if(!commandSaid) description();
        }

        if(final_transcript.indexOf("complete") > -1 && !addedDescription){
            commandSaid = false;
            addedDescription = true;
            //recognition.stop();
            doc.title = final_transcript;
            final_transcript = ' ';
            if(!commandSaid) cause();
        }

        if(final_transcript.indexOf("complete") > -1 && !addedcause){
            addedcause = true;
            commandSaid = false;
            doc.cause = final_transcript;
            final_transcript = ' ';
            //recognition.stop();
            if(!commandSaid) resolution();
        }

        if(final_transcript.indexOf("complete") > -1 && !addedResolution){
            addedResolution = true;
            commandSaid = false;
            doc.resolution = final_transcript;
            final_transcript = ' ';
            if(!commandSaid) {
                //recognition.stop();
                thankyou();
                restartRec();
            }
        }

        final_span.innerHTML = linebreak(final_transcript);
        interim_span.innerHTML = linebreak(interim_transcript);
        if (final_transcript || interim_transcript) {
            showButtons('inline-block');
        }
    };
}

function upgrade() {
    start_button.style.visibility = 'hidden';
    showInfo('info_upgrade');
}
var two_line = /\n\n/g;
var one_line = /\n/g;
function linebreak(s) {
    return s.replace(two_line, '<p></p>').replace(one_line, '<br>');
}


function startButton(event) {
    if (recognizing) {
        recognition.stop();
        return;
    }
    final_transcript = '';
    recognition.lang = select_dialect.value;
    recognition.start();
    ignore_onend = false;
    final_span.innerHTML = '';
    interim_span.innerHTML = '';
    start_img.src = 'mic.png';
    showInfo('info_allow');
    showButtons('none');
    start_timestamp = event.timeStamp;
    initialCommand();
}
function showInfo(s) {
    if (s) {
        for (var child = info.firstChild; child; child = child.nextSibling) {
            if (child.style) {
                child.style.display = child.id == s ? 'inline' : 'none';
            }
        }
        info.style.visibility = 'visible';
    } else {
        info.style.visibility = 'hidden';
    }
}
var current_style;

function showButtons(style) {
    if (style == current_style) {
        return;
    }
    current_style = style;
    // copy_button.style.display = style;
    // copy_info.style.display = 'none';
}

function initialCommand(){
    synth.speak(utterThis);
}

function description(){
    commandSaid = true;
    utterThis.text = "Please state the description or title of the document once done say complete";
    synth.speak(utterThis);
    //recognition.start();
}

function cause(){
    commandSaid = true;
    utterThis.text = "Please state the cause once done say complete";
    synth.speak(utterThis);
    //recognition.start();
}

function resolution(){
    commandSaid = true;
    utterThis.text = "Please state the resolution once done say complete";
    synth.speak(utterThis);
    //recognition.start();
}

function thankyou(){
    commandSaid = true;
    utterThis.text = "Thank you, doc added successfully";
    synth.speak(utterThis);
}

function restartRec(){
    utterThis.text = "Please state the description or title of the document once done say complete";
    addedcause = false;
    addedDescription = false;
    addedResolution = false;
    startedCreation = false;
    commandSaid = false;
    doc = {}
}