/*
>> Basic compnents: "svg" (box where viz can happen), "g" (viz box), and "node" and "link" (create nodes and links)
>> d3.json is main loop

*/

var tooltip = d3.select("body").append("div")
  .attr("class", "tooltip")
  .style("position", "absolute")
  .style("background", "white")
  .style("max-width", "350px")
  .style("height", "auto")
  .style("padding", "1px")
  .style("border-style", "solid")
  .style("border-radius", "4px")
  .style("border-width", "1px")
  .style("pointer-events", "none")
  .style("opacity", 0);

// color variable used in later functions, returns colors assigned to unique numbers (generated from text)
var color = d3.scaleOrdinal(d3.schemeCategory20);

/* creates visualziation box, 960 by 500 px, where visuzliation can happen */
var svg = d3.select("body").append("svg")
  .attr("width", 960)
  .attr("height", 500);

var width = 960,
    height = 500;

/* Start of the javascript, pulls data from root/data/dummy.json
For every data point, runs through the entire js loop.
"error" is boolean for error with dummy.json (if error, will print error in console.
"graph" is now the variable for the data in dummy.json
d3.json-loop runs data through all commands for all nodes and all links
*/
d3.json("./data/german-jewish-frankfurter-zeitung.json", function(error, graph) {

  if (error) throw error; // prints error if there's a problem w/ data file

  var simulation = d3.forceSimulation() // simulation
    .nodes(graph.nodes);

  simulation
    .force("charge_force", d3.forceManyBody().strength(-100))
    .force("center_force", d3.forceCenter(width / 2, height / 2))
    .force("links", d3.forceLink(graph.links).id(function (d) { return d.id; })) // defines distance between the nodes
    .force("collide", d3.forceCollide().radius(2));

  simulation
    .on("tick", ticked);

 /* g variable is box inside visualziation space where click events, all the lines, arrows, nodes, etc. comes in this box
 this is the visualization-box itself */
  var g = svg.append("g")
    .attr("class", "everything"); // all click events, all functions, etc can happen in this element ("everything" defined by j3 library)

  g.append("defs").selectAll("marker")
      .data(["end"])
    .enter().append("svg:marker")
      .attr("id", String)
      .attr("viewBox", "0 -5 10 10")
      .attr("refX", 12)
      .attr("refY", -0.5)
      .attr("markerWidth", 6)
      .attr("markerHeight", 6)
      .attr("orient", "auto")
    .append("svg:path")
      .attr("d", "M0,-5L10,0L0,5");

  /* link variable, appended to "g" variable. This creates the edges in the viz. "svg">"g">"link" */
  var link = g.append("g")
      .attr("class", "links") // define class as links in d3 library
      .selectAll("path") // direction, shape of link between nodes, also called "path"
      .data(graph.links) // call data tell it which data we're giving to variable
      .enter().append("path") // adding data to the various paths
  /* these are the various style elements to determine what links look like */
      .style("fill", "none") // fills between the borders aka "strokes"
      .style("stroke", function(d) { // "stroke" is the border to the link-line. then create a function to determine color
          return color(d.archive); }) // returns a color based on the datapoint for "archive" category ... d.archive.
      .style("stroke-width", function(d) { // defining the width of the stroke determined by function of ...
          return Math.sqrt(d.value); }) // ... square root of the # of letters (square root like a logarithm makes better for vis)
      .attr("marker-end", "url(#end)")
      .style("pointer-events", "stroke") // defining where pointer events can happen >> here, only on the stroke
      .on("mouseover.tooltip", function(d) { // on a mouse-over event, this is what it will print out
        tooltip.transition()
          .duration(300)
          .style("opacity", .8);
        tooltip.html("From: " + d.source.id +
                    "<br>To: " + d.target.id +
                    "<br>Date: " + d.date +
                    "<br>No. of letters: " + d.value +
                    "<br>Archive: " + d.archive)
          .style("left", (d3.event.pageX) + "px")
          .style("top", (d3.event.pageY + 10) + "px");
      })
      .on("mouseout.tooltip", function() {
        tooltip.transition()
          .duration(1000)
          .style("opacity", 0);
      })
      .on("mousemove", function() {
        tooltip.style("left", (d3.event.pageX) + "px")
          .style("top", (d3.event.pageY + 10) + "px");
      });

  /* variable for nodes, also appended to "g," like "link." SVG > G > node */
    var node = g.append("g")
    .attr("class", "nodes") // create a class of nodes
    .selectAll("circle") // created nodes as circles ("paths" before")
    .data(graph.nodes) // calling data in graph.nodes (not graph.links)
    .enter()
    .append("circle") // appending circles to each "node" data point
    .attr("r", 4) // radius as 4px
    .style("fill", "gray") // fill color, here defined as gray, but could be something else (as above)
    .style("stroke", "black") // border color, also static, but could be smth else (as above)
    .style("stroke-width", "1px") // border width, also static
    .style("pointer-events", "all") // pointer events ("all" means in "fill" and "stroke")
    .on("mouseover.tooltip", function(d) {
      tooltip.transition()
        .duration(300)
        .style("opacity", .8);
      tooltip.html("Name: " + d.id + "<br>Group: " + d.group)
        .style("left", (d3.event.pageX) + "px")
        .style("top", (d3.event.pageY + 10) + "px");
    })
    .on("mouseout.tooltip", function() {
      tooltip.transition()
        .duration(100)
        .style("opacity", 0);
    })
    .on("mousemove", function() {
      tooltip.style("left", (d3.event.pageX) + "px")
        .style("top", (d3.event.pageY + 10) + "px");
    });

  var text = g.append("g").attr("class", "labels").selectAll("g")
    .data(graph.nodes)
    .enter().append("g")
    .append("text")
    .attr("x", 14)
    .attr("y", ".31em")
    .style("font-family", "sans-serif")
    .style("font-size", "0.7em")
    .text(function(d) { return d.id; });

  var drag_handler = d3.drag()
    .on("start", drag_start)
    .on("drag", drag_drag)
    .on("end", drag_end);

  drag_handler(node);

  node.on("click", function(d) {
    d3.event.stopImmediatePropagation();
    self.onNodeClicked.emit(d.id);
  });

  var zoom_handler = d3.zoom()
    .on("zoom", zoom_actions);

  zoom_handler(svg);

  function drag_start(d) {
    if (!d3.event.active) simulation.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
  }

  function drag_drag(d) {
    d.fx = d3.event.x;
    d.fy = d3.event.y;
  }

  function drag_end(d) {
    if (!d3.event.active) simulation.alphaTarget(0);
    d.fx = null;
    d.fy = null;
  }

  function zoom_actions() {
    g.attr("transform", d3.event.transform)
  }

 /* when pushing data into links / nodes >> ticked allows nodes, links, and text to move along with drag */
  function ticked() {

    node // defines position for nodes, as D3 creates data for each node, cx / cy
      .attr("cx", function(d) { return d.x; })
      .attr("cy", function(d) { return d.y; });

    link.attr("d", function(d) {
      var dx = d.target.x - d.source.x, // defines positions btw x for target and source
          dy = d.target.y - d.source.y, // deinfes positions btw y for target and source
          dr = Math.sqrt(dx * dx + dy * dy); // defines Euclidean distance between target and source
      return "M" +
          d.source.x + "," +
          d.source.y + "A" +
          dr + "," + dr + " 0 0,1 " +
          d.target.x + "," +
          d.target.y; });

    // defines position of labels relative to the position of the nodes (d.x, d.y)
    text
      .attr("transform", function (d) { return "translate(" + d.x + "," + d.y + ")"; });

  }

});
