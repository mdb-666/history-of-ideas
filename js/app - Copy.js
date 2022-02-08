sheets = {};

sheets["Title"] = "Timeline chart";
sheets["key"] = "1L1JF2zdiT4IA0-NZ4OKsLc0F5VEZQNnpklJVvj_ks_Q";
sheets["sheet"] = "Sheet1";
sheets["xaxis"] = "PRIMARY PLACE LONGITUDE";
sheets["yaxis"] = ["BEGIN ACTIVE YEARS","END ACTIVE YEARS"];

charttooltipfields = {"name":{"hide":false,"title":"Name","position":"left","frominnerdata":false},"value":{hide:false,"title":"Value","position":"right","frominnerdata":false},"%":{hide:false,"title":"Perc.","position":"right","frominnerdata":false}};
margins = {top:10,bottom:10,left:10,right:10};
zoomassets = {};
chartdata = null;
chartwidth = 0;
chartheight = 0;


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
     $("#chart").append('<div id = "chartholder" style = "position:relative;width:100%;height:100%;"></div>');
     $("#chartholder").append('<div id = "title" style = "position:relative;text-align:center;"></div>');
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

      defs.append("svg:clipPath")
           .attr("id", "clip")
           .append("svg:rect")
           .attr("x","0") 
           .attr("width", svgwidth)
           .attr("height", svgheight+50);

      g = svg.append("g").attr("clip-path", "url(#clip)")  

      gmain = g.append("g");

      xScale = d3.scaleLinear()
                 .domain(xdomain)
                 .range([ 0, svgwidth-50 ]) 

      gmain.append("line")
            .attr("x1",50)
            .attr("y1",0)
            .attr("x2",svgwidth)
            .attr("y2",0)
            .style("stroke","black")
            .style("stroke-width","2px")

      gmain.append("line")
            .attr("x1",svgwidth)
            .attr("y1",0)
            .attr("x2",svgwidth)
            .attr("y2",svgheight)
            .style("stroke","black")
            .style("stroke-width","2px")

      xAxis = d3.axisBottom(xScale).ticks(15);

      xaxisg = gmain.append("g").attr("transform", "translate(50,0)")

      xAxisGroup = xaxisg.append("g")
             .attr("id","x-axis") 
             .attr("transform", "translate(0," + (svgheight) + ")")      
             .call(xAxis)

      yScale = d3.scaleLinear()
                 .domain([d3.min(ydomain)-20,d3.max(ydomain)+20])
                 .range([ svgheight, 0 ]) 

      yAxis = d3.axisLeft(yScale).ticks(10).tickFormat(d3.format("d"));

      yaxisg = gmain.append("g").attr("transform", "translate(50,0)")
      yAxisGroup = yaxisg.append("g") 
             .attr("id","y-axis") 
             .attr("transform", "translate(0,0)")   
             .call(yAxis)

      xgridg = gmain.append("g").attr("transform", "translate(50,0)")

      gridx = xgridg.append("g")		
                   .attr("class", "grid")
                   .attr("id", "gridX")
                   .attr("transform", "translate(0," + svgheight + ")")
                   .append("g")	

      gridX = gridx
                   .call(make_x_gridlines(xScale))
                       
      ygridg = gmain.append("g").attr("transform", "translate(50,0)")

      gridy = ygridg.append("g")		
                   .attr("class", "grid")
                   .attr("id", "gridY")
                   .attr("transform", "translate(0," + "0" + ")")
                   .append("g")	

      gridY = gridy	
                   .call(make_y_gridlines(yScale))


     color = d3.scaleQuantize()
               .range(colorbrewer.YlGnBu[9])
               .domain(nm);

     var color = d3.scaleOrdinal(d3.schemePastel2);
//                     .range(d3.schemeSet3);

      link = gmain.append("g").attr("id","links")
      nodes = gmain.append("g").attr("id","nodes")

      bars = nodes.selectAll("rect")
                 .data(chartdata)
                 .enter().append("rect")
                 .attr("id",function(d,i){return "node_"+i;})
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
                     console.log(d);
                 })

      links = link.selectAll("polygon")
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
                     icode = d3.select(this).attr("id").split("_")[1];
                     d3.selectAll("[id^=node_]").style("display","none");
                     for (icheck = 0; icheck < links.length; icheck++){
                          if (icheck == icode){
                              d3.select("#node_"+links[icheck].source).style("display","block");
                              d3.select("#node_"+links[icheck].target).style("display","block");
                              continue;
                          }
                          d3.select("#link_"+icheck).style("display","none");
                     }
                 })
                 .on("mouseout",function(d){
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

//       svg.call(zoom).call(zoom.transform, d3.zoomIdentity) 
         svg.call(zoom).call(zoom); 
}

function zoomed(event){
    t = event.transform;console.log(t.k);
//    xScale.range([0, (svgwidth-50) * t.k]);
//    gridx.attr("transform",t);
//    gridy.attr("transform",t);
    bars.attr("transform",t)
    links.attr("transform",t)
//    trans = svg.select("#x-axis").attr("transform");
//    trans  = parsetransform(trans);
//    transX = parseFloat(trans.translate[0]);
//    transY = parseFloat(trans.translate[1]);
//    svgheight = parseFloat(transY);
//    svg.select("#x-axis")
//       .attr("transform", "translate(" + parseFloat(50+t.x) + "," + (svgheight) + ")")
//       .call(xAxis);
//    gridX
//       .attr("transform", "translate(" + parseFloat(t.x) + "," + (svgheight) + ")")
//       .call(xAxis);
//    let new_xScale = event.transform.rescaleX(xScale); 
//    svg.select("#xaxis").call(xAxis.scale(xScale));

//    let new_yScale = event.transform.rescaleY(yScale); 
//    svg.select("#yaxis").call(yAxis.scale(yScale));
    nx = xAxis.scale(event.transform.rescaleX(xScale));
    ny = yAxis.scale(event.transform.rescaleY(yScale))
    xAxisGroup.call(nx);
    yAxisGroup.call(ny);

//    gridx.call(xAxis,nx)
//    gridy.call(yAxis,ny)


    gridx
                   .call(make_x_gridlines(xScale))


    gridy	
                   .call(make_y_gridlines(yScale))
     

}


function make_x_gridlines(axis) {
    return d3.axisBottom(axis).tickSize(-svgheight)
                       .tickFormat("")
}

function make_y_gridlines(axis) {		
    return d3.axisLeft(axis).tickSize(-svgwidth)
                      .tickFormat("")
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


initData();

