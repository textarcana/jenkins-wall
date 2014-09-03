/*jshint browser:true, jquery:true */

var jenkinsHost = 'http://alembic.local:7000';

var APIURL = jenkinsHost +
        '/api/json?' +
        '&jsonp=?';

var app = {};

app.status = {};

var jsonpHelper = function(data) {
    return data;
};

var publishItem = function(i, item){

    $('<li class="gridWidget">')
        .html('<p style="margin-left: 0;">' +
              '<a href="' +
              item.url +
              '" title="' +
              item.name +
              '">' +
              '<span class="' +
              item.color +
              '">&nbsp;</span>' +
              item.name +
             '</a>' +
              '<p>')
        .appendTo( '#list' );

    return true;
};

var noisy_log = function(message){
    console.debug('[FILTER] ' + message);
};

var noisy_assert = function(expression, message){
    console.debug('[ASSERT] ' + message);
    console.assert(expression, message);
};


var updateWith = function(responseDocument){
    app.status.jenkinsAPIResponse = responseDocument;

    $('#list').html('');

    noisy_assert(_.isArray(responseDocument.jobs),
                 'I see a list of Jenkins jobs.');

    var rawList = _.
            reject(responseDocument.jobs,
                   function(item){
                       var input = item.color;
                       var result = (/^disabled$/).test(input);

                       noisy_log('Are any Jenkins jobs disabled?');

                       return result;
                   });

    $.each(rawList,
           publishItem);

    /* analysis */

    var widgets = $('#list li').length,
        passing = _.where(app.status.jenkinsAPIResponse.jobs, {color: "blue"}).length,
        failing = _.where(app.status.jenkinsAPIResponse.jobs, {color: "red"}).length;;


    $('p.description').html(widgets + ' jobs displayed.<br>' +
                            passing + ' succeeded,<br>' +
                            failing + ' falled.<br>');



};

$.getJSON(APIURL, updateWith);
