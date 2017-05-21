/**
 *  vein.js - version 0.3
 *
 *  by Danny Povolotski (dannypovolotski@gmail.com)
 **/
!function(e,t){if(typeof module!="undefined")module.exports=t();else if(typeof define=="function"&&define.amd)define(e,t);else this[e]=t()}("vein",function(){var e=function(){};var t=function(e){e=e||{};for(var t=1;t<arguments.length;t++){if(!arguments[t])continue;for(var n in arguments[t]){if(arguments[t].hasOwnProperty(n))e[n]=arguments[t][n]}}return e};var n=function(e,t,n){var r=[],i=t[document.all?"rules":"cssRules"],s=e.replace(/\s/g,""),o,u;for(o=0,u=i.length;o<u;o++){if(i[o].selectorText===e||i[o].type===4&&i[o].cssText.replace(/\s/g,"").substring(0,s.length)==s){if(n===null){t.deleteRule(o)}else{r.push(i[o])}}}return r};var r=function(e){cssArray=[];for(property in e){if(e.hasOwnProperty(property)){cssArray.push(property+": "+e[property]+";")}}cssText=cssArray.join("");return cssText};e.getStylesheet=function(){var e=this,t,n;if(!e.element){e.element=document.createElement("style");e.element.setAttribute("type","text/css");e.element.setAttribute("id","vein");document.getElementsByTagName("head")[0].appendChild(e.element);e.stylesheet=e.element}return e.stylesheet};var i=function(e){return e[document.all?"rules":"cssRules"]};var s=function(e,t,n){var r=i(n);if(n.insertRule){n.insertRule(e+"{"+t+"}",r.length)}else{n.addRule(e,t,r.length)}};e.inject=function(e,o,u){u=t({},u);var a=this,f=u.stylesheet||a.getStylesheet(),l=i(f),c,h,p,d,v,m,g,y,b,w;if(typeof e==="string"){e=[e]}for(c=0,h=e.length;c<h;c++){if(typeof e[c]==="object"&&f.insertRule){for(p in e[c]){d=n(p,f,o);if(d.length===0){v=r(o);for(b=0,w=e[c][p].length;b<w;b++){s(p,e[c][p][b]+"{"+v+"}",f)}}else{for(g=0,y=d.length;g<y;g++){a.inject(e[c][p],o,{stylesheet:d[g]})}}}}else{d=n(e[c],f,o);if(o===null)return;if(d.length===0){v=r(o);s(e[c],v,f)}else{for(g=0,y=d.length;g<y;g++){for(m in o){if(o.hasOwnProperty(m)){d[g].style.setProperty(m,o[m],"")}}}}}}return a};return e})