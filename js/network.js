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

var color = d3.scaleOrdinal(d3.schemeCategory20);

d3.json("./data/german-jewish-frankfurter-zeitung.json", function(error, graph) {

  if (error) throw error;

  var svg = d3.select("body").append("svg")
    .attr("width", 960)
    .attr("height", 500);

  var width = 960,
      height = 500;

  var simulation = d3.forceSimulation()
    .nodes(graph.nodes);

  simulation
    .force("charge_force", d3.forceManyBody().strength(-100))
    .force("center_force", d3.forceCenter(width / 2, height / 2))
    .force("links", d3.forceLink(graph.links).id(function (d) { return d.id; }).distance([180]))
    .force("collide", d3.forceCollide().radius(2));

  simulation
    .on("tick", ticked);

  var g = svg.append("g")
    .attr("class", "everything");

  g.append("defs").selectAll("marker")
      .data(["end"])
    .enter().append("svg:marker")
      .attr("id", "arrow")
      .attr("viewBox", "0 -5 10 10")
      .attr("refX", 12)
      .attr("refY", -0.5)
      .attr("markerWidth", 6)
      .attr("markerHeight", 6)
      .attr("orient", "auto")
    .append("svg:path")
      .attr("d", "M0,-5L10,0L0,5");

  var link = g.append("g")
      .attr("class", "links")
      .selectAll("line")
      .data(graph.links)
      .enter().append("line")
      .style("fill", "none")
      .style("stroke", "gray")
      .style("stroke-width", function(d) { return Math.sqrt(d.value); })
      .attr("marker-end", "url(#end)")
      .style("pointer-events", "stroke")
      .on("mouseover.tooltip", function(d) {
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

  var node = g.append("g")
    .attr("class", "nodes")
    .selectAll("circle")
    .data(graph.nodes)
    .enter()
    .append("circle")
    .attr("r", 4)
    .style("fill", "gray")
    .style("stroke", "black")
    .style("stroke-width", "1px")
    .style("pointer-events", "all")
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

  function ticked() {

    node
      .attr("cx", function(d) { return d.x; })
      .attr("cy", function(d) { return d.y; });

    link
      .attr("x1", d => d.source.x)
      .attr("y1", d => d.source.y)
      .attr("x2", d => d.target.x)
      .attr("y2", d => d.target.y);

    text
      .attr("transform", function (d) { return "translate(" + d.x + "," + d.y + ")"; });

}

});
