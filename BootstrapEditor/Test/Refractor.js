/* ===================================================
 * bootstrap-editor.js v0.1
 * Rich Editor
 * ===================================================
 * Copyright (c) 2012 
 * Author - Sanket Bajoria
 * Email - bajoriasanket@gmail.com
 * Source - https://github.com/sanketbajoria/BootstrapEditor
 * Demo - http://sanketbajoria.github.com/BootstrapEditor
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * ========================================================== */

(function( $ ) {
    "use strict";
    
    var actionMap = {}
      , hotkeyMap = {}
      , Action = function(context){
                this.command = context.cmd;
                this.value = context.val;
                this.tag = context.tag;
                this.css = context.css;
                this.hotkey = context.hotkey;
                this.execCmd = context.execCmd;
                this.disable = context.disable;
            }
       , MenuNode = function(context){
                this.icon = context.icon;
                this.group = context.group;
                this.title = context.title;
                this.wrapContent = context.wrapContent;
                this.action = context.action;
                this.subMenu = context.subMenu;
                this.trigger = context.trigger;
            }
        , BootstrapEditorFrame = function(editor,initial,width,height){
	            this.frame = $('<iframe id="bootstrapEditorFrame" frameBorder="0" id="myFrame" style="overflow:hidden"></iframe>');
	            this.placeholder = $("<p style='color:#ccc' id='content-placeholder'>Type something...</p>");
	            this.initialContent = $("<p>"+initial+"</p>");
	            this.frameDoc = null;
	            this.savedRange = null;
	            this.editor = editor;
	            this.init(editor,width,height);
     		}     
     BootstrapEditorFrame.prototype = {
     	    focus: function () {
                this.frame[0].contentWindow.focus();
                if (this.savedRange){
                    if(this.frame[0].contentWindow.getSelection){
                    var selection = this.getSelection();
                    selection.removeAllRanges();
                    selection.addRange(this.savedRange);
                    }   
                    else if(this.frameDoc.selection) { 
                        this.savedRange.select();
                    }
                }
                return true;
            },
            getSelection: function () {
                     return this.frame[0].contentWindow.getSelection?this.frame[0].contentWindow.getSelection() : (this.frameDoc?this.frameDoc.selection:null);
            },
            getRange: function () {
                var selection = this.getSelection();
                if(!selection)return null;
                return selection.createRange?selection.createRange():((selection.rangeCount&&selection.rangeCount>0)?selection.getRangeAt(0):this.frameDoc.createRange());
            },
            getText: function () {
                var selection = this.getSelection();
                if(!selection)return null;
                return selection.createRange?selection.createRange().text:selection.toString();
            },
            replaceText: function(elem){
                var range = this.getRange();
                if(!range) return;
                if(range.insertNode)
                {
                    var selection = this.getSelection();
                    range.deleteContents();
                    range.insertNode(elem);
                    range.selectNodeContents(elem);
                    selection.removeAllRanges ();
                    selection.addRange (range);
                }
                else if(range.pasteHTML)
                {
                     range.pasteHTML (elem.nodeValue);
                     range.moveStart("character",elem.nodeValue.length * -1);
                     range.select();
                }
                
            },
            selectNode: function(elem,collapse){
                var range = bootstrapEditorFrame.getRange();
                if(!range) return;
                if(range.selectNodeContents){
                    var selection = this.getSelection();
                    range.selectNodeContents (elem);
                    if(collapse) range.collapse(true)
                    selection.removeAllRanges (); 
                    selection.addRange (range);
                }
                else{
                     range.moveToElementText(elem);
                     if(collapse) range.collapse(true)
                     range.select ();
                }
            },
            insertNode: function(tableStr){
                var range = this.getRange();
                if(!range) return;
                if(range.insertNode)
                {
                	 range.deleteContents();
                     var el = document.createElement("div");
           			 el.innerHTML = tableStr;
            		 var frag = this.frameDoc.createDocumentFragment(), node, lastNode;
			            while ( (node = el.firstChild) ) {
			                lastNode = frag.appendChild(node);
			            }
			         range.insertNode(frag);
                }
                else if(range.pasteHTML)
                {
                    range.pasteHTML (tableStr);
                }
            },
            checkFrameBodyEmpty: function(){
                var tokens = $(this.frameDoc.body).children("*:not(#content-placeholder)");
                return tokens.length==0 || (tokens.length==1 && $(tokens[0]).find("ol,ul,li,hr,img,table,img,a").length == 0 && !($(tokens[0]).text()));
            },
            setFrameBodyContent: function(placeholderContent){
                var firstNode = $(this.frameDoc.body).find("*:first");
                 if(placeholderContent){
                     firstNode.html(this.placeholder.html()).removeAttr("style").css("color","#CCC").attr("id","content-placeholder");
                 }
                 else{
                     firstNode.html(this.initialContent.html()).removeAttr("id").removeAttr("style");
                 }
            },
            queryCommandValue	  : function(cmd){
						   		    var d = this.frameDoc;
						   			if(cmd && d.queryCommandValue && d.queryCommandValue(cmd)){
						   				return d.queryCommandValue(cmd)
						   			}
						   			return false;
							   },
			queryCommandState : function(cmd){
									var d = this.frameDoc;
						   			if(cmd && d.queryCommandState && d.queryCommandState(cmd)){
						   				return d.queryCommandValue(cmd)
						   			}
						   			return false;
								},
			executeAction 	: function (key,elem,e,val) {
			                    var action = actionMap[key];
			                    if (!val && action.execCmd) {
			                        action.execCmd.apply(this.editor,[key,elem,e]);
			                    } else {
			                   		try {
			                           this.frameDoc.execCommand((action.command||key), false, (val||action.value));
				                      } catch (e) {
				                        console.error(e);
				                     }
			                    }
			                },				   
            init: function(editor,width,height){
               var that = this;
               this.frame[0].src="javascript:void(0)";
               editor.ui.append(this.frame);
               this.frameDoc = this.frame[0].contentDocument ? this.frame[0].contentDocument : (this.frame[0].contentWindow?frame[0].contentWindow.document:null);         
               var myContent = '<!DOCTYPE html><html><head><style>p{margin:16px 0px}</style></head><body style="overflow-x:hidden;word-wrap:break-word;margin:0px;padding: 0px 6px 0px 6px;"><p style="color:#ccc" id="content-placeholder">Type something...</p></body></html>';
               this.frameDoc.open('text/html', 'replace');
               this.frameDoc.write(myContent);
               this.frameDoc.close();

               this.frame.width(width);
               this.frame.height(height);
               
               if (this.frameDoc && 'designMode' in this.frameDoc) {
                        this.frameDoc.designMode = "on";                
               } else if (this.frameDoc.body && 'contentEditable' in this.frameDoc.body) {
                        this.frameDoc.body.contentEditable = true;
               }
            
            $(this.frameDoc).on("beforedeactivate blur", function () {
                    this.savedRange = this.getRange();
            });
            $(this.frameDoc).on("click keyup",function(e){
                   editor.updateToolbar((e.target ? e.target : e.srcElement));
                   return true;
               }).on("keydown",function(e){
                        if((e.which>=65 && e.which<=90)||(e.which>=48 && e.which<=57) || (e.which==188 || e.which==190) || (e.which>=112 && e.which<=123))
                        {
                            var hotkey = e.which;
                            if(e.altKey || e.ctrlKey || e.shiftKey || (e.which>=112 && e.which<=123))   // ctrl -- 0x0100 alt -- 0x0200 shift 0x0400
                            {
                                hotkey |= e.ctrlKey?256:0;
                                hotkey |= e.altKey?512:0;
                                hotkey |= e.shiftKey?1024:0;
                                if(hotkey in hotkeyMap){
                                that.executeAction.apply(that,[hotkeyMap[hotkey]]);
                                editor.updateToolbar(null);
                                e.preventDefault();
                                e.stopPropagation();
                                }
                            }
                        }
                        if (e.which == 8 && this.checkFrameBodyEmpty()) {
                            e.stopPropagation();
                            return false;
                        }
               });
             $(this.frame[0].contentWindow).on("focus",function(){
				                editor.checkFocusBlurState(true);
				            }).on("blur",function(){
				               editor.checkFocusBlurState(false);
			});
               
            }
     };
   
   function BootstrapEditorToolbar(editor){
                        this.menu = [];
                        this.ui = null;
                        this.editor = editor;
                        this.init()
                        }
                        
   BootstrapEditorToolbar.prototype = {
		
		init			: function(){
							var menu = this.menu
							  , that = this
                              , htmlElem = "<div id='bootstrapEditorToolbar' class='navbar navbar-inverse'><div class='navbar-inner'><ul class='nav'>";
                            
							this.initMenu();
							for(var i=0;i<menu.length;i++){
                                if(i>0 && menu[i].group != menu[i-1].group){
                                   htmlElem += this.appendSeperator(true);
                                }
                                if(menu[i].subMenu){
                                    var attr = (menu[i].title)?("title='"+ menu[i].title + "' "):"";
                                    htmlElem +='<li class="dropdown" ' + attr + '>';
                                    htmlElem += '<a href="#" class="dropdown-toggle" data-toggle="dropdown"><i class="'+menu[i].icon+'"></i></a>';
                                    htmlElem += '<ul class="dropdown-menu">';
                                    for(var j=0;j<menu[i].subMenu.length;j++){
                                        if(j>0 && menu[i].subMenu[j].group != menu[i].subMenu[j-1].group){
                                             htmlElem += this.appendSeperator(false);
                                        }
                                        htmlElem += this.appendNode(menu[i].subMenu[j],false);    
                                    }
                                    htmlElem += '</ul></li>';
                                }
                                else{
                                    htmlElem += this.appendNode(menu[i],true);
                                }
                            }
                            htmlElem += "</ul></div></div>";
                            this.ui = $(htmlElem).on("click","li[trigger!='hover']:not(.divider,.divider-vertical,.dropdown)",function(e){
                            	var e = that.editor
                                  , actionKey = $(this).attr("actionKey");
	                            this.blur();
	                            e.frame.focus();
	                            e.checkFocusBlurState(true);
	                            e.fireCmd(actionKey,$(this),e);
	                            that.updateToolbar(null);
	                            return true;
                            }).on("hover","li[trigger='hover']:not(.divider,.divider-vertical,.dropdown)",function(e){
                            	var actionKey = $(this).attr("actionKey");
				            	that.editor.fireCmd(actionKey,$(this),e);
				            	this.updateToolbar(null);
                                return true;
				            });
				            this.editor.ui.append(this.ui);
						  },
		
		initMenu		: function(){
                            var i,j,subMenu;
                            var addMenuNode = this.addMenuNode;
                            var menu = this.menu;
                            i=0;
                            addMenuNode(i++,menu,new MenuNode({icon:"icon-external-link",group:0,title:"View HTML Source",action:"viewHtml"}));
                            
                            addMenuNode(i++,menu,new MenuNode({icon:"icon-font",group:1,title:"Formatting",subMenu:new Array()}));
                             j=0;subMenu=menu[i-1].subMenu;
                             addMenuNode(j++,subMenu,new MenuNode({group:2,title:"Paragraph",wrapContent:"<p />",action:"paragraph"}));
                             while(j<=6){
                             addMenuNode(j++,subMenu,new MenuNode({group:2,title:"Header "+(j-1),wrapContent:"<h"+ (j-1) + " />",action:"h"+(j-1)}));
                             }
                            
                            addMenuNode(i++,menu,new MenuNode({icon:"icon-bold",group:3,title:"Bold",action:"bold"}));
                            addMenuNode(i++,menu,new MenuNode({icon:"icon-italic",group:3,title:"Italic",action:"italic"}));
                            addMenuNode(i++,menu,new MenuNode({icon:"icon-underline",group:3,title:"Underline",action:"underline"}));
                            addMenuNode(i++,menu,new MenuNode({icon:"icon-strikethrough",group:3,title:"StrikeThrough",action:"strikeThrough"}));
                            
                            addMenuNode(i++,menu,new MenuNode({icon:"icon-tasks",group:4,title:"Alignment",subMenu:new Array()}));
                             j=0;subMenu=menu[i-1].subMenu;
                             addMenuNode(j++,subMenu,new MenuNode({icon:"icon-align-left",group:5,title:"Align Text Left",action:"justifyLeft"}));
                             addMenuNode(j++,subMenu,new MenuNode({icon:"icon-align-right",group:5,title:"Align Text Right",action:"justifyRight"}));
                             addMenuNode(j++,subMenu,new MenuNode({icon:"icon-align-center",group:5,title:"Center",action:"justifyCenter"}));
                             addMenuNode(j++,subMenu,new MenuNode({icon:"icon-align-justify",group:6,title:"Justify",action:"justifyFull"}));
                            
                            addMenuNode(i++,menu,new MenuNode({icon:"icon-indent-left",group:7,title:"Increase Indent",action:"indent"}));
                            addMenuNode(i++,menu,new MenuNode({icon:"icon-indent-right",group:7,title:"Decrease Indent",action:"outdent"}));
                            addMenuNode(i++,menu,new MenuNode({icon:"icon-list-ul",group:7,title:"Bullets",action:"insertUnorderedList"}));
                            addMenuNode(i++,menu,new MenuNode({icon:"icon-list-ol",group:7,title:"Numbering",action:"insertOrderedList"}));
                            
                            
                            addMenuNode(i++,menu,new MenuNode({icon:"icon-link",group:8,title:"Link",subMenu:new Array()}));
                             j=0;subMenu=menu[i-1].subMenu;
                             addMenuNode(j++,subMenu, new MenuNode({group:9,title:"Link",action:"createLink"}));
                             addMenuNode(j++,subMenu, new MenuNode({group:9,title:"Unlink",action:"unlink"}));

                            addMenuNode(i++,menu,new MenuNode({icon:"icon-minus",group:8,title:"Insert Horizontal Line",action:"insertHorizontalRule"}));
                            
                            addMenuNode(i++,menu,new MenuNode({icon:"icon-picture",group:8,title:"Insert Image",action:"insertImage"}));
                            
                            addMenuNode(i++,menu,new MenuNode({icon:"icon-table",group:8,title:"Table",subMenu:new Array()}));
                             j=0;subMenu=menu[i-1].subMenu;
                             addMenuNode(j++,subMenu, new MenuNode({group:10,title:"Insert Table",action:"insTable"}));
                             addMenuNode(j++,subMenu, new MenuNode({group:11,title:"Add Row Above",action:"insRowA"}));
                             addMenuNode(j++,subMenu, new MenuNode({group:11,title:"Add Row Below",action:"insRowB"}));
                             addMenuNode(j++,subMenu, new MenuNode({group:11,title:"Add Column Right",action:"insColR"}));
                             addMenuNode(j++,subMenu, new MenuNode({group:11,title:"Add Column Left",action:"insColL"}));
                             addMenuNode(j++,subMenu, new MenuNode({group:12,title:"Delete Row",action:"delRow"}));
                             addMenuNode(j++,subMenu, new MenuNode({group:12,title:"Delete Column",action:"delCol"}));
                             addMenuNode(j++,subMenu, new MenuNode({group:12,title:"Delete Table",action:"delTable"}));
                            
                            addMenuNode(i++,menu,new MenuNode({icon:"icon-twitter",group:8,title:"Color",subMenu:new Array()}));
                             j=0;subMenu=menu[i-1].subMenu;
                             addMenuNode(j++,subMenu, new MenuNode({group:13,title:"Fore Color",action:"foreColor",trigger:"hover"}));
                             addMenuNode(j++,subMenu, new MenuNode({group:13,title:"Back Color",action:"backColor",trigger:"hover"}));
                       		},
		
		addMenuNode 	: function(index,arr,menuNode){
		                            arr[index] = menuNode;
		                    },
        appendSeperator : function(vertical){
                            var className = "class='" + (vertical?"divider-vertical":"divider") + "'";
                            return "<li "+className+"></li>";
                        	},
        appendNode 		: function(menuNode,hori){
                            var actionKey = menuNode.action?("actionKey='" + menuNode.action +"' "):"";
                            var trigger = menuNode.trigger?("trigger='" + menuNode.trigger +"' "):"";
                            var attr = (menuNode.title)?("title='"+ menuNode.title + (menuNode.action && actionMap[menuNode.action].hotkey?" (" + actionMap[menuNode.action].hotkey[0] + ")":"") + "' "):"";
                            var str = hori?('<i class="'+menuNode.icon+'"></i>'):('<i>'+menuNode.title+'</i>');
                            str = menuNode.wrapContent?$(str).wrap("<div>" + menuNode.wrapContent + "</div>").parents().last().html():str;
                            var ret = "<li " + actionKey + trigger + attr +  ">";
                            ret += '<a href="#">'+str+'</a>';
                            ret += "</li>";
                            return ret;
                        	},
    	updateToolbar : function(elem){
									var that = this;
					          		this.selectableItems = this.selectableItems || this.ui.find("div > ul > li:not(.divider,.divider-vertical,.dropdown)");
					          		$.each(this.selectableItems, function(){
					          		var menuNode = $(this);
					          		var actionKey = menuNode.attr("actionKey");
					          		var cmd = actionMap[actionKey].command || actionKey;
					          		if(that.editor.isCmdActive(cmd)){
					          			menuNode.addClass("active");
					          		}
					          		else{
					          			menuNode.removeClass("active");
					          		}});
					          },
   }                     
   var utility = {
   			getTableProp	: function(editor){
					                var range = editor.frame.getRange();
					                if(!range) return null;
					                var select = $(range.commonAncestorContainer?range.commonAncestorContainer:range.parentElement());
					                var rowIndex = parseInt(select.closest("tr").index());
					                var colIndex  = parseInt(select.closest("td").index());
					                var tableObj = select.closest("table");
					                return tableObj.length>0?{
					                    node: tableObj[0],
					                    rowLen: tableObj[0].rows.length,
					                    colLen: tableObj[0].rows[0].childNodes.length,
					                    rowIndex: rowIndex,
					                    colIndex: colIndex
					                }:null;
					            },
			 getTableBorder		: function(widthId, widthLbl, styleId, styleArr, colorId){
					              var str = '<div class="input-append" style="float:left"><input type="text" id="'+widthId+'" placeholder="'+widthLbl+'" class="input-mini"><span class="add-on">px</span></div>';
					              str += '<div class="dropdown selectable" style="float:left;margin:0px 5px"><a id="'+styleId+'" role="button" class="btn dropdown-toggle" data-toggle="dropdown"></a>' +
					 						  '<ul class="dropdown-menu" role="menu" aria-labelledby="drop1">';
					 			    for(var i=0;i<styleArr.length;i++)
					 			    {
					 			    	str += '<li><a tabindex="-1" href="#" value="'+styleArr[i]+'"><div style="height: 20px;"><div style="border-bottom-style:'+styleArr[i]+';height:10px"></div></div></a></li>'; 
					 			    }
					              str += '</ul></div>';
					              str += "<div id='"+colorId+"' class='colorPickerDisplay' style='background-color:black;margin-top:8px;float:left'></div>";
					              return str; 
					            },
			 
		 getBootstrapModal 		: function(editor,context)
						            {
						                var htmlStr = '<div class="modal hide fade" tabindex="-1">';
						                if(context.header){
						                htmlStr += '<div class="modal-header"><button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>'
						                htmlStr += '<h3>' + context.header + '</h3></div>'; 
						                }
						                if(context.body){
						                htmlStr += '<div class="modal-body">';
						                if(!context.header){ 
						                    htmlStr += '<button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>'; 
						                }
						                htmlStr += context.body + '</div>';
						                }
						                htmlStr += '<div class="modal-footer"><button class="btn" data-dismiss="modal" aria-hidden="true">Cancel</button>'
						                if(context.button){
						                htmlStr += '<button class="btn btn-primary">'+context.button+'</button>';
						                }
						                htmlStr += '</div></div>';
						                var ret = $(htmlStr).on("click","button",function(e){
						                   ret.modal('hide');
						                   editor.frame.focus();
						                   editor.checkFocusBlurState(true);
						                   if($(this).hasClass('btn-primary')){
						                   			context.callback(); 
						                   }
						                }).on("shown",function(){
						                    editor.hasFocus = true;
						                    $("textarea:first,input:first",ret).focus();
						                }).appendTo(editor.ui);
						                if(context.initialize){ context.initialize();}   
						                return ret;
						            },
		repSelNode 			: function(elem,flag){
				            		var a = $(elem).children('a');
									var b = $(elem).parent().siblings('a');
									var width = (a.width() || a.children().width() || 114)/2;
									var height = (a.height()/2) || (a.children().height()/2) || 8;
									b.css("width",(width + 16) +"px")
									b.html('<div  style="float: left;width:' + width + 'px">' + a.html() + '</div>' + ' <b class="caret" style="margin-left:4px;margin-top:'+height+'px"></b>' + '</div>');
									b.attr("value",a.attr("value"));
				            },
				lblInp 				: function(lbl,inp,custom){
            						return '<div class="control-group"><label class="control-label">' + lbl + '</label><div class="controls">' + (custom?inp:('<input type="text" id="'+inp[0]+'" placeholder="'+inp[1]+'">')) + '</div></div>';
            					}	 
   }
   utility.colorPicker = {
   			colorCodes			: {"Standard Color":["000000","FFFFFF","EEECE1","1F497D","4F81BD","C0504D","9BBB59","8064A2","4BACC6","F79646","C00000","FF0000","FFC000","FFFF00",
            						"92D050","00B050","00B0F0","0070C0","002060","7030A0"],"Other Color":[]},
            createColorPicker 	: function(elem,title,placement,trigger,callback){
					            	var items=10;
					            	var contentStr = "<div>";
					            	contentStr += "<label class='colorPickerLabel'>"+title+"</label><div class='colorPickerControl'><input type='text' class='input-small colorPickerValue' /><div class='colorPickerDisplay colorPicker'></div></div>";
					            	$.each(colorPicker.colorCodes, function(key, value) { 
					                        if(value.length>0)
					                        {
					                            contentStr += "<h4>"+key+"</h4><table>";
					                            for(var i=0;i<=((value.length/items) && value.length!=0);i++){
					                                contentStr += "<tr>";
					                                for(var j=(i*items);j<value.length && j<(i+1)*items;j++){
					                                    contentStr += "<td><div class='colorPickerDisplay' style='background-color:#"+value[j]+";'></div></td>";
					                                }
					                                contentStr += "</tr>";
					                            }
					                            contentStr += "</td></tr></table>"
					                        }
					                    });
									contentStr += "</div>";
									elem.popover({html:true,placement:placement,content:contentStr,trigger:trigger});
									elem.popover("show");
									return (elem.data('popover').tip()).on("click","div.colorPickerDisplay",function(){
									 callback($(this).css("background-color"));
									}).hide();
					            },
			 hex 				: function(x) {
					               return ("0" + parseInt(x).toString(16)).slice(-2);
								},
			normalizeColor 		: function(rgb) {
		            			 if(typeof rgb != 'string') return null;
							     if (rgb.search("rgb") == -1 ) {
							          return rgb;
							     } else {
							          rgb = rgb.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d+))?\)$/);
							          var hex = colorPicker.hex;
							          return "#" + hex(rgb[1]) + hex(rgb[2]) + hex(rgb[3]); 
							     }},
							     
			initColor 			: function(tip,color){
								    var colorPickerDiv = $(".colorPicker",tip);
					                var colorPickerValue = $(".colorPickerValue",tip);
					                colorPickerDiv.css("background-color",color);
					                colorPickerValue.val(color);
					                colorPickerValue.on("keyup",function(){
					                        colorPickerDiv.css("background-color",$(this).val());
					                }).on("click",function(e){
					                    e.preventDefault();
					                    e.stopPropagation();
					                    return false;
					                });
								}				     
   }     

   utility.action = {
   			
   }                        
                        
   function BootstrapEditor(elem){
   		this.toolbar = null;
   		this.frame = null;
   		this.ui = elem;
   		this.hasFocus = false;
    	this.lastFocus = false;
        this.bootstrapModalMap = {};
   		this.init();
   }                                              
                        
   BootstrapEditor.prototype = {
   		init 		: function(){
				  	    var width = this.ui.width() || 640;
				  	    var height = this.ui.height() || 340;
				  	    var that = this;
				  	    this.action.initActionMap();
				  	    this.ui.addClass("bootstrapEditor").attr("tabindex",'0').width(width).height(height);				  	    
				  	    this.toolbar = new BootstrapEditorToolbar(this);
				  	    this.frame = new BootstrapEditorFrame(this,"<br>",width,height-this.toolbar.ui.height());
				  	    this.ui.on("focus",function(e){
				  	        that.hasFocus = true;
				  	        this.blur();
				  	        that.frame.focus();
				  	    }).on("blur",function(e){
				            that.checkFocusBlurState(false);
				        });
				        this.action.parent = this;
				      },
		changeFocus	: function(){
				    		if(this.lastFocus != this.hasFocus){
				            this.ui.toggleClass('onfocus',this.hasFocus);
				            if(this.frame.checkFrameBodyEmpty())
				                                   this.frame.setFrameBodyContent(!this.hasFocus);              
				            this.lastFocus = this.hasFocus;
				            }
						   },
    checkFocusBlurState : function(instant){
    						this.hasFocus = instant;
    						var that = this;
    						if(!instant){
					        setTimeout(function(){
					            that.changeFocus();            
					        },200);
					        }else{
					            this.changeFocus();
					        }
					    },
		isCmdActive		: function(cmd){
							return this.frame.queryCommandState(cmd)
						  },
		fireCmd			: function(key,elem,e,val){
							this.frame.executeAction.apply(this.frame,[key,elem,e,val]);
						  },
		updateToolbar	: function(e){
						  this.toolbar.updateToolbar(e);
						  }	
   };
   
   BootstrapEditor.prototype.action = {
   			delTable 		: function(){
				               var tableProp = utility.getTableProp(this.frame);
				               if(tableProp && tableProp.node){
				                   $(tableProp.node).remove();
				               } 
				            },
           insRow 			: function(key){
				               var below = actionMap[key].value;
				               var tableProp = utility.getTableProp(this.frame);
				               if(tableProp && tableProp.rowIndex>=0){
				               var row = tableProp.node.insertRow(below?tableProp.rowIndex+1:tableProp.rowIndex);
				                  for(var i=0;i<tableProp.colLen;i++){
				                    var cell = row.insertCell(i);
				                    cell.innerHTML = "&nbsp;";
				                  }
				               }
				            },
		   delRow 			: function(){
				               var tableProp = utility.getTableProp(this.frame);
				               if(tableProp==null) return;
				               if(tableProp.rowLen==1){
				                   table.delTable();
				                   return;
				               }
				               if(tableProp.rowIndex>=0 && tableProp.rowIndex<tableProp.rowLen){
				                   var sibling = $(tableProp.node.rows[tableProp.rowIndex]).siblings("tr");
				                   tableProp.node.deleteRow(tableProp.rowIndex);
				                   this.parent.frame.selectNode(sibling[tableProp.rowIndex<tableProp.rowLen-1?tableProp.rowIndex:tableProp.rowIndex-1].cells[tableProp.colIndex>=0?tableProp.colIndex:0],true);
				               }
				            },
           delCol 			: function(){
				               var tableProp = utility.getTableProp(this.frame);
				               if(tableProp==null) return;
				               if(tableProp.colIndex>=0 && tableProp.colIndex<tableProp.colLen){
				                   if(tableProp.colLen==1){
				                       table.delTable();
				                       return;
				                   }
				                   var sibling = $(tableProp.node.rows[tableProp.rowIndex].cells[tableProp.colIndex]).siblings("td");
				                   for(var i=0;i<tableProp.rowLen;i++){
				                     tableProp.node.rows[i].deleteCell(tableProp.colIndex);
				                  }
				                  this.parent.frame.selectNode(sibling[tableProp.colIndex<tableProp.colLen-1?tableProp.colIndex:tableProp.colIndex-1],true);
				               }
				            },
           insCol 			: function(key){
				               var right = actionMap[key].value;
				               var tableProp = table.getTableProp(this.parent);
				               if(tableProp && tableProp.colIndex>=0){
				               for(var i=0;i<tableProp.rowLen;i++){
				                    var cell = tableProp.node.rows[i].insertCell(right?tableProp.colIndex+1:tableProp.colIndex);
				                    cell.innerHTML = "&nbsp;";
				                  }
				               }
				            },
           insTable 		: function(key,elem,e){
					                var tableModal = elem.data("bootstrapTableModal");
					                if(!tableModal){
					                var body = '<form class="form-horizontal" style="height:300px">' + lblInp('No. of rows',['row','rows'],false) + 
					                            lblInp('No. of columns',['column','columns'],false) +
					                            lblInp('Cell Padding',['cellPadding','padding'],false) +
					                            lblInp('Border',getTableBorder('borderWidth','width','borderStyle',['solid','none','double','dotted','dashed'],'borderColor'),true) +
					                            '</form>';
					                var button = 'Insert', row = null, column = null, borderWidth = null, borderStyle = null, cellPadding=null, borderColor=null;
					                tableModal = utility.getBootstrapModal({body:body,button:button, callback:function(){
					                                   var style = "border:" + (borderWidth.val() || "1") + "px " + borderStyle.attr("value") + " " + borderColor.css("background-color") + ";";
					                                   var padding = "padding:" + (cellPadding.val() || "1") + "px";
					                                   if(parseInt($.trim(row.val()))<=0 || parseInt($.trim(column.val()))<=0)return;
					                                   var tableStr = "<table cellspacing=1 border=1 style='"+ style +"'>";
					                                   for(var i=0;i<parseInt($.trim(row.val()));i++){
					                                       tableStr += "<tr>";
					                                       for(var j=0;j<parseInt($.trim(column.val()));j++){
					                                           tableStr += "<td style='"+ style + padding +"'>&nbsp;</td>";
					                                       }
					                                       tableStr += "</tr>";
					                                   }
					                                   tableStr += "</table>";
					                                   this.parent.frame.insertNode(tableStr);
					                                   //var a =  table.getTableProp(this.);
					                                }, initialize: function(){
					                                    (borderStyle = $("#borderStyle",tableModal)).parent().on("click","li",function(){
					                                        repSelNode(this,true);  
					                                    });
					                                    borderColor = $("#borderColor",tableModal).on('click',function(){
					                                            var val = colorPicker.normalizeColor(borderColor.css("background-color")) || "#fff";
					                                            var tip = borderColor.data('popover') && borderColor.data('popover').tip();
					                                            if(!tip){
					                                            var tip = colorPicker.createColorPicker(borderColor,"Border Color","bottom","manual",function(color){
					                                            tip.hide();
					                                            borderColor.css("background-color",color);
					                                            });}
					                                            tip.toggle();
					                                            colorPicker.initColor(tip,val);
					                                    });
					                                }});
					                }
					                row = $('#row',tableModal).val("");
					                column = $('#column',tableModal).val("");
					                borderWidth = $("#borderWidth",tableModal).val("");
					                (borderStyle = borderStyle || $("#borderStyle",tableModal)).parent().find("li:first").each(function(){repSelNode(this,false);});
					                borderColor = $("#borderColor",tableModal).css("background-color","#000");
					                cellPadding = $("#cellPadding",tableModal).val("");
					                tableModal.modal('show');
					            },
   			changeColor 		: function(key,elem,e){
					               var fore = actionMap[key].value;
					               var cmd = actionMap[key].command || key;
					               var obj = $(elem.find("a:first")[0]);
					               var tip = obj.data('popover') && obj.data('popover').tip();
					               var val = colorPicker.normalizeColor(queryCommandValue(cmd)) || (fore?"#000":"#fff");
					               if(!tip){
						           tip = colorPicker.createColorPicker(obj,elem.attr("title"),"right","manual",function(color){
											            tip.hide();
											            bootstrapEditorFrame.focus();
											            this.fireCmd(key,elem,e,color);
											            });
											            
					                } 
						            if(e.type=="mouseleave"){
						              tip.hide();
						            }else if(e.type=="mouseenter"){
						                tip.show();
					            	}
						            colorPicker.initColor(tip,val);
						        },
   			viewHtml 		: function(key,elem,e){
				                var body = '<form><fieldset><label>HTML Source Editor</label><textarea id="htmlSource" rows="15" style="width:100%"></textarea></fieldset></form>';
				                var button = 'Update';
				                var htmlSource = null;
				                var htmlModal = getBootstrapModal("bootstrapHtmlModal",{body:body,button:button,callback:function (){
				                                   htmlSource = htmlSource || $('#htmlSource',htmlModal);
				                                   var content = "";
				                                   var tokens = $("<div>" + htmlSource.val() + "</div>").contents().each(function(){
				                                        if(this.nodeType === 3){
				                                                content += "<p>" + this.nodeValue + "</p>"
				                                           }else{
				                                               content += $(this).wrap("<div/>").parent().html();
				                                   }});
				                                   bootstrapEditorFrame.frameDoc.body.innerHTML = content;
				                }});
				                htmlSource = $('#htmlSource',htmlModal);
				                setTimeout(function(){
				                                    htmlSource.val(bootstrapEditorFrame.frameDoc.body.innerHTML);
				                                    htmlModal.modal('show');
				                                    },200);
				            },
            insImg 			: function(key,elem,e){
            					var imageModal = elem.data("bootstrapImageModal")
            					  , imageUrl = null;
            					if(!imageModal){
				                var body = '<form><fieldset><label>Enter Image URL</label><input type="text" id="imageUrl" placeholder="Image URL"></fieldset></form>';
				                var button = 'Insert';
				                imageModal = utility.getBootstrapModal(this,{body:body,button:button,callback:function (){
				                                   imageUrl = imageUrl || $('#imageUrl',imageModal);
				                                   if($.trim(imageUrl.val()) === "") return;
				                                   this.fireCmd(key,elem,e,$.trim(imageUrl.val()));
				                }});
				                }
				                imageUrl = $('#imageUrl',imageModal).val("http://");
				                imageModal.modal('show');
				            },
    
            createLink 		: function(key,elem,e){
				                var body = '<form><fieldset><label>Address</label><input type="text" id="address" placeholder="URL/Mail"><label>Text to display</label>' +
				                            '<input type="text" id="text" placeholder="Text"></fieldset></form>';
				                    
				                var button = 'Create';
				                var address = null;
				                var text = null;
				                var linkModal = getBootstrapModal("bootstrapLinkModal",{body:body,button:button, callback:function(){
				                                   var valid = true;
				                                   address = address || $('#address',linkModal);
				                                   text = text || $('#text',linkModal);
				                                   if($.trim(address.val()) === "" || $.trim(text.val()) === "") return;
				                                   var textNode = this.parent.frame.frameDoc.createTextNode($.trim(text.val()))
				                                   this.parent.frame.replaceText(textNode);
				                                   this.fireCmd(key,elem,e,$.trim(address.val()));
				                                }});
				                address = $('#address',linkModal).val("http://");
				                text = $('#text',linkModal).val(bootstrapEditorFrame.getText());
				                linkModal.modal('show');
				            },
			initActionMap 			: function(){
					                    //F1-F12 a-z, 0-9, ',' , '.' with ctrl shift alt combination
					                    actionMap["bold"] = new Action({tag:["b","strong"],css:{"font-weight":"800"},hotkey:["Ctrl-B"]});
					                    actionMap["italic"] = new Action({tag:["i","em"],css:{"font-style":"italic"},hotkey:["Ctrl-I"]});
					                    actionMap["underline"] = new Action({tag:["u"],css:{"text-decoration":"underline"},hotkey:["Ctrl-U"]});
					                    actionMap["strikeThrough"] = new Action({tag:["s","strike"],css:{"text-decoration":"line-through"},hotkey:["Ctrl-S"]});
					                    
					                    actionMap["justifyLeft"] = new Action({css:{"text-align":"left"},hotkey:["Ctrl-L"]});
					                    actionMap["justifyRight"] = new Action({css:{"text-align":"right"},hotkey:["Ctrl-R"]});
					                    actionMap["justifyCenter"] = new Action({css:{"text-align":"center"},hotkey:["Ctrl-E"]});
					                    actionMap["justifyFull"] = new Action({css:{"text-align":"justify"},hotkey:["Ctrl-J"]});
					                    
					                    actionMap["createLink"] = new Action({tag:["a"], hotkey:["Ctrl-K"], execCmd:this.createLink});
					                    actionMap["unlink"] = new Action({});
					                    
					                    actionMap["indent"] =  new Action({});
					                    actionMap["outdent"] =  new Action({});
					                    
					                    actionMap["insertOrderedList"] =  new Action({tag:["ol"]});
					                    actionMap["insertUnorderedList"] =  new Action({tag:["ul"]});
					                    
					                    actionMap["paragraph"] =  new Action({cmd:"FormatBlock",val:(($.browser.msie||$.browser.webkit)?"<p>":"p"),tag:["p"]});
					                    for(var i=1;i<=6;i++)
					                    {
					                        actionMap["h"+i] = new Action({cmd:(($.browser.msie||$.browser.webkit)?"FormatBlock":"heading"),val:(($.browser.msie||$.browser.webkit)?"<h"+i+">":"h"+i),tag:["h"+i]});
					                    }
					                    actionMap["insertHorizontalRule"] = new Action({tag:["hr"]});
					                    
					                    
					                    actionMap["insertImage"] =  new Action({tag:["img"],execCmd:this.insImg});
					                    
					                    actionMap["insTable"] = new Action({tag:["table"],execCmd:this.insTable});
					                    actionMap["insRowB"] = new Action({val:true,execCmd:this.insRow});
					                    actionMap["insRowA"] = new Action({val:false,execCmd:this.insRow});
					                    actionMap["insColL"] = new Action({val:false,execCmd:this.insCol});
					                    actionMap["insColR"] = new Action({val:true,execCmd:this.insCol});
					                    actionMap["delRow"] = new Action({execCmd:this.delRow});
					                    actionMap["delCol"] = new Action({execCmd:this.delCol});
					                    actionMap["delTable"] = new Action({execCmd:this.delTable});
					                    
					                    actionMap["viewHtml"] = new Action({execCmd:this.viewHtml});
					                    
					                    actionMap["foreColor"] = new Action({val:true,execCmd:this.changeColor});
					                    actionMap["backColor"] = new Action({val:false,execCmd:this.changeColor});
					                    
					                    //actionMap["setting"] = new Action({execCmd:setting});
					                    
					                    $.each(actionMap,function(name,val){
					                        if(!val.hotkey)return;
					                        for(var i=0;i<val.hotkey.length;i++)
					                        {
					                            var token = val.hotkey[i].toUpperCase().split('-')
					                            var hotkey = 0;
					                            for(var j=0;j<token.length;j++)
					                            {
					                                if(token[j]=="CTRL"){hotkey |= 256}
					                                else if(token[j]=="ALT"){hotkey |= 512}
					                                else if(token[j]=="SHIFT"){hotkey |= 1024}
					                                else if(token[j]=="."){hotkey |= 190}
					                                else if(token[j]==","){hotkey |= 188}
					                                else{ 
					                                    var keycode = token[j].charCodeAt(0);
					                                    if((keycode>=48 && keycode<=57)||(keycode>=65&&keycode<=90))
					                                    {
					                                        if(token[j].length==1){hotkey |= keycode}
					                                        else if(token[j][0]=="F")
					                                        {
					                                            var num = parseInt(token[j].substring(1)) || 0;
					                                            if(num>=1 && num<=12){hotkey |= 111+num}
					                                        }
					                                    }
					                                }
					                            }
					                            hotkeyMap[hotkey] = name;    
					                        }
					                    });
					                },
   }

  $.fn.bootstrapEditor = function() {
        var bootstrapEditor = new BootstrapEditor(this);
  };
})( jQuery );