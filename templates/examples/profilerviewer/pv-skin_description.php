<h2 class="first">Skinning the ProfilerViewer Control</h2>

<h3>ProfilerViewer's YUI Sam Skin CSS</h3>
<p>The bulk of the ProfilerViewer's UI is designated by the skin CSS file for YUI Sam Skin.  That file defines:</p>
<ol>
  <li>The header/launch bar and its background;</li>
  <li>The launcher's buttons (show/hide, refresh data);</li>
  <li>The busy indicator;</li>
  <li>The ProfilerViewer console's body color;</li>
  <li>The look and feel of the ProfilerViewer's DataTable (via style rules on top of the DataTable's Sam Skin CSS file);</li>
  <li>The style rules for minimizing the console.</li>
</ol>
<p>Here is the full CSS for ProfilerViewer's YUI Sam Skin treatment. You can modify these rules or replace this file entirely in customizing ProfilerViewer.</p>

<textarea name="code" class="CSS" cols="60" rows="1">.yui-skin-sam .yui-pv {
	background-color:#4a4a4a;
	font:arial;
	position:relative;
	width:99%;
	z-index:1000;
	margin-bottom:1em;
	overflow:hidden;
}

.yui-skin-sam .yui-pv .hd {
	background:url(header_background.png) repeat-x;
	min-height:30px;
	overflow:hidden;
	zoom:1;
	padding:2px 0;
}

.yui-skin-sam .yui-pv .hd h4 {
	padding:8px 10px;
	margin:0;
	font:bold 14px arial;
	color:#fff;
}
	
.yui-skin-sam .yui-pv .hd a {
	background:#3f6bc3; 
	font:bold 11px arial; 
	color:#fff; 
	padding:4px; 
	margin:3px 10px 0 0; 
	border:1px solid #3f567d; 
	cursor:pointer;
	display:block;
	float:right;
}

.yui-skin-sam .yui-pv .hd span {
	display:none;
}

.yui-skin-sam .yui-pv .hd span.yui-pv-busy {
	height:18px;
	width:18px;
	background:url(wait.gif) no-repeat;
	overflow:hidden;
	display:block;
	float:right;
	margin:4px 10px 0 0; 
}

.yui-skin-sam .yui-pv .hd:after, 
.yui-pv .bd:after, 
.yui-skin-sam .yui-pv-chartlegend dl:after {
	content:'.';visibility:hidden;clear:left;height:0;display:block;
}

.yui-skin-sam .yui-pv .bd {
	position:relative; 
	zoom:1; 
	overflow-x:auto; 
	overflow-y:hidden;
}

.yui-skin-sam .yui-pv .yui-pv-table {
	padding:0 10px; 
	margin:5px 0 10px 0;
}

.yui-skin-sam .yui-pv .yui-pv-table .yui-dt-bd td {
	color:#eeee5c;
	font:12px arial;
}

.yui-skin-sam .yui-pv .yui-pv-table tr.yui-dt-odd {
	background:#929292;
}

.yui-skin-sam .yui-pv .yui-pv-table tr.yui-dt-even {
	background:#58637a;
}

.yui-skin-sam .yui-pv .yui-pv-table tr.yui-dt-even td.yui-dt-asc, 
.yui-skin-sam .yui-pv .yui-pv-table tr.yui-dt-even td.yui-dt-desc {
	background:#384970;
}

.yui-skin-sam .yui-pv .yui-pv-table tr.yui-dt-odd td.yui-dt-asc, 
.yui-skin-sam .yui-pv .yui-pv-table tr.yui-dt-odd td.yui-dt-desc {
	background:#6F6E6E;
}

.yui-skin-sam .yui-pv .yui-pv-table .yui-dt-hd th {
	background-image:none;
	background:#2E2D2D;
}

.yui-skin-sam .yui-pv th.yui-dt-asc .yui-dt-liner {
	background:transparent url(asc.gif) no-repeat scroll right center;
}

.yui-skin-sam .yui-pv th.yui-dt-desc .yui-dt-liner {
	background:transparent url(desc.gif) no-repeat scroll right center;
}

.yui-skin-sam .yui-pv .yui-pv-table .yui-dt-hd th a {
	color:#fff; 
	font:bold 12px arial;
}

.yui-skin-sam .yui-pv .yui-pv-table .yui-dt-hd th.yui-dt-asc, 
.yui-skin-sam .yui-pv .yui-pv-table .yui-dt-hd th.yui-dt-desc {
	background:#333;
}

.yui-skin-sam .yui-pv-chartcontainer {
	padding:0 10px;
}

.yui-skin-sam .yui-pv-chart {
	height:250px; 
	clear:right; 
	margin:5px 0 0 0;
	color:#fff;
}

.yui-skin-sam .yui-pv-chartlegend div {
	float:right;
	margin:0 0 0 10px;
	_width:250px;
}

.yui-skin-sam .yui-pv-chartlegend dl {
	border:1px solid #999;
	padding:.2em 0 .2em .5em;
	zoom:1;
	margin:5px 0;
}

.yui-skin-sam .yui-pv-chartlegend dt {
	float:left;
	display:block; 
	height:.7em; 
	width:.7em;  
	padding:0;
}

.yui-skin-sam .yui-pv-chartlegend dd {
	float:left; 
	display:block; 
	color:#fff; 
	margin:0 1em 0 .5em; 
	padding:0; 
	font:11px arial;
}

.yui-skin-sam .yui-pv-minimized {height:35px;}

.yui-skin-sam .yui-pv-minimized .bd {top:-3000px;}

.yui-skin-sam .yui-pv-minimized .hd a.yui-pv-refresh {display:none;}</textarea>

<h3>Styling the Charts component of ProfilerViewer</h3>

<p>The other source of style information is that which controls the YUI Charts visualization.  The chart is styled globally with the <code>chartStyle</code> attribute of ProfilerViewer.  The default <code>chartStyle</code> definition is as follows:</p>

<textarea name="code" class="JScript" cols="60" rows="1">{
    font:
        {
            name: "Arial",
            color: 0xeeee5c,
            size: 12
        },
        background:
        {
            color: "6e6e63"
        }
}</textarea>

<p>The series definitions of the chart are styled via the <code>chartSeriesDefinitions</code> attribute.  The default value for that attribute is as follows:</p>

<textarea name="code" class="JScript" cols="60" rows="1">{
    total: {
        displayName: PV.STRINGS.colHeads.total[0],
        xField: "total",
        style: {color:"CC3333", size:21},
        group: ["total"]
    },
    calls: {		
        displayName: PV.STRINGS.colHeads.calls[0],
        xField: "calls",
        style: {color:"A658BD", size:21},
        group: ["calls"]
    },
    avg: {
        displayName: PV.STRINGS.colHeads.avg[0],
        xField: "avg",
        style: {color:"209daf", size:9},
        group: ["avg", "min", "max"]
    },
    min: {
        displayName: PV.STRINGS.colHeads.min[0],
        xField: "min",
        style: {color:"b6ecf4", size:9},
        group: ["avg", "min", "max"]
    },
    max: {
        displayName: PV.STRINGS.colHeads.max[0],
        xField: "max",
        style: {color:"29c7de", size:9},
        group: ["avg", "min", "max"]
    },
    pct: {
        displayName: PV.STRINGS.colHeads.pct[0],
        xField: "pct",
        style: {color:"bdb327", size:21},
        group: ["pct"]
    }
}</textarea>

<p>To fully skin the chart, you would want to modify these style objects and pass them as custom attributes when you instantiate your ProfilerViewer console.  For example, to change the background color of the chart component to full black, you would do the following:</p>

<textarea name="code" class="JScript" cols="60" rows="1">var pv = new YAHOO.widget.ProfilerViewer("", {
	//pass in a modified chartStyle object with your
    //desired customizations:
	chartStyle = {
        font:
            {
                name: "Arial",
                color: 0xeeee5c,
                size: 12
            },
            background:
            {
            	//change the background to black:
                color: "000000"
            }
	}
});</textarea>