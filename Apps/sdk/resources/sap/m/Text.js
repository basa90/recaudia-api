/*!
 * UI development toolkit for HTML5 (OpenUI5)
 * (c) Copyright 2009-2016 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(['jquery.sap.global','./library','sap/ui/core/Control'],function(q,l,C){"use strict";var T=C.extend("sap.m.Text",{metadata:{interfaces:["sap.ui.core.IShrinkable"],library:"sap.m",properties:{text:{type:"string",defaultValue:'',bindable:"bindable"},textDirection:{type:"sap.ui.core.TextDirection",group:"Appearance",defaultValue:sap.ui.core.TextDirection.Inherit},wrapping:{type:"boolean",group:"Appearance",defaultValue:true},textAlign:{type:"sap.ui.core.TextAlign",group:"Appearance",defaultValue:sap.ui.core.TextAlign.Begin},width:{type:"sap.ui.core.CSSSize",group:"Dimension",defaultValue:null},maxLines:{type:"int",group:"Appearance",defaultValue:null}}}});T.prototype.normalLineHeight=1.2;T.prototype.cacheLineHeight=true;T.prototype.ellipsis='…';T.hasNativeLineClamp=(function(){return(typeof document.documentElement.style.webkitLineClamp!="undefined");})();T.setNodeValue=function(d,n){n=n||"";var c=d.childNodes;if(c.length===1&&c[0].nodeType===window.Node.TEXT_NODE){c[0].nodeValue=n;}else{d.textContent=n;}};T.prototype.setText=function(t){this.setProperty("text",t,true);var d=this.getTextDomRef();if(d){T.setNodeValue(d,this.getText(true));if(this.getWrapping()){if(t&&!/\s/.test(t)){this.$().addClass("sapMTextBreakWord");}else{this.$().removeClass("sapMTextBreakWord");}}}return this;};T.prototype.getText=function(n){var t=this.getProperty("text");if(n){return t.replace(/\\r\\n|\\n/g,"\n");}return t;};T.prototype.onAfterRendering=function(){if(this.getVisible()&&this.hasMaxLines()&&!this.canUseNativeLineClamp()){this.clampHeight();}};T.prototype.hasMaxLines=function(){return(this.getWrapping()&&this.getMaxLines()>1);};T.prototype.getTextDomRef=function(){if(!this.getVisible()){return null;}if(this.hasMaxLines()){return this.getDomRef("inner");}return this.getDomRef();};T.prototype.canUseNativeLineClamp=function(){if(!T.hasNativeLineClamp){return false;}var d=sap.ui.core.TextDirection;if(this.getTextDirection()==d.RTL){return false;}if(this.getTextDirection()==d.Inherit&&sap.ui.getCore().getConfiguration().getRTL()){return false;}return true;};T.prototype.getLineHeight=function(d){if(this.cacheLineHeight&&this._fLineHeight){return this._fLineHeight;}d=d||this.getTextDomRef();if(!d){return 0;}var s=window.getComputedStyle(d),L=s.lineHeight,f;if(/px$/i.test(L)){f=parseFloat(L);}else if(/^normal$/i.test(L)){f=parseFloat(s.fontSize)*this.normalLineHeight;}else{f=parseFloat(s.fontSize)*parseFloat(L);}if(!sap.ui.Device.browser.firefox){f=Math.floor(f);}if(this.cacheLineHeight&&f){this._fLineHeight=f;}return f;};T.prototype.getClampHeight=function(d){d=d||this.getTextDomRef();return this.getMaxLines()*this.getLineHeight(d);};T.prototype.clampHeight=function(d){d=d||this.getTextDomRef();if(!d){return 0;}var m=this.getClampHeight(d);if(m){d.style.maxHeight=m+"px";}return m;};T.prototype.clampText=function(d,s,e){d=d||this.getTextDomRef();if(!d){return;}var E;var t=this.getText(true);var m=this.getClampHeight(d);s=s||0;e=e||t.length;T.setNodeValue(d,t.slice(0,e));if(d.scrollHeight>m){var S=d.style,h=S.height,a=this.ellipsis,i=a.length;S.height=m+"px";while((e-s)>i){E=(s+e)>>1;T.setNodeValue(d,t.slice(0,E-i)+a);if(d.scrollHeight>m){e=E;}else{s=E;}}if(d.scrollHeight>m&&s>0){E=s;d.textContent=t.slice(0,E-i)+a;}S.height=h;}return E;};T.prototype.getAccessibilityInfo=function(){return{description:this.getText()};};return T;},true);
