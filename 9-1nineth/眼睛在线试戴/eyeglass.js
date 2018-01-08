/*
* @Author: Administrator
* @Date:   2018-01-06 15:51:39
* @Last Modified by:   Administrator
* @Last Modified time: 2018-01-08 20:30:20
*/
var mySpace = {};

mySpace.$ = function(id) {
  return typeof id === "object" ? id : document.getElementById(id)
};

mySpace.$$ = function(tagName, oParent) {
  return (oParent || document).getElementsByTagName(tagName)
};

mySpace.$$$ = function(className, tagName, oParent) {
  var reg = new RegExp("(^|\\s)" + className + "(\\s|$)"),
    aEl = mySpace.$$(tagName || "*", oParent)
    len = aEl.length,
    aClass = [],
    i = 0;
  for(;i < len; i++) reg.test(aEl[i].className) && aClass.push(aEl[i]);
  return aClass
};

mySpace.index = function(element) {
  var aChild = element.parentNode.children;
  for(var i = aChild.length; i--;)
    if(element == aChild[i]) return i
};

mySpace.css = function(element, attr, value) {
  if(arguments.length == 2) {
    var style = element.style,
      currentStyle = element.currentStyle;
    if(typeof attr === "string")
      return parseFloat(currentStyle ? currentStyle[attr] : getComputedStyle(element, null)[attr])
    for(var property in attr)
      property == "opacity" ? (style.filter = "alpha(opacity=" + attr[property] + ")", style.opacity = attr[property] / 100) : style[property] = attr[property]
  }
  else if(arguments.length == 3) {
    switch(attr) {
      case "width":
      case "height":
      case "paddingTop":
      case "paddingRight":
      case "paddingBottom":
      case "paddingLeft":
        value = Math.max(value, 0);
      case "top":
      case "right":
      case "bottom":
      case "left":
      case "marginTop":
      case "marginRigth":
      case "marginBottom":
      case "marginLeft":
        element.style[attr] = value + "px";
        break;
      case "opacity":
        element.style.filter = "alpha(opacity=" + value + ")";
        element.style.opacity = value / 100;
        break;
      default:
        element.style[attr] = value
    }
  }
};

mySpace.attr = function(element, attr, value) {
  if(arguments.length == 2) {
    return element.attributes[attr] ? element.attributes[attr].nodeValue : undefined
  }
  else if(arguments.length == 3) {
    element.setAttribute(attr, value)
  }
};

mySpace.contains = function(element, oParent) {
  if(oParent.contains) {
    return oParent.contains(element)
  }
  else if(oParent.compareDocumentPosition) {
    return !!(oParent.compareDocumentPosition(element) & 16)
  }
};

mySpace.isParent = function(element, tagName) {
  while(element != undefined && element != null && element.tagName.toUpperCase() !== "BODY") {
    if(element.tagName.toUpperCase() == tagName.toUpperCase())
      return true;
    element = element.parentNode;
  }
  return false
};

mySpace.extend = function(destination, source) {
  for (var property in source) destination[property] = source[property];
  return destination
};

mySpace.ajax = function(config) {
  var oAjax = null,
  config = mySpace.extend({
    cache: !0,
    param: "",
    type: "GET",
    success: function() {}
  },
  config);
  config.url += config.param && "?" + config.param;
  if (config.cache === !1) {
    var timestamp = (new Date).getTime(),
    re = config.url.replace(/([?&])_=[^&]*/, "$1_=" + timestamp);
    config.url = re + (config.url === re ? (/\?/.test(config.url) ? "&": "?") + "_=" + timestamp: "")
  }
  oAjax = window.XMLHttpRequest ? new XMLHttpRequest: new ActiveXObject("Microsoft.XMLHTTP");
  oAjax.onreadystatechange = function() {
    oAjax.readyState === 4 && oAjax.status === 200 && config.success(oAjax.responseText)
  };
  oAjax.open(config.type, config.url, !0);
  config.type.toUpperCase() === "POST" && oAjax.setRequestHeader("Content-type","application/x-www-form-urlencoded");
  oAjax.send(config.type.toUpperCase() === "POST" && config.param || null)
};

mySpace.animate = function(obj, json, opt) {
  clearInterval(obj.timer);
  obj.iSpeed = 0;
  opt = mySpace.extend({
    type: "buffer",
    callback: function() {}
  }, opt);
  obj.timer = setInterval(function() {
    var iCur = 0,
      complete = !0,
      property = null,
      maxSpeed = 30;
    for(property in json) {
      iCur = mySpace.css(obj, property);
      property == "opacity" && (iCur = parseInt(iCur.toFixed(2) * 100));
      switch(opt.type) {
        case "buffer":
          obj.iSpeed = (json[property] - iCur) / 5;
          obj.iSpeed = obj.iSpeed > 0 ? Math.ceil(obj.iSpeed) : Math.floor(obj.iSpeed);
          json[property] == iCur || (complete = !1, mySpace.css(obj, property, property == "zIndex" ? iCur + obj.iSpeed || iCur * -1 : iCur + obj.iSpeed));
          break;
        case "flex":
          obj.iSpeed += (json[property] - iCur) / 5;
          obj.iSpeed *= 0.7;
          obj.iSpeed = Math.abs(obj.iSpeed) > maxSpeed ? obj.iSpeed > 0 ? maxSpeed : -maxSpeed : obj.iSpeed;
          Math.abs(json[property] - iCur) <=1 && Math.abs(obj.iSpeed) <= 1 || (complete = !1, mySpace.css(obj, property, iCur + obj.iSpeed));
          break;
      }
    }
    if(complete) {
      clearInterval(obj.timer);
      if(opt.type == "flex") for(property in json) mySpace.css(obj, property, json[property]);
      opt.callback.apply(obj, arguments);
    }
  }, 30)
};

function complete() {
  var oBox = mySpace.$("box"),
    oLeft = mySpace.$("left"),
    oTools = mySpace.$("tools"),
    oPhoto = null,
    oGlass = null,
    oNormal = mySpace.$$$("normal")[0],
    oActive = mySpace.$$$("active")[0],
    oContent = mySpace.$$$("content")[0],
    oRight = mySpace.$("right"),
    oLMask = mySpace.$$$("mask", "div", oLeft)[0],
    oRMask = mySpace.$$$("mask", "div", oRight)[0],
    oGlassList = mySpace.$$$("glassList")[0],
    zIndex = 0;

  //事件委托
  oBox.onclick = function(e) {
    e = e || event;
    var oTarget = e.target || e.srcElement;

    //筛选
    (function() {
      if(oTarget.tagName.toUpperCase() === "A" && mySpace.contains(oTarget, oNormal)) {
        var oUl = mySpace.$$("ul", oActive)[0],
          iW = oActive.offsetWidth,
          iL = oTarget.parentNode.offsetLeft - mySpace.css(oActive, "marginLeft"),
          maxH = mySpace.css(oActive, "height"),
          minH = mySpace.css(oActive, "lineHeight");
        mySpace.animate(oActive, {height:minH}, {
          callback: function() {
            mySpace.animate(oUl, {left:-iL});
            mySpace.animate(oActive, {left:iL}, {
              callback: function() {
                mySpace.animate(oActive, {height:maxH}, {
                  callback: function() {
                    var i = 0,
                      aLi = mySpace.$$("li", oContent),
                      sType = mySpace.attr(oTarget, "data-type"),
                      aType = function() {
                        if(sType === "*") {
                          for(var i = aLi.length, a = []; i--;) a[i] = i;
                          return a
                        }
                        return sType.split(",")
                      }();
                    for(i = aLi.length; i--;) mySpace.css(aLi[i], {opacity:20}), aLi[i].className = "hidden";
                    for(i = aType.length; i--;) mySpace.animate(aLi[aType[i]], {opacity:100}), aLi[aType[i]].className = "active"
                  }
                })
              }
            })
          }
        })
      }
    })();

    //模特选择
    if(oTarget.tagName.toUpperCase() === "IMG" && oTarget.parentNode.className !== "hidden" && mySpace.contains(oTarget, oContent)) {
      mySpace.animate(oLMask, {opacity:100, zIndex:1}, {
        callback: function() {
          oPhoto = document.createElement("img");
          oPhoto.src = oTarget.src.replace("model", "big");
          oPhoto.className = "photo";
          oLeft.insertBefore(oPhoto, oLMask);
          mySpace.animate(oPhoto, {width:428, height:526, top:0, left:0}, {
            callback: function() {
              mySpace.animate(oTools, {top:8, left:385}, {
                callback: function() {
                  mySpace.animate(oRMask, {opacity:0, zIndex:-1})
                }
              })
            }
          })
        }
      })
    }

    //工具条
    (function() {
      var count = 0;
      switch(oTarget.className) {
        case "open":
          oTarget.className = "close";
          oTarget.innerHTML = "\u5c55\u5f00";
          mySpace.animate(oTools, {height:33});
          break;
        case "close":
          oTarget.className = "open";
          oTarget.innerHTML = "\u6536\u7f29";
          mySpace.animate(oTools, {height:173});
          break;
        case "reset":
          oGlass && oGlass.parentNode.removeChild(oGlass), oGlass = null;
          mySpace.animate(oRMask, {opacity:70, zIndex:++zIndex});
          mySpace.animate(oPhoto, {left:-530}, {
            callback: function() {
              this.parentNode.removeChild(this);
              ++count == 2 && mySpace.animate(oLMask, {opacity:0, zIndex:-1})
            }
          });
          mySpace.animate(oTools, {top:-30, left:-55}, {
            callback: function() {
              ++count == 2 && mySpace.animate(oLMask, {opacity:0, zIndex:-1})
            }
          });
          break;
      }
    })();

    //眼镜选择
    (function() {
      var oImg = null,
        aLI = null,
        i = 0;
      if(mySpace.contains(oTarget, oGlassList) && mySpace.isParent(oTarget, "li")) {
        for(aLi = mySpace.$$("li", oGlassList), i = aLi.length; i--;) aLi[i].className = "";
        oGlass && oGlass.parentNode.removeChild(oGlass), oGlass = null;
        oGlass = document.createElement("div");
        oImg = document.createElement("img");
        oImg.src = function() {
          switch(oTarget.tagName.toUpperCase()) {
            case "IMG":
              oTarget.parentNode.className = "current";
              return oTarget.src.replace(".jpg", ".png");
              break;
            case "LI":
              oTarget.className = "current";
              return mySpace.$$("img", oTarget)[0].src.replace(".jpg", ".png");
              break;
            default:
              oTarget.parentNode.className = "current";
              return mySpace.$$("img", oTarget.parentNode)[0].src.replace(".jpg", ".png")
          }
        }();
        oGlass.className = "glass";
        oGlass.appendChild(oImg);
        oLeft.insertBefore(oGlass, oPhoto);

        //眼镜拖动
        oGlass.onmousedown = function(e) {
          e = e || event;
          var disX = e.clientX - this.offsetLeft;
          var disY = e.clientY - this.offsetTop;
          document.onmousemove = function(e) {
            e = e || event;
            var iL = e.clientX - disX;
            var iT = e.clientY - disY;
            var maxL = oPhoto.offsetWidth - oGlass.offsetWidth;
            var maxT = oPhoto.offsetHeight - oGlass.offsetHeight;
            iL < 0 && (iL = 0);
            iT < 0 && (iT = 0);
            iL > maxL && (iL = maxL);
            iT > maxT && (iT = maxT);
            mySpace.css(oGlass, {top:iT + "px", left: iL + "px"});
            return false
          };
          document.onmouseup = function() {
            this.onmouseup = null;
            this.onmousemove = null;
            oGlass.releaseCapture && oGlass.releaseCapture()
          }
          this.setCapture && this.setCapture();
          return false
        };
      }
    })();

    //模拟select
    (function() {
      var oSearch = mySpace.$$$("search")[0],
        aUl = mySpace.$$("ul", oSearch),
        oUl = null,
        aLi = null,
        oSelect = null,
        param = "",
        i = 0;
      switch(oTarget.className) {
        case "select":
          for(i = aUl.length; i--;) mySpace.css(aUl[i], {display:"none"});
          oUl = mySpace.$$("ul", oTarget.parentNode)[0];
          mySpace.css(oUl, {display:"block"});
          mySpace.css(oTarget.parentNode, {zIndex:++zIndex});
          document.onclick = function() {
            this.onclick = null;
            mySpace.css(oUl, {display:"none"})
          };
          e.cancelBubble = true;
          break;
        case "btn":
          param = mySpace.attr(mySpace.$$$("selectWrap")[0], "data-param");
          if(param == undefined) {
            alert("请选择品牌！")
          }
          else {
            oGlassList.innerHTML = "";
            mySpace.ajax({
              url: "data.asp?code=" + param,
              cache: !1,
              success: function(data) {
                oGlassList.innerHTML = data;
              }
            })
          }
          break;
        default:
          if(oTarget.tagName.toUpperCase() == "A" && mySpace.contains(oTarget, oSearch) && mySpace.isParent(oTarget, "LI")) {
            aLi = mySpace.$$("li", oTarget.parentNode.parentNode);
            for(i = aLi.length; i--;) aLi[i].className = "";
            oTarget.parentNode.className = "current";
            oSelect = mySpace.$$$("select", "a" ,oTarget.parentNode.parentNode.parentNode)[0];
            oSelect.innerHTML = oTarget.innerHTML;
            mySpace.attr(oSelect.parentNode, "data-param", mySpace.index(oTarget.parentNode))
          }
      }
    })()
  }//事件委托结束
}
