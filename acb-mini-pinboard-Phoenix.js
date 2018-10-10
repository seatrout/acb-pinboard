(function () {
    var readlater = true;
    var appUrl = null;
    var quoteSelection = true;
    var tagKeywords = {
        "bishop|church|priest" : "Press_column",
        pope: ["Catholic", "Press_column", "schism"],
        Islam : ["Press_column", "Islam", "Race/Immigrants"],
        "ö|ä|å" :["Swedish","Sweden"],
        "Facebook|Google" : "Adtech"
    };
    var titleTweaks = {
        "github.com": ".entry-title .js-current-repository"
    };
    var descriptionTweaks = {
        "www.kickstarter.com": ".short-blurb"
    };
    var textLengthLimit = 1800;
    var normalize = function (string) {
        return string.toLowerCase()
    };
    var elementText = function (el) {
        return el ? el.textContent.trim().replace(/\s+/g, " ") : null
    };
    var normalizedDocumentTitle = normalize(document.title);
    var isSubtitle = function (string) {
        if (string) {
            return normalizedDocumentTitle.indexOf(normalize(string)) !== -1
        } else {
            return false
        }
    };
    var selectFromNodeList = function (nodeList, func, thisObj) {
        thisObj = thisObj || window;
        var l = nodeList.length;
        var result;
        for (var i = 0; i < l; ++i) {
            result = func.call(thisObj, nodeList[i]);
            if (result !== null) {
                return result
            }
        }
        return null
    };
    var getTitle = function () {
        var url = location.href;
        var host = location.hostname;
        var e;
        if (host in titleTweaks) {
            e = document.querySelector(titleTweaks[host]);
            if (e) {
                return elementText(e)
            }
        }
        var documentTitle = document.title;
        e = document.querySelector("meta[property='og:title']");
        if (e) {
            documentTitle = e.content.trim().replace(/\s+/g, " ")
        }
        if (selectFromNodeList(document.getElementsByClassName("hentry"), function () {
                return true
            })) {
            var htitle = document.querySelector(".hentry .entry-title");
            if (htitle) {
                return elementText(htitle)
            }
        }
        var a_text = selectFromNodeList(document.getElementsByTagName("A"), function (a) {
            if (a.href === url) {
                a_text = elementText(a);
                if (isSubtitle(a_text)) {
                    return a_text
                }
            }
            return null
        });
        if (a_text) {
            return a_text
        }
        var headerTags = ["h1", "h2", "h3", "h4", "h5", "h6"];
        var headerTitle;
        for (var j = 0; j < headerTags.length; ++j) {
            selectFromNodeList(document.getElementsByTagName(headerTags[j]), function (h) {
                var h_text = elementText(h);
                if (isSubtitle(h_text) && (!headerTitle || h_text.length > headerTitle.length)) {
                    headerTitle = h_text
                }
                return null
            })
        }
        if (headerTitle) {
            return headerTitle
        }
        return documentTitle
    };
    var getTags = function (text) {
        text = normalize(text);
        var tags = [];
        var re;
        for (var keyword in tagKeywords) {
            re = keyword instanceof RegExp ? keyword : new RegExp("\\b" + keyword + "\\b", "i");
            if (re.test(text)) {
                tags.push(tagKeywords[keyword])
            }
        }
        return tags
    };
    var getMetaDescription = function () {
        var e;
        e = document.querySelector("meta[name='description']");
        if (e) {
            return e.content.trim().replace(/\s+/g, " ")
        }
        e = document.querySelector("meta[property='og:description']");
        if (e) {
            return e.content.trim().replace(/\s+/g, " ")
        }
        return ""
    };
    var getDescription = function () {
        var text;
        if ("" !== (text = String(document.getSelection()))) {
            if (quoteSelection) {
                text = text.trim().split("\n").map(function (s) {
                    return "<blockquote>" + s + "</blockquote>"
                }).join("\n")
            }
        }
        var host = location.hostname;
        var e;
        if (host in descriptionTweaks) {
            e = document.querySelector(descriptionTweaks[host]);
            if (e) {
                return elementText(e)
            }
        }
        if (!text) {
            text = getMetaDescription()
        }
        return text
    };
    var url = location.href;
    var title = getTitle();
    var description = getDescription();
    var ix = description.indexOf(title);
    if (ix === 0) {
        description = description.substring(title.length).trim()
    } else if (ix === description.length - title.length) {
        description = description.substring(0, ix).trim()
    }
    var tags = getTags(document.title + " " + description + " " + getMetaDescription());
    if (textLengthLimit > 0) {
        title = title.substring(0, textLengthLimit);
        description = description.substring(0, textLengthLimit)
    }
    var args = ["url=", encodeURIComponent(url), "&title=", encodeURIComponent(title), "&description=", encodeURIComponent(description), "&tags=", encodeURIComponent(tags.join(" ")), "&later=", "no", "&jump=", "close"];
    if (readlater) {
        args = args.concat(["&later=", "yes", "&jump=", "close"])
    }
    if (appUrl) {
        args = args.concat(["&x-source=Safari", "&x-success=", encodeURIComponent(location.href), "&x-cancel=", encodeURIComponent(location.href)]);
        window.location = appUrl + args.join("")
    } else {
        var pin = open("http://pinboard.in/add?" + args.join(""), "Pinboard", "toolbar=no,width=610,height=350");
        if (readlater) {
            pin.blur()
        }
    }
})();