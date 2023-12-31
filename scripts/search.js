// Pull the query from the local storage
var queryid = localStorage.getItem("query");

// Function for populating the cards on to the search page
function dynamicCards(collection) {
    // Check that the search properly matches a keyword, ignoring case. 
    // Parse the documents with the matching keyword first
    if (queryid != null && queryid != "" && queryid != undefined) {
        tmp = queryid.charAt(0).toUpperCase() + queryid.substring(1).toLowerCase();
        db.collection(collection).where('keywords', 'array-contains', tmp).get().then(docsThatContain => {
            // If the get() doesn't return any documents with the keyword, load all
            if (docsThatContain.size == 0) {
                db.collection(collection).get().then(allRestaurants => createCard(allRestaurants));
            } else {
                // If get() returned at least one document, populate first with documents that contain keyword
                // then populate with ones without
                createCard(docsThatContain);
                db.collection(collection).get().then(docs => {
                    createCard(docs, tmp);
                });
            }
        });
    } else {
        db.collection(collection).get().then(allRestaurants => createCard(allRestaurants));
    }
}
dynamicCards("restaurants");

// Function for creating a card with restaurant details
function createCard(documentArray, kw = null) {
    let cardTemplate = document.getElementById("restCardTemp");
    documentArray.forEach(doc => {
        
        const weekday = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
        const d = new Date();
        let day = weekday[d.getDay()];
        let days = day.substring(0, 3);
        
        var title = doc.data().name;
        var details = doc.data().recently_visited;
        var RestCode = doc.data().code;
        var resttime = doc.data().hours[days];
        var resthours = resttime.split(" ");
        var am = resthours[0] + resthours[1];
        var pm = resthours[2] + resthours[3];
        var restkeyword = doc.data().keywords;
        var docID = doc.id;
        var rating = doc.data().stars;
        let newcard = cardTemplate.content.cloneNode(true);

        
        newcard.querySelector('.texttitle').innerHTML = title;
        newcard.querySelector('.card-text').innerHTML = restkeyword + " Recent Visits: " + details;
        newcard.querySelector('.timetext').innerHTML = am + " - " + pm;
        newcard.querySelector('.card-img').src = "/images/" + RestCode + ".jpg";

        setStarDisplay(rating, newcard);

        newcard.getElementById("topcard").addEventListener("click", function (event) {
            // utilizing local storage to pass restaurant id
            // localStorage.setItem("id", docID);
            // window.location.href = "./restaurant.html";

            // utilizing URL
            window.location.href = "./restaurant.html?id=" + docID;
        });

        // If there is a passed in keyword, only append if it is not one of the restaurant's keywords
        if (!restkeyword.includes(kw)) {
            document.getElementById("restaurant-goes-here").appendChild(newcard);
        }
    });
}

// Function to set the star rating display on the card
// This code was taken from the restaurant.js file.
function setStarDisplay(num, tmp) {
    var stars = [tmp.querySelector("#star1"), tmp.querySelector("#star2"), tmp.querySelector("#star3"), tmp.querySelector("#star4"), tmp.querySelector("#star5")];

    for (let i = 0; i < stars.length; i++) {
        if (i <= Math.floor(num) - 1) {
            stars[i].classList.add("star");
            stars[i].style.display = "inline-block";
        } else if (num - Math.floor(num) > 0) {
            stars[i].classList.add("half_star");
            stars[i].style.display = "inline-block";
            break;
        }
    }
}