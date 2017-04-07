var svg = d3.select("svg"),
    width = +svg.attr("width"),
    height = +svg.attr("height");

var fader = function(color) { return d3.interpolateRgb(color, "#fff")(0.2); },
    color = d3.scaleOrdinal(d3.schemeCategory20.map(fader)),
    format = d3.format("$,d");

var treemap = d3.treemap()
    .tile(d3.treemapResquarify)
    .size([width, height])
    .round(true)
    .paddingInner(1);

d3.csv('check-runs/03-16-17.csv', function(error, data) {
  if (error) throw error;

  data = groupData(data);

  console.log(data);

  var genId = 0;
  var root = d3.hierarchy(data)
      .eachBefore(function(d) {
        d.data.id = (d.parent ? d.parent.data.id + "." : "") + genId;
        genId++;
      })
      .sum(sumBySize)
      .sort(function(a, b) { return b.amount - a.amount; });

  treemap(root);

  var cell = svg.selectAll("g")
    .data(root.leaves())
    .enter().append("g")
      .attr("transform", function(d) { return "translate(" + d.x0 + "," + d.y0 + ")"; });

  cell.append("rect")
      .attr("id", function(d) { return d.data.id; })
      .attr("width", function(d) { return d.x1 - d.x0; })
      .attr("height", function(d) { return d.y1 - d.y0; })
      .attr("fill", function(d) { return color(d.parent.data.id * 100); });

  cell.append("clipPath")
      .attr("id", function(d) { return "clip-" + d.data.id; })
    .append("use")
      .attr("xlink:href", function(d) { return "#" + d.data.id; });

  cell.append("text")
      .attr("clip-path", function(d) { return "url(#clip-" + d.data.id + ")"; })
      .attr('x', 4)
      .attr('y', 15)
      .text(function(d) { return d.data.description; });

  cell.on('click', function (d) {
    var html = '<p>' + d.data.to + '</p>' +
               '<p>' + d.data.description + '</p>' +
               '<p>' + format(d.data.amount) + '</p>';
    d3.select('#description').html(html);
  });

  cell.append("title")
      .text(function(d) { return format(d.value) + '\n' + d.data.description; });

  d3.selectAll("input")
      .data([sumBySize, sumByCount], function(d) { return d ? d.name : this.value; })
      .on("change", changed);

  var timeout = d3.timeout(function() {
    d3.select("input[value=\"sumByCount\"]")
        .property("checked", true)
        .dispatch("change");
  }, 2000);

  function changed(sum) {
    timeout.stop();

    treemap(root.sum(sum));

    cell.transition()
        .duration(750)
        .attr("transform", function(d) { return "translate(" + d.x0 + "," + d.y0 + ")"; })
      .select("rect")
        .attr("width", function(d) { return d.x1 - d.x0; })
        .attr("height", function(d) { return d.y1 - d.y0; });
  }
});

function sumByCount(d) {
  return d.children ? 0 : 1;
}

function sumBySize(d) {
  return d.amount;
}

function groupData (data) {
  var newData = {
    name: 'checks',
    children: []
  };

  var groups = [];

  data.forEach(function (datum) {
    var name;

    if (groups.indexOf(datum.to) === -1) {
      groups.push(datum.to);
      newData.children.push({
        to: datum.to,
        children: [datum]
      });
    } else {
      var child = findInChildren(newData.children, datum.to);
      child.children.push(datum);
    }
  });

  return newData;
}

function findInChildren (children, name) {
  return children.filter(function (child) {
    return child.to === name && !child.amount;
  })[0];
}
