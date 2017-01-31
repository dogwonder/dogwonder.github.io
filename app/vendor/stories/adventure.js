var title;
var sections = [];
var currentSection;
var choices = [];

var source;
var filesSupported;

// Initialize Adventure.
$(document).ready(function() {
    if (window.File && window.FileReader && window.FileList && window.Blob) {
        filesSupported = true;
    }

    // Do not allow hashes on first load.
    if (window.location.hash) {
        window.location.hash = "";
        document.location.reload();
    }

    // Handler for Choices.
    $(document).on("click", "#content a", function(event) {
        var choice = $(this).attr("choice");
        var choiceName = choice.replace(/\s+/g, '-').toLowerCase();
        if (choice) {
            choices.push(choice);
            currentSection = choice;
            displaySection(choice);
        }
        $('#coya').attr('data-story', '');
        $('#coya').attr('data-story', choiceName);
        $('.story__background img').attr('src', 'dist/images/backgrounds/default.jpg');
        $('.story__background img').attr('src',function(i,e){
          return $(this).attr('src').replace('default.jpg',choiceName + '.jpg');
        });
    });

    // "Back" handlers.
    window.onbeforeunload = function() {
        handleBack();
    }

    window.onhashchange = function() {
        handleBack();
    }

    // Get and display story.
    getStory();
});

// Viewer functions.
function displaySection(name) {
    var htmlTree = markdown.toHTMLTree(sections[name]);
    var html = markdown.renderJsonML(htmlTree);

    // Remove H1 if not title.
    if (name !== title) {
        html = html.replace(/<h1>.+<\/h1>/, "");
    }

    html = displayDecisions(html);

    $("#content").html(html.trim());
    // Remove empty tags left behind from decision rendering.
    $("#content :empty").remove();
}

function displayDecisions(html) {
    // Change html based on previous decisions.
    var htmlNodes = $($.parseHTML(html));

    var decisions = $(".decisions", htmlNodes);

    for (var i = 0; i < decisions.length; i++) {
        var requiredChoices = $($(".decisions", htmlNodes).get(i)).attr("decisions").split(",");

        var matches = 0;
        for (var j = 0; j < choices.length; j++) {
            if (requiredChoices.indexOf(choices[j]) >= 0) {
                matches++;
            }
        }

        if (matches == requiredChoices.length) {
            var content = $($(".decisions", htmlNodes).get(i)).html();
            $($(".decisions", htmlNodes).get(i)).replaceWith("<p>" + content + "</p>");
        } else {
            $($(".decisions", htmlNodes).get(i)).replaceWith("");
        }

        i--;
        decisions = $(".decisions", htmlNodes);
    }

    var scaffold = document.createElement("div");
    for (var i = 0; i < htmlNodes.length; i++) {
        scaffold.appendChild(htmlNodes[i]);
    }

    return scaffold.innerHTML;
}

// Core (Parser) functions.
// Stories have Sections, which are defined by H1s.
// Trees have Branches, which are populated with Bundles.
// Tree-related terminology is only used when processing text.
function getStory() {
    // Default to "story" defined in ./scripts/story.js
    if (story) {
        initializeStory(story);
    } else {
        var storyPath = "./stories/";
        var storyFile = "";

        // Check the "story" URL parameter.
        storyFile = getURLParam("story");

        // Fall back to ./stories/adventure.md
        if (!storyFile) {
            storyFile = "adventure";
        }

        storyPath = storyPath + storyFile + ".md";

        $.get(storyPath, function(data) {
            initializeStory(data);
        });
    }
}

function initializeStory(data) {
    parseSource(data);

    document.title = title;
    currentSection = title;
    displaySection(title);

    // Do this here. Don't grab the source twice.
    source = data;
}

function loadStoryFromFile(event) {
    var file = event.target.files[0];
    var contents;

    if (file) {
        var reader = new FileReader();
        reader.onload = function(e) {
             contents = e.target.result;
             initializeStory(contents);
        }
        reader.readAsText(file);
    }
}

function parseSource(data) {
    var branches = parseStory(data);
    title = branches[0][1][2];
    sections = parseBranches(branches);
}

function parseStory(data) {
    var tree = markdown.parse(data);
    var branches = [];

    var bundle = [];
    // For markdown-js' renderer.
    bundle.push("markdown");

    var titleHeader = true;
    var createNewBundle = false;

    // tree[0] = "markdown".
    for (var i = 1; i < tree.length; i++) {
        var branch = tree[i];

        if (branch[0] === "header" && branch[1].level === 1 && !titleHeader) {
            createNewBundle = true;
        } else {
            titleHeader = false;
        }

        // Find choices implemented as links.
        parseBranchLinks(branch);

        if (createNewBundle === true) {
            branches.push(bundle);

            // Prepare new bundle
            bundle = [];
            bundle.push("markdown");
            createNewBundle = false;
        }

        bundle.push(branch);
    }

    // Last bundle.
    branches.push(bundle);

    return branches;
}

// Pre-processing for choice: and decisions:.
// Gets all links to open in a new tab or window.
function parseBranchLinks(branch) {
    for (var i = 0; i < branch.length; i++) {
        if (branch[i].length > 0 && branch[i][0] === "link") {
            var attributes = branch[i][1];

            if (attributes["href"].substring(0, 7) === "choice:") {
                var choice = attributes["href"].substring(7);
                branch[i][1]["href"] = "#choice";
                branch[i][1]["class"] = "choice";
                branch[i][1]["choice"] = choice;
            } else if (attributes["href"].substring(0, 10) === "decisions:") {
                var decisions = attributes["href"].substring(10);
                branch[i][1]["href"] = "#decision";
                branch[i][1]["class"] = "decisions";
                branch[i][1]["decisions"] = decisions;
            } else {
                branch[i][1]["target"] = "_blank";
            }
        }
    }
}

function parseBranches(branches) {
    var sections = [];

    for (var i = 0; i < branches.length; i++) {
        var name = branches[i][1][2];
        sections[name] = branches[i];
    }

    return sections;
}

// Utility functions.
function getURLParam(param) {
    var pageURL = window.location.search.substring(1);
    var pageURLParams = pageURL.split('&');

    for (var i = 0; i < pageURLParams.length; i++) {
        var paramName = pageURLParams[i].split('=');
        if (paramName[0] == param) {
            // Do not allow paths in story parameter.
            var story = paramName[1];
            if (/[\/\.]/.test(story) === false) {
                return story;
            }
        }
    }
}

function handleBack() {
    if (choices.length > 0) {
        var hashIndex = window.location.href.indexOf('#choice');
        if (hashIndex < 0) {
            var restart = confirm("Your Adventure is still in progress. Would you like to return to the beginning?");
            if (restart) {
                document.location.reload(true);
            } else {
                window.location.hash = "choice";
                displaySection(currentSection);
            }
        }
    }
}
