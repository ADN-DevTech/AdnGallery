/**
 * Created by leefsmp on 2/15/15.
 */

function loadScripts(scripts, onSuccess) {

    async.each(scripts,

        function (script, callback) {

            jQuery.getScript(script)

                .done(function () {

                    callback();
                })
                .fail(function(jqxhr, settings, exception) {
                    console.log("Failed to load script: " + script);
                });
        },
        function (err) {

            onSuccess();

        });
}