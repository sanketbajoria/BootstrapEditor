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
    function BootstrapEditor()
    {
            var actionMap = {};
            var bootstrapEditor = null;
            var bootstrapEditorToolbar = null;
            var bootstrapEditorFrame = null;
            var selectableItems = null;
            var hotkeyMap = {};
            var bootstrapModalMap = {};
    
    
    
    
            var table = {};
    
            table.delTable = function(){
               var tableProp = table.getTableProp();
               if(tableProp && tableProp.node){
                   $(tableProp.node).remove();
               } 
            }
            table.getTableProp = function(){
                var range = bootstrapEditorFrame.getRange();
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
            }
            table.insRow = function(key){
               var below = actionMap[key].value;
               var tableProp = table.getTableProp();
               if(tableProp && tableProp.rowIndex>=0){
               var row = tableProp.node.insertRow(below?tableProp.rowIndex+1:tableProp.rowIndex);
                  for(var i=0;i<tableProp.colLen;i++){
                    var cell = row.insertCell(i);
                    cell.innerHTML = "&nbsp;";
                  }
               }
            }
            
            table.delRow = function(){
               var tableProp = table.getTableProp();
               if(tableProp==null) return;
               if(tableProp.rowLen==1){
                   table.delTable();
                   return;
               }
               if(tableProp.rowIndex>=0 && tableProp.rowIndex<tableProp.rowLen){
                   var sibling = $(tableProp.node.rows[tableProp.rowIndex]).siblings("tr");
                   tableProp.node.deleteRow(tableProp.rowIndex);
                   bootstrapEditorFrame.selectNode(sibling[tableProp.rowIndex<tableProp.rowLen-1?tableProp.rowIndex:tableProp.rowIndex-1].cells[tableProp.colIndex>=0?tableProp.colIndex:0],true);
               }
            }
            table.delCol = function(){
               var tableProp = table.getTableProp();
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
                  bootstrapEditorFrame.selectNode(sibling[tableProp.colIndex<tableProp.colLen-1?tableProp.colIndex:tableProp.colIndex-1],true);
               }
            }
            table.insCol = function(key){
               var right = actionMap[key].value;
               var tableProp = table.getTableProp();
               if(tableProp && tableProp.colIndex>=0){
               for(var i=0;i<tableProp.rowLen;i++){
                    var cell = tableProp.node.rows[i].insertCell(right?tableProp.colIndex+1:tableProp.colIndex);
                    cell.innerHTML = "&nbsp;";
                  }
               }
               
            }
			table.insTable = function(){
                
                var body = '<form class="form-horizontal"><div class="control-group"><label class="control-label">No. of rows</label><div class="controls"><input type="text" id="row" placeholder="rows">' + 
                			'</div></div><div class="control-group"><label class="control-label">No. of columns</label><div class="controls"><input type="text" id="column" placeholder="columns"></div></div>' +
                			'</form>';
                var button = 'Insert', row = null, column = null;
                var tableModal = getBootstrapModal("bootstrapTableModal",null,body,button, function(){
                                   row = row || $('#row',tableModal);
                                   column = column || $('#column',tableModal);
                                   if(parseInt($.trim(row.val()))<=0 || parseInt($.trim(column.val()))<=0)return;
                                   var tableStr = "<table id='test' cellspacing=0 cellpadding=0 border=1 style='border-color: #ccc'>";
                                   for(var i=0;i<parseInt($.trim(row.val()));i++)
                                   {
                                       tableStr += "<tr>";
                                       for(var j=0;j<parseInt($.trim(column.val()));j++)
                                       {
                                           tableStr += "<td>&nbsp;</td>";
                                       }
                                       tableStr += "</tr>";
                                   }
                                   tableStr += "</table>";
                                   bootstrapEditorFrame.insertNode(tableStr);
                                });
                row = $('#row',tableModal);
                column = $('#column',tableModal);
                row.val("");
                column.val("");
                tableModal.modal('show');              
            }
            var colorPicker = {};
            
            colorPicker.colorCodes = {"Standard Color":["000000","FFFFFF","EEECE1","1F497D","4F81BD","C0504D","9BBB59","8064A2","4BACC6","F79646","C00000","FF0000","FFC000","FFFF00",
            						"92D050","00B050","00B0F0","0070C0","002060","7030A0"],"Other Color":[]}; 
            colorPicker.createColorPicker = function(elem,input,callback){
            	var items=10;
            	var contentStr = "<div>"
            	if(input){
            	contentStr += "<label class='colorPickerLabel'>"+elem.attr('title')+"</label><div class='colorPickerControl'><div class='colorPickerDisplay colorPicker'></div><input type='text' class='input-small colorPickerValue' /></div>"
            	}
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
				elem.popover({html:true,placement:"bottom",content:contentStr,trigger:"manual"});
				elem.data('popover').options.template = '<div class="popover"><div class="arrow"></div><div class="popover-inner"><div class="popover-content"></div></div></div>';
				elem.popover("show");
				elem.data('popover').tip().on("click","div.colorPickerDisplay",function(){
				 callback($(this).css("background-color"));
				});
            }
            colorPicker.hex = function(x) {
					               return ("0" + parseInt(x).toString(16)).slice(-2);
			}
            colorPicker.normalizeColor = function(rgb) {
					     if (  rgb.search("rgb") == -1 ) {
					          return rgb;
					     } else {
					          rgb = rgb.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d+))?\)$/);
					          var hex = colorPicker.hex;
					          return "#" + hex(rgb[1]) + hex(rgb[2]) + hex(rgb[3]); 
					     }
			}
            var changeColor = function(key,elem){
               var front = actionMap[key].value;
               var cmd = actionMap[key].command;
               var obj = $(elem);
               if(!obj.data('popover')){
	           colorPicker.createColorPicker(obj,true,function(color){
						            obj.popover('hide');
						            bootstrapEditorFrame.frameDoc.execCommand(cmd, false, color);
						            });
						            }
			    else{
	            obj.popover(obj.data('popover').tip().is(":hidden")?'show':'hide');
	            }
	            var val = colorPicker.normalizeColor(getCommandValue(cmd) || "#000");
	            var colorPickerDiv = $(".colorPicker",obj.data('popover').tip());
	            var colorPickerValue = $(".colorPickerValue",obj.data('popover').tip());
	            colorPickerValue.on("keyup",function(){
	            	colorPickerDiv.css("background-color",$(this).val());
	            });
	            colorPickerDiv.css("background-color",val);
	            colorPickerValue.val(val);
	            
            }
    
    
    
                        
            var viewHtml = function(){
                var body = '<form><fieldset><label>HTML Source Editor</label><textarea id="htmlSource" rows="15" style="width:100%"></textarea></fieldset></form>';
                var button = 'Update';
                var htmlSource = null;
                var htmlModal = getBootstrapModal("bootstrapHtmlModal",null,body,button,function (){
                                   htmlSource = htmlSource || $('#htmlSource',htmlModal);
                                   var content = "";
                                   var tokens = $("<div>" + htmlSource.val() + "</div>").contents().each(function(){
                                        if(this.nodeType === 3){
                                                content += "<p>" + this.nodeValue + "</p>"
                                           }else{
                                               content += $(this).wrap("<div/>").parent().html();
                                   }});
                                   bootstrapEditorFrame.frameDoc.body.innerHTML = content;
                });
                htmlSource = $('#htmlSource',htmlModal);
                setTimeout(function(){
                                    htmlSource.val(bootstrapEditorFrame.frameDoc.body.innerHTML);
                                    htmlModal.modal('show');
                                    },200);
                
            }
            
            var insImg = function(){
                var body = '<form><fieldset><label>Enter Image URL</label><input type="text" id="imageUrl" placeholder="Image URL"></fieldset></form>';
                    
                var button = 'Insert';
                var imageUrl = null;
                
                var imageModal = getBootstrapModal("bootstrapImageModal",null,body,button,function (){
                                   imageUrl = imageUrl || $('#imageUrl',imageModal);
                                   if($.trim(imageUrl.val()) === "") return;
                                   bootstrapEditorFrame.frameDoc.execCommand("insertImage", false, $.trim(imageUrl.val()));
                 
                });
                imageUrl = $('#imageUrl',imageModal);
                imageUrl.val("http://");
                imageModal.modal('show');
            }
    
            var createLink = function(){
                var body = '<form><fieldset><label>Address</label><input type="text" id="address" placeholder="URL/Mail"><label>Text to display</label>' +
                            '<input type="text" id="text" placeholder="Text"></fieldset></form>';
                    
                var button = 'Create';
                var address = null;
                var text = null;
                var linkModal = getBootstrapModal("bootstrapLinkModal",null,body,button, function(){
                                   var valid = true;
                                   address = address || $('#address',linkModal);
                                   text = text || $('#text',linkModal);
                                   if($.trim(address.val()) === "" || $.trim(text.val()) === "") return;
                                   var textNode = bootstrapEditorFrame.frameDoc.createTextNode($.trim(text.val()))
                                   bootstrapEditorFrame.replaceText(textNode);
                                   bootstrapEditorFrame.frameDoc.execCommand("createLink", false, $.trim(address.val()));
                 
                                });
                address = $('#address',linkModal);
                text = $('#text',linkModal);
                address.val("http://");
                text.val(bootstrapEditorFrame.getText());              
                linkModal.modal('show');
            }        
            var Action = function(context)
            {
                this.command = context.cmd;
                this.value = context.val;
                this.tag = context.tag;
                this.css = context.css;
                this.hotkey = context.hotkey;
                this.execCmd = context.execCmd;
            }
            
            var MenuNode = function(icon, group, title, visible, wrapContent, action, subMenu)
            {
                this.icon = icon;
                this.group =group;
                this.title = title;
                this.visible = visible;
                this.wrapContent = wrapContent;
                this.action = action;
                this.subMenu = subMenu;
            }
            
            var getBootstrapModal = function(id,header,body,button,callback)
            {
                if(id in bootstrapModalMap)
                    return bootstrapModalMap[id];
                var htmlStr = '<div id="'+id+'" class="modal hide fade" tabindex="-1">';
                if(header){
                htmlStr += '<div class="modal-header"><button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>'
                htmlStr += '<h3>' + heading + '</h3></div>'; 
                }
                if(body){
                htmlStr += '<div class="modal-body">';
                if(!header){ 
                    htmlStr += '<button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>'; 
                }
                htmlStr += body + '</div>';
                }
                htmlStr += '<div class="modal-footer"><button class="btn" data-dismiss="modal" aria-hidden="true">Cancel</button>'
                if(button){
                htmlStr += '<button class="btn btn-primary">'+button+'</button>';
                }
                htmlStr += '</div></div>';
                bootstrapModalMap[id] = $(htmlStr).on("click","button",function(e){
                   bootstrapModalMap[id].modal('hide');
                   hasFocus = true;
                   bootstrapEditorFrame.focus();
                   checkFocusBlurState(true);
                   if($(this).hasClass('btn-primary')){
                   			callback(); 
                   }
                }).on("shown",function(){
                    hasFocus = true;
                    $("textarea:first,input:first",bootstrapModalMap[id]).focus();
                });   
                return bootstrapModalMap[id];
            }

            var initActionMap = function(){
                
                    //F1-F12 a-z, 0-9, ',' , '.' with ctrl shift alt combination
                    actionMap["bold"] = new Action({cmd:"bold", tag:["b","strong"],css:{"font-weight":"800"},hotkey:["Ctrl-B"]});
                    actionMap["italic"] = new Action({cmd:"italic", tag:["i","em"],css:{"font-style":"italic"},hotkey:["Ctrl-I"]});
                    actionMap["underline"] = new Action({cmd:"underline",tag:["u"],css:{"text-decoration":"underline"},hotkey:["Ctrl-U"]});
                    actionMap["strikeThrough"] = new Action({cmd:"strikeThrough", tag:["s","strike"],css:{"text-decoration":"line-through"},hotkey:["Ctrl-S"]});
                    
                    actionMap["justifyLeft"] = new Action({cmd:"justifyLeft", css:{"text-align":"left"},hotkey:["Ctrl-L"]});
                    actionMap["justifyRight"] = new Action({cmd:"justifyRight", css:{"text-align":"right"},hotkey:["Ctrl-R"]});
                    actionMap["justifyCenter"] = new Action({cmd:"justifyCenter", css:{"text-align":"center"},hotkey:["Ctrl-E"]});
                    actionMap["justifyFull"] = new Action({cmd:"justifyFull", css:{"text-align":"justify"},hotkey:["Ctrl-J"]});
                    
                    actionMap["createLink"] = new Action({cmd:"createLink", tag:["a"], hotkey:["Ctrl-K"], execCmd:createLink});
                    actionMap["unlink"] = new Action({cmd:"unlink"});
                    
                    actionMap["indent"] =  new Action({cmd:"indent"});
                    actionMap["outdent"] =  new Action({cmd:"outdent"});
                    
                    actionMap["insertOrderedList"] =  new Action({cmd:"insertOrderedList",tag:["ol"]});
                    actionMap["insertUnorderedList"] =  new Action({cmd:"insertUnorderedList",tag:["ul"]});
                    
                    actionMap["paragraph"] =  new Action({cmd:"FormatBlock",val:(($.browser.msie||$.browser.webkit)?"<p>":"p"),tag:["p"]});
                    for(var i=1;i<=6;i++)
                    {
                        actionMap["h"+i] = new Action({cmd:(($.browser.msie||$.browser.webkit)?"FormatBlock":"heading"),val:(($.browser.msie||$.browser.webkit)?"<h"+i+">":"h"+i),tag:["h"+i]});
                    }
                    actionMap["horizontalLine"] = new Action({cmd:"insertHorizontalRule",tag:["hr"]});
                    
                    
                    actionMap["insImg"] =  new Action({cmd:"insertImage",tag:["img"],execCmd:insImg});
                    
                    actionMap["insTable"] = new Action({tag:["table"],execCmd:table.insTable});
                    actionMap["insRowB"] = new Action({val:true,execCmd:table.insRow});
                    actionMap["insRowA"] = new Action({val:false,execCmd:table.insRow});
                    actionMap["insColL"] = new Action({val:false,execCmd:table.insCol});
                    actionMap["insColR"] = new Action({val:true,execCmd:table.insCol});
                    actionMap["delRow"] = new Action({execCmd:table.delRow});
                    actionMap["delCol"] = new Action({execCmd:table.delCol});
                    actionMap["delTable"] = new Action({execCmd:table.delTable});
                    
                    actionMap["viewHtml"] = new Action({execCmd:viewHtml});
                    
                    actionMap["foreColor"] = new Action({cmd:"foreColor",val:true,execCmd:changeColor});
                    actionMap["backColor"] = new Action({cmd:"backColor",val:false,execCmd:changeColor});
                    
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
                };
		   var getCommandValue = function(cmd){
		   			var d = bootstrapEditorFrame.frameDoc;
		   			if(cmd && d.queryCommandValue && d.queryCommandValue(cmd)){
		   				return d.queryCommandValue(cmd)
		   			}
		   			return false;
		   }
           var executeAction = function (actionKey,arg) {
                    var action = actionMap[actionKey];
                    if (action.execCmd) {
                        action.execCmd.apply(this,[actionKey,arg]);
                    } else {
                    try {
                        bootstrapEditorFrame.frameDoc.execCommand(action.command, false, action.value);
                        } catch (e) {
                        console.error(e);
                        }
                    }
                   updateBootstrapToolbar(null);
                };
        
        
          var updateBootstrapToolbar = function(elem)
          {
          		selectableItems	= selectableItems || bootstrapEditorToolbar.getToolbar().find("div > ul > li:not(.divider,.divider-vertical,.dropdown)");
          		$.each(selectableItems, function(){
          		var menuNode = $(this);
          		var actionKey = menuNode.attr("actionKey");
          		var cmd = actionMap[actionKey].command;
          		if(cmd && bootstrapEditorFrame.frameDoc.queryCommandState && bootstrapEditorFrame.frameDoc.queryCommandState(cmd)){
          			menuNode.addClass("active");
          		}
          		else{
          			menuNode.removeClass("active");
          		}});
          }
          
          var BootstrapEditorFrame = function(initial,frameWidth,frameHeight){
            var frame = $('<iframe id="bootstrapEditorFrame" frameBorder="0" id="myFrame"></iframe>');
            var placeholder = $("<p style='color:#ccc' id='content-placeholder'>Type something...</p>");
            var initialContent = $("<p>"+initial+"</p>");
            this.frameDoc = null;
            var instance = this;
            this.savedRange = null;
            var turnOnEditingMode = function(){
                    if (instance.frameDoc && 'designMode' in instance.frameDoc) {
                        instance.frameDoc.designMode = "on";                
                    } else if (instance.frameDoc.body && 'contentEditable' in instance.frameDoc.body) {
                        instance.frameDoc.body.contentEditable = true;
                    }
            }
            this.getSelection = function () {
                     return frame[0].contentWindow.getSelection?frame[0].contentWindow.getSelection() : (instance.frameDoc?instance.frameDoc.selection:null);
            }
            this.getRange = function () {
                var selection = this.getSelection();
                if(!selection) 
                    return null;
                return selection.createRange?selection.createRange():((selection.rangeCount&&selection.rangeCount>0)?selection.getRangeAt(0):frameDoc.createRange());
            }
            this.getText = function(){
                var selection = this.getSelection();
                if(!selection) 
                    return null;
                return selection.createRange?selection.createRange().text:selection.toString();
            }
            
            this.replaceText = function(elem){
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
                
            }
            this.selectNode = function(elem,collapse){
                var range = bootstrapEditorFrame.getRange();
                if(!range) return;
                if(range.selectNodeContents){
                    var selection = bootstrapEditorFrame.getSelection();
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
                
            }
            this.insertNode = function(tableStr){
                var range = this.getRange();
                if(!range) return;
                if(range.insertNode)
                {
                    var selection = this.getSelection();
                    range.deleteContents();
                    range.insertNode($(tableStr)[0]);
                    
                }
                else if(range.pasteHTML)
                {
                    range.pasteHTML (tableStr);
                }
            }
            
            this.checkFrameBodyEmpty = function(){
                var tokens = $(instance.frameDoc.body).children("*:not(#content-placeholder)");
                return tokens.length==0 || (tokens.length==1 && $(tokens[0]).find("ol,ul,li,hr,img,table,img,a").length == 0 && !($(tokens[0]).text()));
            }
            
            this.setFrameBodyContent = function(placeholderContent){
                var firstNode = $(instance.frameDoc.body).find("*:first");
                 if(placeholderContent){
                     firstNode.html(placeholder.html()).removeAttr("style").css("color","#CCC").attr("id","content-placeholder");
                 }
                 else{
                     firstNode.html(initialContent.html()).removeAttr("id").removeAttr("style");
                 }
            }
            
           var initFrame = function(){
               frame.width(frameWidth);
               frame.height(frameHeight); 
               turnOnEditingMode(); 
               $(instance.frameDoc).on("click keyup",function(e){
                   updateBootstrapToolbar(e.target ? e.target : e.srcElement);
                   return true;
               });
               $(instance.frameDoc).on("keydown",function(e){
                        if((e.which>=65 && e.which<=90)||(e.which>=48 && e.which<=57) || (e.which==188 || e.which==190) || (e.which>=112 && e.which<=123))
                        {
                            var hotkey = e.which;
                            if(e.altKey || e.ctrlKey || e.shiftKey || (e.which>=112 && e.which<=123))   // ctrl -- 0x0100 alt -- 0x0200 shift 0x0400
                            {
                                hotkey |= e.ctrlKey?256:0;
                                hotkey |= e.altKey?512:0;
                                hotkey |= e.shiftKey?1024:0;
                                if(hotkey in hotkeyMap){
                                executeAction.apply(this,[hotkeyMap[hotkey]]);
                                e.preventDefault();
                                e.stopPropagation();
                                }
                            }
                            
                        }
                        if (e.which == 8 && instance.checkFrameBodyEmpty()) {
                            e.stopPropagation();
                            return false;
                        }
               });
               
               
            $(frame[0].contentWindow).on("focus",function(){
                hasFocus = true;
                checkFocusBlurState(true);
            }).on("blur",function(){
               hasFocus = false;
               checkFocusBlurState(false);
            });
            $(instance.frameDoc).on("beforedeactivate blur", function () {
                    instance.savedRange = instance.getRange();
            });
            }

            this.focus = function()
            {
                frame[0].contentWindow.focus();
                if (this.savedRange){
                    if(frame[0].contentWindow.getSelection){
                    var selection = this.getSelection();
                    selection.removeAllRanges();
                    selection.addRange(this.savedRange);
                    }   
                    else if(this.frameDoc.selection) { 
                        this.savedRange.select();
                    }
                }
                return true;
            }

            this.addToElem = function(elem)
            {
               frame[0].src="javascript:void(0)";
               elem.append(frame);
               this.frameDoc = frame[0].contentDocument ? frame[0].contentDocument : (frame[0].contentWindow?frame[0].contentWindow.document:null);         
               var myContent = '<!DOCTYPE html><html><head><style>p{margin:16px 0px}</style></head><body style="overflow-x:hidden;word-wrap:break-word"><p style="color:#ccc" id="content-placeholder">Type something...</p></body></html>';
               this.frameDoc.open('text/html', 'replace');
               this.frameDoc.write(myContent);
               this.frameDoc.close();
               initFrame();
            }
          }

           var BootstrapEditorToolbar = function(){
                        var menu = this.menu = [];
                        var toolbar = null;
                        var instance=this;
                        var addMenuNode=function(index,arr,menuNode){
                            arr[index] = menuNode;
                        }
                        var appendSeperator = function(vertical){
                            var className = "class='" + (vertical?"divider-vertical":"divider") + "'";
                            return "<li "+className+"></li>";
                        }
                            
                        var appendNode = function(menuNode,hori){
                            var actionKey = menuNode.action?("actionKey='" + menuNode.action +"' "):"";
                            var attr = (menuNode.title)?("title='"+ menuNode.title + (menuNode.action && actionMap[menuNode.action].hotkey?" (" + actionMap[menuNode.action].hotkey[0] + ")":"") + "' "):"";
                            var str = hori?('<i class="'+menuNode.icon+'"></i>'):('<i>'+menuNode.title+'</i>');
                            str = menuNode.wrapContent?$(str).wrap("<div>" + menuNode.wrapContent + "</div>").parents().last().html():str;
                            var ret = "<li " + actionKey + attr +  ">";
                            ret += '<a href="#">'+str+'</a>';
                            ret += "</li>";
                            return ret;
                        }
                        var initMenu = function(){
                            var i,j;
                            i=0;
                            addMenuNode(i++,menu,new MenuNode("icon-external-link",0,"View HTML Source",true,null,"viewHtml",null));
                            
                            addMenuNode(i++,menu,new MenuNode("icon-font",1,"Formatting",true,null,null,new Array()));
                             j=0;
                             addMenuNode(j++,menu[i-1].subMenu, new MenuNode(null,2,"Paragraph",true,"<p />","paragraph",null));
                             while(j<=6){
                             addMenuNode(j++,menu[i-1].subMenu, new MenuNode(null,2,"Header "+(j-1),true,"<h"+ (j-1) + " />","h"+(j-1),null));
                             }
                            
                            addMenuNode(i++,menu,new MenuNode("icon-bold",3,"Bold",true,null,"bold",null));
                            addMenuNode(i++,menu,new MenuNode("icon-italic",3,"Italic",true,null,"italic",null));
                            addMenuNode(i++,menu,new MenuNode("icon-underline",3,"Underline",true,null,"underline",null));
                            addMenuNode(i++,menu, new MenuNode("icon-strikethrough",3,"StrikeThrough",true,null,"strikeThrough",null));
                            
                            addMenuNode(i++,menu,new MenuNode("icon-tasks",4,"Alignment",true,null,null,new Array()));
                             j=0;
                             addMenuNode(j++,menu[i-1].subMenu, new MenuNode("icon-align-left",5,"Align Text Left",true,null,"justifyLeft",null));
                             addMenuNode(j++,menu[i-1].subMenu, new MenuNode("icon-align-right",5,"Align Text Right",true,null,"justifyRight",null));
                             addMenuNode(j++,menu[i-1].subMenu, new MenuNode("icon-align-center",5,"Center",true,null,"justifyCenter",null));
                             addMenuNode(j++,menu[i-1].subMenu, new MenuNode("icon-align-justify",6,"Justify",true,null,"justifyFull",null));
                            
                            addMenuNode(i++,menu,new MenuNode("icon-indent-left",7,"Increase Indent",true,null,"indent",null));
                            addMenuNode(i++,menu,new MenuNode("icon-indent-right",7,"Decrease Indent",true,null,"outdent",null));
                            addMenuNode(i++,menu,new MenuNode("icon-list-ul",7,"Bullets",true,null,"insertUnorderedList",null));
                            addMenuNode(i++,menu,new MenuNode("icon-list-ol",7,"Numbering",true,null,"insertOrderedList",null));
                            
                            
                            addMenuNode(i++,menu,new MenuNode("icon-link",8,"Link",true,null,null,new Array()));
                             j=0;
                             addMenuNode(j++,menu[i-1].subMenu, new MenuNode(null,9,"Link",true,null,"createLink",null));
                             addMenuNode(j++,menu[i-1].subMenu, new MenuNode(null,9,"Unlink",true,null,"unlink",null));

                            addMenuNode(i++,menu,new MenuNode("icon-minus",8,"Insert Horizontal Line",true,null,"horizontalLine",null));
                            
                            addMenuNode(i++,menu,new MenuNode("icon-picture",8,"Insert Image",true,null,"insImg",null));
                            
                            addMenuNode(i++,menu,new MenuNode("icon-table",8,"Table",true,null,null,new Array()));
                             j=0;
                             addMenuNode(j++,menu[i-1].subMenu, new MenuNode(null,10,"Insert Table",true,null,"insTable",null));
                             addMenuNode(j++,menu[i-1].subMenu, new MenuNode(null,11,"Add Row Above",true,null,"insRowA",null));
                             addMenuNode(j++,menu[i-1].subMenu, new MenuNode(null,11,"Add Row Below",true,null,"insRowB",null));
                             addMenuNode(j++,menu[i-1].subMenu, new MenuNode(null,11,"Add Column Right",true,null,"insColR",null));
                             addMenuNode(j++,menu[i-1].subMenu, new MenuNode(null,11,"Add Column Left",true,null,"insColL",null));
                             addMenuNode(j++,menu[i-1].subMenu, new MenuNode(null,12,"Delete Row",true,null,"delRow",null));
                             addMenuNode(j++,menu[i-1].subMenu, new MenuNode(null,12,"Delete Column",true,null,"delCol",null));
                             addMenuNode(j++,menu[i-1].subMenu, new MenuNode(null,12,"Delete Table",true,null,"delTable",null));
                            
                            addMenuNode(i++,menu,new MenuNode("icon-twitter",8,"Fore Color",true,null,"foreColor"));
                            addMenuNode(i++,menu,new MenuNode("icon-twitter-sign",8,"Back Color",true,null,"backColor"));
                        }
                        var toolbarHtml = function(){
                            initMenu();
                            var htmlElem = "<div id='bootstrapEditorToolbar' class='navbar navbar-inverse'><div class='navbar-inner'><ul class='nav'>";
                            for(var i=0;i<menu.length;i++)
                            {
                                if(i>0 && menu[i].group != menu[i-1].group)
                                {
                                   htmlElem += appendSeperator(true);
                                }
                                if(menu[i].subMenu)
                                {
                                    var attr = (menu[i].title)?("title='"+ menu[i].title + "' "):"";
                                    htmlElem +='<li class="dropdown" ' + attr + '>';
                                    htmlElem += '<a href="#" class="dropdown-toggle" data-toggle="dropdown"><i class="'+menu[i].icon+'"></i></a>';
                                    htmlElem += '<ul class="dropdown-menu">';
                                    for(var j=0;j<menu[i].subMenu.length;j++)
                                    {
                                        if(j>0 && menu[i].subMenu[j].group != menu[i].subMenu[j-1].group)
                                        {
                                             htmlElem += appendSeperator(false);
                                        }
                                        htmlElem += appendNode(menu[i].subMenu[j],false);    
                                    }
                                    htmlElem += '</ul></li>';
                                }
                                else
                                {
                                    htmlElem += appendNode(menu[i],true);
                                }
                            }
                            htmlElem += "</ul></div></div>";
                            return htmlElem;
                            
                        }
                        this.getToolbar = function()
                        {
                            toolbar = toolbar || $(toolbarHtml());
                            return toolbar;
                        }
                        this.addToElem = function(elem)
                        {
                            elem.append(this.getToolbar());
                            this.getToolbar().on("click","li:not(.divider,.divider-vertical,.dropdown)",function(event){
                                var actionKey = $(this).attr("actionKey");
                                hasFocus = true;
                                this.blur();
                                bootstrapEditorFrame.focus();
                                checkFocusBlurState(true);
                                executeAction.apply(this,[actionKey,$(this)]);
                                return true;
                            });
                        }                          
                        
                     }
    
    var hasFocus = false;
    var lastFocus = false;
    
    var changeFocus = function(){
    		if(lastFocus != hasFocus){
            bootstrapEditor.toggleClass('onfocus',hasFocus);
            if(bootstrapEditorFrame.checkFrameBodyEmpty())
                                   bootstrapEditorFrame.setFrameBodyContent(!hasFocus);              
            lastFocus = hasFocus;
            }
    }
    
    var checkFocusBlurState = function(instant){
        if(!instant){
        setTimeout(function(){
            changeFocus();            
        },200);
        }else{
            changeFocus();
        }
    }
  	this.init = function(elem){
  	    var width = elem.width() || 640;
  	    var height = elem.height() || 340;
  	    
  	    initActionMap();
  	    elem.addClass("bootstrapEditor")
  	    elem.attr("tabindex",'0');
  	    bootstrapEditor = elem;
  	    bootstrapEditor.width(width);
  	    bootstrapEditor.height(height);
  	    
  	    bootstrapEditorToolbar = new BootstrapEditorToolbar();
  	    bootstrapEditorToolbar.addToElem(bootstrapEditor);
  	    bootstrapEditorFrame = new BootstrapEditorFrame("<br>",width,height-bootstrapEditorToolbar.getToolbar().height());
  	    bootstrapEditorFrame.addToElem(bootstrapEditor);
  	    
  	    bootstrapEditor.on("focus",function(e){
  	        hasFocus = true;
  	        this.blur();
  	        bootstrapEditorFrame.focus();
  	    }).on("blur",function(e){
  	        hasFocus = false;
            checkFocusBlurState(false);
        });    
  	}   
  	}    
  	    	
  $.fn.bootstrapEditor = function() {
        var bootstrapEditor = new BootstrapEditor();
        bootstrapEditor.init(this);
  };
})( jQuery );