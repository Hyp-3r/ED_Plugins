Object.filter = function( obj, predicate) {
    var result = [], key;
    // ---------------^---- as noted by @CMS, 
    //      always declare variables with the "var" keyword

    for (key in obj) {
        if (obj.hasOwnProperty(key) && predicate(obj[key])) {
            result.push(obj[key]);
        }
    }

    return result;
};

const Plugin = require('../plugin');

module.exports = new Plugin({
    name: 'Tag All',
    description: 'tag hidden channels n stuff.',
    color: 'magenta',
    author: 'Joe 🎸#7070, fixed for EnhancedDiscord by Hyper#0404',

    load: async function() {
        let $ = require('jquery')
        $(document).on("keypress.ts", function(e) {
            var text = e.target.value;

            let gID = findModule('getLastSelectedGuildId').getLastSelectedGuildId()
            var g = findModule('getGuild').getGuild(gID);
            if (!g) return;

            // mention unmentionable roles
            var unMen = Object.filter(g.roles, r => !r.mentionable);

            var roles = unMen.map(r => r.name.toLowerCase());

            for (var i in roles) {
                text = text.replace( new RegExp('@'+roles[i]+'([^#])?', 'gi'), `<@&${unMen[i].id}>`);
            }

            // mention channels you can't see
            let globalChans = findModule('getChannels').getChannels();
            let me = findModule('getCurrentUser').getCurrentUser();

            let hiddenChans = [];
            for (let id in globalChans) {
                if (globalChans[id].guild_id == gID && !(findModule('computePermissions').computePermissions(me, globalChans[id]) & 1024))
                    hiddenChans.push(globalChans[id]);
            }

            var chans = hiddenChans.map(c => c.name.toLowerCase());
            for (var i in chans) {
                text = text.replace('#'+chans[i], `<#${hiddenChans[i].id}>`);
            }
            if (e.target.value == text) return;

            e.target.value = text;
        });
    },
    
    unload: function() {
        $(document).off("keypress.ts");
    }
});