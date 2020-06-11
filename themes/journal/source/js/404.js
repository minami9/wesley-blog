

var blinkTiming = 0;
var paragraphsId = "console-text-";
var currentParagraphsIndex = 0;

function blinkCursor()
{
    var blinkNode = document.getElementById("blink-block");
    if (blinkNode == null)
        return;

    if (blinkTiming++ > 5) 
        blinkNode.innerHTML = "_";
    else 
        blinkNode.innerHTML = "";
    
    if(blinkTiming >= 10) 
        blinkTiming = 0;
}


function deleteBlinkBlock()
{
    var parentNode = document.getElementById(paragraphsId + currentParagraphsIndex);
    if (parentNode != null) {
        var blinkNode = document.getElementById("blink-block");
        if (blinkNode)
            parentNode.removeChild(blinkNode);
    }
}

function appendBlinkBlock(parentNode)
{
    var blinkNode = document.createElement("span");
    blinkNode.id = "blink-block";
    parentNode.appendChild(blinkNode);
}

function newParagraphs()
{
    deleteBlinkBlock();
    var parentNode = document.getElementById(paragraphsId + currentParagraphsIndex);
    if (parentNode != null) 
        currentParagraphsIndex++;
    
    var consoleWindow = document.getElementById("console-window");
    var paragraphs = document.createElement("p");
    paragraphs.innerHTML = ">&nbsp";
    paragraphs.setAttribute("class", "console-text-class");
    paragraphs.id = paragraphsId + currentParagraphsIndex;
    appendBlinkBlock(paragraphs);
    consoleWindow.appendChild(paragraphs);
}

var sentence = new Array(
    "code: 404,",
    "hi,",
    "you are lost in my site.",
    "please return to home page."
);

var currentSentensIndex = 0;
var currentChIndex = 0;

function consoleCommunications()
{
    if (currentSentensIndex >= sentence.length) {
        currentSentensIndex = sentence.length;
        return;
    }
    

    if (currentChIndex >= sentence[currentSentensIndex].length) {
        currentSentensIndex++;
        currentChIndex = 0;
        newParagraphs();
        return;
    }
    deleteBlinkBlock();
    var paragraphs = document.getElementById(paragraphsId + currentParagraphsIndex);

    var ch = sentence[currentSentensIndex].substring(currentChIndex, currentChIndex + 1);
    if (ch === ' ')
        ch = '\xa0\xa0';

    paragraphs.innerText = paragraphs.innerText + ch.toUpperCase();
    appendBlinkBlock(paragraphs);

    currentChIndex++;
}

function runConsole()
{
    setInterval(consoleCommunications, 180);
}

function consoleShow()
{
    setInterval(blinkCursor, 100);
    setTimeout(runConsole, 3000);
    newParagraphs();
}
