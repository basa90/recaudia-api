/*!
 * UI development toolkit for HTML5 (OpenUI5)
 * (c) Copyright 2009-2016 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(['jquery.sap.global','./TableExtension','sap/ui/core/delegate/ItemNavigation','./TableUtils','./TableKeyboardDelegate'],function(q,T,I,a,b){"use strict";var c={_forward:function(t,o){var i=t._getItemNavigation();if(i&&!t._getKeyboardExtension()._itemNavigationSuspended&&!o.isMarked("sapUiTableSkipItemNavigation")){i["on"+o.type](o);}},onfocusin:function(o){c._forward(this,o);},onsapfocusleave:function(o){c._forward(this,o);},onmousedown:function(o){c._forward(this,o);},onsapnext:function(o){c._forward(this,o);},onsapnextmodifiers:function(o){c._forward(this,o);},onsapprevious:function(o){c._forward(this,o);},onsappreviousmodifiers:function(o){c._forward(this,o);},onsappageup:function(o){c._forward(this,o);},onsappagedown:function(o){c._forward(this,o);},onsaphome:function(o){c._forward(this,o);},onsaphomemodifiers:function(o){c._forward(this,o);},onsapend:function(o){c._forward(this,o);},onsapendmodifiers:function(o){c._forward(this,o);},onsapkeyup:function(o){c._forward(this,o);}};var E={onfocusin:function(o){var f=this._getKeyboardExtension();if(!f._bIgnoreFocusIn){f.initItemNavigation();if(d.isItemNavigationInvalid(this)){o.setMarked("sapUiTableInitItemNavigation");}}else{o.setMarked("sapUiTableIgnoreFocusIn");}if(o.target&&o.target.id===this.getId()+"-rsz"){o.preventDefault();o.setMarked("sapUiTableSkipItemNavigation");}}};var d={_initItemNavigation:function(o){var t=o.getTable();var $=t.$();var C=a.getVisibleColumnCount(t);var f=C;var h=a.hasRowHeader(t);var g=[];if(t.getFixedColumnCount()==0){g=$.find(".sapUiTableCtrl td[tabindex]").get();}else{var j=$.find('.sapUiTableCtrlFixed.sapUiTableCtrlRowFixed');var k=$.find('.sapUiTableCtrlScroll.sapUiTableCtrlRowFixed');var l=$.find('.sapUiTableCtrlFixed.sapUiTableCtrlRowScroll');var m=$.find('.sapUiTableCtrlScroll.sapUiTableCtrlRowScroll');var n=$.find('.sapUiTableCtrlFixed.sapUiTableCtrlRowFixedBottom');var p=$.find('.sapUiTableCtrlScroll.sapUiTableCtrlRowFixedBottom');for(var i=0;i<t.getVisibleRowCount();i++){g=g.concat(j.find('tr[data-sap-ui-rowindex="'+i+'"]').find('td[tabindex]').get());g=g.concat(k.find('tr[data-sap-ui-rowindex="'+i+'"]').find('td[tabindex]').get());g=g.concat(l.find('tr[data-sap-ui-rowindex="'+i+'"]').find('td[tabindex]').get());g=g.concat(m.find('tr[data-sap-ui-rowindex="'+i+'"]').find('td[tabindex]').get());g=g.concat(n.find('tr[data-sap-ui-rowindex="'+i+'"]').find('td[tabindex]').get());g=g.concat(p.find('tr[data-sap-ui-rowindex="'+i+'"]').find('td[tabindex]').get());}}var r=g.length;if(h){var R=$.find(".sapUiTableRowHdr").get();for(var i=R.length-1;i>=0;i--){g.splice(i*C,0,R[i]);r++;}r--;f++;}if(t.getColumnHeaderVisible()){var H=[];var F=$.find(".sapUiTableColHdrFixed").children();var s=$.find(".sapUiTableColHdrScr").children();for(var i=0;i<a.getHeaderRowCount(t);i++){if(h){H.push(t.getDomRef("selall"));}if(F.length){H=H.concat(q(F.get(i)).find(".sapUiTableCol").get());}if(s.length){H=H.concat(q(s.get(i)).find(".sapUiTableCol").get());}}g=H.concat(g);}if(!o._itemNavigation){o._itemNavigation=new I();o._itemNavigation.setTableMode(true);o._itemNavigation.attachEvent(I.Events.AfterFocus,function(u){var v=a.getFocusedItemInfo(t);v.header=a.getHeaderRowCount(t);v.domRef=null;if(v.row>=v.header){o._oLastFocusedCellInfo=v;}},t);}o._itemNavigation.setColumns(f);o._itemNavigation.setRootDomRef($.find(".sapUiTableCnt").get(0));o._itemNavigation.setItemDomRefs(g);o._itemNavigation.setFocusedIndex(d.getInitialItemNavigationIndex(o));o._itemNavigationInvalidated=false;},getInitialItemNavigationIndex:function(o){return a.hasRowHeader(o.getTable())?1:0;},isItemNavigationInvalid:function(o){return!o._itemNavigation||o._itemNavigationInvalidated;}};var e=T.extend("sap.ui.table.TableKeyboardExtension",{_init:function(t,s,S){this._itemNavigation=null;this._itemNavigationInvalidated=false;this._itemNavigationSuspended=false;this._type=s;this._delegate=new b(s);this._actionMode=false;t.addEventDelegate(E,t);t.addEventDelegate(this._delegate,t);t.addEventDelegate(c,t);var f=this;t._getItemNavigation=function(){return f._itemNavigation;};return"KeyboardExtension";},_debug:function(){this._ExtensionHelper=d;this._ItemNavigationDelegate=c;this._ExtensionDelegate=E;},destroy:function(){var t=this.getTable();if(t){t.removeEventDelegate(E);t.removeEventDelegate(this._delegate);t.removeEventDelegate(c);}if(this._itemNavigation){this._itemNavigation.destroy();this._itemNavigation=null;}if(this._delegate){this._delegate.destroy();this._delegate=null;}T.prototype.destroy.apply(this,arguments);}});e.prototype.initItemNavigation=function(){if(d.isItemNavigationInvalid(this)){d._initItemNavigation(this);}};e.prototype.invalidateItemNavigation=function(){this._itemNavigationInvalidated=true;};e.prototype.setActionMode=function(A,o){if(A&&!this._actionMode&&this._delegate.enterActionMode){this._actionMode=!!this._delegate.enterActionMode.apply(this.getTable(),[o||{}]);}else if(!A&&this._actionMode&&this._delegate.leaveActionMode){this._actionMode=false;this._delegate.leaveActionMode.apply(this.getTable(),[o||{}]);}};e.prototype.isInActionMode=function(){return this._actionMode;};e.prototype.updateNoDataAndOverlayFocus=function(p){var t=this.getTable();if(!t||!t.getDomRef()){return;}if(t.getShowOverlay()){if(q.sap.containsOrEquals(t.getDomRef(),p)){t.$("overlay").focus();}}else if(a.isNoDataVisible(t)){if(q.sap.containsOrEquals(t.getDomRef("sapUiTableCnt"),p)){t.$("noDataCnt").focus();}}else if(q.sap.containsOrEquals(t.getDomRef("noDataCnt"),p)||q.sap.containsOrEquals(t.getDomRef("overlay"),p)){a.focusItem(t,d.getInitialItemNavigationIndex(this));}};e.prototype._suspendItemNavigation=function(){this._itemNavigationSuspended=true;};e.prototype._resumeItemNavigation=function(){this._itemNavigationSuspended=false;};e.prototype._getLastFocusedCellInfo=function(){var h=a.getHeaderRowCount(this.getTable());if(!this._oLastFocusedCellInfo||this._oLastFocusedCellInfo.header!=h){var i=a.getFocusedItemInfo(this.getTable());var D=d.getInitialItemNavigationIndex(this);return{cellInRow:D,row:h,header:h,cellCount:i.cellCount,columnCount:i.columnCount,cell:i.columnCount*h+D};}return this._oLastFocusedCellInfo;};e.prototype._setSilentFocus=function(r){this._bIgnoreFocusIn=true;r.focus();this._bIgnoreFocusIn=false;};e.prototype._getTableType=function(){return this._type;};return e;},true);
