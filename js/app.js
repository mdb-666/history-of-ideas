sheets = {};

sheets["Title"] = "Timeline chart";
sheets["key"] = "1L1JF2zdiT4IA0-NZ4OKsLc0F5VEZQNnpklJVvj_ks_Q";
sheets["sheet"] = "Sheet1";
sheets["xaxis"] = "PRIMARY PLACE LONGITUDE";
sheets["yaxis"] = ["BEGIN ACTIVE YEARS","END ACTIVE YEARS"];
sheets["xaxislabel"] = "Primary place longitude";
sheets["yaxislabel"] = "Years active";

charttooltipfields = {"BEGIN ACTIVE YEARS":{"hide":false,"title":"BEGIN ACTIVE YEARS","position":"right","frominnerdata":false,"check":""},"END ACTIVE YEARS":{hide:false,"title":"END ACTIVE YEARS","position":"right","frominnerdata":false,"check":""},"NAME":{hide:false,"title":"NAME","position":"left","frominnerdata":false,"check":""},"NUMBER OF CONNECTIONS":{hide:false,"title":"NUMBER OF CONNECTIONS","position":"right","frominnerdata":false,"check":""},"PRIMARY PLACE":{hide:false,"title":"PRIMARY PLACE","position":"left","frominnerdata":false,"check":""},"PRIMARY PLACE LATITUDE":{hide:false,"title":"PRIMARY PLACE LATITUDE","position":"right","frominnerdata":false,"check":""},"PRIMARY PLACE LONGITUDE":{hide:false,"title":"PRIMARY PLACE LONGITUDE","position":"right","frominnerdata":false,"check":""},"TITLE OF CONNECTION":{hide:false,"title":"TITLE OF CONNECTION","position":"left","frominnerdata":false,"check":"TARGET"},"TYPE (TAUGHT, COLLABORATED, STUDIED)":{hide:false,"title":"TYPE (TAUGHT, COLLABORATED, STUDIED)","position":"left","frominnerdata":false,"check":"TARGET"},"YEAR OF CONNECTION":{hide:false,"title":"YEAR OF CONNECTION","position":"right","frominnerdata":false,"check":"TARGET"}};
multidetailsfields = {"SOURCE":{"hide":false,"title":"SOURCE","position":"left","frominnerdata":false,check:"NUMBER OF CONNECTIONS","from":"chartdata","field":"SOURCE ID","afield":"NAME"},"TARGET":{"hide":false,"title":"TARGET","position":"left","frominnerdata":false,check:"NUMBER OF CONNECTIONS","from":"links","field":"SOURCE ID","afield":"NAME"}}


margins = {top:10,bottom:15,left:10,right:10};
zoomassets = {};
chartdata = null;
chartwidth = 0;
chartheight = 0;
hvlinedisplay = false;
itemclicked = false;
tipopenedobject = "";
function initData(){
           $.ajax({
              type: 'GET',
              url: "https://sheets.googleapis.com/v4/spreadsheets/"+sheets.key+"/values/"+sheets.sheet+"!A1:Z200?key=AIzaSyDyDGVDHEsmbZA9IKR0NAGYSMgGGVIJ1oc",
              crossDomain: true,
              contentType: "application/json; charset=utf-8",
              dataType: "json",
              success: function(datas) { 
                  header = datas.values[0];
                  chartdata = [];
                  for (idata = 1; idata < datas.values.length; idata++){
                       let c = {};
                       icounter = 0;
                       emptydata = false;
                       for (ikey in datas.values[idata]){
                            if (header[icounter] == sheets["yaxis"][0] && !datas.values[idata][ikey]){
                                emptydata = true;
                                break;
                            }
                            icounter++;
                       }
                       if (emptydata){
                           continue;
                       }
                       icounter = 0;
                       for (ikey in datas.values[idata]){
                            if (header[icounter] == sheets["yaxis"][0] && !datas.values[idata][ikey]){
                                continue;
                            }
                            c[header[icounter]] = datas.values[idata][ikey];
                            icounter++;
                       }
                       c.id = idata;
                       chartdata.push(c);
                  }
                  initChart();
               },
               error: function(xhr, status, error) { alert(error); },
               async: false,
               cache: false
          });
}

function initChart(){
     $("#chart").empty();
     $("#hvlineholder").remove();
     $("#chart").append('<div id = "chartholder" style = "position:relative;width:100%;height:100%;"></div>');
     $("#chartholder").append('<div id = "hvlineholder" style = "position:relative;float:left;"><label>H/V Line</label><input type = "radio" id = "hvline" name = "hvline" value = "on"><label for="hvline">On</label><input type = "radio" checked id = "hvline" name = "hvline" value = "off" checked><label for="hvline">Off</label></div>');
     $("#chartholder").append('<div id = "title" style = "z-index:-1;position:relative;text-align:center;width:100%;margin-left:-50px;"></div>');
     $("#chartholder").append('<div id = "charts" style = "position:relative;float:left;width:100%;height:100%;">')
     d3.select("#charts").select("svg").remove();
     $("#charts").parent().find("#title").html(sheets.Title);
     chartheight = window.innerHeight - $("#title").height();
     chartwidth = window.innerWidth;
     $("#chartholder").css("height",chartheight+"px")
     generateChart()
}


function generateChart(){
      nm = [];
      for (irep = 0; irep < chartdata.length; irep++){
           if (!chartdata[irep]["NAME"]){
               if (chartdata[irep]["FIRST NAME"]){
                   chartdata[irep]["NAME"] = chartdata[irep]["FIRST NAME"]+" "+chartdata[irep]["LAST NAME"];
               }else{
                   chartdata[irep]["NAME"] = chartdata[irep]["FIRST NAME"]+chartdata[irep]["LAST NAME"];
               }
           }
           nm.push(irep);
      }
      links = [];
      for (irep = 0; irep < chartdata.length; irep++){
           numberofconnections = parseFloat(chartdata[irep]["NUMBER OF CONNECTIONS"]);
           for (ikey in chartdata[irep]){
                if (ikey.toUpperCase().indexOf("TARGET ") > -1){
                    if (!chartdata[irep][ikey]){
                        numberofconnections++;
                    }
                }
           }
           numberofconnections++;
           for (icon = 0; icon < numberofconnections; icon++){
                if (chartdata[irep]["TARGET ID "+icon] || chartdata[irep]["TARGET ID"+icon]){
                    name = "";
                    if (chartdata[irep]["TARGET ID "+icon]){
                        name = chartdata[irep]["TARGET ID "+icon];
                    } 
                    if (chartdata[irep]["TARGET ID"+icon]){
                        name = chartdata[irep]["TARGET ID"+icon];
                    } 
                    if (!name){
                        continue;
                    }
                    for (irep1 = 0; irep1 < chartdata.length; irep1++){  
                         if (chartdata[irep1]["NAME"].toUpperCase() == name.toUpperCase()){
                             l = {};
                             l.source = irep;
                             l.target = irep1
                             links.push(l);
                         }   
                    }
                }
          }
      }
      d3.select(".loadingtext").style("display","none");
      d3.select(".loading").style("display","none");
      svgwidth = chartwidth - margins.left - margins.right;
      svgheight = chartheight - margins.top - margins.bottom;

      svg = d3.select("#charts").append("svg")
                          .attr("width",chartwidth)
                           .attr("height",chartheight)
      xdomain = [-90,90];
      ydomain = [];
      for (ildata  =0; ildata < chartdata.length; ildata++){
           for (iyear = 0; iyear < sheets.yaxis.length; iyear++){
                ydomain.push(parseFloat(chartdata[ildata][sheets.yaxis[iyear]]));
           }  
      }  

      defs = svg.append("defs");

      defs.append("clipPath")
           .attr("id", "clip")
           .append("svg:rect")
           .attr("x","0") 
           .attr("y","0") 
           .attr("width", svgwidth-50)
           .attr("height", svgheight-10);

      defs.append("clipPath")
           .attr("id", "clipdiagram")
           .append("svg:rect")
           .attr("x","50") 
           .attr("y","0") 
           .attr("width", svgwidth-50)
           .attr("height", svgheight-10)



      defs
           .append('clipPath')
           .attr('id', 'clipx')
           .append('rect')
           .attr('x', "50")
           .attr('y', svgheight)
           .attr('width', svgwidth)
           .attr('height', 50);

      defs
           .append('clipPath')
           .attr('id', 'clipy')
           .append('rect')
           .attr('x', "-40")
           .attr('y', "0")
           .attr('width', "50")
           .attr('height', svgheight);

      g = svg.append("g")

      gaxis = g.append("g").attr("transform","translate(50,0)")

      gmain = g.append("g").attr("clip-path", "url(#clipdiagram)")

      d3.select("svg").style("pointer-events","all").on("mousemove",hvlinemove);

      gindicators = g.append("g").attr("clip-path", "url(#clipdiagram)") ;

      gindicators.append("line")
                 .attr("id","vertical")
                 .attr("x1","0")
                 .attr("x2","0")
                 .attr("y1","0")
                 .attr("y2",svgheight-10)
                 .style("stroke","black")
                 .style("fill","none")
                 .style("display","none")

      gindicators.append("line")
                 .attr("id","horizontal")
                 .attr("x1","0")
                 .attr("x2",svgwidth)
                 .attr("y1","0")
                 .attr("y2","0")
                 .style("stroke","black")
                 .style("fill","none")
                 .style("display","none")

      gindicator = gindicators.append("g").attr("id","indicatortext").style("display","none")
      gindicator.append("text")


      xScale = d3.scaleLinear()
                 .domain(xdomain)
                 .range([ 0, svgwidth-50 ]) 

      gaxis.append("line")
            .attr("x1",0)
            .attr("y1",0)
            .attr("x2",svgwidth-50)
            .attr("y2",0)
            .style("stroke","black")
            .style("stroke-width","2px")

      gaxis.append("line")
            .attr("x1",svgwidth-50)
            .attr("y1",0)
            .attr("x2",svgwidth-50)
            .attr("y2",svgheight-10)
            .style("stroke","black")
            .style("stroke-width","2px")

      xAxis = d3.axisBottom(xScale).ticks(15);

      gaxis.append("g").attr("transform",
            "translate(" + ((svgwidth/2)-30) + " ," + 
                           (svgheight + margins.top + 7) + ")")
            .append("text")             
            .style("text-anchor", "middle")
            .text(sheets["xaxislabel"])
            .style("font-size","12px")

      xAxisGroup = gaxis.append("g")
             .attr("id","x-axis") 
             .attr("transform", "translate(0," + (svgheight-10) + ")")      
             .call(xAxis)

      yScale = d3.scaleLinear()
                 .domain([d3.min(ydomain)-20,d3.max(ydomain)+20])
                 .range([ svgheight-10, 0 ]) 

      yAxis = d3.axisLeft(yScale).ticks(10).tickFormat(d3.format("d"));

      yAxisGroup = gaxis.append("g") 
             .attr("id","y-axis") 
             .attr("transform", "translate(0,0)")   
             .call(yAxis)

      gaxis.append("text")
         .attr("transform", "rotate(-90)")
         .attr("y", 0 - margins.left - 35)
         .attr("x",0 - (svgheight / 2)+5)
         .attr("dy", "1em")
         .style("text-anchor", "middle")
         .text(sheets["yaxislabel"])
         .style("font-size","12px")    

      gridg = gaxis.append("g").attr("clip-path", "url(#clip)").append("g")


      gridg.call(grid, xScale, yScale);


      var color = d3.scaleOrdinal(d3.schemePastel2);

      link = gmain.append("g").attr("id","links")
      nodes = gmain.append("g").attr("id","nodes")

      bars = nodes.selectAll("rect")
                 .data(chartdata)
                 .enter().append("rect")
                 .attr("id",function(d,i){return "node_"+d.id;})
                 .attr("y",function(d,i){ 
                     d.starty = yScale(parseFloat(d[sheets.yaxis[1]]))
                     return d.starty;
                  })
                 .attr("height",function(d,i){ 
                      d.endy = yScale(parseFloat(d[sheets.yaxis[1]])) + (yScale(parseFloat(d[sheets.yaxis[0]]))-yScale(parseFloat(d[sheets.yaxis[1]])));
                      return (yScale(parseFloat(d[sheets.yaxis[0]]))-yScale(parseFloat(d[sheets.yaxis[1]])))
                  })
                 .attr("x", function(d) { 
                      d.startx =  xScale(d[sheets.xaxis])+50;
                      return d.startx; 
                  })
                 .attr("width", function(d) { 
                       d.endx = xScale(d[sheets.xaxis])+53;
                       return "3"; 
                 })
                 .style("fill","brown")
                 .on("mouseover",function(d){
                     d3.select(this).style("cursor","pointer");
                     val = d.target.__data__[sheets["xaxis"]];
                     val1 = parseFloat(d.target.__data__[sheets["yaxis"][0]]);
                     val2 = parseFloat(d.target.__data__[sheets["yaxis"][1]]);
                     ids = [];
                     poss = [];
                     for (imain = 0; imain < chartdata.length; imain++){
                          if (chartdata[imain][sheets["xaxis"]] != val){
                              continue;
                          }
                          if (val2 >= parseFloat(chartdata[imain][sheets["yaxis"][0]]) && val2 <= parseFloat(chartdata[imain][sheets["yaxis"][1]])){
                          }else{
                              continue;
                          } 
                          ids.push(chartdata[imain].id);
                          poss.push(imain);
                     }
                     d3.selectAll("[id^=link_]").style("display","none");
                     d3.selectAll("[id^=node_]").style("display","none");
                     for (ipos = 0; ipos < poss.length; ipos++){
                          d3.select("#node_"+chartdata[poss[ipos]].id).style("display","block");
                          for (ilink = 0; ilink < links.length; ilink++){
                               if (links[ilink].source == poss[ipos]){
                                   d3.select("#link_"+ilink).style("display","block");
                                   d3.select("#node_"+chartdata[links[ilink].target].id).style("display","block");
                               }
                               if (links[ilink].target == poss[ipos]){
                                   d3.select("#link_"+ilink).style("display","block");
                                   d3.select("#node_"+chartdata[links[ilink].source].id).style("display","block");

                               }
                          }
                     }
                     if (tipopenedobject && tipopenedobject.indexOf(d.target.id+";") > -1){
                         return;
                     }
                     var pos = d3.pointer(d,this);
                     checks = {};
                     for (item in charttooltipfields){
                          if (charttooltipfields[item].hide){
                              continue;
                          } 
                          if (!charttooltipfields[item].check){
                              continue;
                          }
                          found = false;
                          for (item1 in d.target.__data__){
                               if (item1.indexOf(charttooltipfields[item].check) > -1){
                                   found = true;
                                   break;
                               }
                          }
                          if (found){
                              checks[item] = true;
                          }else{
                              checks[item] = false;
                          }
                     }
                     val = d.target.__data__[sheets["xaxis"]];
                     val1 = parseFloat(d.target.__data__[sheets["yaxis"][0]]);
                     val2 = parseFloat(d.target.__data__[sheets["yaxis"][1]]);
                     tiphtml = "<div><div style = 'height:250px;overflow-y:auto'>";
                     mfirst = true;
                     for (imain = 0; imain < chartdata.length; imain++){
                          if (chartdata[imain][sheets["xaxis"]] != val){
                              continue;
                          }
                          if (chartdata[imain][sheets["yaxis"][0]] >= val1 && chartdata[imain][sheets["yaxis"][0]] <= val2){
                          }else{
                              continue;
                          } 
                          if (!mfirst){
                              tiphtml += "<br><br>";
                              mfirst = false;
                          }
                          tiphtml += "<table style = 'background:rgba(0,0,0,.9);color:#fff;opacity:1;font-size:14px;'>";
                          for (item in charttooltipfields){
                               if (charttooltipfields[item].hide){
                                   continue;
                               } 
                               if (charttooltipfields[item].check){
                                   if (!checks[item]){
                                       continue;
                                   }
                               }
                               tiphtml += "<tr>";
                               tiphtml += "<td style = 'width:125px;opacity:.5;border:1px solid white;'>";
                               tiphtml += charttooltipfields[item].title;
                               tiphtml += "</td>";
                               tiphtml += "<td style = 'width:125px;margin-top:1px;opacity:.5;border:1px solid white;text-align:" +charttooltipfields[item].position+"'>";
                               if (chartdata[imain][item]){
                                   tiphtml += chartdata[imain][item];
                               }  
                               tiphtml += "</td>";
                               tiphtml += "</tr>";
                          }  
                          tiphtml += "</table>" ;
                          checks1 = {};
                          tiphtml1 = "<table style = 'background:rgba(0,0,0,.9);color:#fff;opacity:1;font-size:14px;'>";
                          tiphtml1 += "<tr><th>Source</th><th>Target</th></tr>";
                          for (item in multidetailsfields){
                               if (multidetailsfields[item].hide){
                                   continue;
                               } 
                               if (!multidetailsfields[item].check){
                                   continue;
                               }
                               found = false;
                               for (item1 in chartdata[imain]){
                                    if (item1.indexOf(multidetailsfields[item].check) > -1){
                                        found = true;
                                        break;
                                    }
                               }
                               if (found){
                                   checks1[item] = true;
                               }else{
                                   checks1[item] = false;
                               }
                          }
                          datafound = false;
                          for (ilinks = 0; ilinks < links.length; ilinks++){
                               if (links[ilinks].source != imain){
                                  continue;
                               }
                               tiphtml1 += "<tr>";
                               for (item in multidetailsfields){
                                    if (multidetailsfields[item].hide){
                                        continue;
                                    } 
                                    if (multidetailsfields[item].check){
                                        if (!checks1[item]){
                                            continue;
                                        }
                                    }
                                    if (multidetailsfields[item]["from"] == "chartdata"){
                                        tiphtml1 += "<td style = 'width:125px;margin-top:1px;opacity:.5;border:1px solid white;text-align:" +multidetailsfields[item].position+"'>";
                                        if (chartdata[imain][multidetailsfields[item].field]){
                                            tiphtml1 += chartdata[imain][multidetailsfields[item].field];
                                        }else{
                                            if (chartdata[imain][multidetailsfields[item].afield]){
                                                tiphtml1 += chartdata[imain][multidetailsfields[item].afield];
                                            }
                                        }
                                        tiphtml1 += "</td>";
                                    }
                                    if (multidetailsfields[item]["from"] == "links"){
                                        tiphtml1 += "<td style = 'width:125px;margin-top:1px;opacity:.5;border:1px solid white;text-align:" +multidetailsfields[item].position+"'>";
                                        if (chartdata[links[ilinks].target][multidetailsfields[item].field]){
                                            datafound = true;
                                            tiphtml += chartdata[links[ilinks].target][multidetailsfields[item].field];
                                        }else{
                                            if (chartdata[links[ilinks].target][multidetailsfields[item].afield]){
                                                datafound = true;
                                                tiphtml += chartdata[links[ilinks].target][multidetailsfields[item].afield];
                                            }
                                        }   
                                        tiphtml1 += "</td>";
                                    }
                              }
                              tiphtml1 += "</tr>";
                         }
                         tiphtml1 += "</table>";
                         if (datafound){
                             tiphtml = tiphtml + tiphtml1+"";;
                         }else{
                         }
                    }
                    reduce = 0;
                    tiphtml += "</div></div>";
                    tip.html(tiphtml);
                    widthbased = false;
                    heightbased = false;
                    if (pos[0] > svgwidth/2){
                        tip.direction("w"); 
                        reduce = 260
                        if (pos[1] > svgheight * .80){
                            tip.direction("n");  
                            heightbased = true;
                        }
                        if (pos[1] < svgheight * .20){
                            tip.direction("s"); 
                            heightbased = true;
                        }
                    }else{ 
                        tip.direction("e"); 
                        reduce = -260  
                        if (pos[1] > svgheight * .80){
                            tip.direction("n"); 
                            heightbased = true;
                        }
                        if (pos[1] < svgheight * .20){
                            tip.direction("s"); 
                            heightbased = true;
                        }
                    }
                    tip.show(this,d.target);
                    selobj = d.target
                    bboxM = selobj.getBoundingClientRect();  
                    top = bboxM.y+(bboxM.height/2) 
                    left = bboxM.x+(bboxM.width/2);
                    tipwidth = d3.select(".d3-tip.dtl.one").node().getBoundingClientRect(); 
                    if (pos[0] > svgwidth/2){
                        reduce = tipwidth.width;
                    }else{
                        reduce = 0;
                    }
                    if (heightbased){
                        reduce = parseFloat((tipwidth.width/2));
                    }
                    d3.select(".d3-tip.dtl.one").style("left",(left-reduce)+"px").style("top",top+"px")
                 })
                 .on("mouseout",function(d){
                     d3.select(this).style("cursor","default");
                     d3.selectAll("[id^=link_]").style("display","block");
                     d3.selectAll("[id^=node_]").style("display","block");
                     if (tipopenedobject && tipopenedobject.indexOf(d.target.id+";") > -1){
                         return;
                     }
                     tip.hide();
                 })
                 .on("click",function(d){
                     if (tipopenedobject && tipopenedobject.indexOf(d.target.id+";") > -1){
                         tipopenedobject = "";
                         tipclicked.hide();
                         return;
                     }
                     tipopenedobject = "";
                     tip.hide();
                     var pos = d3.pointer(d,this);
                     checks = {};
                     for (item in charttooltipfields){
                          if (charttooltipfields[item].hide){
                              continue;
                          } 
                          if (!charttooltipfields[item].check){
                              continue;
                          }
                          found = false;
                          for (item1 in d.target.__data__){
                               if (item1.indexOf(charttooltipfields[item].check) > -1){
                                   found = true;
                                   break;
                               }
                          }
                          if (found){
                              checks[item] = true;
                          }else{
                              checks[item] = false;
                          }
                     }
                     val = d.target.__data__[sheets["xaxis"]];
                     val1 = parseFloat(d.target.__data__[sheets["yaxis"][0]]);
                     val2 = parseFloat(d.target.__data__[sheets["yaxis"][1]]);
                     tiphtml = "<div><div style = 'height:250px;overflow-y:auto'>";
                     mfirst = true;
                     for (imain = 0; imain < chartdata.length; imain++){
                          if (chartdata[imain][sheets["xaxis"]] != val){
                              continue;
                          }
                          if (chartdata[imain][sheets["yaxis"][0]] >= val1 && chartdata[imain][sheets["yaxis"][0]] <= val2){
                          }else{
                              continue;
                          } 
                          tipopenedobject += "node_"+chartdata[imain].id+";";
                          if (!mfirst){
                              tiphtml += "<br><br>";
                              mfirst = false;
                          }
                          tiphtml += "<table style = 'background:rgba(0,0,0,.9);color:#fff;opacity:1;font-size:14px;'>";
                          for (item in charttooltipfields){
                               if (charttooltipfields[item].hide){
                                   continue;
                               } 
                               if (charttooltipfields[item].check){
                                   if (!checks[item]){
                                       continue;
                                   }
                               }
                               tiphtml += "<tr>";
                               tiphtml += "<td style = 'width:125px;opacity:.5;border:1px solid white;'>";
                               tiphtml += charttooltipfields[item].title;
                               tiphtml += "</td>";
                               tiphtml += "<td style = 'width:125px;margin-top:1px;opacity:.5;border:1px solid white;text-align:" +charttooltipfields[item].position+"'>";
                               if (chartdata[imain][item]){
                                   tiphtml += chartdata[imain][item];
                               }  
                               tiphtml += "</td>";
                               tiphtml += "</tr>";
                          }  
                          tiphtml += "</table>" ;
                          checks1 = {};
                          tiphtml1 = "<table style = 'background:rgba(0,0,0,.9);color:#fff;opacity:1;font-size:14px;'>";
                          tiphtml1 += "<tr><th>Source</th><th>Target</th></tr>";
                          for (item in multidetailsfields){
                               if (multidetailsfields[item].hide){
                                   continue;
                               } 
                               if (!multidetailsfields[item].check){
                                   continue;
                               }
                               found = false;
                               for (item1 in chartdata[imain]){
                                    if (item1.indexOf(multidetailsfields[item].check) > -1){
                                        found = true;
                                        break;
                                    }
                               }
                               if (found){
                                   checks1[item] = true;
                               }else{
                                   checks1[item] = false;
                               }
                          }
                          datafound = false;
                          for (ilinks = 0; ilinks < links.length; ilinks++){
                               if (links[ilinks].source != imain){
                                  continue;
                               }
                               tiphtml1 += "<tr>";
                               for (item in multidetailsfields){
                                    if (multidetailsfields[item].hide){
                                        continue;
                                    } 
                                    if (multidetailsfields[item].check){
                                        if (!checks1[item]){
                                            continue;
                                        }
                                    }
                                    if (multidetailsfields[item]["from"] == "chartdata"){
                                        tiphtml1 += "<td style = 'width:125px;margin-top:1px;opacity:.5;border:1px solid white;text-align:" +multidetailsfields[item].position+"'>";
                                        if (chartdata[imain][multidetailsfields[item].field]){
                                            tiphtml1 += chartdata[imain][multidetailsfields[item].field];
                                        }  
                                        tiphtml1 += "</td>";
                                    }
                                    if (multidetailsfields[item]["from"] == "links"){
                                        tiphtml1 += "<td style = 'width:125px;margin-top:1px;opacity:.5;border:1px solid white;text-align:" +multidetailsfields[item].position+"'>";
                                        if (chartdata[links[ilinks].target][multidetailsfields[item].field]){
                                            datafound = true;
                                            tiphtml1 += chartdata[links[ilinks].target][multidetailsfields[item].field];
                                        }else{
                                            if (chartdata[links[ilinks].target][multidetailsfields[item].afield]){
                                                datafound = true;
                                                tiphtml1 += chartdata[links[ilinks].target][multidetailsfields[item].afield];
                                            }
                                        }
                                        tiphtml1 += "</td>";
                                    }
                              }
                              tiphtml1 += "</tr>";
                         }
                         tiphtml1 += "</table>";
                         if (datafound){
                             tiphtml = tiphtml + tiphtml1+"";;
                         }else{
                             tiphtml += "";
                         }
                    }
                    reduce = 0;
                    tiphtml += "</div></div>";
                    tipclicked.html(tiphtml);

                    widthbased = false;
                    heightbased = false;
                    if (pos[0] > svgwidth/2){
                        tipclicked.direction("w"); 
                        reduce = 260
                        if (pos[1] > svgheight * .80){
                            tipclicked.direction("n");  
                            heightbased = true;
                        }
                        if (pos[1] < svgheight * .20){
                            tipclicked.direction("s"); 
                            heightbased = true;
                        }
                    }else{ 
                        tipclicked.direction("e"); 
                        reduce = -260  
                        if (pos[1] > svgheight * .80){
                            tipclicked.direction("n"); 
                            heightbased = true;
                        }
                        if (pos[1] < svgheight * .20){
                            tipclicked.direction("s"); 
                            heightbased = true;
                        }
                    }
                    tipclicked.show(this,d.target);
                    selobj = d.target
                    bboxM = selobj.getBoundingClientRect();  
                    top = bboxM.y+(bboxM.height/2) 
                    left = bboxM.x+(bboxM.width/2);
                    tipwidth = d3.select(".d3-tip.dtl.two").node().getBoundingClientRect(); 
                    if (pos[0] > svgwidth/2){
                        reduce = tipwidth.width;
                    }else{
                        reduce = 0;
                    }
                    if (heightbased){
                        reduce = parseFloat((tipwidth.width/2));
                    }
                    d3.select(".d3-tip.dtl.two").style("left",(left-reduce)+"px").style("top",top+"px")
                 })

      link = link.selectAll("polygon")
                 .data(links)
                 .enter().append("polygon") 
                 .style("fill",function(d,i){return color(i);})
                 .style("fill-opacity",".7")
                 .attr("id",function(d,i){return "link_"+i;})
                 .attr("points",function(d,i){
                      positions = [];
                      p = {};
                      p.x = chartdata[d.source].startx;
                      p.y = chartdata[d.source].starty;
                      positions.push(p);
                      p = {};
                      p.x = chartdata[d.target].startx+3
                      p.y = chartdata[d.target].starty
                      positions.push(p);
                      p = {};
                      p.x = chartdata[d.target].startx+3
                      p.y = chartdata[d.target].endy
                      positions.push(p);
                      p = {};
                      p.x = chartdata[d.source].startx;
                      p.y = chartdata[d.source].starty;
                      positions.push(p);
                      return positions.map(function(d) {
                            return [d.x,d.y].join(",");
                      }).join(" ");  
        
                 })
                 .on("mouseover",function(d,n,i){
                     addedlinks = {};
                     d3.select(this).style("cursor","pointer");
                     var pos = d3.pointer(d,this);
                     icode = parseFloat(d3.select(this).attr("id").split("_")[1]);
                     d3.selectAll("[id^=node_]").style("display","none");
                     cdata = [];
                     main = links[icode]
                     for (icheck = 0; icheck < links.length; icheck++){
                          if (main.source == links[icheck].source || main.source == links[icheck].target){
                          }else{
                              d3.select("#link_"+icheck).style("display","none");
                              continue;  
                          }
                          cdata.push(chartdata[links[icheck].source]);
                          cdata.push(chartdata[links[icheck].target]);
                          d3.select("#node_"+chartdata[links[icheck].source].id).style("display","block");
                          d3.select("#node_"+chartdata[links[icheck].target].id).style("display","block");
                     }
                     checks1 = {};
                     tiphtml = "<table style = 'background:rgba(0,0,0,.9);color:#fff;opacity:1;font-size:14px;'>";
                     tiphtml += "<tr><th>Source</th><th>Target</th></tr>";
                     for (imain = 0; imain < cdata.length; imain++){
                          for (item in multidetailsfields){
                               if (multidetailsfields[item].hide){
                                   continue;
                               } 
                               if (!multidetailsfields[item].check){
                                   continue;
                               }
                               found = false;
                               for (item1 in cdata[imain]){
                                    if (item1.indexOf(multidetailsfields[item].check) > -1){
                                        found = true;
                                        break;
                                    }
                               }
                               if (found){
                                   checks1[item] = true;
                               }else{
                                   checks1[item] = false;
                               }
                          }
                          for (ilinks = 0; ilinks < links.length; ilinks++){
                               if (chartdata[links[ilinks].source].id == cdata[imain].id || chartdata[links[ilinks].target].id == cdata[imain].id){
                               }else{
                                   continue;
                               }
                               if (addedlinks[ilinks]){
                                   continue;
                               }
                               addedlinks[ilinks] = true;
                               tiphtml += "<tr>";
                               for (item in multidetailsfields){
                                    if (multidetailsfields[item].hide){
                                        continue;
                                    } 
                                    if (multidetailsfields[item].check){
                                        if (!checks1[item]){
                                            continue;
                                        }
                                    }
                                    if (multidetailsfields[item]["from"] == "chartdata"){
                                        tiphtml += "<td style = 'width:125px;margin-top:1px;opacity:.5;border:1px solid white;text-align:" +multidetailsfields[item].position+"'>";
                                        if (chartdata[links[ilinks].source][multidetailsfields[item].field]){
                                            tiphtml += chartdata[links[ilinks].source][multidetailsfields[item].field];
                                        }  
                                        tiphtml += "</td>";
                                    }
                                    if (multidetailsfields[item]["from"] == "links"){
                                        tiphtml += "<td style = 'width:125px;margin-top:1px;opacity:.5;border:1px solid white;text-align:" +multidetailsfields[item].position+"'>";
                                        if (chartdata[links[ilinks].target][multidetailsfields[item].field]){
                                            datafound = true;
                                            tiphtml += chartdata[links[ilinks].target][multidetailsfields[item].field];
                                        }else{
                                            if (chartdata[links[ilinks].target][multidetailsfields[item].afield]){
                                                datafound = true;
                                                tiphtml += chartdata[links[ilinks].target][multidetailsfields[item].afield];
                                            }
                                        } 
                                        tiphtml += "</td>";
                                    }
                              }
                              tiphtml += "</tr>";
                         }
                    }
                    tiphtml += "</table>";
                    tip.html(tiphtml);
                    widthbased = false;
                    heightbased = false;
                    if (pos[0] > svgwidth/2){
                        tip.direction("w"); 
                        reduce = 260
                        if (pos[1] > svgheight * .80){
                            tip.direction("n");  
                            heightbased = true;
                        }
                        if (pos[1] < svgheight * .20){
                            tip.direction("s"); 
                            heightbased = true;
                        }
                    }else{ 
                        tip.direction("e"); 
                        reduce = -260  
                        if (pos[1] > svgheight * .80){
                            tip.direction("n"); 
                            heightbased = true;
                        }
                        if (pos[1] < svgheight * .20){
                            tip.direction("s"); 
                            heightbased = true;
                        }
                    }
                    tip.show(this,d.target);
                    selobj = d.target
                    bboxM = selobj.getBoundingClientRect();  
                    top = bboxM.y+(bboxM.height/2) 
                    left = bboxM.x+(bboxM.width/2);
                    tipwidth = d3.select(".d3-tip.dtl.one").node().getBoundingClientRect(); 
                    if (pos[0] > svgwidth/2){
                        reduce = tipwidth.width;
                    }else{
                        reduce = 0;
                    }
                    if (heightbased){
                        reduce = parseFloat((tipwidth.width/2));
                    }
                    d3.select(".d3-tip.dtl.one").style("left",(left-reduce)+"px").style("top",top+"px")
                 })
                 .on("mouseout",function(d){
                     d3.select(this).style("cursor","default");
                     tip.hide();
                     d3.selectAll("[id^=link_]").style("display","block");
                     d3.selectAll("[id^=node_]").style("display","block");
                 })

        zoom = d3.zoom()
           .scaleExtent([1,30])// less than 1 means can resize smaller than  original size    
           .extent([
                [margins.left, margins.top],
                [svgwidth+margins.left-50, svgheight+margins.top]
           ])
           .translateExtent([
                [margins.left, margins.top],
                [svgwidth+margins.left-50, svgheight+margins.top]
           ])
           .on("zoom",zoomed);  

//       svg.call(zoom).call(zoom.transform, d3.zoom) 
         svg.call(zoom).call(zoom); 

         direction = "e"
         tip = d3.tip()
            .attr('class', 'd3-tip dtl one')
            .direction(direction) 
            .offset(function () {
                if(direction=='n') { return [-10,0] }
                  else if(direction=='s') { return [10,0] }
                 else if(direction=='e') { return [0,7] }
                 else if(direction=='w') { return [0,-10] }
             })
            .html(function(d) {
               console.log(d);    
            })

         tipclicked = d3.tip()
            .attr('class', 'd3-tip dtl two')
            .direction(direction) 
            .offset(function () {
                if(direction=='n') { return [-10,0] }
                  else if(direction=='s') { return [10,0] }
                 else if(direction=='e') { return [0,7] }
                 else if(direction=='w') { return [0,-10] }
             })
            .html(function(d) {
               console.log(d);    
            })

        tip.direction(direction)
        svg.call(tip);

        tipclicked.direction(direction)
        svg.call(tipclicked);
}

function zoomed(event){
    tipopenedobject = "";
    tip.hide();
    tipclicked.hide();
    t = event.transform;
    bars.attr("transform",t)
    link.attr("transform",t)
    nx = xAxis.scale(event.transform.rescaleX(xScale));
    ny = yAxis.scale(event.transform.rescaleY(yScale))
    xAxisGroup.call(nx);
    yAxisGroup.call(ny); 
    gridg.attr("transform",t);
    d3.select("#horizontal").attr("transform",t);
    d3.select("#vertical").attr("transform",t);
    gridg.selectAll("line").attr("stroke-width",1/t.k);
    d3.select("#horizontal").attr("stroke-width",1/t.k);
    d3.select("#vertical").attr("stroke-width",1/t.k);
}


function make_x_gridlines(axis) {
    return d3.axisBottom(axis).tickSize(-svgheight)
                       .tickFormat("")
                       .ticks(15);
}

function make_y_gridlines(axis) {		
    return d3.axisLeft(axis).tickSize(-svgwidth)
                      .tickFormat("")
                      .ticks(10);
}

function parsetransform(a){
    var b={};
    for (var i in a = a.match(/(\w+\((\-?\d+\.?\d*e?\-?\d*,?)+\))+/g))
    {
        var c = a[i].match(/[\w\.\-]+/g);
        b[c.shift()] = c;
    }
    return b;
}


function hvlinemove(event){
  if (!hvlinedisplay){
      return;
  }
  x = event.pageX;
  y = event.pageY;
  if (x > svgwidth || y > svgheight+20){
      d3.select("#horizontal").style("display","none");
      d3.select("#vertical").style("display","none");
      d3.select("#indicatortext").style("display","none")
      return;
  }
  if (x < 51 || y < 20){
      d3.select("#horizontal").style("display","none");
      d3.select("#vertical").style("display","none");
      d3.select("#indicatortext").style("display","none")
      return;
  }
  if (hvlinedisplay){
      d3.select("#horizontal").style("display","block");
      d3.select("#vertical").style("display","block");
      d3.select("#indicatortext").style("display","block");
  }
  d3.select("#vertical").attr("x1",x);
  d3.select("#vertical").attr("x2",x);
  d3.select("#horizontal").attr("y1",y-20);
  d3.select("#horizontal").attr("y2",y-20);
  d3.select("#indicatortext").attr("transform","translate("+(x+10)+","+(y+10)+")").attr("stroke","red")
  d3.select("#indicatortext").select("text").text("("+xScale.invert(x-50)+","+Math.round(yScale.invert(y-20))+")")
}


grid = (g, x, y) => g
    .attr("stroke", "currentColor")
    .attr("stroke-opacity", 0.1)
    .call(g => g
      .selectAll(".xgrid")
      .data(x.ticks(15))
      .join(
        enter => enter.append("line").attr("class", "x").attr("y2", svgheight-10),
        update => update,
        exit => exit.remove()
     )
     .attr("x1", d => 0.5 + x(d))
     .attr("x2", d => 0.5 + x(d)))
    .call(g => g
      .selectAll(".ygrid")
      .data(y.ticks(10))
      .join(
        enter => enter.append("line").attr("class", "y").attr("x2", svgwidth),
        update => update,
        exit => exit.remove()
     )
     .attr("y1", d => 0.5 + y(d))
     .attr("y2", d => 0.5 + y(d)));

$(document).on("change","#hvline",function(d){
  sval = $('input[name="hvline"]:checked').val(); 
  if (sval == "on"){
      hvlinedisplay = true;
      d3.select("#horizontal").style("display","block");
      d3.select("#vertical").style("display","block");
      d3.select("#indicatortext").style("display","block")
  }
  if (sval == "off"){
      hvlinedisplay = false;
      d3.select("#horizontal").style("display","none");
      d3.select("#vertical").style("display","none");
      d3.select("#indicatortext").style("display","none")
  }
})

$(window).resize(function(){
   tipopenedobject = "";
   tip.hide();
   initChart()
})


initData();

