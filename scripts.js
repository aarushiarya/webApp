apiKey = "AIzaSyBsqqvSXgfdba5wWPx2YGTJvyWg4UUUsCM";
//var url = "http://localhost:3000";
var url = "http://webhw81-env.us-east-2.elasticbeanstalk.com";

var divProgress = '<div class="progress"> <div class="progress-bar progress-bar-striped active" role="progressbar" aria-valuenow="40" aria-valuemin="0" aria-valuemax="100" style="width:50%"> </div></div>';

function getipApi() {
    $.ajax({
        type: 'GET',
        url: 'http://ip-api.com/json',
        success: function(result) {
            $("#latitude").val(result.lat);
            $("#longitute").val(result.lon);
        }
    });
}


function geo() {
    //calling geocoding api
    console.log("calling geocoding");
    var paddr = $.trim($("#locationBox").val());
    var addr = encodeURIComponent(paddr);
    console.log(addr);
    $.ajax({
        type: 'GET',
        url: url + '/geoCode/' + addr + '/' + apiKey,
        //data:'{"data" : "TEST"}',
        success: function(result) {
            console.log(result);
            lat = result["results"][0]["geometry"]["location"]["lat"];
            $("#latitude").val(lat);
            console.log(lat);

            lon = result["results"][0]["geometry"]["location"]["lng"];
            $("#longitute").val(lon);
            console.log(lon);
        }
    });
}



$(document).ready(function() {
    // all custom jQuery will go here
    getipApi();
    //initAutocomplete();

    $("#showFav").click(function() {
        var local = JSON.parse(localStorage.getItem("info"));
        createFav(local);
    });

    $(".mainPill").click(function(){
        $("#detailPlace").hide();
    });

    $("input:radio").click(function() {
        console.log("clicked");
        if ($(this).attr('id') == 'locationS') {
            $("#locationBox").prop("disabled", false);
        } else if ($(this).attr('id') == 'locationC') {
            $("#locationBox").val('');
            $("#locationBox").prop("disabled", true);
        }
    });

    var types = ['Default', 'Airport', 'Amusement Park', 'Aquarium', 'Art Gallery', 'Bakery', 'Bar', 'Beauty Salon', 'Bowling Alley',
        'Bus Station', 'Cafe', 'Camground', 'Car Rental', 'Casino', 'Lodging', 'Movie Theater', 'Museum', 'Night Club', 'Park', 'Parking',
        'Restaurant', 'Shopping Mall', 'Stadium', 'Subway Station', 'Taxi Stand', 'Train Station', 'Transit Station', 'Travel Agency', 'Zoo'
    ];
    var select = $('#category');
    for (x in types) {
        select.append($('<option>', {
            value: types[x].toLowerCase().split(" ").join("_"),
            text: types[x]
        }));
    };

    var types = ['Google Reviews', 'Yelp Reviews'];
    var select = $('#applicat');
    for (x in types) {
        select.append($('<option>', {
            value: types[x],
            text: types[x]
        }));
    };

    var types = ['Default', 'Highest Rating', 'Lowest Rating', 'Most Recent', 'Least Recent'];
    var select = $('#ord');
    for (x in types) {
        select.append($('<option>', {
            value: types[x],
            text: types[x]
        }));
    };

    $("#keyword").keyup(function() {
        checkLengthRequirements(this);
    });
    $("#locationBox").keyup(function() {
        checkLengthRequirements(this);
    });

    $("#search").click(function() {
        var paddr = $.trim($("#locationBox").val());
        if (paddr != "") {
            geo();
        }
        currentId = "";
        var keywd = encodeURIComponent($("#keyword").val());
        var cat = $("#category").val();
        var distance = $("#distance").val();
        var dist = distance * 1609.34;
        if (dist == 0) {
            dist = 16093.4;
        } else if (dist >= 50000) {
            dist = 50000;
        }
        var lat = $("#latitude").val();
        var lon = $("#longitute").val();

        $("#output").html(divProgress);

        $.ajax({
            type: 'GET',
            url: url + '/getPlaces/' + keywd + '/' + cat + '/' + dist + '/' + lat + '/' + lon + '/' + apiKey,
            //data:'{"data" : "TEST"}',
            success: function(result) {
                curr_page = 0;
                if(result.results.length>0){
                    arr = [result];
                    displayRes(result);
                }
                else{
                    $("#output").html("<div class='alert alert-warning'>No records</div>'");
                    $("#tableBtn").css("display","none");
                    $("#detailDiv").css("display","none");
                }
            },
            error: function(){
                $("#output").html("<div class='alert alert-danger'>Failed to get search results</div>'");
                $("#tableBtn").css("display","none");
                $("#detailDiv").css("display","none");
            }
        });
    });


    $("#clear").click(function() {
        console.log("clear is clicked");
        $("#keyword").val('');
        $("#distance").val('');
        $("#category").val('Default');
        $("#locationBox").val('');
        $("#locationBox").prop("disabled", true);
        $("input:radio:first").prop("checked", true);
    });

    $("#next").click(function() {
        var token = arr[curr_page]["next_page_token"];
        console.log(token);
        $.ajax({
            type: 'GET',
            url: url + '/getNextPage/' + token + '/' + apiKey,
            //data:'{"data" : "TEST"}',
            success: function(result) {
                console.log(result);
                console.log("inside nextPage");
                nextPage(result);
            }
        });
    });

    $("#prev").click(function() {
        if (curr_page > 0) {
            curr_page -= 1;
            console.log("inside if prev");
            createTable(arr[curr_page]);
            //check if next_page_token is present
            var next = arr[curr_page]["next_page_token"];
            console.log(next);
            if (next != null) {
                $("#next").css("display", "block");
            }
            if (curr_page == 0) {
                $("#prev").css("display", "none");
                $("#next").css("display", "block");
            }
        }
    });

    $("#list").click(function() {
        $("#detailDiv").css('display', 'block');
        $("#detailPlace").css('display', 'none');
        //if home is active
        var t = $('.nav-pills .active').text();
        if (t == "Results") {
            $("#detailPlace").css('display', 'none');
            $("#home").addClass('active');
        }
        //if favs is active
        else if (t == "Favorites") {
            $("#favs").addClass('active');
            $("#home").removeClass('active');
        }
        checkFavIconSet();
    });

    $('select[name="ord"]').change(function() {

        var order = $("#ord").val();
        var site = $("#applicat").val();
        decide(site, order);
    });

    $('select[name="applicat"]').change(function() {
        var order = $("#ord").val();
        var site = $("#applicat").val();
        decide(site, order);
    });

    //check if form is filled
    $("#start").change(function() {
        var v = $("#start").val();
        var val = $.trim(v);
        if (val != "") {
            $("#directionBtn").removeAttr("disabled");
        } else {
            $("#directionBtn").attr("disabled", "disabled");
        }
    });
    $("#directionBtn").click(function() {
        calculateAndDisplayRoute(directionsService, directionsDisplay);
    });

    $("#viewBtn").click(function() {
        var image = document.getElementById('toggle');
        if (image.getAttribute('src') == "http://cs-server.usc.edu:45678/hw/hw8/images/Pegman.png") {
            $("#pano").css("display", "block");
            $("#map").css("display", "none");
            getView();
            image.src = "http://cs-server.usc.edu:45678/hw/hw8/images/Map.png";
        } else if (image.getAttribute('src') == "http://cs-server.usc.edu:45678/hw/hw8/images/Map.png") {
            $("#pano").css("display", "none");
            $("#map").css("display", "block");
            image.src = "http://cs-server.usc.edu:45678/hw/hw8/images/Pegman.png";
        }
    });

    $("#detBtn").click(function() {
        $("#detailPlace").css('display', 'block');
        var t = $('.nav-pills .active').text();
        if (t == "Results") {
            $("#home").removeClass('active');
        }
        //if favs is active
        else if (t == "Favorites") {
            $("#favTable").removeClass('active');
        }
        checkFavIconSet();
    });

    
});

function decide(site, order) {

    if(site=="Yelp Reviews" && typeof yelpRev == 'undefined'){
        $("#rev").html("<div class='alert alert-warning'>No reviews </div>");
        return;
    }


    if ((site == "Google Reviews") && (order == "Default")) {
        ordDefault();
    } else if ((site == "Google Reviews") && (order == "Highest Rating")) {
        ordHighest();
    } else if ((site == "Google Reviews") && (order == "Lowest Rating")) {
        ordLowest();
    } else if ((site == "Google Reviews") && (order == "Most Recent")) {
        ordMost();
    } else if ((site == "Google Reviews") && (order == "Least Recent")) {
        ordLeast();
    } else if ((site == "Yelp Reviews") && (order == "Default")) {
        getYelp();
    } else if ((site == "Yelp Reviews") && (order == "Highest Rating")) {
        getYelpHighest();
    } else if ((site == "Yelp Reviews") && (order == "Lowest Rating")) {
        getYelpLowest();
    } else if ((site == "Yelp Reviews") && (order == "Most Recent")) {
        getYelpMost();
    } else if ((site == "Yelp Reviews") && (order == "Least Recent")) {
        getYelpLeast();
    }
}

function displayRes(result) {
    $("#detailDiv").css("display", "block");
    createTable(result);
    //introduce delay
    var next = result["next_page_token"];
    //check if next is valid
    if (next != null) {
        $("#next").css("display", "block");
    } else {
        $("#next").css("display", "none");
    }
}

function createTable(res, outputTable) {
    var outputTable = outputTable || "output";
    var rows = res["results"];
    var obj = "<table class='table table-hover' >";
    obj += "<thead><tr><th> # </th>";
    obj += "<th> Category </th>";
    obj += "<th> Name </th>";
    obj += "<th> Address </th>";
    obj += "<th> Favorite </th>";
    obj += "<th> Details </th></tr><thead>";
    for (var i = 0; i < rows.length; i++) {
        var j = i + 1;
        var id = rows[i].place_id;
        var icon = rows[i].icon;
        var name = rows[i].name;
        var vicinity = rows[i].vicinity;
        obj += "<tbody><tr>";
        obj += "<td>" + j + "</td>";
        obj += "<td> <img src=" + icon + "> </td>";
        obj += "<td>" + name + "</td>";
        obj += "<td>" + vicinity + "</td>";
        obj += "<td> <button id='favBtn' class='btn btn-default favClass' data-id=\"" + id + "\" data-name=\"" + name + "\" data-icon=\"" + icon + "\" data-vicinity=\"" + vicinity + "\"><span id='star' class='glyphicon glyphicon-star-empty'></span></button> </td>";
        obj += "<td><input type='button' class='btn btn-default detailsBtn' value='>' data-id=\"" + id + "\"/></td>";
        obj += "</tr></tbody>";
    }
    obj += "</table>";
    $("#" + outputTable).html(obj);

    $(".detailsBtn").click(function(e) {
        displayInfo(e);
    });
    $(".favClass").click(function(e) {
        var button = $(e.target).closest("button");
        addFav(button);

    });

    checkFavIconSet();



}


function addFav(button) {
    var id = button.attr("data-id");
    var name = button.attr("data-name");
    var icon = button.attr("data-icon");
    var vicinity = button.attr("data-vicinity");
    var obj = {
        "name": name,
        "icon": icon,
        "id": id,
        "vicinity": vicinity,
    };


    var local = localStorage.getItem("info");
    local = JSON.parse(local);
    local = local || {};
    local["results"] = local["results"] || [];
    local["results"] = local["results"].filter(function(o) {
        return o.id != id
    });



    var image = button.children().first();
    if (image.hasClass('glyphicon-star-empty')) {
        image.removeClass('glyphicon-star-empty');
        image.addClass('glyphicon-star');
        local["results"].push(obj);

    } else if (image.hasClass("glyphicon-star")) {
        image.removeClass('glyphicon-star');
        image.addClass('glyphicon-star-empty');

    }
    localStorage.setItem("info", JSON.stringify(local));
}

function createFav(loc) {
    $("#detailDiv").css("display", "block");
    console.log("inside fav table");

    if(loc && loc["results"] && loc["results"].length>0){
        var rows = loc["results"];
        var obj = "<table class='table table-hover' >";
        obj += "<tr><th> # </th>";
        obj += "<th> Category </th>";
        obj += "<th> Name </th>";
        obj += "<th> Address </th>";
        obj += "<th> Favorite </th>";
        obj += "<th> Details </th></tr>";
        for (var i = 0; i < rows.length; i++) {
            var j = i + 1;
            var id = rows[i].id;
            console.log(id);
            var icon = rows[i].icon;
            var name = rows[i].name;
            var vicinity = rows[i].vicinity;
            obj += "<tr>";
            obj += "<td>" + j + "</td>";
            obj += "<td> <img src=" + icon + "> </td>";
            obj += "<td>" + name + "</td>";
            obj += "<td>" + vicinity + "</td>";
            obj += "<td> <button id='remFav' class='btn btn-default removeBtn'><span class='glyphicon glyphicon-trash' ></span></button> </td>";
            obj += "<td><input type='button' class='btn btn-default detailsBtn' value='>' data-id=\"" + id + "\"/></td>";
            obj += "</tr>";
        }
        obj += "</table>";
        $("#favTable").html(obj);
        $(".detailsBtn").click(function(e) {
            displayInfo(e);
        });

        $(".removeBtn").click(function(e) {
            console.log("remove favs");
            var tr = $(e.target).closest("tr");
            tr.remove();

            var id = $(tr.children()[5]).children()[0].getAttribute("data-id");

            var local = localStorage.getItem("info");
            local = JSON.parse(local);
            local["results"] = local["results"].filter(function(o) {
                return o.id != id
            });
            localStorage.setItem("info", JSON.stringify(local));

            if(local.length==0)
            {
                var obj = "<div class='alert alert-warning'>No records</div>";
                $("#favTable").html(obj);
                $("#detailDiv").css("display", "none");
            }

        });
    }
    else{
        $("#detailDiv").css("display", "none");
        var obj = "<div class='alert alert-warning'>No records</div>";
        $("#favTable").html(obj);
    }
    

}

function nextPage(result) {
    $("#prev").css("display", "block");
    createTable(result);
    curr_page += 1;
    arr[curr_page] = result;
    //check if next_page_token is present
    var next = result["next_page_token"];
    console.log(next);
    if (next != null) {
        $("#next").css("display", "block");
    } else {
        $("#next").css("display", "none");
    }
}

function showFavIcons(id, button) {
    var local = localStorage.getItem("info");
    local = JSON.parse(local);
    local = local || {};
    local["results"] = local["results"] || [];
    var res = local["results"].filter(function(o) {
        return o.id == id
    });

    var image = button.children().first();
    if (res.length > 0) {
        image.removeClass('glyphicon-star-empty');
        image.addClass('glyphicon-star');
    } else if (image.hasClass("glyphicon-star")) {
        image.removeClass('glyphicon-star');
        image.addClass('glyphicon-star-empty');

    }
}

function checkFavIconSet() {
    $('.favClass').each(function(i, obj) {
        showFavIcons($(obj).attr("data-id"), $(obj));
    });
}

function displayInfo(e) {
    var id = e.target.getAttribute("data-id");
    $("tr").css("backgroundColor", "");
    e.currentTarget.parentNode.parentNode.style.backgroundColor = "#ffc14d";


    //add details to button on details page
    var button = $("button[data-id=" + id + "]");
    var favDetails = $("#favDetails");
    var name = button.attr("data-name");
    var icon = button.attr("data-icon");
    var vicinity = button.attr("data-vicinity");
    favDetails.attr("data-id", id);
    favDetails.attr("data-name", name);
    favDetails.attr("data-icon", icon);
    favDetails.attr("data-vicinity", vicinity);
    showFavIcons(id, favDetails);

    //end add details

    $("#detailPlace").css('display', 'block');
    $("#home").removeClass('active');
    $("#favs").removeClass("active");

    $("#detBtn").removeAttr("disabled");
    
    $("#detailDiv").css("display", "none");
    $("#directionBtn").attr("disabled", "disabled");
    $("#start").val(' ');
    var service = new google.maps.places.PlacesService(serv);


    service.getDetails({
        placeId: id
    }, function(place, status) {

        var name = place.name;
        $("#namePlace").html(name);

        //Info 
        var open, rate = "",
            price = "";

        if (place.formatted_address) {
            $("#end").val(place.formatted_address);
            $("#addr").children().eq(1).html(place.formatted_address);
            $("#addr").removeClass("hidden");
        } else {
            $("#addr").addClass("hidden");
        }

        if (place.international_phone_number) {
            $("#num").children().eq(1).html(place.international_phone_number);
            $("#num").removeClass("hidden");
        } else {
            $("#num").addClass("hidden");
        }

        var p = place.price_level;
        while (p > 0) {
            price += "$";
            p--;
        }
        if (place.price_level) {
            $("#price").children().eq(1).html(price);
            $("#price").removeClass("hidden");
        } else {
            $("#price").addClass("hidden");
        }

        console.log(place.rating);

        if (place.rating) {
            $("#ratin").children().eq(1).html("<span>" + place.rating + "</span><div id='ratStar' style='display:inline-block'></div>");
            //var onSet = $("#ratStar").rateYo("option", "onSet");
            $("#ratStar").rateYo({
                rating: place.rating,
                readOnly: true,
                normalFill: "transparent",
                starWidth: "30px"
            });
            $("#ratStar").rateYo("rating", place.rating);

            $("#rating").removeClass("hidden");
        } else {
            $("#rating").addClass("hidden");
        }

        if (place.url) {
            $("#goo a").text(place.url);
            $("#goo a").attr('href', place.url);
            $("#goo").removeClass("hidden");
        } else {
            $("#goo").addClass("hidden");
        }


        if (place.website) {
            $("#web a").text(place.website);
            $("#web a").attr('href', place.website);
            $("#web").removeClass("hidden");
        } else {
            $("#web").addClass("hidden");
        }

        if (place.website) {
            var webUrl = place.website;
        } else if (place.url) {
            var webUrl = place.url;
        }
        var text = "Check out " + place.name + " located at " + place.formatted_address + "Website:";

        //twitter
        $("#twit").attr('href', 'https://twitter.com/intent/tweet?text=' + text + "&url=" + webUrl + "&hashtags=TravelAndEntertainmentSearch");

        var p = place.utc_offset;
        var n = moment.utc();
        var m = n - p;
        mS = m.toString();
        var d = new Date(m);

        var day = moment(d).isoWeekday();
        day -= 1;
        var r = place.opening_hours.weekday_text[day];
        t = r.substring(r.indexOf(":") + 1);
        var o = place.opening_hours.open_now;
        if (o) {
            open = "Open Now: " + t + " ";
        } else {
            open = "Closed";
        }

        if (place.opening_hours) {
            $("#hrsTime").html(open + " <a data-toggle='modal' href='#myModal'>Daily open hours</a>");
            $("#hrsTime").removeClass("hidden");
        } else {
            $("#hrsTime").addClass("hidden");
        }


        var newObj = "<table class='table'>"
        var arr = place.opening_hours.weekday_text;
        for (var i = 0; i < 7; i++) {
            newObj += "<tr><td>";
            if (i == day) {
                newObj += "<b>"
            }
            newObj += arr[i];
            if (i == day) {
                newObj += "</b>"
            }
            newObj += "</td></tr>";
        }
        newObj += "</table>";
        $(".modal-body").html(newObj);



        $("#info tr:not(.hidden)").each(function(i) {
            $(this).toggleClass("stripe", !!((i + 1) & 1));
        });

        //photos
        var pic = place.photos;
        var len = pic.length;

        for (var i = 0; i < len; i++) {
            $("#column" + (i % 4)).append("<a href = " + pic[i].getUrl({
                'maxWidth': "2000",
                'maxHeight': "2000"
            }) + " target = _blank><img width='100%' src =" + pic[i].getUrl({
                'maxWidth': 350,
                'maxHeight': 350
            }) + "></a>");
        }

        //Map
        var Paddr = encodeURIComponent(place.formatted_address);
        $.ajax({
            type: 'GET',
            url: url + '/geoCode/' + Paddr + '/' + apiKey,
            //data:'{"data" : "TEST"}',
            success: function(result) {
                var Plat = result.results[0].geometry.location.lat;
                var Plon = result["results"][0]["geometry"]["location"]["lng"];
                initMap(Plat, Plon);
            }
        });

        $.ajax({
            type: 'GET',
            url: url + '/yelpMatch/' + place.name + '/' + place.address_components[0].short_name + place.address_components[1].short_name + '/' + place.address_components[3].short_name + '/' + place.address_components[5].short_name + '/' + place.address_components[6].short_name,
            success: function(result) {
                console.log("inside yelp");
                console.log(result);
                var busi = result["businesses"];
                if(busi.length>0){
                    console.log(busi);
                    console.log(busi[0]);
                    var len = busi.length;
                    var bid = busi[0].id;
                    console.log(bid);
                    $.ajax({
                        type: 'GET',
                        url: url + '/yelpReview/' + bid,
                        success: function(resultRev) {
                            console.log(resultRev);
                            yelpRev = resultRev.reviews;
                        }
                    });
                }
                else{

                }
                
            }
        });

        $("#rev").html(divProgress);

        //Reviews
        revi = place.reviews;
        var len = revi.length;
        var detobj = "<div>";
        for (var i = 0; i < len; i++) {
            detobj += "<div class='styleRev'>";
            detobj += "<a href='" + revi[i].author_url + "' target=_blank><img src=" + revi[i].profile_photo_url + " height='40'></a>"
            detobj += "<a href='" + revi[i].author_url + "' target=_blank>" + revi[i].author_name + "</a>";
            detobj += "<br>";
            var rate = "";
            var r = revi[i].rating;
            console.log(r);
            while (r > 0) {
                rate += "<i class='glyphicon glyphicon-star'></i>";
                r--;
            }
            detobj += rate;
            detobj += "<br>";
            var r = revi[i].time;

            dr = moment.unix(r).format('YYYY-MM-DD h:mm:ss');
            console.log(dr);
            detobj += dr;
            detobj += "<br>";
            detobj += revi[i].text;
            detobj += "</div><br>"
        }
        detobj += "</div>";
        var h = document.getElementById("rev").innerHTML = detobj;
    });
}

function getYelp() {
    var len = yelpRev.length;
    var detobj = "<div>";
    for (var i = 0; i < len; i++) {
        detobj += "<div class='styleRev'>";
        detobj += "<a href='" + yelpRev[i].url + "' target=_blank><img src=" + yelpRev[i].user.image_url + " height='40'></a>"
        detobj += "<a href='" + yelpRev[i].url + "' target=_blank>" + yelpRev[i].user.name + "</a>";
        detobj += "<br>";
        var rate = "";
        var r = yelpRev[i].rating;
        while (r > 0) {
            rate += "<i class='glyphicon glyphicon-star'></i>";
            r--;
        }
        detobj += rate;
        detobj += "<br>";
        var dr = yelpRev[i].time_created;
        detobj += dr;
        detobj += "<br>";
        detobj += yelpRev[i].text;
        detobj += "</div><br>"
    }
    detobj += "</div>";
    var h = document.getElementById("rev").innerHTML = detobj;
}

function ordDefault() {
    console.log(revi);
    console.log("inside Default rev");
    var len = revi.length;
    var detobj = "<div>";
    for (var i = 0; i < len; i++) {
        detobj += "<div class='styleRev'>";
        detobj += "<a href='" + revi[i].author_url + "' target=_blank><img src=" + revi[i].profile_photo_url + " height='40'></a>"
        detobj += "<a href='" + revi[i].author_url + "' target=_blank>" + revi[i].author_name + "</a>";
        detobj += "<br>";
        var rate = "";
        var r = revi[i].rating;
        console.log(r);
        while (r > 0) {
            rate += "<i class='glyphicon glyphicon-star'></i>";
            r--;
        }
        detobj += rate;
        detobj += "<br>";
        var r = revi[i].time;
        var mr = moment(new Date(1970, 1, 1, 0, 0, 0));
        mr.add(r, 'seconds');
        var dr = new Date(mr);
        console.log(dr);
        detobj += dr;
        detobj += "<br>";
        detobj += revi[i].text;
        detobj += "</div><br>"
    }
    detobj += "</div>";
    var h = document.getElementById("rev").innerHTML = detobj;
}

function ordHighest() {
    var rat = revi.sort(function(a, b) {
        return a.rating - b.rating
    });
    console.log("inside Highest");
    var len = rat.length;
    var detobj = "<div>";
    for (var i = len - 1; i >= 0; i--) {
        detobj += "<div class='styleRev'>";
        detobj += "<a href='" + rat[i].author_url + "' target=_blank><img src=" + rat[i].profile_photo_url + " height='40'></a>"
        detobj += "<a href='" + rat[i].author_url + "' target=_blank>" + rat[i].author_name + "</a>";
        detobj += "<br>";
        var rate = "";
        var r = rat[i].rating;
        console.log(r);
        while (r > 0) {
            rate += "<i class='glyphicon glyphicon-star'></i>";
            r--;
        }
        detobj += rate;
        detobj += "<br>";
        var r = rat[i].time;
        var mr = moment(new Date(1970, 1, 1, 0, 0, 0));
        mr.add(r, 'seconds');
        var dr = new Date(mr);
        detobj += dr;
        detobj += "<br>";
        detobj += rat[i].text;
        detobj += "</div><br>"
    }
    detobj += "</div>";
    var h = document.getElementById("rev").innerHTML = detobj;
}

function ordLowest() {
    var rat = revi.sort(function(a, b) {
        return a.rating - b.rating
    });
    console.log("inside Lowest");
    var len = rat.length;
    console.log(rat);
    var detobj = "<div>";
    for (var i = 0; i < len; i++) {
        detobj += "<div class='styleRev'>";
        detobj += "<a href='" + rat[i].author_url + "' target=_blank><img src=" + rat[i].profile_photo_url + " height='40'></a>"
        detobj += "<a href='" + rat[i].author_url + "' target=_blank>" + rat[i].author_name + "</a>";
        detobj += "<br>";
        var rate = "";
        var r = rat[i].rating;
        console.log(r);
        while (r > 0) {
            rate += "<i class='glyphicon glyphicon-star'></i>";
            r--;
        }
        detobj += rate;
        detobj += "<br>";
        var r = rat[i].time;
        var mr = moment(new Date(1970, 1, 1, 0, 0, 0));
        mr.add(r, 'seconds');
        var dr = new Date(mr);
        detobj += dr;
        detobj += "<br>";
        if (rat[i].text != "") {
            detobj += rat[i].text;
        }
        detobj += "</div><br>"
    }
    detobj += "</div>";
    var h = document.getElementById("rev").innerHTML = detobj;
}

function ordMost() {
    var s = revi.sort(function(a, b) {
        return a.time - b.time
    });
    console.log(s);
    var len = s.length;
    var detobj = "<div>";
    for (var i = len - 1; i >= 0; i--) {
        detobj += "<div class='styleRev'>";
        detobj += "<a href='" + s[i].author_url + "' target=_blank><img src=" + s[i].profile_photo_url + " height='40'></a>"
        detobj += "<a href='" + s[i].author_url + "' target=_blank>" + s[i].author_name + "</a>";
        detobj += "<br>";
        var rate = "";
        var r = s[i].rating;
        console.log(r);
        while (r > 0) {
            rate += "<i class='glyphicon glyphicon-star'></i>";
            r--;
        }
        detobj += rate;
        detobj += "<br>";
        var r = s[i].time;
        console.log(r);
        var mr = moment(new Date(1970, 1, 1, 0, 0, 0));
        mr.add(r, 'seconds');
        var dr = new Date(mr);
        console.log(dr);
        detobj += dr;
        detobj += "<br>";
        detobj += s[i].text;
        detobj += "</div><br>"
    }
    detobj += "</div>";
    var h = document.getElementById("rev").innerHTML = detobj;
}

function ordLeast() {
    var s = revi.sort(function(a, b) {
        return a.time - b.time
    });
    console.log("inside Least");
    var len = s.length;
    var detobj = "<div>";
    for (var i = 0; i < len; i++) {
        detobj += "<div class='styleRev'>";
        detobj += "<a href='" + s[i].author_url + "' target=_blank><img src=" + s[i].profile_photo_url + " height='40'></a>"
        detobj += "<a href='" + s[i].author_url + "' target=_blank>" + s[i].author_name + "</a>";
        detobj += "<br>";
        var rate = "";
        var r = s[i].rating;
        console.log(r);
        while (r > 0) {
            rate += "<i class='glyphicon glyphicon-star'></i>";
            r--;
        }
        detobj += rate;
        detobj += "<br>";
        var r = s[i].time;
        var mr = moment(new Date(1970, 1, 1, 0, 0, 0));
        mr.add(r, 'seconds');
        var dr = new Date(mr);
        console.log(dr);
        detobj += dr;
        detobj += "<br>";
        detobj += s[i].text;
        detobj += "</div><br>"
    }
    detobj += "</div>";
    var h = document.getElementById("rev").innerHTML = detobj;
}

function getYelpHighest() {
    var ratYelp = yelpRev.sort(function(a, b) {
        return a.rating - b.rating
    });
    var len = ratYelp.length;
    var detobj = "<div>";
    for (var i = len - 1; i >= 0; i--) {
        detobj += "<div class='styleRev'>";
        detobj += "<a href='" + ratYelp[i].url + "' target=_blank><img src=" + ratYelp[i].user.image_url + " height='40'></a>"
        detobj += "<a href='" + ratYelp[i].url + "' target=_blank>" + ratYelp[i].user.name + "</a>";
        detobj += "<br>";
        var rate = "";
        var r = ratYelp[i].rating;
        while (r > 0) {
            rate += "<i class='glyphicon glyphicon-star'></i>";
            r--;
        }
        detobj += rate;
        detobj += "<br>";
        var dr = ratYelp[i].time_created;
        detobj += dr;
        detobj += "<br>";
        detobj += ratYelp[i].text;
        detobj += "</div><br>"
    }
    detobj += "</div>";
    var h = document.getElementById("rev").innerHTML = detobj;
}

function getYelpLowest() {
    var ratYelp = yelpRev.sort(function(a, b) {
        return a.rating - b.rating
    });
    var len = ratYelp.length;
    var detobj = "<div>";
    for (var i = 0; i < len; i++) {
        detobj += "<div class='styleRev'>";
        detobj += "<a href='" + ratYelp[i].url + "' target=_blank><img src=" + ratYelp[i].user.image_url + " height='40'></a>"
        detobj += "<a href='" + ratYelp[i].url + "' target=_blank>" + ratYelp[i].user.name + "</a>";
        detobj += "<br>";
        var rate = "";
        var r = ratYelp[i].rating;
        while (r > 0) {
            rate += "<i class='glyphicon glyphicon-star'></i>";
            r--;
        }
        detobj += rate;
        detobj += "<br>";
        var dr = ratYelp[i].time_created;
        detobj += dr;
        detobj += "<br>";
        detobj += ratYelp[i].text;
        detobj += "</div><br>"
    }
    detobj += "</div>";
    var h = document.getElementById("rev").innerHTML = detobj;
}

function getYelpMost() {
    var ratYelp = yelpRev.sort(function(a, b) {
        return new Date(a.time_created) > new Date(b.time_created)
    });
    var len = ratYelp.length;
    var detobj = "<div>";
    for (var i = len - 1; i >= 0; i--) {
        detobj += "<div class='styleRev'>";
        detobj += "<a href='" + ratYelp[i].url + "' target=_blank><img src=" + ratYelp[i].user.image_url + " height='40'></a>"
        detobj += "<a href='" + ratYelp[i].url + "' target=_blank>" + ratYelp[i].user.name + "</a>";
        detobj += "<br>";
        var rate = "";
        var r = ratYelp[i].rating;
        while (r > 0) {
            rate += "<i class='glyphicon glyphicon-star'></i>";
            r--;
        }
        detobj += rate;
        detobj += "<br>";
        var dr = ratYelp[i].time_created;
        detobj += dr;
        detobj += "<br>";
        detobj += ratYelp[i].text;
        detobj += "</div><br>"
    }
    detobj += "</div>";
    var h = document.getElementById("rev").innerHTML = detobj;
}

function getYelpLeast() {
    var ratYelp = yelpRev.sort(function(a, b) {
        return new Date(a.time_created) > new Date(b.time_created)
    });
    var len = ratYelp.length;
    var detobj = "<div>";
    for (var i = 0; i < len; i++) {
        detobj += "<div class='styleRev'>";
        detobj += "<a href='" + ratYelp[i].url + "' target=_blank><img src=" + ratYelp[i].user.image_url + " height='40'></a>"
        detobj += "<a href='" + ratYelp[i].url + "' target=_blank>" + ratYelp[i].user.name + "</a>";
        detobj += "<br>";
        var rate = "";
        var r = ratYelp[i].rating;
        while (r > 0) {
            rate += "<i class='glyphicon glyphicon-star'></i>";
            r--;
        }
        detobj += rate;
        detobj += "<br>";
        var dr = ratYelp[i].time_created;
        detobj += dr;
        detobj += "<br>";
        detobj += ratYelp[i].text;
        detobj += "</div><br>"
    }
    detobj += "</div>";
    var h = document.getElementById("rev").innerHTML = detobj;
}

function checkLengthRequirements(input) {
    var val = $(input).val().trim();
    if (val.length == 0) {
        $("#search").attr("disabled", "disabled");
        $(input).parent().addClass("has-error");
        $(input).siblings().show()
    } else {
        $("#search").removeAttr("disabled");
        $(input).parent().removeClass("has-error");
        $(input).siblings().hide();
    }

}
//Map 
function initMap(Plat, Plng) {
    uluru = {
        lat: Plat,
        lng: Plng
    };
    directionsService = new google.maps.DirectionsService;
    directionsDisplay = new google.maps.DirectionsRenderer;
    var map = new google.maps.Map(document.getElementById("map"), {
        zoom: 15,
        center: {
            lat: Plat,
            lng: Plng
        }
    });
    var marker = new google.maps.Marker({
        position: uluru,
        map: map
    });
    directionsDisplay.setMap(map);
    directionsDisplay.setPanel(document.getElementById('right-panel'));
}

function calculateAndDisplayRoute(directionsService, directionsDisplay) {
    var mode = document.getElementById('mode').value;
    var start = document.getElementById('start').value;
    if ((start == "Your location") || (start == "My location")) {
        //set your location
        var sLat = $("#latitude").val();
        console.log(sLat);
        var sLng = $("#longitute").val();
        console.log(sLng);

        start = new google.maps.LatLng(parseFloat(sLat), parseFloat(sLng));
    }
    var end = document.getElementById('end').value;
    directionsService.route({
        origin: start,
        destination: end,
        travelMode: mode,
        provideRouteAlternatives: true
    }, function(response, status) {
        if (status === 'OK') {
            console.log(response);
            directionsDisplay.setDirections(response);
        } else {
            window.alert('Directions request failed due to ' + status);
        }
    });
}

function getView() {
    var sv = new google.maps.StreetViewService();
    panorama = new google.maps.StreetViewPanorama(document.getElementById('pano'));
    map = new google.maps.Map(document.getElementById('map'), {
        center: uluru,
        zoom: 16,
        streetViewControl: false
    });
    sv.getPanorama({
        location: uluru,
        radius: 50
    }, processSVData);
}

function processSVData(data, status) {
    if (status === 'OK') {
        var marker = new google.maps.Marker({
            position: data.location.latLng,
            map: map,
            title: data.location.description
        });

        panorama.setPano(data.location.pano);
        panorama.setPov({
            heading: 270,
            pitch: 0
        });
        panorama.setVisible(true);
    } else {
        console.error('Street View data not found for this location.');
    }
}


//Autocomplete
var placeSearch, autocomplete, autocompleteMap;
var componentForm = {
    street_number: 'short_name',
    route: 'long_name',
    locality: 'long_name',
    administrative_area_level_1: 'short_name',
    country: 'long_name',
    postal_code: 'short_name'
};

function initAutocomplete() {
    autocomplete = new google.maps.places.Autocomplete(
        (document.getElementById('locationBox')), {
            types: ['geocode']
        });
    autocompleteMap = new google.maps.places.Autocomplete(
        (document.getElementById('start')), {
            types: ['geocode']
        });
}

function geolocate() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
            var geolocation = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };
            console.log("inside geolocate");
            var circle = new google.maps.Circle({
                center: geolocation,
                radius: position.coords.accuracy
            });
            autocomplete.setBounds(circle.getBounds());
        });
    }
}
