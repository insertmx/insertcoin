// This was taken from the SCEditor plugin for MyBB

$(document).ready(function($) {
	'use strict';

	var $document = $(document);


	/***********************
	 * Add custom MyBB CSS *
	 ***********************/
	$('<style type="text/css">' +
		'.sceditor-dropdown { text-align: ' + ($('body').css('direction') === 'rtl' ? 'right' :'left') + '; }' +
	'</style>').appendTo('body');



	/********************************************
	 * Update editor to use align= as alignment *
	 ********************************************/
	$.sceditor.plugins.bbcode.bbcode
		.set('align', {
			html: function(element, attrs, content) {
				return '<div align="' + (attrs.defaultattr || 'left') + '">' + content + '</div>';
			},
			isInline: false
		})
		.set('center', { format: '[align=center]{0}[/align]' })
		.set('left', { format: '[align=left]{0}[/align]' })
		.set('right', { format: '[align=right]{0}[/align]' })
		.set('justify', { format: '[align=justify]{0}[/align]' });

	$.sceditor.command
		.set('center', { txtExec: ['[align=center]', '[/align]'] })
		.set('left', { txtExec: ['[align=left]', '[/align]'] })
		.set('right', { txtExec: ['[align=right]', '[/align]'] })
		.set('justify', { txtExec: ['[align=justify]', '[/align]'] });



	/************************************************
	 * Update font to support MyBB's BBCode dialect *
	 ************************************************/
	$.sceditor.plugins.bbcode.bbcode
		.set('list', {
			html: function(element, attrs, content) {
				var type = (attrs.defaultattr === '1' ? 'ol' : 'ul');

				if(attrs.defaultattr === 'a')
					type = 'ol type="a"';

				return '<' + type + '>' + content + '</' + type + '>';
			},

			breakAfter: false
		})
		.set('ul', { format: '[list]{0}[/list]' })
		.set('ol', {
			format: function($elm, content) {
				var type = ($elm.attr('type') === 'a' ? 'a' : '1');

				return '[list=' + type + ']' + content + '[/list]';
			}
		})
		.set('li', { format: '[*]{0}', excludeClosing: true })
		.set('*', { excludeClosing: true, isInline: true });

	$.sceditor.command
		.set('bulletlist', { txtExec: ['[list]\n[*]', '\n[/list]'] })
		.set('orderedlist', { txtExec: ['[list=1]\n[*]', '\n[/list]'] });



	/***********************************************************
	 * Update size tag to use xx-small-xx-large instead of 1-7 *
	 ***********************************************************/
	$.sceditor.plugins.bbcode.bbcode.set('size', {
		format: function($elm, content) {
			var	fontSize,
				sizes = ['xx-small', 'x-small', 'small', 'medium', 'large', 'x-large', 'xx-large'],
				size  = $elm.data('scefontsize');

			if(!size)
			{
				fontSize = $elm.css('fontSize');

				// Most browsers return px value but IE returns 1-7
				if(fontSize.indexOf('px') > -1) {
					// convert size to an int
					fontSize = fontSize.replace('px', '') - 0;
					size     = 1;

					if(fontSize > 9)
						size = 1;
					if(fontSize > 12)
						size = 2;
					if(fontSize > 15)
						size = 3;
					if(fontSize > 17)
						size = 4;
					if(fontSize > 23)
						size = 5;
					if(fontSize > 31)
						size = 6;
					if(fontSize > 47)
						size = 7;
				}
				else
					size = (~~fontSize) + 1;

				if(size > 7)
					size = 7;
				if(size < 1)
					size = 1;

				size = sizes[size-1];
			}

			return '[size=' + size + ']' + content + '[/size]';
		},
		html: function(token, attrs, content) {
			return '<span data-scefontsize="' + attrs.defaultattr + '" style="font-size:' + attrs.defaultattr + '">' + content + '</span>';
		}
	});

	$.sceditor.command.set('size', {
		_dropDown: function(editor, caller, callback) {
			var	content   = $('<div />'),
				clickFunc = function (e) {
					callback($(this).data('size'));
					editor.closeDropDown(true);
					e.preventDefault();
				};

			for (var i=1; i <= 7; i++)
				content.append($('<a class="sceditor-fontsize-option" data-size="' + i + '" href="#"><font size="' + i + '">' + i + '</font></a>').click(clickFunc));

			editor.createDropDown(caller, 'fontsize-picker', content);
		},
		txtExec: function(caller) {
			var	editor = this,
				sizes = ['xx-small', 'x-small', 'small', 'medium', 'large', 'x-large', 'xx-large'];

			$.sceditor.command.get('size')._dropDown(
				editor,
				caller,
				function(size) {
					size = (~~size);
					size = (size > 7) ? 7 : ( (size < 1) ? 1 : size );

					editor.insertText('[size=' + sizes[size-1] + ']', '[/size]');
				}
			);
		}
	});



	/********************************************
	 * Update quote to support pid and dateline *
	 ********************************************/
	$.sceditor.plugins.bbcode.bbcode.set('quote', {
		format: function(element, content) {
			var	author = '',
				$elm  = $(element),
				$cite = $elm.children('cite').first();
		//spoiler
	                if ($(element[0]).hasClass('spoiler')) {
                        var desc = '';
                        if($cite.length === 1 || $elm.data('desc')) {
                        desc = $elm.data('desc') || $cite.text() ;

                        $elm.data('desc', desc);
                        $cite.remove();

                content = this.elementToBbcode($(element));
                        desc  = '=' + desc;

                $elm.prepend($cite);
            }
                return '[spoiler' + desc + ']' + content + '[/spoiler]';
            }  			
				$cite.html($cite.text());

			if($cite.length === 1 || $elm.data('author'))
			{
				author = $cite.text() || $elm.data('author');

				$elm.data('author', author);
				$cite.remove();

				content	= this.elementToBbcode($(element));
				author = '=' + author.replace(/(^\s+|\s+$)/g, '');

				$elm.prepend($cite);
			}

			if($elm.data('pid'))
				author += " pid='" + $elm.data('pid') + "'";

			if($elm.data('dateline'))
				author += " dateline='" + $elm.data('dateline') + "'";

			return '[quote' + author + ']' + content + '[/quote]';
		},
		html: function(token, attrs, content) {
			var data = '';

			if(attrs.pid)
				data += ' data-pid="' + attrs.pid + '"';

			if(attrs.dateline)
				data += ' data-dateline="' + attrs.dateline + '"';

			if(typeof attrs.defaultattr !== "undefined")
				content = '<cite>' + attrs.defaultattr.replace(/ /g, '&nbsp;') + '</cite>' + content;

			return '<blockquote' + data + '>' + content + '</blockquote>';
		},
		quoteType: function(val, name) {
			return "'" + val.replace("'", "\\'") + "'";
		},
		breakStart: true,
		breakEnd: true
	});



	/************************************************************
	 * Update font tag to allow limiting to only first in stack *
	 ************************************************************/
	$.sceditor.plugins.bbcode.bbcode.set('font', {
		format: function(element, content) {
			var font;

			if(element[0].nodeName.toLowerCase() !== 'font' || !(font = element.attr('face')))
				font = element.css('font-family');


			if(typeof font == 'string' && font != '' && font != 'defaultattr')
			{
				return '[font=' + this.stripQuotes(font) + ']' + content + '[/font]';
			}
			else
			{
				return content;
			}
		},
		html: function(token, attrs, content) {
			if(typeof attrs.defaultattr == 'string' && attrs.defaultattr != '' && attrs.defaultattr != '{defaultattr}')
			{
				return '<font face="' +
					attrs.defaultattr +
					'">' + content + '</font>';
			}
			else
			{
				return content;
			}
		}
	});



	/************************
	 * Add MyBB PHP command *
	 ************************/
	$.sceditor.plugins.bbcode.bbcode.set('php', {
		allowsEmpty: true,
		isInline: false,
		allowedChildren: ['#', '#newline'],
		format: '[php]{0}[/php]',
		html: '<code class="phpcodeblock">{0}</code>'
	});

	$.sceditor.command.set("php", {
		_dropDown: function (editor, caller, html) {
			var $content;

			$content = $(
				'<div>' +
					'<label for="php">' + editor._('PHP') + ':</label> ' +
					'<textarea type="text" id="php" />' +					
				'</div>' +
				'<div><input type="button" class="button" value="' + editor._('Insert') + '" /></div>'
			);

			setTimeout(function() {
				$content.find('#php').focus();
			},100);

			$content.find('.button').click(function (e) {
				var	val = $content.find('#php').val(),
					before = '[php]',
					end = '[/php]';

				if (html) {
					before = before + html + end;
					end = null;
				}
				else if (val) {
					before = before + val + end;
					end = null;
				}

				editor.insert(before, end);
				editor.closeDropDown(true);
				e.preventDefault();
			});

			editor.createDropDown(caller, 'insertphp', $content);
		},
		exec: function (caller) {
			$.sceditor.command.get('php')._dropDown(this, caller);
		},
		txtExec: ['[php]', '[/php]'],
		tooltip: "PHP"
	});



	/******************************
	 * Update code to support PHP *
	 ******************************/
	$.sceditor.plugins.bbcode.bbcode.set('code', {
		allowsEmpty: true,
		tags: {
			code: null
		},
		isInline: false,
		allowedChildren: ['#', '#newline'],
		format: function (element, content) {
			if ($(element[0]).hasClass('phpcodeblock')) {
				return '[php]' + content + '[/php]';
			}
			return '[code]' + content + '[/code]';
		},
		html: '<code>{0}</code>'
	});

	$.sceditor.command.set("code", {
		_dropDown: function (editor, caller, html) {
			var $content;

			$content = $(
				'<div>' +
					'<label for="code">' + editor._('Code') + ':</label> ' +
					'<textarea type="text" id="code" />' +					
				'</div>' +
				'<div><input type="button" class="button" value="' + editor._('Insert') + '" /></div>'
			);

			setTimeout(function() {
				$content.find('#code').focus();
			},100);

			$content.find('.button').click(function (e) {
				var	val = $content.find('#code').val(),
					before = '[code]',
					end = '[/code]';

				if (html) {
					before = before + html + end;
					end = null;
				}
				else if (val) {
					before = before + val + end;
					end = null;
				}

				editor.insert(before, end);
				editor.closeDropDown(true);
				e.preventDefault();
			});

			editor.createDropDown(caller, 'insertcode', $content);
		},
		exec: function (caller) {
			$.sceditor.command.get('code')._dropDown(this, caller);
		},
		txtExec: ['[code]', '[/code]'],
	});



	/***************************************
	 * Update email to support description *
	 ***************************************/
	$.sceditor.command.set('email', {
		_dropDown: function (editor, caller) {
			var $content;

			$content = $(
				'<div>' +
					'<label for="email">' + editor._('E-mail:') + '</label> ' +
					'<input type="text" id="email" />' +					
				'</div>' +
				'<div>' +
					'<label for="des">' + editor._('Description (optional):') + '</label> ' +
					'<input type="text" id="des" />' +
				'</div>' +
				'<div><input type="button" class="button" value="' + editor._('Insert') + '" /></div>'
			);

			$content.find('.button').click(function (e) {
				var	val = $content.find('#email').val(),
					description = $content.find('#des').val();

				if(val) {
					// needed for IE to reset the last range
					editor.focus();

					if(!editor.getRangeHelper().selectedHtml() || description) {
						if(!description)
							description = val;

						editor.wysiwygEditorInsertHtml('<a href="' + 'mailto:' + val + '">' + description + '</a>');
					}
					else
						editor.execCommand('createlink', 'mailto:' + val);
					}

				editor.closeDropDown(true);
				e.preventDefault();
			});

			editor.createDropDown(caller, 'insertemail', $content);
		},
		exec: function (caller) {
			$.sceditor.command.get('email')._dropDown(this, caller);
		}
	});

       /***************************************
        * Mention Me Button *
        ***************************************/
        $.sceditor.command.set('mention', {
            _dropDown: function (editor, caller) {
            var $content;

            $content = $(
                '<div>' +
                    '<label for="names">' + editor._('Usuarios a Mencionar:') + '</label> ' +
                    '<input type="text" id="names" />' +                    
                '</div>' +
                '<div><input type="button" class="button" value="' + editor._('Insert') + '" /></div>'
            );

            $content.find('.button').click(function (e) {
                var    val = $content.find('#names').val();
                var array = val.split(',');

                if(val) {
                    // needed for IE to reset the last range
                    editor.focus();
                        $.each(array, function(index, value ){
                            if(value.replace(/\s/g, '') != "")
                            {
                                var text = value.replace(/,\s?/g, ", "),
                                    id = value.replace(/,\s?/g, ", ");
                                editor.wysiwygEditorInsertHtml('@"' + text + '" ');    
                                
                            }
                        });
                    }
                
                editor.closeDropDown(true);
                e.preventDefault();
            });

            editor.createDropDown(caller, 'insertmention', $content);
        },
        exec: function (caller) {
            $.sceditor.command.get('mention')._dropDown(this, caller);
            MyBB.select2();
            $("#names").select2({
                placeholder: "Buscar Usuario",
                minimumInputLength: 3,
                maximumSelectionSize: 25,
                multiple: true,
                ajax: { // instead of writing the function to execute the request we use Select2's convenient helper
                    url: "xmlhttp.php?action=get_users",
                    dataType: 'json',
                    data: function (term, page) {
                        return {
                            query: term, // search term
                        };
                    },
                    results: function (data, page) { // parse the results into the format expected by Select2.
                        // since we are using custom formatting functions we do not need to alter remote JSON data
                        return {results: data};
                    }
                },
                initSelection: function(element, callback) {
                    var query = $(element).val();
                    if (query !== "") {
                        var newqueries = [];
                        exp_queries = query.split(",");
                        $.each(exp_queries, function(index, value ){
                            if(value.replace(/\s/g, '') != "")
                            {
                                var newquery = {
                                    id: value.replace(/,\s?/g, ", "),
                                    text: value.replace(/,\s?/g, ", ")
                                };
                                newqueries.push(newquery);
                            }
                        });
                        callback(newqueries);
                    }
                }
            });

        },
        txtExec: ['@'],
        tooltip: 'Mencionar'
        });

	/**************************
	 * Add MyBB video command *
	 **************************/
	$.sceditor.plugins.bbcode.bbcode.set('video', {
		allowsEmpty: true,
		tags: {
			iframe: {
				'data-mybb-vt': null
			}
		},
		format: function($element, content) {
			return '[video=' + $element.data('mybb-vt') + ']' + $element.data('mybb-vsrc') + '[/video]';
		},
		html: function(token, attrs, content) {
			var	matches, url,
				html = {
					dailymotion: '<iframe frameborder="0" width="480" height="270" src="{url}" data-mybb-vt="{type}" data-mybb-vsrc="{src}"></iframe>',
					facebook: '<iframe src="{url}" width="625" height="350" frameborder="0" data-mybb-vt="{type}" data-mybb-vsrc="{src}"></iframe>',
					liveleak: '<iframe width="500" height="300" src="{url}" frameborder="0" data-mybb-vt="{type}" data-mybb-vsrc="{src}"></iframe>',
					metacafe: '<iframe src="{url}" width="440" height="248" frameborder=0 data-mybb-vt="{type}" data-mybb-vsrc="{src}"></iframe>',
					veoh: '<iframe src="{url}" width="410" height="341" frameborder="0" data-mybb-vt="{type}" data-mybb-vsrc="{src}"></iframe>',
					vimeo: '<iframe src="{url}" width="500" height="281" frameborder="0" data-mybb-vt="{type}" data-mybb-vsrc="{src}"></iframe>',
					youtube: '<iframe width="560" height="315" src="{url}" frameborder="0" data-mybb-vt="{type}" data-mybb-vsrc="{src}"></iframe>'
				};

			if(html[attrs.defaultattr])
			{
				switch(attrs.defaultattr)
				{
					case 'dailymotion':
						matches = content.match(/dailymotion\.com\/video\/([^_]+)/);
						url     = matches ? 'http://www.dailymotion.com/embed/video/' + matches[1] : false;
						break;
					case 'facebook':
						matches = content.match(/facebook\.com\/(?:photo.php\?v=|video\/video.php\?v=|video\/embed\?video_id=|v\/?)(\d+)/);
						url     = matches ? 'https://www.facebook.com/video/embed?video_id=' + matches[1] : false;
						break;
					case 'liveleak':
						matches = content.match(/liveleak\.com\/(?:view\?i=)([^\/]+)/);
						url     = matches ? 'http://www.liveleak.com/ll_embed?i=' + matches[1] : false;
						break;
					case 'metacafe':
						matches = content.match(/metacafe\.com\/watch\/([^\/]+)/);
						url     = matches ? 'http://www.metacafe.com/embed/' + matches[1] : false;
						break;
					case 'veoh':
						matches = content.match(/veoh\.com\/watch\/([^\/]+)/);
						url     = matches ? '//www.veoh.com/swf/webplayer/WebPlayer.swf?videoAutoPlay=0&permalinkId=' + matches[1] : false;
						break;
					case 'vimeo':
						matches = content.match(/vimeo.com\/(\d+)($|\/)/);
						url     = matches ? '//player.vimeo.com/video/' + matches[1] : false;
						break;
					case 'youtube':
						matches = content.match(/(?:v=|v\/|embed\/|youtu\.be\/)(.{11})/);
						url     = matches ? '//www.youtube.com/embed/' + matches[1] : false;
						break;
				}

				if(url)
				{
					return html[attrs.defaultattr]
						.replace('{url}', url)
						.replace('{src}', content)
						.replace('{type}', attrs.defaultattr);
				}
			}

			return token.val + content + (token.closing ? token.closing.val : '');
		}
	});

	$.sceditor.command.set('video', {
		_dropDown: function (editor, caller) {
			var $content, videourl, videotype;

			// Excludes MySpace TV and Yahoo Video as I couldn't actually find them. Maybe they are gone now?
			$content = $(
				'<div>' +
					'<label for="videotype">' + editor._('Video Type:') + '</label> ' +
					'<select id="videotype">' +
						'<option value="dailymotion">' + editor._('Dailymotion') + '</option>' +
						'<option value="facebook">' + editor._('Facebook') + '</option>' +
						'<option value="liveleak">' + editor._('LiveLeak') + '</option>' +
						'<option value="metacafe">' + editor._('MetaCafe') + '</option>' +
						'<option value="veoh">' + editor._('Veoh') + '</option>' +
						'<option value="vimeo">' + editor._('Vimeo') + '</option>' +
						'<option value="youtube">' + editor._('Youtube') + '</option>' +
					'</select>'+
				'</div>' +
				'<div>' +
					'<label for="link">' + editor._('Video URL:') + '</label> ' +
					'<input type="text" id="videourl" value="http://" />' +
				'</div>' +
				'<div><input type="button" class="button" value="' + editor._('Insert') + '" /></div>'
			);

			$content.find('.button').click(function (e) {
				videourl  = $content.find('#videourl').val();
				videotype = $content.find('#videotype').val();

				if (videourl !== '' && videourl !== 'http://')
					editor.insert('[video=' + videotype + ']' + videourl + '[/video]');

				editor.closeDropDown(true);
				e.preventDefault();
			});

			editor.createDropDown(caller, 'insertvideo', $content);
		},
		exec: function (caller) {
			$.sceditor.command.get('video')._dropDown(this, caller);
		},
		txtExec: function (caller) {
			$.sceditor.command.get('video')._dropDown(this, caller);
		},
		tooltip: 'Insert a video'
	});
	
	
        /***********************
         * Add Spoiler command *
         ***********************/
        $.sceditor.plugins.bbcode.bbcode.set("spoiler", {
                allowsEmpty: true,
                isInline: false,    
                format: function(element, content) {
            var desc = '',
                $elm = $(element),
                $cite = $elm.children('cite').first();

            if($cite.length === 1 || $elm.data('desc')) {
                desc = $elm.data('desc') || $cite.text() ;

                $elm.data('desc', desc);
                $cite.remove();

                content = this.elementToBbcode($(element));
                desc = '=' + desc;

                $elm.prepend($cite);
            }

            return '[spoiler' + desc + ']' + content + '[/spoiler]';
        },
            html: function (token, attrs, content) {
               var data = '';
            
            if (attrs.defaultattr) {
                content = '<cite>' + attrs.defaultattr + '</cite>' + content;
            data += ' data-desc="' + attrs.defaultattr + '"';
            }
                
            return '<blockquote' + data + ' class="spoiler">' + content + '</blockquote>';
        },
        breakStart: true,
        breakEnd: true
        });
    
        $.sceditor.command.set("spoiler", {
        _dropDown: function (editor, caller, html) {
            var $content;

            $content = $(
                '<div>' +
                    '<label for="des">' + editor._('Description (optional):') + '</label> ' +
                    '<input type="text" id="des" />' +
                '</div>' +
                '<div><input type="button" class="button" value="' + editor._('Insert') + '" /></div>'
            );

            $content.find('.button').click(function (e) {
                var    description = $content.find('#des').val(),
                    descriptionAttr = '',
                    before = '[spoiler]',
                    end = '[/spoiler]';
                
                if (description) {
                   descriptionAttr = '=' + description + '';
                   before = '[spoiler'+ descriptionAttr +']';
                }
                
                if (html) {
                    before = before + html + end;
                    end    = null;
                }
                
                editor.insert(before, end);
                editor.closeDropDown(true);
                e.preventDefault();
            });

            editor.createDropDown(caller, 'insertspoiler', $content);
        },        
        exec: function (caller) {
            $.sceditor.command.get('spoiler')._dropDown(this, caller);
        },
        txtExec: function (caller) {
            $.sceditor.command.get('spoiler')._dropDown(this, caller);
        },
         tooltip: 'Insertar spoiler'
        }); 

        /*********************
         * Add imgur command *
        *********************/
             	$.sceditor.command.set("imgur", {
             	_imgur: function () {
 		document.querySelector('textarea').insertAdjacentHTML( 'afterEnd', '<input class="imgur" style="visibility:hidden;position:absolute;top:0;" type="file" onchange="upload(this.files[0])" accept="image/*">' );
 		document.querySelector('input.imgur').click();
 	},
 		exec: function () 
 	{
 		$.sceditor.command.get('imgur')._imgur();
 	},
 		txtExec: function() 
 	{
 		$.sceditor.command.get('imgur')._imgur();
 	},		
 		tooltip: 'Subir a Imgur'
 		}); 



	/*************************************
	 * Remove last bits of table support *
	 *************************************/
	$.sceditor.command.remove('table');
	$.sceditor.plugins.bbcode.bbcode.remove('table')
					.remove('tr')
					.remove('th')
					.remove('td');



	/********************************************
	 * Remove code and quote if in partial mode *
	 ********************************************/
	if(partialmode) {
		$.sceditor.plugins.bbcode.bbcode.remove('code').remove('php').remove('quote').remove('video').remove('img').remove('spoiler';
		$.sceditor.command
			.set('image', {
				exec:  function (caller) {
					var	editor  = this,
						content = $(this._('<form><div><label for="link">{0}</label> <input type="text" id="image" value="http://" /></div>' +
							'<div><label for="width">{1}</label> <input type="text" id="width" size="2" /></div>' +
							'<div><label for="height">{2}</label> <input type="text" id="height" size="2" /></div></form>',
								this._("URL:"),
								this._("Width (optional):"),
								this._("Height (optional):")
							))
						.submit(function () {return false;});

					content.append($(this._('<div><input type="button" class="button" value="Insert" /></div>',
							this._("Insert")
						)).click(function (e) {
						var	$form = $(this).parent('form'),
							val = $form.find('#image').val(),
							width = $form.find('#width').val(),
							height = $form.find('#height').val(),
							attrs = '';

						if(width && height) {
							attrs = '=' + width + 'x' + height;
						}

						if(val && val !== 'http://') {
							editor.wysiwygEditorInsertHtml('[img' + attrs + ']' + val + '[/img]');
						}

						editor.closeDropDown(true);
						e.preventDefault();
					}));

					editor.createDropDown(caller, 'insertimage', content);
				}
			})
			.set('quote', {
				exec: function() {
					this.insert('[quote]', '[/quote]');
				}
			});
	}
});

        /*****************************
 	* Add imgur upload function *
 	*****************************/
 	function upload(file) {

 	/* Is the file an image? */
 	if (!file || !file.type.match(/image.*/)) return;
 
 	/* It is! */
 	document.body.className = "uploading";
 	var d = document.querySelector(".sceditor-button-imgur div");
 	d.className = d.className + " imgurup";
 
 	/* Lets build a FormData object*/
 	var fd = new FormData(); // I wrote about it: https://hacks.mozilla.org/2011/01/how-to-develop-a-html5-image-uploader/
 	fd.append("image", file); // Append the file
 	var xhr = new XMLHttpRequest(); // Create the XHR (Cross-Domain XHR FTW!!!) Thank you sooooo much imgur.com
 	xhr.open("POST", "https://api.imgur.com/3/image.json"); // Boooom!
 	xhr.onload = function() {
 	var code = '[img]' + JSON.parse(xhr.responseText).data.link + '[/img]';
 	$('#message, #signature, textarea[name*="value"]').data('sceditor').insert(code);
 	var d = document.querySelector(".sceditor-button-imgur div.imgurup");
 	d.className = d.className - " imgurup";
 	document.querySelector('input.imgur').remove();
 	}
 	// Ok, I don't handle the errors. An exercice for the reader.
 	xhr.setRequestHeader('Authorization', 'Client-ID 2fad2e5fe8bf4fb');
 	/* And now, we send the formdata */
 	xhr.send(fd);
 }; 
