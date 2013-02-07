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
                
                var body = '<form class="form-horizontal" style="height:300px">' + lblInp('No. of rows',['row','rows'],false) + 
                            lblInp('No. of columns',['column','columns'],false) +
                            lblInp('Cell Padding',['cellPadding','padding'],false) +
                            lblInp('Border',getTableBorder('borderWidth','width','borderStyle',['solid','none','double','dotted','dashed'],'borderColor'),true) +
                            '</form>';
                var button = 'Insert', row = null, column = null, borderWidth = null, borderStyle = null, cellPadding=null, borderColor=null;
                var tableModal = getBootstrapModal("bootstrapTableModal",{body:body,button:button, callback:function(){
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
                                   bootstrapEditorFrame.insertNode(tableStr);
                                   var a =  table.getTableProp();
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
                row = $('#row',tableModal).val("");
                column = $('#column',tableModal).val("");
                borderWidth = $("#borderWidth",tableModal).val("");
                (borderStyle = borderStyle || $("#borderStyle",tableModal)).parent().find("li:first").each(function(){repSelNode(this,false);});
                borderColor = $("#borderColor",tableModal).css("background-color","#000");
                cellPadding = $("#cellPadding",tableModal).val("");
                tableModal.modal('show');
            }
            
            var getTableBorder = function(widthId, widthLbl, styleId, styleArr, colorId){
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
            }

            var lblInp = function(lbl,inp,custom){
            	return '<div class="control-group"><label class="control-label">' + lbl + '</label><div class="controls">' + (custom?inp:('<input type="text" id="'+inp[0]+'" placeholder="'+inp[1]+'">')) + '</div></div>';
            }
            var repSelNode = function(elem,flag){
            		var a = $(elem).children('a');
					var b = $(elem).parent().siblings('a');
					var width = (a.width() || a.children().width() || 114)/2;
					var height = (a.height()/2) || (a.children().height()/2) || 8;
					b.css("width",(width + 16) +"px")
					b.html('<div  style="float: left;width:' + width + 'px">' + a.html() + '</div>' + ' <b class="caret" style="margin-left:4px;margin-top:'+height+'px"></b>' + '</div>');
					b.attr("value",a.attr("value"));
            }
			
            var colorPicker = {};
            
            colorPicker.colorCodes = {"Standard Color":["000000","FFFFFF","EEECE1","1F497D","4F81BD","C0504D","9BBB59","8064A2","4BACC6","F79646","C00000","FF0000","FFC000","FFFF00",
            						"92D050","00B050","00B0F0","0070C0","002060","7030A0"],"Other Color":[]};
            colorPicker.createColorPicker = function(elem,title,placement,trigger,callback){
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
				
            }
            colorPicker.hex = function(x) {
					               return ("0" + parseInt(x).toString(16)).slice(-2);
			}
            colorPicker.normalizeColor = function(rgb) {
            			 if(typeof rgb != 'string') return null;
					     if (rgb.search("rgb") == -1 ) {
					          return rgb;
					     } else {
					          rgb = rgb.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d+))?\)$/);
					          var hex = colorPicker.hex;
					          return "#" + hex(rgb[1]) + hex(rgb[2]) + hex(rgb[3]); 
					     }
			}
			colorPicker.initColor = function(tip,color){
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
            var changeColor = function(key,elem,e){
               var fore = actionMap[key].value;
               var cmd = actionMap[key].command || key;
               var obj = $(elem.find("a:first")[0]);
               var tip = obj.data('popover') && obj.data('popover').tip();
               var val = colorPicker.normalizeColor(getCommandValue(cmd)) || (fore?"#000":"#fff");
               if(!tip){
	           tip = colorPicker.createColorPicker(obj,elem.attr("title"),"right","manual",function(color){
						            tip.hide();
						            bootstrapEditorFrame.focus();
						            executeAction.apply(this,[key,elem,e,color]);
						            });
						            
                } 
	            if(e.type=="mouseleave"){
	              tip.hide();
	            }else if(e.type=="mouseenter"){
	                tip.show();
            	}
	            colorPicker.initColor(tip,val);
	        }
    
            var viewHtml = function(){
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
            }
            
            var insImg = function(key,elem,e){
                var body = '<form><fieldset><label>Enter Image URL</label><input type="text" id="imageUrl" placeholder="Image URL"></fieldset></form>';
                var button = 'Insert';
                var imageUrl = null;
                
                var imageModal = getBootstrapModal("bootstrapImageModal",{body:body,button:button,callback:function (){
                                   imageUrl = imageUrl || $('#imageUrl',imageModal);
                                   if($.trim(imageUrl.val()) === "") return;
                                   executeAction.apply(this,[key,elem,e,$.trim(imageUrl.val())]);
                }});
                imageUrl = $('#imageUrl',imageModal).val("http://");
                imageModal.modal('show');
            }
    
            var createLink = function(key,elem,e){
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
                                   var textNode = bootstrapEditorFrame.frameDoc.createTextNode($.trim(text.val()))
                                   bootstrapEditorFrame.replaceText(textNode);
                                   executeAction.apply(this,[key,elem,e,$.trim(address.val())]);
                                }});
                address = $('#address',linkModal).val("http://");
                text = $('#text',linkModal).val(bootstrapEditorFrame.getText());
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
                this.disable = context.disable;
            }
            
            var MenuNode = function(context)
            {
                this.icon = context.icon;
                this.group = context.group;
                this.title = context.title;
                this.wrapContent = context.wrapContent;
                this.action = context.action;
                this.subMenu = context.subMenu;
                this.trigger = context.trigger;
            }
            
            var setting = function(){
            	
            }
            
            var getBootstrapModal = function(id,context)
            {
                if(id in bootstrapModalMap)
                    return bootstrapModalMap[id];
                var htmlStr = '<div id="'+id+'" class="modal hide fade" tabindex="-1">';
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
                bootstrapModalMap[id] = $(htmlStr).on("click","button",function(e){
                   bootstrapModalMap[id].modal('hide');
                   hasFocus = true;
                   bootstrapEditorFrame.focus();
                   checkFocusBlurState(true);
                   if($(this).hasClass('btn-primary')){
                   			context.callback(); 
                   }
                }).on("shown",function(){
                    hasFocus = true;
                    $("textarea:first,input:first",bootstrapModalMap[id]).focus();
                }).appendTo(bootstrapEditor);
                
                if(context.initialize) context.initialize();   
                return bootstrapModalMap[id];
            }
            
            

            var initActionMap = function(){
                
                    //F1-F12 a-z, 0-9, ',' , '.' with ctrl shift alt combination
                    actionMap["bold"] = new Action({tag:["b","strong"],css:{"font-weight":"800"},hotkey:["Ctrl-B"]});
                    actionMap["italic"] = new Action({tag:["i","em"],css:{"font-style":"italic"},hotkey:["Ctrl-I"]});
                    actionMap["underline"] = new Action({tag:["u"],css:{"text-decoration":"underline"},hotkey:["Ctrl-U"]});
                    actionMap["strikeThrough"] = new Action({tag:["s","strike"],css:{"text-decoration":"line-through"},hotkey:["Ctrl-S"]});
                    
                    actionMap["justifyLeft"] = new Action({css:{"text-align":"left"},hotkey:["Ctrl-L"]});
                    actionMap["justifyRight"] = new Action({css:{"text-align":"right"},hotkey:["Ctrl-R"]});
                    actionMap["justifyCenter"] = new Action({css:{"text-align":"center"},hotkey:["Ctrl-E"]});
                    actionMap["justifyFull"] = new Action({css:{"text-align":"justify"},hotkey:["Ctrl-J"]});
                    
                    actionMap["createLink"] = new Action({tag:["a"], hotkey:["Ctrl-K"], execCmd:createLink});
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
                    
                    
                    actionMap["insertImage"] =  new Action({tag:["img"],execCmd:insImg});
                    
                    actionMap["insTable"] = new Action({tag:["table"],execCmd:table.insTable});
                    actionMap["insRowB"] = new Action({val:true,execCmd:table.insRow});
                    actionMap["insRowA"] = new Action({val:false,execCmd:table.insRow});
                    actionMap["insColL"] = new Action({val:false,execCmd:table.insCol});
                    actionMap["insColR"] = new Action({val:true,execCmd:table.insCol});
                    actionMap["delRow"] = new Action({execCmd:table.delRow});
                    actionMap["delCol"] = new Action({execCmd:table.delCol});
                    actionMap["delTable"] = new Action({execCmd:table.delTable});
                    
                    actionMap["viewHtml"] = new Action({execCmd:viewHtml});
                    
                    actionMap["foreColor"] = new Action({val:true,execCmd:changeColor});
                    actionMap["backColor"] = new Action({val:false,execCmd:changeColor});
                    
                    actionMap["setting"] = new Action({execCmd:setting});
                    
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
           var executeAction = function (key,elem,e,val) {
                    var action = actionMap[key];
                    if (!val && action.execCmd) {
                        action.execCmd.apply(this,[key,elem,e]);
                    } else {
                   		try {
                           bootstrapEditorFrame.frameDoc.execCommand((action.command||key), false, (val||action.value));
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
          		var cmd = actionMap[actionKey].command || actionKey;
          		if(cmd && bootstrapEditorFrame.frameDoc.queryCommandState && bootstrapEditorFrame.frameDoc.queryCommandState(cmd)){
          			menuNode.addClass("active");
          		}
          		else{
          			menuNode.removeClass("active");
          		}});
          }
          
          var BootstrapEditorFrame = function(initial,frameWidth,frameHeight){
            var frame = $('<iframe id="bootstrapEditorFrame" frameBorder="0" id="myFrame" style="overflow:hidden"></iframe>');
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
                	 range.deleteContents();
                     var el = document.createElement("div");
           			 el.innerHTML = tableStr;
            		 var frag = bootstrapEditorFrame.frameDoc.createDocumentFragment(), node, lastNode;
			            while ( (node = el.firstChild) ) {
			                lastNode = frag.appendChild(node);
			            }
			         range.insertNode(frag);
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
                   updateBootstrapToolbar((e.target ? e.target : e.srcElement));
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
               var myContent = '<!DOCTYPE html><html><head><style>p{margin:16px 0px}</style></head><body style="overflow-x:hidden;word-wrap:break-word;margin:0px;padding: 0px 6px 0px 6px;"><p style="color:#ccc" id="content-placeholder">Type something...</p></body></html>';
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
                            var trigger = menuNode.trigger?("trigger='" + menuNode.trigger +"' "):"";
                            var attr = (menuNode.title)?("title='"+ menuNode.title + (menuNode.action && actionMap[menuNode.action].hotkey?" (" + actionMap[menuNode.action].hotkey[0] + ")":"") + "' "):"";
                            var str = hori?('<i class="'+menuNode.icon+'"></i>'):('<i>'+menuNode.title+'</i>');
                            str = menuNode.wrapContent?$(str).wrap("<div>" + menuNode.wrapContent + "</div>").parents().last().html():str;
                            var ret = "<li " + actionKey + trigger + attr +  ">";
                            ret += '<a href="#">'+str+'</a>';
                            ret += "</li>";
                            return ret;
                        }
                        var initMenu = function(){
                            var i,j,subMenu;
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
                        var execElem = function(elem,e){
                        	var actionKey = $(elem).attr("actionKey");
                            hasFocus = true;
                            elem.blur();
                            bootstrapEditorFrame.focus();
                            checkFocusBlurState(true);
                            executeAction.apply(elem,[actionKey,$(elem),e]);
                            return true;
                        }
                        this.addToElem = function(elem)
                        {
                            elem.append(this.getToolbar());
                            this.getToolbar().on("click","li[trigger!='hover']:not(.divider,.divider-vertical,.dropdown)",function(e){
                                return execElem(this,e);
                            }).on("hover","li[trigger='hover']:not(.divider,.divider-vertical,.dropdown)",function(e){
                            	var actionKey = $(this).attr("actionKey");
				            	executeAction.apply(this,[actionKey,$(this),e]);
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