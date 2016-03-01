(function ($, global) {

    var name = 'view';
    var it = {};
    var nodes = {};
    var lock = {};
    var cache = {};
    var LSN = {};
    var _ = global.i18n;

    var closeBtn = '' +
        '<nav action-type="closeBtn" class="closeBtn">' +
        '<button class="fa fa-angle-double-right"></button>' +
        '<b class="fa fa-circle"></b>' +
        '</nav>';

    it.init = function () {
        it.parseDOM();
        it.bind();
    };

    it.parseDOM = function () {

        $('#bar').html([
            '<li><button title="' + _('Upload') + '" node-type="uploadBtn" action-type="uploadBtn" class="fa fa-cloud-upload"></button></li>',
            '<li><button title="' + _('Copy all links') + '" node-type="copyBtn" action-type="copyBtn" class="fa fa-copy"></button></li>',
            '<li><button title="' + _('Edit links') + '" node-type="urlsTextBtn" action-type="urlsTextBtn" class="fa fa-clipboard"></button></li>',
            '<li><button title="' + _('History') + '" node-type="historyBtn" action-type="historyBtn" class="fa fa-history"></button></li>',
            '<li><button title="' + _('Clear') + '" node-type="trashBtn" action-type="trashBtn" class="fa fa-trash"></button></li>',
            '<li><button title="' + _('Settings') + '" node-type="settingBtn" action-type="settingBtn" class="fa fa-cog"></button></li>'
        ].join(''));

        $('#platform').html([
            '<li node-type="upload">',
            '<div node-type="uploadDrop">',
            '<div class="drop-pictures-here">',
            '<i class="fa fa-picture-o"></i>',
            '<i class="fa fa-folder-open-o"></i>',
            '<b>' + _('Drop pictures here OR click to open a file picker') + '</b>',
            '</div>',
            '<input node-type="uploadBox" type="file" multiple="true" title="' + _('Drop pictures here OR click to open a file picker') + '">',
            '</div>',
            '</li>',
            '<li node-type="urlsText">',
            '<div>',
            '<nav class="toolbar">',
            '<button action-type="copy" class="fl fa fa-copy" title="' + _('Copy to clipboard') + '"></button>',
            '<button action-type="markdown" class="fl" title="' + _('Conversion to Markdown') + '">![Markdown</button>',
            '<button action-type="image" class="fl" title="' + _('Conversion to HTML') + '">&lt;IMG</button>',
            '<button action-type="ubb" class="fl" title="' + _('Conversion to UBB') + '">[UBB]</button>',
            '<button action-type="undo" class="fr fa fa-undo" title="' + _('Restore') + '"></button>',
            '</nav>',
            '<textarea action-type="selectAll" readonly node-type="urlsTextBox"></textarea>',
            '</div>',
            '</li>',
            '<li node-type="history">',
            '<ul node-type="historyBox"></ul>',
            '</li>'
        ].join(''));


        nodes = $('#bar, #platform').parseDOM();
        nodes.body = $(document.body);
        nodes.bar = $('#bar');
        nodes.platform = $('#platform');

        nodes.platform.children().prepend($(closeBtn));

        nodes.body.addClass('right');

        it.reset();
    };

    it.bind = function () {
        var evts, type;

        evts = it.evts.bar;
        for (var type in evts) {
            if (evts.hasOwnProperty(type)) {
                nodes.bar.on('click', '[action-type="' + type + '"]', evts[type]);
            }
        }

        evts = it.evts.platform;
        for (var type in evts) {
            if (evts.hasOwnProperty(type)) {
                nodes.platform.on('click', '[action-type="' + type + '"]', evts[type]);
            }
        }

        evts = it.evts.upload;
        for (var type in evts) {
            if (evts.hasOwnProperty(type)) {
                nodes.uploadBox.on(type, evts[type]);
            }
        }

        evts = it.evts.uploadBox;
        for (var type in evts) {
            if (evts.hasOwnProperty(type)) {
                nodes.uploadBox.on(type, evts[type]);
            }
        }

        evts = it.evts.bodyBlock;
        for (var type in evts) {
            if (evts.hasOwnProperty(type)) {
                nodes.body.on(type, evts[type]);
            }
        }

        evts = it.custEvts;
        for (var type in evts) {
            if (evts.hasOwnProperty(type)) {
                Channel.register(name, type, evts[type]);
            }
        }
    };

    it.evts = {
        bar: {
            copyBtn: function (e) {
                e.preventDefault();
                if (!lock.copyBtn) {
                    if (cache.urls && cache.urls.length) {
                        Channel.fire(name, 'copyAllToClipboard', cache.urls.join('\n'));
                    }
                }
                return false;
            },
            uploadBtn: function (e) {
                e.preventDefault();
                if (!lock.uploadBtn) {
                    it.switchPlatform('upload');
                }
                return false;
            },
            urlsTextBtn: function (e) {
                e.preventDefault();
                if (!lock.urlsTextBtn) {
                    if (cache.urls && cache.urls.length) {
                        it.switchPlatform('urlsText');
                    }
                }
                return false;
            },
            historyBtn: function (e) {
                e.preventDefault();
                it.renderHistory();
                return false;
            },
            trashBtn: function (e) {
                e.preventDefault();
                if (!lock.trashBtn) {
                    it.reset();
                    Channel.fire(name, 'reset');
                }
                return false;
            },
            settingBtn: function (e) {
                e.preventDefault();
                global.location.reload();
                it.switchPlatform('settings');
                return false;
            }
        },
        bodyBlock: {
            dragenter: function (e) {
                e.preventDefault();
                if (!nodes.upload.hasClass('show')) {
                    it.switchPlatform('upload');
                }
                return false;
            },
            dragover: function (e) {
                e.preventDefault();
                return false;
            },
            dragleave: function (e) {
                e.preventDefault();
                return false;
            },
            drop: function (e) {
                e.preventDefault();
                return false;
            }
        },
        upload: {
            dragenter: function (e) {
                e.preventDefault();
                nodes.uploadDrop.addClass('active');
                return false;
            },
            dragover: function (e) {
                e.preventDefault();
                return false;
            },
            dragleave: function (e) {
                e.preventDefault();
                nodes.uploadDrop.removeClass('active');
                return false;
            },
            drop: function (e) {
                e.preventDefault();
                nodes.uploadDrop.removeClass('active');
                Channel.fire(name, 'dropedFiles', e.dataTransfer.files);
                return false;
            }
        },
        uploadBox: {
            change: function () {
                Channel.fire(name, 'selectedFiles', nodes.uploadBox.get(0).files);
            }
        },
        platform: {
            markdown: function (e) {
                e.preventDefault();
                nodes.urlsTextBox.val(cache.urls.map(function (url) {
                    return '![](' + url + ')';
                }).join('\n'));
                return false;
            },
            image: function (e) {
                e.preventDefault();
                nodes.urlsTextBox.val(cache.urls.map(function (url) {
                    return '<img src="' + url + '" />';
                }).join('\n'));
                return false;
            },
            ubb: function (e) {
                e.preventDefault();
                nodes.urlsTextBox.val(cache.urls.map(function (url) {
                    return '[IMG]' + url + '[/IMG]';
                }).join('\n'));
                return false;
            },
            copy: function (e) {
                e.preventDefault();
                Channel.fire(name, 'copyAllToClipboard', nodes.urlsTextBox.val());
                return false;
            },
            undo: function (e) {
                e.preventDefault();
                nodes.urlsTextBox.val(cache.urls.join('\n'));
                return false;
            },
            closeBtn: function (e) {
                e.preventDefault();
                it.switchPlatform();
                return false;
            },
            selectAll: function (e) {
                e.preventDefault();
                $(this).get(0).select();
                return false;
            }
        }
    };

    it.custEvts = {
        closePlat: function () {
            it.switchPlatform();
        },
        updateUrlsText: function (urls) {
            if (urls.length) {
                cache.urls = urls;
                nodes.urlsTextBox.val(urls.join('\n'));
                it.custEvts.copyUnlock();
                it.custEvts.urlsTextUnlock();
                it.custEvts.trashUnlock();
            }
        },
        showUrlsText: function () {
            it.switchPlatform('urlsText');
        },
        uploadLock: function () {
            lock.uploadBtn = true;
            nodes.uploadBtn.addClass('disable');
            it.custEvts.copyLock();
            it.custEvts.urlsTextLock();
            it.custEvts.trashLock();
        },
        uploadUnlock: function () {
            lock.uploadBtn = false;
            nodes.uploadBtn.removeClass('disable');
        },
        copyLock: function () {
            lock.copyBtn = true;
            nodes.copyBtn.addClass('disable');
        },
        copyUnlock: function () {
            lock.copyBtn = false;
            nodes.copyBtn.removeClass('disable');
        },
        urlsTextLock: function () {
            lock.urlsTextBtn = true;
            nodes.urlsTextBtn.addClass('disable');
        },
        urlsTextUnlock: function () {
            lock.urlsTextBtn = false;
            nodes.urlsTextBtn.removeClass('disable');
        },
        trashLock: function () {
            lock.trashBtn = true;
            nodes.trashBtn.addClass('disable');
        },
        trashUnlock: function () {
            lock.trashBtn = false;
            nodes.trashBtn.removeClass('disable');
        }
    };

    it.switchPlatform = function (name) {
        var els, target;
        if (LSN.mask) {
            global.clearTimeout(LSN.mask);
        }
        if (!name) {
            els = nodes.platform.children();
            nodes.body.css('overflow', '');
        } else {
            target = nodes.platform.find('[node-type="' + name + '"]');
            target.addClass('show');
            nodes.body.css('overflow', 'hidden');
            els = nodes.platform.find('li:not([node-type="' + name + '"])');
            LSN.mask = global.setTimeout(function () {
                target.addClass('mask');
            }, 500);
        }
        els.each(function () {
            var el = $(this);
            if (el.hasClass('show')) {
                el.addClass('hide').removeClass('mask');
                global.setTimeout(function () {
                    el.removeClass('hide').removeClass('show');
                }, 500);
            }
        });
    };

    it.renderHistory = function () {
        Channel.fire(name, 'loadHistory', function (history) {
            if (history.length) {
                nodes.historyBox.html(history.reverse().map(function (item) {
                    return '<li class="clearfix">' +
                        '<div class="preview" style="background-image:url(' + item.src + ')"></div>' +
                        '<div class="detail">' +
                        '<div class="url">' +
                        '<input action-type="selectAll" readonly value="' + item.src + '">' +
                        '</div>' +
                        (item.time ? '<p class="time">' + new Date(item.time).Format('yyyy-mm-dd h:i:s') + '</p>' : '') +
                        '</div>' +
                        '</li>';
                }).join('\n'));
                it.switchPlatform('history');
            } else {
                Channel.fire('tips', 'show', _('No history'));
            }
        });
        //var history = historyManager.load();
        //if (history.length) {
        //    nodes.historyBox.html(history.reverse().map(function (item) {
        //        return '<li class="clearfix">' +
        //            '<div class="preview" style="background-image:url(' + item.src + ')"></div>' +
        //            '<div class="detail">' +
        //            '<div class="url">' +
        //            '<input action-type="selectAll" readonly value="' + item.src + '">' +
        //            '</div>' +
        //            (item.time ? '<p class="time">' + new Date(item.time).Format('yyyy-mm-dd h:i:s') + '</p>' : '') +
        //            '</div>' +
        //            '</li>';
        //    }).join('\n'));
        //    it.switchPlatform('history');
        //} else {
        //    Channel.fire('tips', 'show', '没有上传记录');
        //}
    };

    it.reset = function () {
        nodes.urlsTextBox.val('');
        cache.urls = null;
        it.switchPlatform('upload');
        it.custEvts.copyLock();
        it.custEvts.urlsTextLock();
        it.custEvts.trashLock();
    }

    it.init();

})(Zepto, this || window);