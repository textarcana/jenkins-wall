/*jshint browser:true, jquery:true */

/*
*   Copyright 2014 Noah Sussman New Media, LLC
*
*   Licensed under the Apache License, Version 2.0 (the "License");
*   you may not use this file except in compliance with the License.
*   You may obtain a copy of the License at
*
*       http://www.apache.org/licenses/LICENSE-2.0
*
*   Unless required by applicable law or agreed to in writing, software
*   distributed under the License is distributed on an "AS IS" BASIS,
*   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
*   See the License for the specific language governing permissions and
*   limitations under the License.
*/

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

    $('<li class="gridWidget ' + item.color + '">')
        .html('<p style="margin-left: 0;"' +
              '">' +
              '<a href="' +
              item.url +
              '" title="' +
              item.name +
              '">' +
              item.name +
             '</a>' +
              ' &nbsp; <a href="' + jenkinsHost + '/job/' + item.name + '/configure" class="conf">configure</a>' +
              '<p>')
        .click(function(){
            var buildURL = jenkinsHost +
                    '/job/' +
                    item.name +
                    '/build?delay=0sec';

            $.ajax({
                url: buildURL,
                dataType: "jsonp"
            });

            pollRemoteHost();

        })
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
                            failing + ' failed.<br>');



};

var pollRemoteHost = function(){
    $.getJSON(APIURL, updateWith);
};

pollRemoteHost();

var eventLoop = setInterval(pollRemoteHost, 8 * 1000);
