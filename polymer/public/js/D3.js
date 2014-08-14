//<editor-fold desc="D3 Bar">
function bar_init(dataset) {
    //dataset obtained using socket.io above
    //need failure handling
    //70% of width
    var w = 0.7*($(document).width());
    var h = 500;
    var margin = {top: 40, right: 20, bottom: 30, left: 40},
        width = 960 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;
    var maxVal = 100;
    var sortOrder = false;

    var key = function (d) {
        return d.date;
    };

    //console.log(dataset.length);

    var xScale = d3.scale.ordinal()
        .domain(d3.range(dataset.length))
        .rangeRoundBands([0, w], 0.0);
    var yScale = d3.scale.linear()
        .domain([0, d3.max(dataset, function (d) {
            return d.wordcount;
        })])
        .range([0, h]);

    var svg = d3.select("#bar")
        .append("svg")
        .attr("width", w)
        .attr("height", h)
//                    .attr("width", width + margin.left + margin.right)
//                    .attr("height", height + margin.top + margin.bottom)
        .attr("class", "animated fadeIn")
        .style("margin", "auto")
        .style("display", "block");

    svg.selectAll("rect")
        .data(dataset, key)
        .enter()
        .append("rect")
        .attr("x", function (d, i) {
            return xScale(i);
        })
        .attr("y", function (d) {
            return h - yScale(d.wordcount);
        })
        .attr("width", xScale.rangeBand())
        .attr("height", function (d) {
            return yScale(d.wordcount);
        })
        .attr("fill", function (d) {
            return "rgb(0, 0, " + (d.wordcount * 5) + ")";
        })
        .on("mouseover", function (d) {
            d3.select(this)
                .attr("fill", "orange");

            //update tooltip value
            d3.select("#tooltip #date")
                .text(d.date);
            d3.select("#tooltip #wordcount")
                .text(d.wordcount);

            //Get this bar's x/y values, then augment for the tooltip
            var divWidth = parseFloat(d3.select("#tooltip").style("width"));
            var xPosition = parseFloat(d3.select(this).attr("x")) - divWidth - 10;
            var yPosition = parseFloat(d3.select(this).attr("y")) / 2 + h / 2;

            //Update the tooltip position
            d3.select("#tooltip")
                .style("left", xPosition + "40px")
                .style("top", yPosition + "px");


            //Show the tooltip
            d3.select("#tooltip").classed("hidden", false);
        })
        .on("mouseout", function (d) {
            d3.select(this)
                .transition()
                .duration(250)
                .attr("fill", "rgb(0, 0, " + (d.wordcount * 2) + ")");

            d3.select("#tooltip").classed("hidden", true);

        });


    d3.select("#btnSort")
        .on("click", function () {
            sortBars();
        });

    var sortBars = function () {
        svg.selectAll("rect")
            .sort(function (a, b) {
                if (sortOrder) {
                    return d3.ascending(a.wordcount, b.wordcount);
                } else {
                    return d3.descending(a.wordcount, b.wordcount);
                }
            })
            .transition()
            .delay(function (d, i) {
                return i * 2;
            })
            .duration(1000)
            .attr("x", function (d, i) {
                return xScale(i);
            });

        sortOrder = !sortOrder;
    };

}
//</editor-fold>

//<editor-fold desc="D3 Radar">
function radar_init(dataset) {
    var w = 500, h = 500;

    var colorscale = d3.scale.category10();

    //Legend titles, different users can be superimposed
    //just add them to array
    var LegendOptions = ['friend1'];

    //Data
    var d = [dataset];

    //Options for the Radar chart, other than default
    var mycfg = {
        w: w,
        h: h,
        maxValue: 0.6,
        levels: 6,
        ExtraWidthX: 300
    };

    //Call function to draw the Radar chart
    //Will expect that data is in %'s
    RadarChart.draw("#chart", d, mycfg);

    ////////////////////////////////////////////
    /////////// Initiate legend ////////////////
    ////////////////////////////////////////////

    var svg = d3.select('#radar')
        .attr("class", "animated fadeIn")
        .selectAll('svg')
        .append('svg')
        .attr("width", w + 300)
        .attr("height", h);

    //Create the title for the legend
    var text = svg.append("text")
        .attr("class", "title")
        .attr('transform', 'translate(90,0)')
        .attr("x", w - 70)
        .attr("y", 10)
        .attr("font-size", "12px")
        .attr("fill", "#404040")
        .text("The number of words spoken during a specific hour");

    //Initiate Legend
    var legend = svg.append("g")
        .attr("class", "legend")
        .attr("height", 100)
        .attr("width", 200)
        .attr('transform', 'translate(90,20)');
    //Create colour squares
    legend.selectAll('rect')
        .data(LegendOptions)
        .enter()
        .append("rect")
        .attr("x", w - 65)
        .attr("y", function (d, i) {
            return i * 20;
        })
        .attr("width", 10)
        .attr("height", 10)
        .style("fill", function (d, i) {
            return colorscale(i);
        });

    //Create text next to squares
    legend.selectAll('text')
        .data(LegendOptions)
        .enter()
        .append("text")
        .attr("x", w - 52)
        .attr("y", function (d, i) {
            return i * 20 + 9;
        })
        .attr("font-size", "11px")
        .attr("fill", "#737373")
        .text(function (d) {
            return d;
        });
}
//</editor-fold>