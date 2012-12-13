/* ===================================================
 * bootstrap-editor.js v0.1
 * Rich Editor
 * ===================================================
 * Copyright (c) 2012 Sanket Bajoria
 * https://github.com/sanketbajoria/BootstrapEditor
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
    
            table.insertTable = function(){
                
                var body = '<form><fieldset><label>No. of rows</label><input type="text" id="row" placeholder="rows"><label>No. of columns</label>' +
                            '<input type="text" id="column" placeholder="columns"></fieldset></form>';
                var button = 'Insert', row = null, column = null;
                var tableModal = getBootstrapModal("bootstrapTableModal",null,body,button, function(){
                                   row = row || $('#row',tableModal);
                                   column = column || $('#column',tableModal);
                                   tableModal.modal('hide');
                                   bootstrapEditorFrame.focus();
                                   if(parseInt(row.val().trim())<=0 || parseInt(column.val().trim())<=0)
                                        return;
                                   var tableStr = "<table id='test' cellspacing=0 cellpadding=0 border=1 style='border-color: #ccc'>";
                                   for(var i=0;i<parseInt(row.val().trim());i++)
                                   {
                                       tableStr += "<tr>";
                                       for(var j=0;j<parseInt(column.val().trim());j++)
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
            
            
            table.deleteTable = function(){
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
            table.insertRow = function(below){
               var tableProp = table.getTableProp();
               if(tableProp && tableProp.rowIndex>=0){
               var row = tableProp.node.insertRow(below?tableProp.rowIndex+1:tableProp.rowIndex);
                  for(var i=0;i<tableProp.colLen;i++){
                    var cell = row.insertCell(i);
                    cell.innerHTML = "&nbsp;";
                  }
               }
            }
            
            table.deleteRow = function(){
               var tableProp = table.getTableProp();
               if(tableProp==null) return;
               if(tableProp.rowLen==1){
                   table.deleteTable();
                   return;
               }
               if(tableProp.rowIndex>=0 && tableProp.rowIndex<tableProp.rowLen){
                   var sibling = $(tableProp.node.rows[tableProp.rowIndex]).siblings("tr");
                   tableProp.node.deleteRow(tableProp.rowIndex);
                   bootstrapEditorFrame.selectNode(sibling[tableProp.rowIndex<tableProp.rowLen-1?tableProp.rowIndex:tableProp.rowIndex-1].cells[tableProp.colIndex>=0?tableProp.colIndex:0],true);
               }
            }
            table.deleteCol = function(){
               var tableProp = table.getTableProp();
               if(tableProp==null) return;
               if(tableProp.colIndex>=0 && tableProp.colIndex<tableProp.colLen){
                   if(tableProp.colLen==1){
                       table.deleteTable();
                       return;
                   }
                   var sibling = $(tableProp.node.rows[tableProp.rowIndex].cells[tableProp.colIndex]).siblings("td");
                   for(var i=0;i<tableProp.rowLen;i++){
                     tableProp.node.rows[i].deleteCell(tableProp.colIndex);
                  }
                  bootstrapEditorFrame.selectNode(sibling[tableProp.colIndex<tableProp.colLen-1?tableProp.colIndex:tableProp.colIndex-1],true);
               }
            }
            
            table.insertCol = function(right){
               var tableProp = table.getTableProp();
               if(tableProp && tableProp.colIndex>=0){
               for(var i=0;i<tableProp.rowLen;i++){
                    var cell = tableProp.node.rows[i].insertCell(right?tableProp.colIndex+1:tableProp.colIndex);
                    cell.innerHTML = "&nbsp;";
                  }
               }
               
            }
            table.insertRowBelow = function(){
                table.insertRow(true);
            }
            table.insertRowAbove = function(){
                table.insertRow(false);
            }
            table.insertColLeft = function(){
                table.insertCol(false);
            }
            table.insertColRight = function(){
                table.insertCol(true);
            }
            
            var viewHtml = function(){
                var body = '<form><fieldset><label>HTML Source Editor</label><textarea id="htmlSource" rows="15" style="width:100%"></textarea></fieldset></form>';
                var button = 'Update';
                var htmlSource = null;
                var htmlModal = getBootstrapModal("bootstrapHtmlModal",null,body,button,function (){
                                   htmlSource = htmlSource || $('#htmlSource',htmlModal);
                                   htmlModal.modal('hide');
                                   bootstrapEditorFrame.focus();
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
            
             
            var insertImage = function(){
                var body = '<form><fieldset><label>Enter Image URL</label><input type="text" id="imageUrl" placeholder="Image URL"></fieldset></form>';
                    
                var button = 'Insert';
                var imageUrl = null;
                
                var imageModal = getBootstrapModal("bootstrapImageModal",null,body,button,function (){
                                   imageUrl = imageUrl || $('#imageUrl',imageModal);
                                   imageModal.modal('hide');
                                   bootstrapEditorFrame.focus();
                                   if(imageUrl.val().trim() === "") return;
                                   bootstrapEditorFrame.frameDoc.execCommand("insertImage", false, imageUrl.val().trim());
                 
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
                                   linkModal.modal('hide');
                                   bootstrapEditorFrame.focus();
                                   if(address.val().trim() === "" || text.val().trim() === "") return;
                                   var textNode = bootstrapEditorFrame.frameDoc.createTextNode(text.val().trim())
                                   bootstrapEditorFrame.replaceText(textNode);
                                   bootstrapEditorFrame.frameDoc.execCommand("createLink", false, address.val().trim());
                 
                                });
                address = $('#address',linkModal);
                text = $('#text',linkModal);
                address.val("http://");
                text.val(bootstrapEditorFrame.getText());              
                linkModal.modal('show');
            }        
            var Action = function(command, value, tags, css, hotkey, execCmd)
            {
                this.command = command;
                this.value = value;
                this.tags = tags;
                this.css = css;
                this.hotkey = hotkey;
                this.execCmd = execCmd;
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
                bootstrapModalMap[id] = $(htmlStr).on("click","button.btn-primary",function(e){
                   callback(); 
                }).on("shown",function(){
                    hasFocus = true;
                    $("textarea:first,input:first",bootstrapModalMap[id]).focus();
                });   
                return bootstrapModalMap[id];
            }

            var initActionMap = function(){
                
                    //F1-F12 a-z, 0-9, ',' , '.' with ctrl shift alt combination
                    actionMap["bold"] = new Action("bold", null, ["b","strong"],{"font-weight":"800"},["Ctrl-B"],null);
                    actionMap["italic"] = new Action("italic", null, ["i","em"],{"font-style":"italic"},["Ctrl-I"],null);
                    actionMap["underline"] = new Action("underline", null, ["u"],{"text-decoration":"underline"},["Ctrl-U"],null);
                    actionMap["strikeThrough"] = new Action("strikeThrough", null, ["s","strike"],{"text-decoration":"line-through"},["Ctrl-S"],null);
                    
                    actionMap["justifyLeft"] = new Action("justifyLeft", null, null,{"text-align":"left"},["Ctrl-L"],null);
                    actionMap["justifyRight"] = new Action("justifyRight", null, null,{"text-align":"right"},["Ctrl-R"],null);
                    actionMap["justifyCenter"] = new Action("justifyCenter", null, null,{"text-align":"center"},["Ctrl-E"],null);
                    actionMap["justifyFull"] = new Action("justifyFull", null, null,{"text-align":"justify"},["Ctrl-J"],null);
                    
                    actionMap["createLink"] = new Action("createLink", null, ["a"], null, ["Ctrl-K"], createLink);
                    actionMap["unlink"] = new Action("unlink",null,null,null,null,null);
                    
                    actionMap["indent"] =  new Action("indent",null,null,null,null,null);
                    actionMap["outdent"] =  new Action("outdent",null,null,null,null,null);
                    
                    actionMap["insertOrderedList"] =  new Action("insertOrderedList",null,["ol"],null,null,null);
                    actionMap["insertUnorderedList"] =  new Action("insertUnorderedList",null,["ul"],null,null,null);
                    
                    actionMap["paragraph"] =  new Action("FormatBlock",(($.browser.msie||$.browser.webkit)?"<p>":"p"),["p"],null,null,null);
                    for(var i=1;i<=6;i++)
                    {
                        actionMap["h"+i] = new Action((($.browser.msie||$.browser.webkit)?"FormatBlock":"heading"),(($.browser.msie||$.browser.webkit)?"<h"+i+">":"h"+i),["h"+i],null,null,null);
                    }
                    actionMap["horizontalLine"] = new Action("insertHorizontalRule",null,["hr"],null,null,null);
                    
                    
                    actionMap["insertImage"] =  new Action("insertImage",null,["img"],null,null,insertImage);
                    
                    actionMap["insertTable"] = new Action(null,null,["table"],null,null,table.insertTable);
                    actionMap["insertRowBelow"] = new Action(null,null,null,null,null,table.insertRowBelow);
                    actionMap["insertRowAbove"] = new Action(null,null,null,null,null,table.insertRowAbove);
                    actionMap["insertColLeft"] = new Action(null,null,null,null,null,table.insertColLeft);
                    actionMap["insertColRight"] = new Action(null,null,null,null,null,table.insertColRight);
                    actionMap["deleteRow"] = new Action(null,null,null,null,null,table.deleteRow);
                    actionMap["deleteCol"] = new Action(null,null,null,null,null,table.deleteCol);
                    actionMap["deleteTable"] = new Action(null,null,null,null,null,table.deleteTable);
                    
                    actionMap["viewHtml"] = new Action(null,null,null,null,null,viewHtml);
                    
                    
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

           var executeAction = function (actionKey) {
                    var action = actionMap[actionKey];
                    if (action.execCmd) {
                        action.execCmd.apply(this);
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
          		if(cmd && bootstrapEditorFrame.frameDoc.queryCommandState && bootstrapEditorFrame.frameDoc.queryCommandState(cmd))
          		{
          			menuNode.addClass("active");
          		}
          		else
          		{
          			menuNode.removeClass("active");
          		}
          		});
          		
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
            
            this.getFrame = function(){
                return frame;
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
            
            this.changeSelection = function(elemToSelect){
                if (frame[0].contentWindow.getSelection) {  
                var selection = frame[0].contentWindow.getSelection ();
                var rangeToSelect = this.frameDoc.createRange ();
                rangeToSelect.selectNodeContents (elemToSelect);
                selection.removeAllRanges ();
                selection.addRange (rangeToSelect);
                } else {
                if (this.frameDoc.body.createTextRange) {    
                    var rangeToSelect = this.frameDoc.body.createTextRange ();
                    rangeToSelect.moveToElementText (elemToSelect);
                    rangeToSelect.select ();
                }
            }
            }
            this.checkFrameBodyEmpty = function(){
                var tokens = $(instance.frameDoc.body).children("*:not(#content-placeholder)");
                return tokens.length==0 || (tokens.length==1 && $(tokens[0]).find("ol,ul,li,hr,img").length == 0 && !($(tokens[0]).text()));
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
                                executeAction(hotkeyMap[hotkey]);
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
                checkFocusBlurState();
            }).on("blur",function(){
               hasFocus = false;
               checkFocusBlurState();
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
                        var addMenuNode=function(index,arr,menuNode)
                        {
                            arr[index] = menuNode;
                        }
                        var appendSeperator = function(vertical)
                        {
                            var className = "class='" + (vertical?"divider-vertical":"divider") + "'";
                            return "<li "+className+"></li>";
                        }
                            
                        var appendNode = function(menuNode,hori)
                        {
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
                            
                            addMenuNode(i++,menu,new MenuNode("icon-picture",8,"Insert Image",true,null,"insertImage",null));
                            
                            addMenuNode(i++,menu,new MenuNode("icon-table",8,"Table",true,null,"insertTable",new Array()));
                             j=0;
                             addMenuNode(j++,menu[i-1].subMenu, new MenuNode(null,10,"Insert Table",true,null,"insertTable",null));
                             addMenuNode(j++,menu[i-1].subMenu, new MenuNode(null,11,"Add Row Above",true,null,"insertRowAbove",null));
                             addMenuNode(j++,menu[i-1].subMenu, new MenuNode(null,11,"Add Row Below",true,null,"insertRowBelow",null));
                             addMenuNode(j++,menu[i-1].subMenu, new MenuNode(null,11,"Add Column Right",true,null,"insertColRight",null));
                             addMenuNode(j++,menu[i-1].subMenu, new MenuNode(null,11,"Add Column Left",true,null,"insertColLeft",null));
                             addMenuNode(j++,menu[i-1].subMenu, new MenuNode(null,12,"Delete Row",true,null,"deleteRow",null));
                             addMenuNode(j++,menu[i-1].subMenu, new MenuNode(null,12,"Delete Column",true,null,"deleteCol",null));
                             addMenuNode(j++,menu[i-1].subMenu, new MenuNode(null,12,"Delete Table",true,null,"deleteTable",null));
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
                                checkFocusBlurState();
                                this.blur();
                                bootstrapEditorFrame.focus();
                                
                                executeAction(actionKey);
                                return true;
                            });
                            
                            this.getToolbar().on("focus",function(){
                                                              hasFocus = true;
                                                        })
                            this.getToolbar().on("blur",function(){
                                                              hasFocus = false;
                                                              checkFocusBlurState();
                                                        })
                        }                          
                        
                     }
    
    var hasFocus = false;
    var lastFocus = false;
    
    var checkFocusBlurState = function()
    {
        setTimeout(function(){
            if(lastFocus != hasFocus){
            if(hasFocus){
               bootstrapEditor.addClass('onfocus');
               if(bootstrapEditorFrame.checkFrameBodyEmpty())
                                   bootstrapEditorFrame.setFrameBodyContent(false);              
                
            }
            else{
               bootstrapEditor.removeClass('onfocus');
               if(bootstrapEditorFrame.checkFrameBodyEmpty())
                                   bootstrapEditorFrame.setFrameBodyContent(true);
            }
            lastFocus = hasFocus;
            }
            
        },100);
    }
  	this.init = function(elem)
  	{
  	    var width = elem.width() || 640;
  	    var height = elem.height() || 340;
  	    
  	    initActionMap();
  	    elem.addClass("bootstrapEditor")
  	    elem.attr("tabindex",'0');
  	    bootstrapEditor = elem;
  	    bootstrapEditor.width(width);
  	    bootstrapEditor.height(height);
  	    
  	    //elem.hide().before(bootstrapEditor);
  	    
  	    bootstrapEditorToolbar = new BootstrapEditorToolbar();
  	    bootstrapEditorToolbar.addToElem(bootstrapEditor);
  	    bootstrapEditorFrame = new BootstrapEditorFrame("<br>",width,height-bootstrapEditorToolbar.getToolbar().height());
  	    bootstrapEditorFrame.addToElem(bootstrapEditor);
  	    
  	    bootstrapEditor.on("focus",function(e){
  	        hasFocus = true;
  	        this.blur();
  	        bootstrapEditorFrame.focus();
  	    });
  	    bootstrapEditor.on("blur",function(e){
  	        hasFocus = false;
            checkFocusBlurState();
        });    
  	}   
  	}    
  	    	
  $.fn.bootstrapEditor = function() {
        var bootstrapEditor = new BootstrapEditor();
        bootstrapEditor.init(this);
  };
})( jQuery );